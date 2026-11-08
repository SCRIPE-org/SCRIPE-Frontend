import { defineConfig, devices } from "@playwright/test";

/**
 * Dedicated Playwright Configuration for SCRIPE Sovereign Account Console v4.0 Suite.
 * Targets all 9 `/account/*` B2B enterprise pages in both Tactical Dark Mode and Clean Light Mode.
 */
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 90_000,

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: {
    command: "pnpm dev -p 3000",
    port: 3000,
    reuseExistingServer: true,
    timeout: 90_000,
  },
});
