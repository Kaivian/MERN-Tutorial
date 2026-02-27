import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Quan trọng: Sử dụng class để kích hoạt dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ['var(--font-jersey10)', 'cursive'],
        roboto: ['var(--font-roboto)', 'sans-serif'],
        jersey10: ['var(--font-jersey10)', 'cursive'],
      },
      colors: {
        "retro-orange": "#ee9d2b", // FPT Orange
        "retro-dark": "#2d0b46",   // Dark Purple
        "retro-purple": "#5d1b5c", // Mid Purple
        "retro-pink": "#b52b7c",   // Pinkish accent
        "retro-bg": "#fff5e6",     // Light Background
        "retro-bg-dark": "#18181b",// Updated: Darker Zinc for better contrast
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px #000000",
        "pixel-hover": "2px 2px 0px 0px #000000",
        "pixel-dark": "4px 4px 0px 0px #ffffff", // Shadow trắng cho dark mode
        "pixel-dark-hover": "2px 2px 0px 0px #ffffff",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          },
        },
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#fff5e6", // Match retro-bg
            foreground: "#000000",
            primary: {
              DEFAULT: "#ee9d2b",
              foreground: "#000000",
            },
          },
        },
        dark: {
          colors: {
            background: "#18181b", // Match retro-bg-dark (Zinc-950)
            foreground: "#ffffff",
            primary: {
              DEFAULT: "#ee9d2b",
              foreground: "#000000",
            },
            content1: "#27272a", // Zinc-800 for cards
          },
        },
      },
    }),
  ],
};

export default config;