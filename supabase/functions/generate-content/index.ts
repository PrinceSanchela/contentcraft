import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, prompt, tone, style, userDetails = {}, sampleMode = false } = await req.json();
    
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // 1) Validate the token to get the user
    const supabaseForAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: userError } = await supabaseForAuth.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2) Create an authed client for RLS-protected queries
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Check user credits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    if (profile.credits <= 0) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt based on content type
    let systemPrompt = 'You are an expert AI content writer. ';
    
    if (sampleMode) {
      systemPrompt += 'Generate content with placeholders like [Your Name], [Company Name], etc. for missing information. ';
    } else {
      systemPrompt += 'CRITICAL: Use ONLY the specific user-provided details. NEVER use placeholders like [Your Name], [Address], [Company], etc. If information is missing, create realistic example content or skip that section entirely. ';
    }
    
    switch (contentType) {
      case 'blog':
        systemPrompt += 'Create SEO-optimized blog posts with engaging titles, meta descriptions, and well-structured content with headings.';
        break;
      case 'email':
        systemPrompt += 'Write professional and effective emails with clear subject lines and well-formatted body text.';
        break;
      case 'letter':
        systemPrompt += 'Compose formal business letters with proper formatting, professional language, and clear structure.';
        break;
      case 'resume':
        systemPrompt += 'Generate professional resume content with compelling summaries, achievement-focused bullet points, and industry-appropriate language.';
        break;
      case 'essay':
        systemPrompt += 'Write well-researched academic essays with clear thesis statements, supporting arguments, and proper structure.';
        break;
      case 'marketing':
        systemPrompt += 'Create persuasive marketing copy that drives action, highlights benefits, and connects with the target audience.';
        break;
      default:
        systemPrompt += 'Generate high-quality written content based on the user\'s requirements.';
    }

    if (tone) {
      systemPrompt += ` Use a ${tone} tone.`;
    }

    // Build user details context
    let detailsContext = '';
    if (Object.keys(userDetails).length > 0 && !sampleMode) {
      detailsContext = '\n\nUser Details:\n';
      for (const [key, value] of Object.entries(userDetails)) {
        if (value) {
          detailsContext += `${key}: ${value}\n`;
        }
      }
      detailsContext += '\nIMPORTANT: Use these exact details in the content. Do not add placeholders.';
    }

    // Call Lovable AI Gateway with streaming
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt + detailsContext }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits depleted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI generation failed');
    }

    // Deduct credit immediately
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update credits:', updateError);
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        try {
          // Send initial metadata
          const metadata = JSON.stringify({ 
            type: 'metadata', 
            remainingCredits: profile.credits - 1 
          }) + '\n';
          controller.enqueue(new TextEncoder().encode(metadata));

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    const contentChunk = JSON.stringify({ 
                      type: 'content', 
                      content 
                    }) + '\n';
                    controller.enqueue(new TextEncoder().encode(contentChunk));
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});