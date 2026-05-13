// NOTE: This project uses Tailwind CSS v4, which is configured via CSS @theme blocks
// in src/app/globals.css rather than this file. See globals.css for the full theme.
//
// This file is kept for tooling compatibility but is not processed by Tailwind v4.
// All custom colors, fonts, and animations are defined in globals.css @theme {}.

import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0E0F11",
        surface: "#161719",
        elevated: "#1D1E21",
        border: "#252628",
        "border-subtle": "#1A1B1D",
        primary: "#F0F0EE",
        muted: "#7C7D80",
        dim: "#383A3D",
        accent: "#E8A427",
        "accent-hover": "#F0B340",
        "accent-dim": "#261C08",
        green: "#50C97A",
        red: "#E06060",
        blue: "#5B9EF0",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
      },
    },
  },
  plugins: [],
} satisfies Config
