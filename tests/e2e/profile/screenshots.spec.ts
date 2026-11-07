import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks, mockWebAuthn } from "./fixtures/test-helpers";
import * as path from "path";

test.describe("Profile & Security Sovereign Views - High-Res Screenshots", () => {
  const screenshotDir = path.resolve(process.cwd(), "screenshots/profile");

  test.beforeEach(async ({ page }) => {
    await mockWebAuthn(page);
    await setupProfileRouteMocks(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("01 - Executive Dossier View", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "01_executive_dossier.png"), fullPage: true });
  });

  test("02 - Sovereign Security Vault View", async ({ page }) => {
    await page.goto("/profile/security");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "02_security_vault.png"), fullPage: true });
  });

  test("03 - Workstation Sessions Fleet View", async ({ page }) => {
    await page.goto("/profile/sessions");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "03_workstation_sessions.png"), fullPage: true });
  });

  test("04 - SOC2 Audit Activity Trail View", async ({ page }) => {
    await page.goto("/profile/activity");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "04_soc2_audit_trail.png"), fullPage: true });
  });

  test("05 - Preferences and Ergonomics View", async ({ page }) => {
    await page.goto("/profile/preferences");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "05_preferences_ergonomics.png"), fullPage: true });
  });

  test("06 - SSO and Developer Integrations View", async ({ page }) => {
    await page.goto("/profile/integrations");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "06_sso_integrations.png"), fullPage: true });
  });
});
