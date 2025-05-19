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

export const MainPage: React.FC = () => {
  const { currentUser } = useAuth(); // Optional: Get user info to display

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
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
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Welcome to the Main Application
      </h1>
      {currentUser && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <p className="text-lg text-center">
            Signed in as:{" "}
            <span className="font-semibold">
              {currentUser.displayName || currentUser.email}
            </span>
          </p>
          {currentUser.photoURL && (
            <img
              src={currentUser.photoURL}
              alt="User avatar"
              className="w-20 h-20 rounded-full mx-auto mt-3 shadow-md"
            />
          )}
        </div>
      )}

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

      <Button onClick={handleSignOut} variant="destructive" size="lg">
        Sign Out
      </Button>
    </div>
  );
};
