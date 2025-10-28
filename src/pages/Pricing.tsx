import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const creditPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 50,
    price: 9.99,
    popular: false,
    features: [
      "50 AI generations",
      "All content types",
      "Basic templates",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 150,
    price: 24.99,
    popular: true,
    features: [
      "150 AI generations",
      "All content types",
      "Premium templates",
      "Priority support",
      "Save 17% vs Starter",
    ],
  },
  {
    id: "unlimited",
    name: "Ultimate Pack",
    credits: 500,
    price: 79.99,
    popular: false,
    features: [
      "500 AI generations",
      "All content types",
      "Exclusive templates",
      "24/7 Priority support",
      "Save 33% vs Starter",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string, credits: number) => {
    setLoading(packageId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // In a real implementation, this would integrate with a payment provider
      // For now, we'll simulate adding credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update({ credits: profile.credits + credits })
          .eq("id", session.user.id);

        if (error) throw error;

        toast.success(`Successfully added ${credits} credits to your account!`);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast.error("Failed to purchase credits. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ContentCraft AI
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Choose Your Credit Package</h1>
            <p className="text-lg text-muted-foreground">
              Select the perfect package for your content creation needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative transition-smooth hover:scale-105 ${
                  pkg.popular
                    ? "border-primary shadow-elegant"
                    : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        ${pkg.price}
                      </span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>
                    <div className="mt-2 text-primary font-semibold">
                      {pkg.credits} Credits
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(pkg.id, pkg.credits)}
                    disabled={loading === pkg.id}
                  >
                    {loading === pkg.id ? "Processing..." : "Get Credits"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>All packages include access to all content types and templates</p>
            <p className="mt-2">Need a custom package? Contact our support team</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
