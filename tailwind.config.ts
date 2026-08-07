import type { Config } from "tailwindcss";

// Design tokens sourced from 04_OMV_Design_System.md and 01_OMV_Brand_Book.md.
// Actual color VALUES live in app/globals.css as CSS variables so that
// dark/light themes can swap them at runtime without shipping two builds.
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-elevated": "hsl(var(--surface-elevated) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "foreground-muted": "hsl(var(--foreground-muted) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "hsl(var(--gold) / <alpha-value>)",
          foreground: "hsl(var(--gold-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-heading)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      // Design System: Buttons 16px, Inputs 14px, Cards 20px, Modals 24px
      borderRadius: {
        button: "16px",
        input: "14px",
        card: "20px",
        modal: "24px",
      },
      // Design System spacing scale
      spacing: {
        18: "72px",
      },
      transitionDuration: {
        DEFAULT: "250ms",
      },
      boxShadow: {
        premium: "0 8px 30px -12px hsl(var(--primary) / 0.35)",
        gold: "0 4px 20px -6px hsl(var(--gold) / 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
