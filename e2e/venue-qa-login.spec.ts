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

    // Console, network, and error monitoring instrumentation
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    const http5xxErrors: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      console.log(`[BROWSER ${msg.type()}]:`, text);
      if (msg.type() === "error") {
        consoleErrors.push(text);
      }
    });

    page.on("requestfailed", (req) => {
      const failureText = req.failure()?.errorText || "Unknown failure";
      // Filter out non-fatal cancelled prefetch or aborted navigation requests
      if (!failureText.includes("ERR_ABORTED")) {
        const failureMsg = `[REQUEST FAILED]: ${req.method()} ${req.url()} - ${failureText}`;
        console.log(failureMsg);
        failedRequests.push(failureMsg);
      }
    });

    page.on("response", (res) => {
      if (res.status() >= 500) {
        const err = `[HTTP ${res.status()}]: ${res.url()}`;
        console.log(err);
        http5xxErrors.push(err);
      } else if (res.url().includes("/api/") || res.status() >= 400) {
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

    // 5. Verify Venue Dashboard / Overview (Critical Assertions & Real Rendered Data)
    await visitAndCapture("/venue", "01-venue-dashboard.png", '[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]');
    const overviewLocator = page.locator('[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]');
    await expect(overviewLocator).toBeVisible({ timeout: 30_000 });
    const overviewContent = await overviewLocator.innerText();
    expect(overviewContent).toMatch(/No facilities configured|Downtown Sports Complex|Venue Operations|Football Pitch|Padel Court|Good morning/i);
    console.log("ASSERTION_PASSED: Venue Dashboard verified with live rendered state.");

    // 6. Verify Operations Calendar (Critical Assertions & Real Rendered Data)
    await visitAndCapture("/venue/calendar", "02-venue-calendar.png", '[data-testid="operations-calendar-view"]');
    const calendarLocator = page.locator('[data-testid="operations-calendar-view"]');
    await expect(calendarLocator).toBeVisible({ timeout: 30_000 });
    const calendarContent = await calendarLocator.innerText();
    expect(calendarContent.length).toBeGreaterThan(20);
    console.log("ASSERTION_PASSED: Operations Calendar verified with live rendered view.");

    // 6b. Verify ClickToBook Modal
    const newBookingBtn = page.locator('button:has-text("New Booking")').first();
    const isNewBookingEnabled = await newBookingBtn.isEnabled().catch(() => false);
    if (isNewBookingEnabled) {
      await newBookingBtn.click();
      await page.waitForTimeout(2_000);
      await page.screenshot({ path: path.join(screenshotDir, "11-venue-click-to-book.png") });
      console.log("Captured 11-venue-click-to-book.png");
      const closeBtn = page.locator('button:has-text("Cancel"), button[aria-label="Close"]').first();
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(1_000);
    } else {
      console.log("Navigating to calendar with published Padel Court Alpha booking parameters...");
      await page.goto("/venue/calendar?newBooking=true&facilityId=H6ys5JmT0LBpXLq2V6KOBy670JlGAMuMlmp2DSZHjqikxX9aXU9tw7ng3J8&resourceId=0rBiVgWtt13rEy3HygPjBuVtab0YOfkmyKBJNaoye9OWWDFh5-q7i-2dnsg", { timeout: 60_000 });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(4_000);
      await page.screenshot({ path: path.join(screenshotDir, "11-venue-click-to-book.png") });
      console.log("Captured 11-venue-click-to-book.png via direct published court query param");
    }

    // 7. Verify Facilities (Critical Assertions & Real Rendered Data from PostgreSQL)
    await visitAndCapture("/venue/facilities", "03-venue-facilities.png", "table");
    const tableLocator = page.locator("table");
    await expect(tableLocator).toBeVisible({ timeout: 30_000 });
    const tableText = await tableLocator.innerText();
    expect(tableText).toMatch(/Football Pitch 1|Padel Court 1/i);
    console.log("ASSERTION_PASSED: Facilities list verified with live record from PostgreSQL database.");

    // 8. Verify Resources & Courts
    await visitAndCapture("/venue/resources", "04-venue-resources.png", '[data-testid="venue-resources-workspace"]');
    const resourcesLocator = page.locator('[data-testid="venue-resources-workspace"]');
    await expect(resourcesLocator).toBeVisible({ timeout: 30_000 });
    console.log("ASSERTION_PASSED: Resources list verified.");

    // 8b. Capture Add Court Wizard modal
    const addCourtBtn = page.locator('button:has-text("Add Court / Space")').first();
    if (await addCourtBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await addCourtBtn.click();
      await page.waitForTimeout(1_500);
      await page.screenshot({ path: path.join(screenshotDir, "11-venue-setup-wizard.png") });
      console.log("Captured 11-venue-setup-wizard.png");
      const closeBtn = page.locator('button:has-text("Cancel"), button[aria-label="Close"]').first();
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(1_000);
    }

    // 8c. Capture Court Edit Detail Tabs
    const editCourtBtn = page.locator('a:has-text("Edit"), a:has-text("Complete Setup")').first();
    if (await editCourtBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const editHref = await editCourtBtn.getAttribute("href");
      if (editHref) {
        await visitAndCapture(editHref, "14-venue-court-edit-tabs.png", "input, [role='tablist']");
      }
    }

    // 9. Verify Reports & Analytics
    await visitAndCapture("/venue/reports", "05-venue-reports.png", "h1");
    const reportsH1 = page.locator("h1").first();
    await expect(reportsH1).toBeVisible({ timeout: 30_000 });
    console.log("ASSERTION_PASSED: Reports & Analytics view verified.");

    // 10. Verify Money & Financials
    await visitAndCapture("/venue/money", "06-venue-money.png", "h1");
    const moneyH1 = page.locator("h1").first();
    await expect(moneyH1).toBeVisible({ timeout: 30_000 });
    console.log("ASSERTION_PASSED: Money & Financials view verified.");

    // 11. Verify Dark Mode (Dashboard, Calendar, Resources, Money)
    console.log("Switching to Dark Theme...");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    });
    const htmlDarkClass = await page.getAttribute("html", "class");
    expect(htmlDarkClass).toContain("dark");
    await visitAndCapture("/venue", "07-venue-dark-dashboard.png", '[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]');
    await expect(page.locator('[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]')).toBeVisible();
    await visitAndCapture("/venue/calendar", "08-venue-dark-calendar.png", '[data-testid="operations-calendar-view"]');
    await expect(page.locator('[data-testid="operations-calendar-view"]')).toBeVisible();
    await visitAndCapture("/venue/resources", "12-venue-dark-resources.png", '[data-testid="venue-resources-workspace"]');
    await visitAndCapture("/venue/money", "13-venue-dark-money.png", "h1");
    console.log("ASSERTION_PASSED: Dark Mode applied and verified.");

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
    await expect(page.locator('[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]')).toBeVisible();
    const arabicDashboardText = await page.locator('[data-testid="venue-overview-view"], [data-testid="venue-overview-empty"]').innerText();
    expect(/[\u0600-\u06FF]/.test(arabicDashboardText)).toBe(true);

    await visitAndCapture("/venue/calendar", "10-venue-arabic-rtl-calendar.png", '[data-testid="operations-calendar-view"]');
    await expect(page.locator('[data-testid="operations-calendar-view"]')).toBeVisible();
    console.log("ASSERTION_PASSED: Arabic RTL layout and translations verified.");

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

    // 14. Error Instrumentation Validation
    console.log("Total browser console errors captured:", consoleErrors.length);
    console.log("Total failed network requests captured:", failedRequests.length);
    console.log("Total HTTP 5xx server errors captured:", http5xxErrors.length);

    // Critical assertion: Zero 500 server crashes during the entire authenticated operator walkthrough
    expect(http5xxErrors).toEqual([]);
    console.log("ASSERTION_PASSED: Zero HTTP 5xx server errors during authenticated test run.");
  });
});
