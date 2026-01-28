import globals from "globals";
import pluginJs from "@eslint/js";
import checkFile from "eslint-plugin-check-file";

export default [
  pluginJs.configs.recommended,

  {
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.js": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true, 
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/": "KEBAB_CASE",
        },
      ],
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**", "eslint.config.mjs"],
  },
];