import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { MainPage } from "./pages/MainPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import "./App.css"; // You can keep or remove this if not needed for global styles beyond index.css
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // You can render a global loading spinner here if you like
    // For example, from shadcn: import { Icons } from "@/components/icons";
    // return <div className="flex items-center justify-center min-h-screen"><Icons.spinner className="h-10 w-10 animate-spin" /></div>;
    return <div>Loading application...</div>; // Simple loading text for now
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* If logged in and trying to access /auth, redirect to home */}
        <Route
          path="/auth"
          element={currentUser ? <Navigate to="/" replace /> : <AuthPage />}
        />

        {/* For now, MainPage is not protected. We will add ProtectedRoute next. */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        {/* Optional: A route to specifically guide users to verify their email if you want a dedicated page */}
        {/* <Route path="/verify-email" element={<EmailVerificationPromptPage />} /> */}

        {/* You can add a 404 Not Found route here if needed */}
        {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
