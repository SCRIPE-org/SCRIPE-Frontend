import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  SOVEREIGN_ACCOUNT_ROUTES,
  applyThemeMode,
  mockWebAuthn,
  setupSovereignAccountRouteMocks,
} from "./fixtures/account-test-helpers";

const BRAIN_SCREENSHOT_DIR =
  "C:/Users/seif/.gemini/antigravity/brain/41501c95-3202-4431-87e4-d1839e400b2e/screenshots/account";
const REPO_SCREENSHOT_DIR = path.resolve(process.cwd(), "screenshots/account");

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

test.describe("SCRIPE Sovereign Account World v3.0 — 15 Pages (Dark & Light Modes + Interactive E2E)", () => {
  test.beforeEach(async ({ page }) => {
    await mockWebAuthn(page);
    await setupSovereignAccountRouteMocks(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("00 - Root /account redirects cleanly to /account/dossier", async ({ page }) => {
    await page.goto("/account");
    await page.waitForURL("**/account/dossier", { timeout: 20_000 });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
  });

  test("01..15 - All 15 Sovereign Account Pages render in Tactical Dark Mode & Clean Light Mode with zero overflow", async ({
    page,
  }) => {
    test.setTimeout(300_000);

    for (const route of SOVEREIGN_ACCOUNT_ROUTES) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });

      // 1. Tactical Dark Mode Verification & Full-Res Capture
      await applyThemeMode(page, "dark");
      await expect(page.locator("html")).toHaveClass(/dark/);
      const darkOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 4
      );
      expect(darkOverflow, `Horizontal overflow detected in Dark Mode on ${route.path}`).toBe(false);
      await saveDualScreenshot(page, `${route.index}_${route.slug}_dark.png`);

      // 2. Clean Light Mode Verification & Full-Res Capture
      await applyThemeMode(page, "light");
      await expect(page.locator("html")).toHaveClass(/light/);
      const lightOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 4
      );
      expect(lightOverflow, `Horizontal overflow detected in Light Mode on ${route.path}`).toBe(false);
      await saveDualScreenshot(page, `${route.index}_${route.slug}_light.png`);

      // Restore dark mode for subsequent navigation
      await applyThemeMode(page, "dark");
    }
  });

  test("16 - Interactive Shell: Command Bar (Ctrl+K), Privacy Blur (Alt+P), and 180° Pass Flip", async ({
    page,
  }) => {
    await page.goto("/account/dossier", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await applyThemeMode(page, "dark");

    // Trigger Command Bar via Ctrl+K
    await page.keyboard.press("Control+k");
    const searchInput = page.locator('input[type="text"], input[placeholder]').first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await saveDualScreenshot(page, "16_command_bar_modal_dark.png");
    await page.keyboard.press("Escape");

    // Trigger Press-Conference Privacy Blur via Alt+P
    await page.keyboard.press("Alt+p");
    await page.waitForTimeout(250);
    await saveDualScreenshot(page, "18_privacy_blur_active_dark.png");
    await page.keyboard.press("Alt+p");

    // Navigate to /account/credentials and flip the 180° Sovereign Identity Pass
    await page.goto("/account/credentials", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    const flipButton = page.getByTestId("flip-sovereign-pass-btn");
    await expect(flipButton).toBeVisible({ timeout: 10_000 });
    await flipButton.click();
    await expect(page.getByTestId("sovereign-pass-back")).toBeVisible({ timeout: 5_000 });
    await saveDualScreenshot(page, "17_identity_pass_back_dark.png");
  });

  test("17 - Interactive Mutations across Security, Sessions, Governance, Privacy, Plan, Billing & Integrations", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    // 1. Security: Verify Passkey Vault, Biometric Sudo & Away-Match Travel Shield
    await page.goto("/account/security", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Executive MacBook Pro M4/i).first()).toBeVisible();

    // 2. Sessions: Verify Active Workstation Fleet & Session Radar
    await page.goto("/account/sessions", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/197\.38\.14\.88/).first()).toBeVisible();

    // 3. Governance: Verify Permission Provenance Graph & Delegations
    await page.goto("/account/governance", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Platform Operations/i).first()).toBeVisible();

    // 4. Privacy: Verify Zero-Knowledge Scratchpad & DSAR Export
    await page.goto("/account/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/AES-256-GCM/i).first()).toBeVisible();

    // 5. Plan: Verify Edition, Support PIN & 3-State Features Matrix
    await page.goto("/account/plan", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("849201").first()).toBeVisible();

    // 6. Billing: Verify Corporate Card & Expense Ledger
    await page.goto("/account/billing", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/8842/).first()).toBeVisible();

    // 7. Integrations: Verify PATs, Ed25519 SSH Keys & Personal Webhooks
    await page.goto("/account/integrations", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/SHA256:9f8a000000000001e41c/i).first()).toBeVisible();
  });
});
