import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export const HeroSection: React.FC = () => {
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
              Your Complete{" "}
              <span className="gradient-text">Finance Toolkit</span>
            </h1>
          </div>

          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-left">
            Real-time insights, AI-driven analysis, and intuitive tools to help
            you make informed investment decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-start mx-auto max-w-2xl">
            <Button
              size="lg"
              className="group px-8 py-6 text-lg gradient-bg hover:shadow-modern-lg transition-all duration-300"
              onClick={() => {
                void navigate("/tools/emi-calculator");
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
                // Navigate to demo or tutorial
                console.log("Get a demo clicked");
              }}
            >
              Get a demo
            </Button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
