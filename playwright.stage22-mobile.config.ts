import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL;

if (!baseURL) {
  throw new Error("E2E_BASE_URL is required for the Stage 22 mobile UX proof.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "android-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "iphone-safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
