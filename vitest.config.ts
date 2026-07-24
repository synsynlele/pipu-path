import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/app/**",
        "src/**/*.d.ts",
        "src/proxy.ts",
        "src/components/shells/app-shell.tsx",
        "src/components/shells/auth-shell.tsx",
        "src/lib/supabase/**",
        "src/modules/identity/application/auth-actions.ts",
        "src/modules/identity/application/checkpoint-actions.ts",
        "src/modules/identity/application/form-state.ts",
        "src/modules/identity/infrastructure/identity-dal.ts",
        "src/modules/identity/ui/**",
        "src/modules/discovery/application/discovery-actions.ts",
        "src/modules/discovery/infrastructure/discovery-dal.ts",
        "src/modules/discovery/ui/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
