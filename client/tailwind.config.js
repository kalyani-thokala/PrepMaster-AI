/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#06B6D4",      // Cyan
        secondary: "#8B5CF6",    // Purple
        background: "#0F172A",   // Slate Dark
        card: "#1E293B",         // Slate Card
        text: "#F8FAFC",         // Slate Light Text
        success: "#22C55E",      // Green
        danger: "#EF4444",       // Red
        darkBorder: "#1e293b",
        glowCyan: "0 0 20px rgba(6, 182, 212, 0.4)",
        glowPurple: "0 0 20px rgba(139, 92, 246, 0.4)"
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 15px rgba(6, 182, 212, 0.15)"
      }
    },
  },
  plugins: [],
}
