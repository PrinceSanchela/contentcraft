import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Create Professional Content with{" "}
              <span className=" bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered Writing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate blogs, emails, resumes, and more in seconds.
              Perfect for students, professionals, and businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Writing for Free
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See Examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Write Better
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed to help you create any type of content instantly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border bg-card hover:shadow-elegant transition-smooth">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Advanced AI models trained on millions of documents for perfect content
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card hover:shadow-elegant transition-smooth">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate complete documents in seconds, not hours
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card hover:shadow-elegant transition-smooth">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your content is encrypted and never shared with third parties
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card hover:shadow-elegant transition-smooth">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SEO Optimized</h3>
              <p className="text-muted-foreground">
                Content automatically optimized for search engines and readability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Generate Any Type of Content
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From business letters to blog posts, we've got you covered
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              "Business Letters",
              "Professional Emails",
              "Blog Posts",
              "Resumes & CVs",
              "Essays & Assignments",
              "Marketing Copy",
              "Product Descriptions",
              "Social Media Posts",
              "Cover Letters",
            ].map((type) => (
              <div
                key={type}
                className="p-4 rounded-lg border bg-background text-center hover:border-primary transition-smooth cursor-pointer"
              >
                <span className="font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8 p-12 rounded-2xl gradient-primary shadow-glow">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Writing?
            </h2>
            <p className="text-lg text-white/90">
              Join thousands of users creating professional content with AI
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-primary hover:bg-white">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 ContentCraft AI By Prince Sanchela. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
