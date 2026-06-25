import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "gg-surf": "#0b0e14",
        "gg-surf2": "#111418",
        "gg-border": "#292d30",
        "gg-border-mid": "#464a4d",
        "gg-text": "#f0f0f0",
        "gg-text-mid": "#a1a4a5",
        "gg-muted": "#6c6c6c",
        "gg-acc": "#3b9eff",
        "gg-acc-border": "rgba(59,158,255,0.45)",
        "gg-acc-dim": "rgba(59,158,255,0.07)",
        "gg-violet": "#9281f7",
        "gg-violet-border": "rgba(146,129,247,0.42)",
        "gg-violet-dim": "rgba(146,129,247,0.08)",
        "gg-green": "#3ad389",
        "gg-green-border": "rgba(58,211,137,0.32)",
        "gg-green-dim": "rgba(58,211,137,0.07)",
        "gg-amber": "#ffca16",
        "gg-amber-border": "rgba(255,202,22,0.35)",
        "gg-amber-dim": "rgba(255,202,22,0.07)",
        "gg-red": "#ff9592",
        "gg-red-border": "rgba(255,149,146,0.38)",
        "gg-red-dim": "rgba(255,149,146,0.07)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(7px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        bloom: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        spin: "spin 0.8s linear infinite",
        "fade-up": "fade-up 0.22s ease both",
        bloom: "bloom 0.35s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
