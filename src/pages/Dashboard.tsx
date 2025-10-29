import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Mail,
  FileText,
  Newspaper,
  Briefcase,
  PenTool,
  Megaphone,
  Sparkles,
  LogOut,
  Coins,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { SavedContentPreview } from "@/components/SavedContentPreview";

interface Profile {
  credits: number;
  plan: string;
}

const contentTypes = [
  {
    id: "blog",
    title: "Blog Post",
    description: "SEO-optimized articles and blog content",
    icon: Newspaper,
    color: "text-blue-500",
  },
  {
    id: "email",
    title: "Professional Email",
    description: "Business emails and correspondence",
    icon: Mail,
    color: "text-green-500",
  },
  {
    id: "letter",
    title: "Business Letter",
    description: "Formal letters and proposals",
    icon: FileText,
    color: "text-purple-500",
  },
  {
    id: "resume",
    title: "Resume",
    description: "Professional CV and cover letters",
    icon: Briefcase,
    color: "text-orange-500",
  },
  {
    id: "essay",
    title: "Essay",
    description: "Academic essays and assignments",
    icon: PenTool,
    color: "text-pink-500",
  },
  {
    id: "marketing",
    title: "Marketing Copy",
    description: "Product descriptions and ad copy",
    icon: Megaphone,
    color: "text-red-500",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("credits, plan")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSelectContentType = (contentTypeId: string) => {
    navigate(`/editor?type=${contentTypeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 max-w-full">
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
            <span className="text-base md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              ContentCraft AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-semibold">{profile?.credits || 0} Credits</span>
              <Badge variant="secondary" className="ml-2">
                {profile?.plan || "Free"}
              </Badge>
            </div>
            <Button variant="outline" asChild>
              <Link to="/pricing">Get Credits</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
              <Coins className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold whitespace-nowrap">{profile?.credits || 0}</span>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{profile?.credits || 0} Credits</span>
                    <Badge variant="secondary" className="ml-2">
                      {profile?.plan || "Free"}
                    </Badge>
                  </div>

                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/pricing">
                      <Coins className="mr-2 h-4 w-4" />
                      Get Credits
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={toggleTheme}
                  >
                    {theme === "light" ? (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Light Mode
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">What would you like to create?</h1>
            <p className="text-lg text-muted-foreground">
              Choose a content type to get started with AI-powered writing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((type) => (
              <Card
                key={type.id}
                className="cursor-pointer hover:shadow-elegant transition-smooth hover:scale-105"
                onClick={() => handleSelectContentType(type.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <type.icon className={`h-8 w-8 ${type.color}`} />
                    <Badge variant="secondary">1 Credit</Badge>
                  </div>
                  <CardTitle className="mt-4">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Generate with AI
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Saved Content Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Content</h2>
              <Button variant="outline" asChild>
                <Link to="/history">View All</Link>
              </Button>
            </div>
            <SavedContentPreview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
