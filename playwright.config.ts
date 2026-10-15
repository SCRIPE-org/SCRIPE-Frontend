import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for SCRIPE E2E tests.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  timeout: 1_800_000,

  use: {
    baseURL: "http://localhost:3005",
    navigationTimeout: 180_000,
    actionTimeout: 120_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: {
          args: [
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=CalculateNativeWinOcclusion",
          ],
        },
      },
    },
  ],

  webServer: {
    command: "pnpm run dev -p 3005",
    port: 3005,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
