import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path if your firebase.ts is elsewhere
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext"; // To display user info, optional
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export const MainPage: React.FC = (): React.ReactElement => {
  const { currentUser } = useAuth(); // Optional: Get user info to display

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      console.warn("User signed out successfully");
      // No need to navigate('/auth') here, as the AuthContext and ProtectedRoute will handle it.
    } catch (error) {
      console.error("Sign out error:", error);
      // Handle sign-out errors if necessary (though rare for basic signOut)
    }
  };

  const financeTools = [
    {
      title: "EMI Calculator",
      description: "Calculate your loan EMI, interest payments and more",
      icon: "💰",
    },
    {
      title: "Investment Returns",
      description: "Calculate returns on various investment options",
      icon: "📈",
    },
    {
      title: "Budget Planner",
      description: "Plan and track your monthly budget",
      icon: "📊",
    },
    {
      title: "Tax Calculator",
      description: "Estimate your income tax liability",
      icon: "📋",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with user profile and sign out */}
      <header className="w-full p-4 bg-gray-100 dark:bg-gray-800 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">All In One Finance</h1>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {currentUser.photoURL && (
                    <img
                      src={currentUser.photoURL}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full shadow-md"
                    />
                  )}
                  <span className="font-medium hidden md:inline">
                    {currentUser.displayName ?? currentUser.email}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    void handleSignOut();
                  }}
                  variant="destructive"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-8 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
          {financeTools.map((tool, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{tool.icon}</span>
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Open Tool</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};
