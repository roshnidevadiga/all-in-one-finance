import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { auth } from "../../firebase"; // Adjusted path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { useAuth } from '../../contexts/AuthContext'; // To access currentUser or loading state if needed

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { currentUser } = useAuth(); // Example: if you need to redirect if already logged in

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Signed in
      const user = userCredential.user;
      console.log("Logged in user:", user);
      // The AuthContext will pick up the user and redirect via ProtectedRoute
      // or you can explicitly navigate here if needed after checking emailVerified, etc.
      if (!user.emailVerified) {
        setError(
          "Please verify your email before logging in. Check your inbox for a verification link."
        );
        // Optionally, sign them out again or guide them to a resend verification page
        // await signOut(auth);
        setLoading(false);
        return;
      }
      navigate("/"); // Navigate to home page or dashboard
    } catch (err) {
      const firebaseError = err as AuthError; // Type assertion for Firebase AuthError
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many login attempts. Please try again later.");
      } else {
        setError(firebaseError.message || "Failed to login. Please try again.");
      }
      console.error(
        "Login error code:",
        firebaseError.code,
        "Message:",
        firebaseError.message
      );
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
          disabled={loading}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
      {/* TODO: Add "Forgot Password?" link here */}
    </form>
  );
};
