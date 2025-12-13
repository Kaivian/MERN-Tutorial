import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        content4: "#DEECFE",
        danger: {
          DEFAULT: "#FA003F",
        },
        primary: {
          DEFAULT: "#0062A7",
        }
      }
    },
    dark: {
      colors: {
        background: "#212121",
        content4: "#313131",
        danger: {
          DEFAULT: "#D6204E",
        },
        primary: {
          DEFAULT: "#3F3F47",
        }
      }
    }
  },
})],
};

export default config;
