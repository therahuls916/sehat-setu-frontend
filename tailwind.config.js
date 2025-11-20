// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- NEW HIGH-CONTRAST PALETTE ---

        // Primary brand color, as seen in the active sidebar link.
        brand: {
          DEFAULT: '#3b82f6', // A vibrant, professional blue (blue-500)
          light: '#eff6ff',   // The light blue background for active sidebar items (blue-50)
          hover: '#2563eb',   // A darker shade for button hovers (blue-600)
        },

        // Background colors for the main layout components.
        // We will apply these manually in our layout and page files.
        panel: {
          DEFAULT: '#f1f5f9', // The main content area in LIGHT mode (slate-100)
          dark: '#111827',    // The deep navy content area in DARK mode (gray-900)
        },
        sidebar: '#ffffff', // The sidebar is ALWAYS white, regardless of theme.
        card: '#ffffff',    // Content cards are ALWAYS white, regardless of theme.

        // Text colors.
        content: {
          // Used on light backgrounds (sidebar, cards)
          primary: '#1e293b',   // (slate-800)
          secondary: '#64748b', // (slate-500)
          
          // Used on the dark panel background in dark mode
          primary_dark: '#f9fafb', // (gray-50)
          secondary_dark: '#9ca3af',// (gray-400)
        },
        
        // A single, consistent border color for cards and dividers.
        border: '#e5e7eb', // (gray-200)
      },
    },
  },
  plugins: [],
};