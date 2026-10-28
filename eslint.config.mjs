import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The standalone city runner is JavaScript, so retain undefined-name checks
  // that the TypeScript preset disables for TS source files.
  {
    files: ["public/games/city/game.mjs"],
    languageOptions: {
      globals: Object.fromEntries(
        [
          "window",
          "document",
          "innerWidth",
          "innerHeight",
          "devicePixelRatio",
          "matchMedia",
          "performance",
          "setTimeout",
          "clearTimeout",
          "requestAnimationFrame",
          "confirm",
          "console",
        ].map((name) => [name, "readonly"]),
      ),
    },
    rules: { "no-undef": "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/games/shared/vendor/**",
  ]),
]);

export default eslintConfig;
