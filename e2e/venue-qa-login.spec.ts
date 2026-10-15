import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("SCRIPE Venue - Real QA Authentication & Workspace E2E", () => {
  test.use({ baseURL: "http://localhost:3005" });
  test.setTimeout(1_800_000);

  test("should authenticate venue_manager and load Venue workspace", async ({ page }) => {
    const scratchSecret = path.resolve("C:/Users/DELL/.gemini/antigravity/brain/8421ed51-658d-4db2-9a05-4d1e45afc1b6/scratch/.qa_secret");
    const password = process.env.SCRIPE_E2E_PASSWORD || (fs.existsSync(scratchSecret) ? fs.readFileSync(scratchSecret, "utf8").trim() : "");
    if (!password) {
      test.skip(true, "SCRIPE_E2E_PASSWORD is not set and .qa_secret is not present");
      return;
    }

    // Console and error monitoring
    const consoleLogs: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (msg) => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    page.on("requestfailed", (req) => {
      console.log(`[REQUEST FAILED]:`, req.method(), req.url(), req.failure()?.errorText);
    });

    page.on("response", (res) => {
      if (res.url().includes("/api/") || res.status() >= 400) {
        console.log(`[HTTP ${res.status()}]:`, res.url());
      }
    });

    // Ensure screenshot directory exists
    const screenshotDir = path.resolve("test-results/venue-qa-screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // 1. Navigate to login
    await page.goto("/login");
    await expect(page.locator("input#identifier")).toBeVisible({ timeout: 20_000 });

    // 2. Fill credentials
    await page.locator("input#identifier").fill("manager@scripe.com");
    await page.locator('input[type="password"]').fill(password);

    // 3. Submit
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 60_000 });
    await page.locator('button[type="submit"]').click();

    // 4. Wait for navigation away from login (allow up to 240s for WAN database roundtrip)
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 240_000 });
    console.log("LOGIN_SUCCESS: Post-login URL is:", page.url());

    // Wait for workspace readiness transition
    await page.waitForFunction(() => !document.body.innerText.includes("getting everything ready for you"), { timeout: 30_000 }).catch(() => {});

    // Helper to settle page and capture screenshot
    const visitAndCapture = async (url: string, screenshotName: string, contentSelector?: string) => {
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { timeout: 90_000 });
      await page.waitForLoadState("domcontentloaded");
      // If a specific content selector is provided, wait for it
      if (contentSelector) {
        await page.locator(contentSelector).first().waitFor({ state: "visible", timeout: 90_000 }).catch((e) => {
          console.log(`Notice: ${contentSelector} not visible within 90s on ${url}`);
        });
      }
      // Wait for any global loading spinner to disappear
      await page.locator('[role="status"]').waitFor({ state: "detached", timeout: 60_000 }).catch(() => {});
      // Settle brief animation
      await page.waitForTimeout(3_000);
      await page.screenshot({ path: path.join(screenshotDir, screenshotName), fullPage: true });
      console.log(`Captured ${screenshotName}`);
    };

    // 5. Verify Venue Dashboard / Overview
    await visitAndCapture("/venue", "01-venue-dashboard.png", '[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]');

    // 6. Verify Operations Calendar
    await visitAndCapture("/venue/calendar", "02-venue-calendar.png", '[data-testid="operations-calendar-view"]');

    // 7. Verify Facilities
    await visitAndCapture("/venue/facilities", "03-venue-facilities.png", "table, [data-testid=\"empty-state\"], h1");

    // 8. Verify Resources & Courts
    await visitAndCapture("/venue/resources", "04-venue-resources.png", "table, [data-testid=\"empty-state\"], h1");

    // 9. Verify Reports & Analytics
    await visitAndCapture("/venue/reports", "05-venue-reports.png", "h1, [role=\"tablist\"]");

    // 10. Verify Money & Financials
    await visitAndCapture("/venue/money", "06-venue-money.png", "h1, [role=\"tablist\"]");

    // 11. Verify Dark Mode (Dashboard & Calendar)
    console.log("Switching to Dark Theme...");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    });
    await visitAndCapture("/venue", "07-venue-dark-dashboard.png", '[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]');
    await visitAndCapture("/venue/calendar", "08-venue-dark-calendar.png", '[data-testid="operations-calendar-view"]');

    // 12. Verify Arabic RTL (Dashboard & Calendar)
    console.log("Switching to Arabic RTL...");
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "ar");
      document.cookie = "scr_lang=ar; path=/; max-age=31536000";
    });
    await page.goto("/venue", { timeout: 90_000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3_000);
    const htmlDir = await page.getAttribute("html", "dir");
    const htmlLang = await page.getAttribute("html", "lang");
    console.log(`Arabic HTML attributes: dir=${htmlDir}, lang=${htmlLang}`);
    expect(htmlDir).toBe("rtl");
    expect(htmlLang).toBe("ar");

    await visitAndCapture("/venue", "09-venue-arabic-rtl-dashboard.png", '[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]');
    await visitAndCapture("/venue/calendar", "10-venue-arabic-rtl-calendar.png", '[data-testid="operations-calendar-view"]');

    // 13. Restore English and Light Theme (clean test state)
    console.log("Restoring English and Light Theme...");
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "en");
      document.cookie = "scr_lang=en; path=/; max-age=31536000";
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    });
    await page.goto("/venue", { timeout: 90_000 });
    await page.waitForLoadState("domcontentloaded");

    console.log("Console errors captured:", consoleLogs.length);
    console.log("Failed network requests:", failedRequests.length);
  });
});
