import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    include: ["tests/live/account-deletion.test.ts"],
    environment: "node",
    testTimeout: 240_000,
    fileParallelism: false,
  },
});
