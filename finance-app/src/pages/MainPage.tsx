import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path if your firebase.ts is elsewhere
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext"; // To display user info, optional

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
      <p className="text-lg mb-8 text-center">
        This is the main content area, visible after successful login.
      </p>

      <Button onClick={handleSignOut} variant="destructive" size="lg">
        Sign Out
      </Button>
    </div>
  );
};
