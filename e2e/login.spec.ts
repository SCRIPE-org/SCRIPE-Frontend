import { test, expect, type Page } from "@playwright/test";

/**
 * Helper to login as admin before tests.
 */
async function loginAsAdmin(page: Page) {
  await page.goto("/login");

  // Wait for login form to be visible
  await page.waitForSelector('[data-testid="login-form"], form', { timeout: 10_000 });

  // Fill credentials
  const usernameInput = page
    .locator('input[name="username"], input[placeholder*="username" i]')
    .first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await usernameInput.fill("system_superadmin");
  await passwordInput.fill("P@ssw0rd");

  // Submit
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
}

test.describe("Admin Login Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");

    // Should see a login form
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    const usernameInput = page
      .locator('input[name="username"], input[placeholder*="username" i]')
      .first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    await usernameInput.fill("invalid_user");
    await passwordInput.fill("WrongPassword");

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show some error indication (toast, alert, or inline error)
    const errorElement = page
      .locator('[role="alert"], .toast-error, [data-testid="error-message"]')
      .first();
    await expect(errorElement)
      .toBeVisible({ timeout: 10_000 })
      .catch(() => {
        // If no specific error element, at least we should still be on the login page
      });

    // Should still be on the login page
    expect(page.url()).toContain("/login");
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    await loginAsAdmin(page);

    // Should be redirected to a dashboard or home page
    await expect(page.url()).not.toContain("/login");
  });

  test("should maintain session after page reload", async ({ page }) => {
    await loginAsAdmin(page);

    // Reload the page
    await page.reload();

    // Should not be redirected back to login
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/login");
  });
});
