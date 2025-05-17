import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // The App.tsx already handles global loading state,
    // so we can return null here or a more specific loader if desired for the route itself.
    return null; // Or a specific loading spinner for this route transition
  }

  if (!currentUser) {
    // User not logged in, redirect them to the /auth page.
    // Save the current location they were trying to go to so we can send them there after login.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!currentUser.emailVerified) {
    // User is logged in but email is not verified.
    // Redirect to /auth, where LoginForm can show the "verify email" message.
    // Alternatively, redirect to a dedicated /verify-email page or show an inline message here.
    // For simplicity, we'll redirect to /auth. The LoginForm has logic to prompt for verification.
    // You could also pass a specific state to AuthPage to show a message.
    return (
      <Navigate
        to="/auth"
        state={{ from: location, needsVerification: true }}
        replace
      />
    );
  }

  // User is logged in and email is verified (or verification not strictly enforced here).
  return children;
};
