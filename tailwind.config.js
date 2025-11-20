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
        // Brand Colors
        brand: {
          DEFAULT: '#3b82f6',
          light: '#eff6ff',
          hover: '#2563eb',
        },
        
        // --- MISSING COLORS FIXED HERE ---
        dark: {
          surface: '#1f2937',      // gray-800 (Card/Input background)
          surfaceMuted: '#111827', // gray-900 (Main background)
          border: '#374151',       // gray-700 (Borders)
          textPrimary: '#f9fafb',  // gray-50 (Main text)
          textSecondary: '#9ca3af',// gray-400 (Sub text)
        },
        // --------------------------------

        // Existing colors
        panel: {
          DEFAULT: '#f1f5f9',
          dark: '#111827',
        },
        sidebar: '#ffffff',
        card: '#ffffff',
        content: {
          primary: '#1e293b',
          secondary: '#64748b',
          primary_dark: '#f9fafb',
          secondary_dark: '#9ca3af',
        },
        border: '#e5e7eb',
      },
    },
  },
  plugins: [],
};