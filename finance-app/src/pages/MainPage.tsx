import React from "react";
import { Navigation } from "@/components/Navigation";
import { ToolsSection } from "@/components/ToolsSection";
import { useAuth } from "../contexts/AuthContext";

export const MainPage: React.FC = (): React.ReactElement => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="home" />

      <main className="flex-grow">
        {/* Simple welcome section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome
              {currentUser?.displayName ? `, ${currentUser.displayName}` : ""}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our financial tools to calculate EMI, analyze mutual
              funds, and make informed investment decisions.
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
