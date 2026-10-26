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
        // Professional Navy Blue & White Theme Tokens
        navy: {
          50: "#F0F4F8",
          100: "#DBE2EF",
          200: "#B8CBE0",
          300: "#8FAECF",
          400: "#5D87B8",
          500: "#3F72AF",
          600: "#2C5282",
          700: "#1F4068",
          800: "#163252",
          900: "#112D4E",
          950: "#0B1E34",
          DEFAULT: "#112D4E",
          primary: "#112D4E",
          secondary: "#3F72AF",
          light: "#DBE2EF",
          hover: "#2C5282",
          dark: "#0B1E34",
        },
        // Backward-compatible alias mapped to Navy & Light Blue
        sage: {
          50: "#F9F7F7",
          100: "#F0F4F8",
          200: "#DBE2EF",
          300: "#B8CBE0",
          400: "#8FAECF",
          500: "#3F72AF",
          600: "#3F72AF",
          700: "#112D4E",
          800: "#163252",
          900: "#112D4E",
          DEFAULT: "#3F72AF",
          primary: "#112D4E",
          secondary: "#3F72AF",
          light: "#DBE2EF",
          hover: "#112D4E",
          dark: "#112D4E",
        },
        // Background White / Canvas Tokens
        beige: {
          50: "#FFFFFF",
          100: "#F9F7F7",
          200: "#F0F4F8",
          300: "#DBE2EF",
          DEFAULT: "#F9F7F7",
        },
        warm: {
          50: "#F9F7F7",
          100: "#F9F7F7",
          200: "#F0F4F8",
          300: "#DBE2EF",
        },
        // Brand Scale mapped to Secondary Blue (#3F72AF) and Primary Navy (#112D4E)
        brand: {
          50: "#DBE2EF",
          100: "#DBE2EF",
          200: "#B8CBE0",
          300: "#8FAECF",
          400: "#5D87B8",
          500: "#3F72AF",
          600: "#3F72AF",
          700: "#112D4E",
          800: "#163252",
          900: "#112D4E",
        },
        // Harmonize slate to Navy Blue and clean neutrals
        slate: {
          50: "#F9F7F7",
          100: "#F0F4F8",
          200: "#DBE2EF",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#4B5E76",
          700: "#244773",
          800: "#163252",
          900: "#112D4E",
          950: "#0B1E34",
        },
        accent: {
          soft: "#DBE2EF",
          teal: "#3F72AF",
          amber: "#B45309",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(17, 45, 78, 0.05), 0 1px 2px 0 rgba(17, 45, 78, 0.03)",
        card: "0 4px 20px -2px rgba(17, 45, 78, 0.08)",
        "card-hover": "0 10px 25px -4px rgba(63, 114, 175, 0.2), 0 4px 10px -2px rgba(17, 45, 78, 0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
