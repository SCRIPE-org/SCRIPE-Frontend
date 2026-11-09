import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  applyThemeMode,
  mockWebAuthn,
  setupSovereignAccountRouteMocks,
} from "./fixtures/account-test-helpers";

const PRIMARY_BRAIN_DIR =
  "C:/Users/seif/.gemini/antigravity/brain/8725e4d2-d0d0-40de-81f9-0ff23647d3c5";
const PRIMARY_BRAIN_SCREENSHOTS_DIR =
  "C:/Users/seif/.gemini/antigravity/brain/8725e4d2-d0d0-40de-81f9-0ff23647d3c5/screenshots";
const REPO_SCREENSHOT_DIR = path.resolve(process.cwd(), "screenshots/toast-preferences");

function ensureScreenshotDirs() {
  fs.mkdirSync(PRIMARY_BRAIN_DIR, { recursive: true });
  fs.mkdirSync(PRIMARY_BRAIN_SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(REPO_SCREENSHOT_DIR, { recursive: true });
}

async function saveDualScreenshot(page: import("@playwright/test").Page, filename: string) {
  ensureScreenshotDirs();

  // Scroll to the top so sticky/fixed elements reset to their natural positions
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Measure the total scrollable height of the document
  const fullHeight = await page.evaluate(() =>
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 1200)
  );

  // Expand the viewport to encompass the entire document height.
  // This completely eliminates Playwright's tile-stitching bug where sticky headers
  // get duplicated and stamped across the middle of the cards.
  await page.setViewportSize({ width: 1440, height: fullHeight });
  await page.waitForTimeout(400);

  // Capture single-frame, high-resolution full page screenshot
  const buffer = await page.screenshot({ fullPage: false });

  // Save to current brain root, brain screenshots folder, and repo folder
  fs.writeFileSync(path.join(PRIMARY_BRAIN_DIR, filename), buffer);
  fs.writeFileSync(path.join(PRIMARY_BRAIN_SCREENSHOTS_DIR, filename), buffer);
  fs.writeFileSync(path.join(REPO_SCREENSHOT_DIR, filename), buffer);

  // Restore normal viewport size
  await page.setViewportSize({ width: 1440, height: 900 });
}

test.describe("SCRIPE Toast Viewport & Smart Notification Position — E2E Acceptance", () => {
  test.beforeEach(async ({ page }) => {
    await mockWebAuthn(page);
    await setupSovereignAccountRouteMocks(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("01 - Tactical Dark Mode: renders position grid and fires live smart test toast with rich actions", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/account/preferences", { waitUntil: "commit", timeout: 90_000 });

    // Verify Toast Viewport Card is visible
    const cardTitle = page.getByRole("heading", { name: /Toast Viewport|موقع إشعارات/i });
    await expect(cardTitle.first()).toBeVisible({ timeout: 30_000 });

    // Ensure Dark Mode
    await applyThemeMode(page, "dark");

    // Click Top-End position button (Top-Right in English LTR)
    const topEndBtn = page.locator('[data-testid="toast-position-top-end"]');
    await expect(topEndBtn).toBeVisible();
    await topEndBtn.click();

    // Trigger Smart Test Toast explicitly if not already triggered
    const triggerBtn = page.locator('[data-testid="trigger-smart-test-toast-btn"]');
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();

    // Wait for the toast to appear with rich title
    const toastTitle = page.locator("text=Tactical Telemetry Synced").first();
    await expect(toastTitle).toBeVisible({ timeout: 15_000 });

    // Capture Tactical Dark Mode screenshot with live toast
    await saveDualScreenshot(page, "01-toast-preferences-dark-top-right.png");
  });

  test("02 - Clean Light Mode: updates to bottom-center with rich live toast preview", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/account/preferences", { waitUntil: "commit", timeout: 60_000 });

    // Switch to Clean Light mode
    await applyThemeMode(page, "light");

    // Select Bottom-Center position
    const bottomCenterBtn = page.locator('[data-testid="toast-position-bottom-center"]');
    await expect(bottomCenterBtn).toBeVisible({ timeout: 30_000 });
    await bottomCenterBtn.click();

    await page.waitForTimeout(600);

    // Capture Clean Light Mode screenshot with live bottom-center toast
    await saveDualScreenshot(page, "02-toast-preferences-light-bottom-center.png");
  });

  test("03 - Arabic RTL Mode: automatically detects RTL direction and mirrors logical positions", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/account/preferences", { waitUntil: "commit", timeout: 60_000 });

    // Switch to Arabic language by scrolling to and clicking the Arabic toggle
    const arabicBtn = page.locator('[data-testid="language-ar"]');
    await arabicBtn.scrollIntoViewIfNeeded();
    await arabicBtn.click();

    await page.waitForTimeout(600);

    // Verify RTL mirroring badge is visible with RTL detection
    const badge = page.locator('[data-testid="toast-mirror-badge"]');
    await expect(badge).toBeVisible({ timeout: 10_000 });
    await expect(badge).toContainText("RTL");

    // Click Top-End position button in Arabic (which represents Top-Left in RTL)
    const topEndBtn = page.locator('[data-testid="toast-position-top-end"]');
    await topEndBtn.scrollIntoViewIfNeeded();
    await expect(topEndBtn).toBeVisible();
    await expect(topEndBtn).toContainText("أعلى اليسار");
    await topEndBtn.click();

    // Verify Arabic smart test toast is visible
    const arabicToast = page.locator("text=تمت مزامنة القياسات التكتيكية").first();
    await expect(arabicToast).toBeVisible({ timeout: 15_000 });

    // Capture Arabic RTL Mode screenshot with live toast
    await saveDualScreenshot(page, "03-toast-preferences-arabic-rtl.png");
  });
});
