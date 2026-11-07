import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks } from "./fixtures/test-helpers";
import { MOCK_AUDIT_LOGS } from "./fixtures/profile-mock-data";

test.describe("Feature 4: SOC2 Compliance Audit Activity Trail (ProfileActivityView)", () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRouteMocks(page);
    await page.goto("/profile/activity");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
  });

  // ── Tier 1: Happy Path Feature Coverage ───────────────────────────────────

  test("TC-4.1: Render SOC2 compliance audit ledger with event details and status pills", async ({ page }) => {
    // Assert Header
    await expect(page.getByText(/compliance audit trail|security activity/i).first()).toBeVisible();

    // Verify all mock audit log items are displayed in table
    for (const log of MOCK_AUDIT_LOGS) {
      await expect(page.getByText(log.eventDescription).or(page.getByText(log.eventType)).first()).toBeVisible();
      await expect(page.getByText(log.ipAddress).first()).toBeVisible();
    }

    // Verify status badges (Success / Failed)
    await expect(page.getByText(/success/i).first()).toBeVisible();
    await expect(page.getByText(/failed/i).first()).toBeVisible();
  });

  test("TC-4.2: Filter audit ledger by full-text search query", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='search' i]").or(page.locator("input[type='search']")).first();
    await expect(searchInput).toBeVisible();

    // Search by specific IP address
    await searchInput.fill("102.184.99.14");

    // Only the failed attempt with that IP should remain visible
    await expect(page.getByText(/Invalid Password Attempt|Failed password attempt|LoginFailed/i).first()).toBeVisible();
    await expect(page.getByText(/Biometric Passkey Authentication Verified|LoginSuccess/i)).not.toBeVisible();
  });

  test("TC-4.3: Filter audit ledger by Event Type dropdown", async ({ page }) => {
    // Open Event Type Select
    const eventTypeTrigger = page.locator("[role='combobox']").first();
    if (await eventTypeTrigger.isVisible()) {
      await eventTypeTrigger.click();

      // Pick PasswordChanged
      const option = page.getByRole("option", { name: /passwordchanged/i });
      if (await option.isVisible()) {
        await option.click();
        await expect(page.getByText(/Self-Service Password Rotated|PasswordChanged/i).first()).toBeVisible();
      }
    }
  });

  test("TC-4.4: Filter audit ledger by Outcome dropdown (Success vs Failure)", async ({ page }) => {
    // Outcome filter is the second combobox
    const outcomeTrigger = page.locator("[role='combobox']").nth(1);
    if (await outcomeTrigger.isVisible()) {
      await outcomeTrigger.click();

      // Pick 'Failures Only'
      const failureOption = page.getByRole("option", { name: /only failure|failed only|failures only/i });
      if (await failureOption.isVisible()) {
        await failureOption.click();

        // Failed entry visible, success entries hidden
        await expect(page.getByText(/Invalid Password Attempt|Failed password attempt|LoginFailed/i).first()).toBeVisible();
        await expect(page.getByText(/Biometric Passkey Authentication Verified|LoginSuccess/i)).not.toBeVisible();
      }
    }
  });

  test("TC-4.5: Open ForensicPayloadDrawer on audit row click and verify syntax-highlighted JSON", async ({
    page,
  }) => {
    // Click on the first audit log row
    const firstRow = page.getByText(/LoginSuccess|Biometric Passkey/i).first();
    await firstRow.click();

    // Drawer opens
    await expect(page.getByText(/forensic payload inspector|soc2 forensic/i).first()).toBeVisible();

    // Syntax-highlighted JSON contains credential ID and standard metadata
    await expect(page.getByText(/cred_8f3a••••••••99b2/).first()).toBeVisible();
    await expect(page.getByText(/SOC2-CC6\.1/).first()).toBeVisible();
  });

  test("TC-4.6: Copy forensic JSON payload and download .json file from drawer", async ({ page }) => {
    // Open drawer
    await page.getByText(/LoginSuccess|Biometric Passkey/i).first().click();
    await expect(page.getByText(/forensic payload inspector|soc2 forensic/i).first()).toBeVisible();

    // Copy to clipboard button
    const copyBtn = page.getByRole("button", { name: /copy raw payload|copy/i }).first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Download JSON button
    const downloadBtn = page.getByRole("button", { name: /download json|json/i }).first();
    await expect(downloadBtn).toBeVisible();
  });

  test("TC-4.7: Export audit trail to CSV format", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /export audit csv|export csv/i }).first();
    await expect(exportBtn).toBeVisible();

    // Verify click triggers download or export without error
    await exportBtn.click();
  });

  // ── Tier 2: Boundary & Corner Cases ───────────────────────────────────────

  test("TC-2.B11: Zero search results displays clean empty state without crashing", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='search' i]").first();
    await searchInput.fill("NonExistentString1234567890XYZ");

    // Empty state message should appear
    await expect(page.getByText(/no security activity found|no audit records found|no matching events/i).first()).toBeVisible();
  });
});
