import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite" // Import the tailwindcss vite plugin
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the tailwindcss plugin here
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
