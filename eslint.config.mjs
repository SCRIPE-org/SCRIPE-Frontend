// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "e2e/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value.value=/(^|\\s)(text|bg|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}(\\s|$)|(^|\\s)shadow-(sm|md|lg|xl|2xl)(\\s|$)|(^|\\s)rounded-\\[|(^|\\s)z-\\[|(^|\\s)duration-(300|500|700|1000)(\\s|$)|(^|\\s)transition-all(\\s|$)|(^|\\s)(ml|mr|pl|pr|left|right)-\\S|(^|\\s)text-(left|right)(\\s|$)/]",
          message:
            "Use nx-* design tokens and logical/RTL-aware classes instead of raw Tailwind palette colors, shadow-*, rounded-[], z-[], duration-(300|500|700|1000), transition-all, or physical-direction (ml-/mr-/pl-/pr-/left-/right-/text-left/text-right) utilities.",
        },
      ],
    },
  },
  ...storybook.configs["flat/recommended"],
]);

export default eslintConfig;
