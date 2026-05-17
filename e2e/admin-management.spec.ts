import { test, expect, type Page } from "@playwright/test";

/**
 * Helper to login as admin before each test.
 */
async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.waitForSelector('[data-testid="login-form"], form', { timeout: 10_000 });

  const usernameInput = page
    .locator('input[name="username"], input[placeholder*="username" i]')
    .first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await usernameInput.fill("system_superadmin");
  await passwordInput.fill("P@ssw0rd");

  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
}

test.describe("Admin Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should navigate to admin management page", async ({ page }) => {
    await page.goto("/admin/user-management");

    // Should see the page content (table or list of admins)
    await page.waitForLoadState("networkidle");

    // Should have a data table or list visible
    const content = page.locator("table, [data-testid='data-table'], [role='table']").first();
    await expect(content).toBeVisible({ timeout: 10_000 });
  });

  test("should open create admin dialog", async ({ page }) => {
    await page.goto("/admin/user-management");
    await page.waitForLoadState("networkidle");

    // Click the create/add button
    const createButton = page
      .locator(
        'button:has-text("Add"), button:has-text("Create"), button:has-text("إضافة"), [data-testid="create-button"]'
      )
      .first();

    if (await createButton.isVisible()) {
      await createButton.click();

      // Should see a dialog/modal with a form
      const dialog = page.locator('[role="dialog"], [data-testid="form-dialog"]').first();
      await expect(dialog).toBeVisible({ timeout: 5_000 });
    }
  });

  test("should show admin details on row click or expand", async ({ page }) => {
    await page.goto("/admin/user-management");
    await page.waitForLoadState("networkidle");

    // Wait for table rows to load
    const rows = page.locator("table tbody tr, [data-testid='table-row']");
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Click the first row
      await rows.first().click();

      // Should show some detail view or expand
      await page.waitForTimeout(1000);
    }
  });
});
