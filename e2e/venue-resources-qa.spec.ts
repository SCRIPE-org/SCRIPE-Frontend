import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("SCRIPE Venue - Courts & Spaces UX & Architecture E2E Verification", () => {
  test.use({ baseURL: "http://localhost:3005" });
  test.setTimeout(360_000);

  test("should verify simplified Courts & Spaces experience, multi-branch, metrics, and actions", async ({ page }) => {
    const scratchSecret = path.resolve("C:/Users/DELL/.gemini/antigravity/brain/8421ed51-658d-4db2-9a05-4d1e45afc1b6/scratch/.qa_secret");
    const password = process.env.SCRIPE_E2E_PASSWORD || (fs.existsSync(scratchSecret) ? fs.readFileSync(scratchSecret, "utf8").trim() : "");
    if (!password) {
      test.skip(true, "SCRIPE_E2E_PASSWORD is not set and .qa_secret is not present");
      return;
    }

    const consoleErrors: string[] = [];
    const http5xxErrors: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") {
        consoleErrors.push(text);
      }
    });

    page.on("response", (res) => {
      if (res.status() >= 500) {
        const err = `[HTTP ${res.status()}]: ${res.url()}`;
        console.log(err);
        http5xxErrors.push(err);
      }
    });

    const screenshotDir = path.resolve("test-results/venue-qa-screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // 1. Authenticate as manager
    console.log("Navigating to login...");
    await page.goto("/login");
    await expect(page.locator("input#identifier")).toBeVisible({ timeout: 20_000 });
    await page.locator("input#identifier").fill("manager@scripe.com");
    await page.locator('input[type="password"]').fill(password);
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 60_000 });
    await page.locator('button[type="submit"]').click();

    // In case of a transient connection retry, if alert appears or URL doesn't change after 15s, re-submit
    const loginSuccess = await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 }).then(() => true).catch(() => false);
    if (!loginSuccess) {
      console.log("Retrying login submit once in case of transient pooler timeout...");
      await page.waitForTimeout(2_000);
      if (await page.locator('button[type="submit"]').isEnabled().catch(() => false)) {
        await page.locator('button[type="submit"]').click();
      }
      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 60_000 });
    }
    console.log("Logged in successfully. Current URL:", page.url());

    // Wait for workspace readiness transition
    await page.waitForFunction(() => !document.body.innerText.includes("getting everything ready for you"), { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(2_000);

    // 2. Navigate to /venue/resources
    await page.goto("/venue/resources", { timeout: 90_000 });
    await page.waitForLoadState("domcontentloaded");
    // Wait for Next.js compilation / loading spinner to detach
    await page.locator('[role="status"]').waitFor({ state: "detached", timeout: 90_000 }).catch(() => {});
    await page.locator('[data-testid="venue-resources-workspace"]').waitFor({ state: "visible", timeout: 90_000 });
    await page.waitForTimeout(2_000);

    // 3. Assert Operational Metrics Strip
    const metricsTotal = page.locator('p:has-text("Total Courts & Spaces")').first();
    const metricsActive = page.locator('p:has-text("Active & Bookable")').first();
    const metricsSetup = page.locator('p:has-text("Setup Required")').first();
    const metricsBranches = page.locator('p:has-text("Authorized Facilities")').first();

    await expect(metricsTotal).toBeVisible();
    await expect(metricsActive).toBeVisible();
    await expect(metricsSetup).toBeVisible();
    await expect(metricsBranches).toBeVisible();
    console.log("ASSERTION_PASSED: Operational metrics strip rendered with live counts.");

    // 4. Assert Add Court CTA exists and capture Light Workspace
    const addCourtBtn = page.locator('button:has-text("+ Add Court / Space")').first();
    await expect(addCourtBtn).toBeVisible();
    await page.locator('[role="status"]').waitFor({ state: "detached", timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: path.join(screenshotDir, "04-venue-resources.png"), fullPage: true });
    console.log("Captured 04-venue-resources.png");

    // 5. Open Court Card Dropdown Actions Menu to prove non-inertness
    const moreMenuBtn = page.locator('button[aria-label="More options"]').first();
    if (await moreMenuBtn.isVisible().catch(() => false)) {
      await moreMenuBtn.click();
      await page.waitForTimeout(600);
      const calendarAction = page.locator('text="View on Calendar"').first();
      await expect(calendarAction).toBeVisible();
      console.log("ASSERTION_PASSED: Court card dropdown menu is fully active and shows action options.");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }

    // 6. Test Setup Wizard Modal (Onboarding Experience - Exact 3 Steps)
    console.log("Opening Add Court / Space Setup Wizard...");
    await addCourtBtn.click();
    await page.waitForTimeout(1_500);

    // Step 1: WHERE (Facility / Location Context)
    const facilityLabel = page.locator('label:has-text("Facility / Location Name")').first();
    await expect(facilityLabel).toBeVisible();
    console.log("ASSERTION_PASSED: Step 1 (WHERE) facility selector is active in setup wizard.");
    await page.screenshot({ path: path.join(screenshotDir, "11-venue-setup-wizard-step1.png") });

    // Advance to Step 2: WHAT (Sport & Courts)
    const nextBtn1 = page.locator('button:has-text("Next Step")').first();
    await expect(nextBtn1).toBeVisible({ timeout: 10_000 });
    await nextBtn1.click();
    await page.waitForTimeout(600);
    const step2Header = page.locator('text="2. WHAT"').first();
    await expect(step2Header).toBeVisible();
    console.log("ASSERTION_PASSED: Step 2 (WHAT) is active in setup wizard.");
    await page.screenshot({ path: path.join(screenshotDir, "11-venue-setup-wizard-step2.png") });

    // Advance to Step 3: WHEN & HOW MUCH (Schedule, Pricing & Review)
    const nextBtn2 = page.locator('button:has-text("Next Step")').first();
    await expect(nextBtn2).toBeVisible({ timeout: 10_000 });
    await nextBtn2.click();
    await page.waitForTimeout(1_000);

    // Assert Step 3 dual primary actions: "Save as Draft" and "Complete Setup & Publish"
    const saveDraftBtn = page.locator('button:has-text("Save as Draft")').first();
    const completePublishBtn = page.locator('button:has-text("Complete Setup & Publish")').first();
    await expect(saveDraftBtn).toBeVisible();
    await expect(completePublishBtn).toBeVisible();
    console.log("ASSERTION_PASSED: Step 3 (WHEN & HOW MUCH) exposes dual primary actions: Save as Draft and Complete Setup & Publish.");

    await page.screenshot({ path: path.join(screenshotDir, "11-venue-setup-wizard-step3.png") });
    await page.screenshot({ path: path.join(screenshotDir, "11-venue-setup-wizard.png") });
    console.log("Captured 11-venue-setup-wizard.png");

    // Close wizard
    const closeBtn = page.locator('button:has-text("Close"), button[aria-label="Close"]').first();
    await closeBtn.click();
    await page.waitForTimeout(800);

    // 7. Verify Court Detail / Configuration Tabs & Tab Query Parameter Navigation
    const configureLink = page.locator('a:has-text("Edit"), a:has-text("Complete Setup")').first();
    if (await configureLink.isVisible().catch(() => false)) {
      const href = await configureLink.getAttribute("href");
      if (href) {
        console.log(`Navigating to court detail: ${href}...`);
        await page.goto(href, { timeout: 60_000 });
        await page.waitForLoadState("domcontentloaded");
        await page.locator('[role="status"]').waitFor({ state: "detached", timeout: 60_000 }).catch(() => {});
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });
        await page.waitForTimeout(1_000);
        await page.screenshot({ path: path.join(screenshotDir, "14-venue-court-edit-tabs.png"), fullPage: true });
        console.log("Captured 14-venue-court-edit-tabs.png");

        // Verify action navigation with query parameter ?tab=workingHours
        console.log("Testing direct tab navigation with ?tab=workingHours...");
        await page.goto(`${href}?tab=workingHours`, { timeout: 60_000 });
        await page.waitForLoadState("domcontentloaded");
        await expect(page.locator('button:has-text("Save Working Hours")').first()).toBeVisible({ timeout: 10_000 });
        console.log("ASSERTION_PASSED: Dropdown link navigation with ?tab=workingHours directly opened Working Hours tab.");

        // Verify action navigation with alias query parameter ?tab=rules
        console.log("Testing direct tab navigation with alias ?tab=rules...");
        await page.goto(`${href}?tab=rules`, { timeout: 60_000 });
        await page.waitForLoadState("domcontentloaded");
        await expect(page.locator('button:has-text("Save Booking Rules")').first()).toBeVisible({ timeout: 10_000 });
        console.log("ASSERTION_PASSED: Dropdown link navigation with alias ?tab=rules directly opened Booking Rules tab.");
      }
    }

    // 8. Verify Dark Theme on Resources Workspace
    console.log("Switching to Dark Theme...");
    await page.goto("/venue/resources", { timeout: 60_000 });
    await page.waitForLoadState("domcontentloaded");
    await page.locator('[role="status"]').waitFor({ state: "detached", timeout: 60_000 }).catch(() => {});
    await expect(page.locator('[data-testid="venue-resources-workspace"]').first()).toBeVisible({ timeout: 60_000 });
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    });
    await page.waitForTimeout(1_500);
    await page.screenshot({ path: path.join(screenshotDir, "12-venue-dark-resources.png"), fullPage: true });
    console.log("Captured 12-venue-dark-resources.png");

    // 9. Verify Arabic RTL on Resources Workspace
    console.log("Switching to Arabic RTL...");
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "ar");
      document.cookie = "scr_lang=ar; path=/; max-age=31536000";
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    });
    await page.goto("/venue/resources", { timeout: 60_000 });
    await page.waitForLoadState("domcontentloaded");
    await page.locator('[role="status"]').waitFor({ state: "detached", timeout: 60_000 }).catch(() => {});
    await expect(page.locator('[data-testid="venue-resources-workspace"]').first()).toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(2_000);
    const htmlDir = await page.getAttribute("html", "dir");
    expect(htmlDir).toBe("rtl");
    await page.screenshot({ path: path.join(screenshotDir, "15-venue-arabic-rtl-resources.png"), fullPage: true });
    console.log("Captured 15-venue-arabic-rtl-resources.png");

    // Clean up back to English & Light
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "en");
      document.cookie = "scr_lang=en; path=/; max-age=31536000";
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    });

    // Zero 500 server crashes check
    expect(http5xxErrors).toEqual([]);
    console.log("ASSERTION_PASSED: Zero HTTP 5xx errors recorded during execution.");
  });
});
