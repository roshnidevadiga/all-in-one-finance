import React from "react";

export const MainPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the Main Application
      </h1>
      <p>This is the main content area, visible after successful login.</p>
      {/* Add your main application content here */}
    </div>
  );
};
