import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface SavedContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  created_at: string;
}

export const SavedContentPreview = () => {
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedContent();
  }, []);

  const loadSavedContent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("generated_content")
        .select("id, title, content, content_type, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      setSavedContent(data || []);
    } catch (error) {
      console.error("Error loading saved content:", error);
    } finally {
      setLoading(false);
    }
  };

  const contentTypeColors: Record<string, string> = {
    blog: "bg-blue-500",
    email: "bg-green-500",
    letter: "bg-purple-500",
    resume: "bg-orange-500",
    essay: "bg-pink-500",
    marketing: "bg-red-500",
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
          <p>Loading your content...</p>
        </CardContent>
      </Card>
    );
  }

  if (savedContent.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No saved content yet. Generate your first piece of content to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {savedContent.map((item) => (
        <Link key={item.id} to="/history">
          <Card className="hover:shadow-elegant transition-smooth cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={contentTypeColors[item.content_type] || "bg-gray-500"}>
                      {item.content_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
