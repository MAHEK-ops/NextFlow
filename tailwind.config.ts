import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0a0a0a",
        surface: {
          DEFAULT: "#111111",
          raised: "#1a1a1a",
          overlay: "#222222",
        },
        border: {
          DEFAULT: "#272727",
          subtle: "#1e1e1e",
          strong: "#3a3a3a",
        },
        accent: {
          DEFAULT: "#7c3aed",
          light: "#8b5cf6",
          dim: "#4c1d95",
          glow: "rgba(124, 58, 237, 0.4)",
        },
        muted: {
          DEFAULT: "#525252",
          foreground: "#737373",
        },
        foreground: {
          DEFAULT: "#fafafa",
          secondary: "#a3a3a3",
          tertiary: "#737373",
        },
        node: {
          text: "#3b82f6",
          llm: "#7c3aed",
          image: "#10b981",
          video: "#f59e0b",
          crop: "#06b6d4",
          frame: "#f97316",
        },
        status: {
          success: "#22c55e",
          failed: "#ef4444",
          partial: "#f59e0b",
          running: "#7c3aed",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        node: "0 0 0 1px #272727, 0 4px 16px rgba(0, 0, 0, 0.4)",
        "node-active": "0 0 0 1px #7c3aed, 0 4px 24px rgba(124, 58, 237, 0.2)",
        "node-running": "0 0 0 1px #7c3aed, 0 0 20px rgba(124, 58, 237, 0.4)",
        accent: "0 0 20px rgba(124, 58, 237, 0.3)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scale-in": "scale-in 0.15s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 1px #7c3aed, 0 0 12px rgba(124, 58, 237, 0.3)" },
          "50%": { boxShadow: "0 0 0 1px #8b5cf6, 0 0 28px rgba(139, 92, 246, 0.6)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
