import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#18181A",
        surface: "#242420",
        accent: "#C9A84C",
        highlight: "#F0C040",
        foreground: "#F5F0E8",
        muted: "#A09880",
        border: "#3A3A34",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(201, 168, 76, 0.18)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(240,192,64,0.18), transparent 40%), radial-gradient(circle at right, rgba(201,168,76,0.12), transparent 35%)",
      },
    },
  },
  plugins: [],
};

export default config;
