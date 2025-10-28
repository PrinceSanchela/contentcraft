import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, ArrowLeft, Copy, Save, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ContentFieldsCollector } from "@/components/ContentFieldsCollector";
import { ShareDialog } from "@/components/ShareDialog";

const tones = ["Professional", "Friendly", "Persuasive", "Academic", "Casual", "Formal"];
const styles = ["Informative", "Conversational", "Technical", "Creative", "Concise"];

const Editor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentType = searchParams.get("type") || "blog";
  
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [style, setStyle] = useState("Informative");
  const [generatedContent, setGeneratedContent] = useState("");
  const [title, setTitle] = useState("");
  const [userDetails, setUserDetails] = useState<Record<string, string>>({});
  const [sampleMode, setSampleMode] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setGeneratedContent("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to generate content");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            contentType,
            prompt,
            tone,
            style,
            userDetails,
            sampleMode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate content");
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let remainingCredits = 0;

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === "metadata") {
              remainingCredits = data.remainingCredits;
            } else if (data.type === "content") {
              accumulatedContent += data.content;
              setGeneratedContent(accumulatedContent);
            }
          } catch (e) {
            console.error("Error parsing stream data:", e);
          }
        }
      }

      toast.success("Content generated successfully!");
      
      // Auto-set title based on content type
      const contentTypeNames: Record<string, string> = {
        blog: "Blog Post",
        email: "Email",
        letter: "Business Letter",
        resume: "Resume",
        essay: "Essay",
        marketing: "Marketing Copy",
      };
      setTitle(`${contentTypeNames[contentType] || "Document"} - ${new Date().toLocaleDateString()}`);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    if (!generatedContent || !title) {
      toast.error("Please generate content and enter a title first");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_content").insert({
        user_id: session.user.id,
        title,
        content_type: contentType,
        content: generatedContent,
        tone,
        style,
      });

      if (error) throw error;

      toast.success("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    }
  };

  const handleShare = () => {
    if (!generatedContent || !title) {
      toast.error("Please generate content first");
      return;
    }
    setShareDialogOpen(true);
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
    handleGenerate();
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ContentCraft AI
            </span>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Create Your Content</CardTitle>
              <CardDescription>
                Fill in the details and let AI generate your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">What do you want to write about? *</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your topic, keywords, or instructions..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <ContentFieldsCollector
                contentType={contentType}
                values={userDetails}
                onChange={(name, value) => 
                  setUserDetails(prev => ({ ...prev, [name]: value }))
                }
              />

              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-1">
                  <Label htmlFor="sample-mode" className="text-sm font-medium">
                    Sample Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Generate with placeholders like [Your Name]
                  </p>
                </div>
                <Switch
                  id="sample-mode"
                  checked={sampleMode}
                  onCheckedChange={setSampleMode}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full relative overflow-hidden"
                size="lg"
                disabled={loading}
                variant="gradient"
              >
                {loading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[slide-in-right_1.5s_ease-in-out_infinite]" />
                )}
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Your AI-generated content will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && !generatedContent ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="relative">
                      <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                      <div className="absolute inset-0 h-16 w-16 rounded-full bg-primary/20 animate-ping" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        AI is crafting your content
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Watch as the content appears line by line...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (loading && generatedContent) || generatedContent ? (
                <>
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for this content"
                    />
                  </div>

                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <Label>Content</Label>
                      {loading && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3 animate-pulse" />
                          Generating...
                        </span>
                      )}
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {generatedContent}
                        {loading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
                      </pre>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 animate-fade-in">
                    <Button onClick={handleCopy} variant="outline" className="hover-scale">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={handleSave} variant="default" className="hover-scale">
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={handleRegenerate} variant="secondary" disabled={loading} className="hover-scale">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="hover-scale">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Fill in the form and click "Generate Content" to see your AI-generated content
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={title}
        content={generatedContent}
      />
    </div>
  );
};

export default Editor;
