// eslint.config.mjs
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierPlugin from "eslint-plugin-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { tsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
    },

    rules: {
      // 🔹 TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn"], // Warn when variables are unused
      "@typescript-eslint/no-explicit-any": ["warn"], // Warn when 'any' is used

      // 🔹 React rules
      "react/react-in-jsx-scope": "off", // Next.js not require React in scope
      "react/jsx-pascal-case": "error", // Enforce PascalCase for component names
      "react-hooks/rules-of-hooks": "error", // Enforce rules of hooks
      "react-hooks/exhaustive-deps": "warn", // Warn about missing dependencies in useEffect

      // 🔹 General JS rules
      eqeqeq: ["error", "always"], // Enforce strict equality
      "no-console": ["warn"], // Warn on console usage
      "no-var": "error", // Disallow var, use let/const
      "prefer-const": "warn", // Suggest using const when variables are not reassigned

      // 🔹 Import rules
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // 🔹 Prettier
      "prettier/prettier": [
        "warn",
        {
          semi: true,
          singleQuote: false,
          trailingComma: "es5",
          tabWidth: 2,
          printWidth: 100,
          endOfLine: "auto",
        },
      ],
    },

    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**", "dist/**"]),
]);

export default eslintConfig;
