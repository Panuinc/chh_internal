import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {

      "camelcase": ["error", {
        "properties": "always",
        "ignoreDestructuring": false,
        "ignoreImports": false,
        "ignoreGlobals": false
      }],

      "react/jsx-pascal-case": "error",
    },
  },

  globalIgnores([

    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
