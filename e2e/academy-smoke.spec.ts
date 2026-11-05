import { test, expect } from "@playwright/test";

test.use({ channel: "chrome" });

test.describe("SCRIPE Academy S0-S4 Real Browser Smoke Acceptance", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  const adminEmail = "uat.tenantadmin@hilal.local";
  const adminPassword = "P@ssw0rd";

  test("1. Health Check: Backend API is live and responds 200 OK", async ({ request }) => {
    const res = await request.get("http://localhost:5035/health/live");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Healthy");
  });

  test("2. Security Guard: UAT diagnostic endpoint rejects unauthenticated access with 401", async ({ request }) => {
    const res = await request.get("http://localhost:5035/api/v1/academy/admin/uat/status");
    expect(res.status()).toBe(401);
  });

  test("3. Authenticated Journey: Login as uat.tenantadmin and verify Academy pages", async ({ page }) => {
    // 3a. Navigate to login
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill(adminEmail);
    await passwordInput.fill(adminPassword);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // 3b. Verify login transition (cookie/token stored and navigated away from /login)
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 90_000 });
    expect(page.url()).not.toContain("/not-authorized");

    // 3c. Navigate to Academy Overview
    await page.goto("/academy");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/academy");

    // 3d. Navigate to Offerings and verify no raw GUID inputs
    await page.goto("/academy/offerings");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/academy/offerings");

    // Verify there are no raw GUID text inputs for program/season/branch
    const rawGuidInputs = page.locator("input[name='programId'], input[name='seasonId'], input[name='branchId']");
    expect(await rawGuidInputs.count()).toBe(0);

    // 3e. Navigate to Trials
    await page.goto("/academy/trials");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/academy/trials");

    // 3f. Navigate to Enrollments
    await page.goto("/academy/enrollments");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/academy/enrollments");

    // 3g. Navigate to Training Groups
    await page.goto("/academy/groups");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/academy/groups");
  });
});
