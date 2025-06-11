import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrendingUp, Shield, Zap } from "lucide-react";

export const AuthPage: React.FC = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "AI-powered insights for better investment decisions",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level security with complete data protection",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant calculations and real-time updates",
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

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-3 md:p-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center min-h-[450px] md:min-h-[550px]">
            {/* Left side - Hero content */}
            <div className="space-y-8 flex flex-col justify-center px-4">
              <div className="text-left">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-blue-500 mb-3 tracking-wide">
                  ALL IN ONE FINANCE
                </h2>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  <span className="gradient-text">Financial Tools</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-md">
                  Tools and insights to help you make smarter financial
                  decisions.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 text-left">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side - Auth card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm md:max-w-md">
                <Card className="shadow-modern-lg border-2 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-bold">
                          Get Started
                        </h2>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Sign in to access your personalized financial
                          dashboard
                        </p>
                      </div>

                      <div className="space-y-4">
                        <GoogleSignInButton />

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-background px-2 text-muted-foreground">
                              secure login
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground text-center">
                          By signing in, you agree to our{" "}
                          <button className="underline hover:text-foreground">
                            Terms
                          </button>{" "}
                          &{" "}
                          <button className="underline hover:text-foreground">
                            Privacy
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
    </div>
  );
};
