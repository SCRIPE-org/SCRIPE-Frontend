import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks } from "./fixtures/test-helpers";
import { MOCK_EXTERNAL_LOGINS, MOCK_PERSONAL_TOKENS } from "./fixtures/profile-mock-data";

test.describe("Feature 6: Enterprise SSO & Developer Tokens (ProfileIntegrationsView)", () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRouteMocks(page);
    await page.goto("/profile/integrations");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
  });

  // ── Tier 1: Happy Path Feature Coverage ───────────────────────────────────

  test("TC-6.1: Render connected enterprise SSO Identity Providers and status", async ({ page }) => {
    // Assert section title
    await expect(page.getByText(/connected single sign-on providers|connected identity providers|enterprise sso/i).first()).toBeVisible();

    // Check Google, Microsoft, Apple cards
    await expect(page.getByText("Google Workspace")).toBeVisible();
    await expect(page.getByText("Microsoft Entra ID")).toBeVisible();
    await expect(page.getByText("Apple ID")).toBeVisible();

    // Verify linked provider displays email
    const linked = MOCK_EXTERNAL_LOGINS[0];
    await expect(page.getByText(linked.providerEmail)).toBeVisible();
    await expect(page.getByText(/connected|linked/i).first()).toBeVisible();
  });

  test("TC-6.2: Disconnect/unlink linked external identity provider", async ({ page }) => {
    const unlinkBtn = page.getByRole("button", { name: /disconnect|unlink/i }).first();
    await expect(unlinkBtn).toBeVisible();

    await unlinkBtn.click();

    // After unlinking, button should switch to Connect
    await expect(page.getByRole("button", { name: /connect/i }).first()).toBeVisible({ timeout: 5_000 });
  });

  test("TC-6.3: Render active Personal Access Tokens (PAT) with masked prefixes and scopes", async ({
    page,
  }) => {
    // Assert PAT section title
    await expect(page.getByText(/personal access tokens|developer api tokens/i).first()).toBeVisible();

    for (const token of MOCK_PERSONAL_TOKENS) {
      await expect(page.getByText(token.name)).toBeVisible();
      await expect(page.getByText(token.maskedToken)).toBeVisible();
      for (const scope of token.scopes) {
        await expect(page.getByText(scope).first()).toBeVisible();
      }
    }
  });

  test("TC-6.4: Open PAT generator modal, configure custom scopes, and submit", async ({ page }) => {
    const generateTokenBtn = page.getByRole("button", { name: /generate new token|create token/i });
    await generateTokenBtn.click();

    // Verify modal title
    await expect(page.getByText(/generate personal access token/i)).toBeVisible();

    // Fill token name
    const tokenNameInput = page.locator("#pat-name").or(page.locator("input[placeholder*='token' i]")).first();
    await tokenNameInput.fill("Match Analysis Automation Agent");

    // Toggle custom scope checkbox (select second scope)
    const scopeCheckbox = page.locator("button[role='checkbox']").nth(1);
    if (await scopeCheckbox.isVisible()) {
      await scopeCheckbox.click();
    }

    // Click Generate Token
    const submitBtn = page.getByRole("button", { name: /generate token/i }).last();
    await submitBtn.click();

    // One-time secret key display should appear
    await expect(page.getByText(/save your secret token|save this secret token|one-time/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test("TC-6.5: One-time plaintext secret key presentation and copy to clipboard", async ({ page }) => {
    // Open modal and generate token
    await page.getByRole("button", { name: /generate new token|create token/i }).click();
    const tokenNameInput = page.locator("#pat-name").or(page.locator("input[placeholder*='token' i]")).first();
    await tokenNameInput.fill("Clip Script Token");
    await page.getByRole("button", { name: /generate token/i }).last().click();

    // Check plaintext token prefix
    await expect(page.getByText(/scr_pat_/i).first()).toBeVisible({ timeout: 5_000 });

    // Copy to clipboard button
    const copyBtn = page.getByRole("button", { name: /copy/i }).last();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
  });

  test("TC-6.6: Revoke active Personal Access Token", async ({ page }) => {
    const targetToken = MOCK_PERSONAL_TOKENS[0];
    await expect(page.getByText(targetToken.name)).toBeVisible();

    // Click revoke button for target token
    const revokeBtn = page
      .locator("div")
      .filter({ hasText: targetToken.name })
      .locator("button[aria-label*='delete' i], button[aria-label*='revoke' i], button:has(svg.lucide-trash2)")
      .first();

    await revokeBtn.click();

    // Token should disappear from list
    await expect(page.getByText(targetToken.name)).not.toBeVisible({ timeout: 5_000 });
  });

  // ── Tier 2: Boundary & Corner Cases ───────────────────────────────────────

  test("TC-2.B13: PAT generator blocks submission when token name is empty", async ({ page }) => {
    await page.getByRole("button", { name: /generate new token|create token/i }).click();

    const submitBtn = page.getByRole("button", { name: /generate token/i }).last();
    const tokenNameInput = page.locator("#pat-name").or(page.locator("input[placeholder*='token' i]")).first();

    // Clear name
    await tokenNameInput.fill("");

    // Submit button should be disabled
    await expect(submitBtn).toBeDisabled();

    // Still on the generator step (not on secret view)
    await expect(page.getByText(/generate personal access token/i)).toBeVisible();
  });
});
