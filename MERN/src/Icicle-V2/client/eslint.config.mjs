import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import checkFile from "eslint-plugin-check-file";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx,js,jsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },
  {
    files: ["src/hooks/**/*", "hooks/**/*"],
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx,js,jsx}": "CAMEL_CASE",
        },
      ],
    },
  },
  {
    files: ["src/components/**/*", "components/**/*"],
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{tsx,jsx}": "PASCAL_CASE",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "src/app/**", // Thường app router của Next.js yêu cầu kebab-case hoặc tên file đặc biệt (page.tsx), nên ignore là hợp lý
  ]),
]);

export default eslintConfig;