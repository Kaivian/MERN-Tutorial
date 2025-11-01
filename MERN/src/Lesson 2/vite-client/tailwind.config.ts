import { heroui } from "@heroui/react";

module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/button.js",
    './node_modules/@heroui/theme/dist/components/(button|snippet|code|input).js'
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};