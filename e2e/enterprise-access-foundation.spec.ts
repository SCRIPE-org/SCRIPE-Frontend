import { test, expect } from "@playwright/test";

test.describe("Enterprise Access Foundation: Real Browser Acceptance", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  const freeTenantEmail = "test.free.1792942264586@scripe-test.org";
  const freeTenantPassword = "P@ssw0rd123!";
  const ahlyAdminEmail = "ahly.booking@scripe-dev.local";
  const standardPassword = "P@ssw0rd";
  const superAdminEmail = "admin-seif@scripe.org";

  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.goto("/login");
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore if origin not ready
      }
    });
  });

  test("1. Unauthenticated Guard: Direct navigation to protected /overview redirects to /login", async ({
    page,
  }) => {
    // Direct attempt to load overview while unauthenticated
    await page.goto("/overview");
    await page.waitForLoadState("domcontentloaded");

    // Must be redirected to /login with redirect query param
    await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 15_000 });
    expect(page.url()).toContain("/login");

    // Form inputs must be visible and interactive
    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 10_000 });
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });
  });

  test("2. Free Tenant Login: Real /login UI authenticates and navigates to workspace without 403", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    const submitBtn = page.locator("form button[type='submit']").first();

    await identifierInput.fill(freeTenantEmail);
    await passwordInput.fill(freeTenantPassword);
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // After login, free tenant must transition into the authenticated workspace without 403 or redirect loop
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    expect(page.url()).not.toContain("/not-authorized");
    expect(page.url()).not.toContain("/login");

    await page.waitForLoadState("networkidle");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.toLowerCase()).not.toContain("403 forbidden");
    expect(bodyText.toLowerCase()).not.toContain("not authorized");
  });

  test("3. Free Tenant Authenticated Overview Access: Direct navigation to /overview renders truthfully", async ({
    page,
  }) => {
    // Perform browser login
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#identifier").fill(freeTenantEmail);
    await page.locator("#password").fill(freeTenantPassword);
    await page.locator("form button[type='submit']").first().click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    // Navigate directly to /overview
    await page.goto("/overview");
    await page.waitForLoadState("networkidle");

    // Verify /overview is rendered and NOT redirected to /not-authorized
    expect(page.url()).not.toContain("/not-authorized");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.toLowerCase()).not.toContain("not authorized");
  });

  test("4. Tenant Admin PBAC Enforcement: Tenant admin is blocked from Platform Admin routes", async ({
    page,
  }) => {
    // Login as tenant-scoped admin (Ahly Booking Coordinator)
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#identifier").fill(ahlyAdminEmail);
    await page.locator("#password").fill(standardPassword);
    await page.locator("form button[type='submit']").first().click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    // Attempt direct navigation to platform-admin tenant management (/tenants, requires tenants.view)
    await page.goto("/tenants");
    await page.waitForLoadState("networkidle");

    // RouteGuard MUST deny access to /tenants — redirecting to safe fallback or /not-authorized
    expect(page.url()).not.toContain("/tenants");
  });

  test("5. Superadmin Access: Platform Super Admin retains access across platform routes", async ({
    page,
  }) => {
    // Login as system platform super admin
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#identifier").fill(superAdminEmail);
    await page.locator("#password").fill(standardPassword);
    await page.locator("form button[type='submit']").first().click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    // Super admin navigates to /tenants
    await page.goto("/tenants");
    await page.waitForLoadState("networkidle");

    // Superadmin has full permissions so /tenants is accessible
    expect(page.url()).toContain("/tenants");
    expect(page.url()).not.toContain("/not-authorized");
    expect(page.url()).not.toContain("/login");
  });
});
