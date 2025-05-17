import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  type AuthError,
} from "firebase/auth";
import { auth } from "../../firebase"; // Adjust path if needed
import { Button } from "@/components/ui/button";
// Optional: Add a Google icon
// import { Icons } from "@/components/icons"; // Assuming you have an icons file like shadcn docs suggest

export const GoogleSignInButton: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log("Google Sign-In successful, user:", user);
      // AuthContext will handle the user state update.
      // App.tsx routing will redirect to '/' if login is successful.
      // No explicit navigate('/') needed here if ProtectedRoute is set up correctly.
    } catch (err) {
      const firebaseError = err as AuthError;
      // Handle Errors here.
      const errorCode = firebaseError.code;
      const errorMessage = firebaseError.message;
      // The email of the user's account used.
      // const email = firebaseError.customData?.email;
      // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(firebaseError);

      if (errorCode === "auth/popup-closed-by-user") {
        setError("Sign-in popup closed. Please try again.");
      } else if (errorCode === "auth/cancelled-popup-request") {
        setError("Multiple sign-in attempts. Please try again.");
      } else if (errorCode === "auth/popup-blocked") {
        setError(
          "Popup blocked by browser. Please allow popups for this site."
        );
      } else {
        setError(errorMessage || "Google Sign-In failed. Please try again.");
      }
      console.error("Google Sign-In error:", errorCode, errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full"
        variant="outline" // Or your preferred variant
      >
        {/* {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />} */}
        {loading ? "Signing in..." : "Sign in with Google"}
        {/* Alternatively, use a Google Icon here */}
      </Button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
};
