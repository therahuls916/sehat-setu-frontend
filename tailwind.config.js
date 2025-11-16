// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // <-- ADD THIS LINE
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme colors (as before)
        primary: "#0ea5e9",
        secondary: "#d1fae5",
        accent: "#10b981",
        surface: "#ffffff",
        textPrimary: "#0f172a",
        textSecondary: "#475569",

        // --- NEW: Dark theme colors ---
        dark: {
          surface: "#111827",      // Dark background (e.g., slate-900)
          surfaceMuted: "#1f2937", // Slightly lighter for cards (e.g., slate-800)
          textPrimary: "#f3f4f6",    // Light text (e.g., gray-100)
          textSecondary: "#9ca3af",  // Muted gray text (e.g., gray-400)
          border: "#374151",      // Border color (e.g., gray-700)
        },
      },
    },
  },
  plugins: [],
};