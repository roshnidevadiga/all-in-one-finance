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

  // User is logged in (email is inherently verified with Google Sign-In).
  return children;
};
