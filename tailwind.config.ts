import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0e14",
        foreground: "#f3f4f6",
        panel: {
          bg: "#11141d",
          border: "#1f2430",
          header: "#161b26",
          hover: "#1a202e",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          muted: "#1d4ed8",
        },
        circuit: {
          green: "#10b981",
          red: "#ef4444",
          yellow: "#f59e0b",
          blue: "#3b82f6",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          orange: "#f97316",
        },
      },
    },
  },
  plugins: [],
};

export default config;
