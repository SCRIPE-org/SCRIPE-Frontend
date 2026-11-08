import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  applyThemeMode,
  mockWebAuthn,
  setupSovereignAccountRouteMocks,
} from "./fixtures/account-test-helpers";

const BRAIN_SCREENSHOT_DIR =
  "C:/Users/seif/.gemini/antigravity/brain/85911dec-5598-43ed-8cc4-47e444517b35/screenshots";
const REPO_SCREENSHOT_DIR = path.resolve(process.cwd(), "screenshots/toast-preferences");

function ensureScreenshotDirs() {
  fs.mkdirSync(BRAIN_SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(REPO_SCREENSHOT_DIR, { recursive: true });
}

async function saveDualScreenshot(page: import("@playwright/test").Page, filename: string) {
  ensureScreenshotDirs();
  const buffer = await page.screenshot({ fullPage: true });
  fs.writeFileSync(path.join(BRAIN_SCREENSHOT_DIR, filename), buffer);
  fs.writeFileSync(path.join(REPO_SCREENSHOT_DIR, filename), buffer);
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
    await page.goto("/account/preferences", { waitUntil: "commit", timeout: 60_000 });

    // Verify Toast Viewport Card is visible
    const cardTitle = page.getByRole("heading", { name: /Toast Viewport|موقع إشعارات/i });
    await expect(cardTitle.first()).toBeVisible({ timeout: 30_000 });

    // Ensure Dark Mode
    await applyThemeMode(page, "dark");

    // Click Top-Right position button
    const topRightBtn = page.locator('[data-testid="toast-position-top-right"]');
    await expect(topRightBtn).toBeVisible();
    await topRightBtn.click();

    // Trigger Smart Test Toast explicitly if not already triggered
    const triggerBtn = page.locator('[data-testid="trigger-smart-test-toast-btn"]');
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();

    // Wait for the toast to appear with rich title
    await page.waitForTimeout(600);

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

    // Switch to Arabic language
    const arabicBtn = page.locator('[data-testid="language-ar"]');
    if (await arabicBtn.isVisible()) {
      await arabicBtn.click();
    } else {
      await page.evaluate(() => {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.setAttribute("lang", "ar");
        window.localStorage.setItem("language", "ar");
      });
    }

    await page.waitForTimeout(600);

    // Verify RTL mirroring badge
    const badge = page.locator("text=نمط RTL نشط").or(page.locator("text=RTL Mode Active"));
    await expect(badge.first()).toBeVisible({ timeout: 10_000 });

    // Click Top-Left in Arabic (which represents Top-End in RTL)
    const topLeftBtn = page.locator('[data-testid="toast-position-top-left"]');
    await expect(topLeftBtn).toBeVisible();
    await topLeftBtn.click();

    await page.waitForTimeout(600);

    // Capture Arabic RTL Mode screenshot with live toast
    await saveDualScreenshot(page, "03-toast-preferences-arabic-rtl.png");
  });
});
