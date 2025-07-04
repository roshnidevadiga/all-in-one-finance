import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Insights",
      description:
        "AI-driven analysis and intuitive tools to help you make informed investment decisions.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Bank-level security with advanced encryption to protect your financial data.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Instant calculations and real-time market data at your fingertips.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl md:text-2xl font-bold gradient-text">
                All In One Finance
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                onClick={() => {
                  void navigate("/auth");
                }}
                variant="outline"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 -z-10" />

          {/* Main hero content */}
          <div className="container mx-auto px-6 py-20 lg:py-28">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="text-left max-w-2xl mx-auto">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-blue-500 mb-3 tracking-wide">
                  ALL IN ONE FINANCE
                </h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Smart Financial{" "}
                  <span className="gradient-text">Decision Making</span>
                </h1>
              </div>

              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-left">
                Real-time insights, AI-driven analysis, and intuitive tools to
                help you make informed investment decisions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-start mx-auto max-w-2xl">
                <Button
                  size="lg"
                  className="group px-8 py-6 text-lg gradient-bg hover:shadow-modern-lg transition-all duration-300"
                  onClick={() => {
                    void navigate("/auth");
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg border-2 hover:bg-accent hover:border-primary transition-colors duration-300"
                  onClick={() => {
                    // Scroll to features section
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Feature highlights */}
            <div
              id="features"
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="text-center p-6 rounded-2xl glass hover:shadow-modern-lg transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-sm text-muted-foreground">
                © 2025 All In One Finance. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                Privacy
              </button>
              <button className="hover:text-foreground transition-colors">
                Terms
              </button>
              <button className="hover:text-foreground transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
