import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4" }],
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["12px", { lineHeight: "1.5" }],
        base: ["13px", { lineHeight: "1.5" }],
        md: ["14px", { lineHeight: "1.5" }],
        lg: ["15px", { lineHeight: "1.6" }],
        xl: ["18px", { lineHeight: "1.4" }],
        "2xl": ["20px", { lineHeight: "1.3" }],
        "3xl": ["24px", { lineHeight: "1.2" }],
        "4xl": ["32px", { lineHeight: "1.1" }],
      },
      colors: {
        squito: {
          appBlack: "#09090b", // True black — body/page background
          appDark: "#111111",  // Deep charcoal — section backgrounds
          appLight: "#f1f1f1", // Light gray background bottom shell
          green: "#6b9e11",    // The prominent Squito green accent
          greenLight: "#95c93e",
          cardDark: "#1a1a1a", // Cards on dark background
          cardBorder: "#2a2a2a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(10,31,20,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(10,31,20,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
