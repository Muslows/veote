import type { Config } from "tailwindcss";

/**
 * Veote — thème Slate Dark (neutre, non partisan).
 * Accents slate/blue uniquement ; pas de couleurs partisanes dans le thème global.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veote: {
          bg: "#0F172A",
          card: "#1E293B",
          border: "#334155",
          text: "#F8FAFC",
          muted: "#94A3B8",
          accent: "#3B82F6",
          "accent-soft": "#1E3A5F",
          focus: "#60A5FA",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-veote-sans)",
          "Source Sans 3",
          "Segoe UI",
          "Helvetica Neue",
          "sans-serif",
        ],
        display: [
          "var(--font-veote-display)",
          "Source Serif 4",
          "Georgia",
          "serif",
        ],
      },
      maxWidth: {
        shell: "72rem",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgb(51 65 85 / 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
