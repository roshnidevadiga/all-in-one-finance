import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calculator, TrendingUp, ArrowRight } from "lucide-react";

export const ToolsSection: React.FC = () => {
  const navigate = useNavigate();

  const financeTools = [
    {
      title: "EMI Calculator",
      description:
        "Calculate your loan EMI, interest payments, and amortization schedules with precision.",
      icon: Calculator,
      id: "emi_calculator",
      gradient: "from-blue-500 to-indigo-600",
      features: ["Monthly EMI", "Total Interest", "Payment Schedule"],
    },
    {
      title: "Mutual Funds Selector",
      description:
        "Discover and analyze the best mutual funds tailored to your investment goals.",
      icon: TrendingUp,
      id: "mutual_funds_selector",
      gradient: "from-green-500 to-emerald-600",
      features: ["Fund Analysis", "Performance Metrics", "Risk Assessment"],
    },
  ];

  const handleToolClick = (toolId: string): void => {
    switch (toolId) {
      case "emi_calculator":
        void navigate("/tools/emi-calculator");
        break;
      case "mutual_funds_selector":
        void navigate("/tools/mutual-funds-selector");
        break;
      default:
        console.log(`Tool "${toolId}" is not yet implemented.`);
        break;
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Financial Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful calculators and analyzers to help you make informed
            financial decisions.
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {financeTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-modern-lg transition-all duration-500 cursor-pointer border-2 hover:border-primary/20"
                onClick={() => {
                  handleToolClick(tool.id);
                }}
              >
                <div className="p-8">
                  {/* Icon with gradient background */}
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.gradient} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-full h-full text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 mb-6">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action button */}
                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 hover:shadow-modern"
                    variant="outline"
                  >
                    Open Tool
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
