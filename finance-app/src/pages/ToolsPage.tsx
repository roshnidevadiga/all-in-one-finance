import React from "react";
import { Navigation } from "@/components/Navigation";
import { ToolsSection } from "@/components/ToolsSection";

export const ToolsPage: React.FC = (): React.ReactElement => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="tools" />

      <main className="flex-grow">
        {/* Tools header */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Financial Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful calculators and analyzers to help you make informed
              financial decisions.
            </p>
          </div>
        </section>

        <ToolsSection />
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
