import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  type AuthError,
} from "firebase/auth";
import { auth } from "../../firebase"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
    <div className="w-full space-y-4">
      <Button
        onClick={() => {
          void handleGoogleSignIn();
        }}
        disabled={loading}
        className="w-full h-12 text-sm md:text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-500"
        variant="outline"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </Button>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive text-center leading-relaxed">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
