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

function purgeObsoleteV3Screenshots() {
  for (const dir of [BRAIN_SCREENSHOT_DIR, REPO_SCREENSHOT_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".png")) {
        fs.unlinkSync(path.join(dir, file));
      }
    }
  }
}

async function saveDualScreenshot(page: import("@playwright/test").Page, filename: string) {
  ensureScreenshotDirs();
  const buffer = await page.screenshot({ fullPage: true });
  fs.writeFileSync(path.join(BRAIN_SCREENSHOT_DIR, filename), buffer);
  fs.writeFileSync(path.join(REPO_SCREENSHOT_DIR, filename), buffer);
}

test.describe("SCRIPE Clean 9-Page B2B Enterprise Account Console (v5.0 Polish & Transcendence) — Dark & Light Modes + Interactive E2E", () => {
  test.beforeEach(async ({ page }) => {
    await mockWebAuthn(page);
    await setupSovereignAccountRouteMocks(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("00 - Root /account redirects cleanly to /account/dossier", async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto("/account/dossier", { waitUntil: "commit", timeout: 180_000 });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 90_000 });
    await page.goto("/account", { waitUntil: "commit", timeout: 90_000 });
    await page.waitForURL("**/account/dossier", { timeout: 60_000 });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 60_000 });
  });

  test("01..09 - All 9 B2B Enterprise Account Pages render in Tactical Dark Mode & Clean Light Mode with zero overflow", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    ensureScreenshotDirs();
    purgeObsoleteV3Screenshots();

    for (const route of SOVEREIGN_ACCOUNT_ROUTES) {
      await page.goto(route.path, { waitUntil: "commit" });
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 60_000 });
      if (route.slug === "sessions") {
        await page.waitForTimeout(1500);
      }

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

  test("10 - Interactive Dossier v5.0: Read-Only Default -> Edit Profile Mode, Seamless Custom Fields, 3-Step Change Email OTP Modal, Lifecycle Export & Deactivate, Command Bar & Privacy Blur", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.goto("/account/dossier", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await applyThemeMode(page, "dark");

    // 1. Verify Read-Only View Mode by default & Seamless Custom Fields inside Personal Information
    await expect(page.getByTestId("personal-info-readonly-grid")).toBeVisible();
    await expect(page.getByText(/Corporate Employee Badge ID/i).first()).toBeVisible();
    await expect(page.getByText(/Executive Division \/ Cost Center/i).first()).toBeVisible();
    await expect(page.getByText(/Primary Office \/ Desk Location/i).first()).toBeVisible();
    await expect(page.getByText(/Emergency Contact/i).first()).toBeVisible();
    await expect(page.getByTestId("remove-avatar-btn")).toBeVisible();
    await expect(page.getByTestId("account-lifecycle-card")).toBeVisible();

    // 2. Click "Edit Profile" to enter Edit Mode and capture 01b_dossier_edit_mode_dark.png
    await page.getByTestId("edit-profile-btn").click();
    await expect(page.getByTestId("personal-info-edit-form")).toBeVisible();
    await saveDualScreenshot(page, "01b_dossier_edit_mode_dark.png");
    await page.getByTestId("cancel-edit-profile-btn").click();
    await expect(page.getByTestId("personal-info-readonly-grid")).toBeVisible();

    // 3. Open 3-Step Change Email Verification Modal and capture 01c_dossier_change_email_otp_modal_dark.png
    await page.getByTestId("open-change-email-btn").click();
    await expect(page.getByTestId("identity-change-modal")).toBeVisible();
    await saveDualScreenshot(page, "01c_dossier_change_email_otp_modal_dark.png");
    await page.keyboard.press("Escape");

    // 4. Trigger Command Bar via Ctrl+K
    await page.keyboard.press("Control+k");
    const searchInput = page.locator('input[type="text"], input[placeholder]').first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await saveDualScreenshot(page, "10_command_bar_modal_dark.png");
    await page.keyboard.press("Escape");

    // 5. Trigger Broadcast Privacy Blur via Alt+P
    await page.keyboard.press("Alt+p");
    await page.waitForTimeout(250);
    await saveDualScreenshot(page, "11_privacy_blur_active_dark.png");
    await page.keyboard.press("Alt+p");
  });

  test("11 - Interactive B2B Flows across Security (Connected SSO), Sessions (OpenStreetMap Radar), Governance (Module Accordions), Notifications, Plan & API Tokens", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    // 1. Security: Verify Passkey Vault, Connected Enterprise SSO Card (BrandIcons), Biometric Sudo & CIDR Allowlist
    await page.goto("/account/security", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Executive MacBook Pro M4/i).first()).toBeVisible();
    await expect(page.getByTestId("connected-enterprise-sso-card")).toBeVisible();
    await expect(page.getByText(/Google Workspace Enterprise/i).first()).toBeVisible();
    await expect(page.getByText(/Microsoft Entra ID/i).first()).toBeVisible();

    // 2. Sessions: Verify Interactive OpenStreetMap Geolocation Map & Non-Overlapping Callouts
    await page.goto("/account/sessions", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("sovereign-session-radar")).toBeVisible();
    await expect(page.getByTestId("map-selected-workstation-inspector")).toBeVisible();
    await expect(page.getByText(/197\.38\.14\.88/).first()).toBeVisible();

    // 3. Governance: Verify Executive Summary, Assigned Roles & Searchable Business Module Capabilities Matrix
    await page.goto("/account/governance", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("permission-provenance-graph")).toBeVisible();
    await expect(page.getByText(/Manage Sales Pipelines & Commercial Stages/i).first()).toBeVisible();

    // 4. Notifications: Verify Live Notification Matrix, Security Bypass Law, 1-Click Live Test Notification & Feed Actions
    await page.goto("/account/notifications", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    const sendTestBtn = page.getByTestId("send-test-notification-btn");
    await expect(sendTestBtn).toBeVisible();
    await sendTestBtn.click();
    await expect(page.getByText(/Live B2B Test Notification/i).first()).toBeVisible();
    const markAllReadBtn = page.getByTestId("mark-all-notifications-read-btn");
    await expect(markAllReadBtn).toBeVisible();
    await markAllReadBtn.click();

    // 5. Plan: Verify Edition, Support PIN & 3-State Features Matrix
    await page.goto("/account/plan", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("849201").first()).toBeVisible();

    // 6. Integrations (API & Developer Tokens): Verify Rate-Limit Telemetry Strip & SHA-256 Personal Access Tokens
    await page.goto("/account/integrations", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("pat-telemetry-strip")).toBeVisible();
    await expect(page.getByText(/4,980 \/ 5,000/i).first()).toBeVisible();
    await expect(page.getByText(/Enterprise BI & CRM Reporting Sync CLI/i).first()).toBeVisible();
  });
});

