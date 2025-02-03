import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.ts"],
  },
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier: prettierPlugin,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },

    rules: {
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "import",
          format: ["camelCase", "PascalCase"],
        },
      ],

      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      semi: "warn",

      // 🔹 Apply Prettier rules and enforce formatting
      ...prettier.rules,
      "prettier/prettier": "warn",
    },
  },
];
