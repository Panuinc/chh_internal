import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Enforce camelCase
      "camelcase": ["error", { 
        "properties": "always",
        "ignoreDestructuring": false,
        "ignoreImports": false,
        "ignoreGlobals": false
      }],
      // Enforce PascalCase for React components
      "react/jsx-pascal-case": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
