import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Trash2, 
  Copy,
  Share2,
  Calendar,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SavedContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  tone: string;
  style: string;
  created_at: string;
}

const History = () => {
  const navigate = useNavigate();
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);

  useEffect(() => {
    checkAuth();
    loadSavedContent();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadSavedContent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("generated_content")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSavedContent(data || []);
    } catch (error) {
      console.error("Error loading saved content:", error);
      toast.error("Failed to load saved content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSavedContent(savedContent.filter((item) => item.id !== id));
      setSelectedContent(null);
      toast.success("Content deleted successfully");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard!");
  };

  const handleShare = (content: SavedContent) => {
    const text = `${content.title}\n\n${content.content}`;
    const encodedText = encodeURIComponent(text);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    };

    return shareUrls;
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
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <h1 className="text-xl font-bold">Content History</h1>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {savedContent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No saved content yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first piece of content to get started
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Create Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {savedContent.map((item) => (
                <Card key={item.id} className="hover:shadow-elegant transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={contentTypeColors[item.content_type] || "bg-gray-500"}>
                            {item.content_type}
                          </Badge>
                          <Badge variant="outline">{item.tone}</Badge>
                          <Badge variant="outline">{item.style}</Badge>
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedContent(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(item.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* View Content Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={contentTypeColors[selectedContent?.content_type || ""] || "bg-gray-500"}>
                  {selectedContent?.content_type}
                </Badge>
                <Badge variant="outline">{selectedContent?.tone}</Badge>
                <Badge variant="outline">{selectedContent?.style}</Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {selectedContent?.content}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => selectedContent && handleCopy(selectedContent.content)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              
              {selectedContent && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => window.open(handleShare(selectedContent).whatsapp, "_blank")}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(handleShare(selectedContent).facebook, "_blank")}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(handleShare(selectedContent).twitter, "_blank")}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(handleShare(selectedContent).linkedin, "_blank")}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
