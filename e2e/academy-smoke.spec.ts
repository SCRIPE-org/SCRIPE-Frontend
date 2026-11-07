import { test, expect } from "@playwright/test";

test.use({ channel: "chrome" });

test.describe("SCRIPE Academy S0-S4 Real Browser Smoke Acceptance", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

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
    test.setTimeout(180_000);

    // 3a. Navigate to login
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill(adminEmail);
    await passwordInput.fill(adminPassword);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // 3b. Verify login transition (navigated away from /login)
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 60_000 });
    expect(page.url()).not.toContain("/not-authorized");

    // 3b-2. Navigate to Hub and verify Academy workspace is accessible
    await page.goto("/hub", { waitUntil: "domcontentloaded" });
    const academyHubTile = page.locator("button:has-text('Academy')").first();
    await expect(academyHubTile).toBeVisible({ timeout: 15_000 });

    // 3c. Navigate to Academy Overview
    await page.goto("/academy", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/academy");
    // Verify no unreleased Sessions/Attendance/Assessments links
    expect(await page.locator("a[href*='/academy/sessions']").count()).toBe(0);
    expect(await page.locator("a[href*='/academy/attendance']").count()).toBe(0);
    expect(await page.locator("a[href*='/academy/assessments']").count()).toBe(0);

    // 3d. Navigate to Programs and verify no raw i18n keys or 404
    await page.goto("/academy/programs", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/academy/programs");
    expect(await page.locator("text=academyPrograms.title").count()).toBe(0);
    expect(await page.locator("text=Request failed with status code 404").count()).toBe(0);

    // 3e. Navigate to Athletes and verify no 404 + blank default DOB in wizard
    await page.goto("/academy/athletes", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/academy/athletes");
    expect(await page.locator("text=Request failed with status code 404").count()).toBe(0);

    const addAthleteBtn = page.locator("button:has-text('New Athlete'), button:has-text('تسجيل رياضي جديد')").first();
    if (await addAthleteBtn.isVisible()) {
      await addAthleteBtn.click();
      await page.waitForTimeout(400);
      const dobInput = page.locator("input[type='date']").first();
      await expect(dobInput).toBeVisible();
      // Ensure DOB is blank by default (UX-10)
      expect(await dobInput.inputValue()).toBe("");
      // Close wizard
      const closeBtn = page.locator("button[aria-label='Close dialog']").first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // 3f. Navigate to Offerings and verify no raw GUID inputs
    await page.goto("/academy/offerings", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/academy/offerings");
    const rawGuidInputs = page.locator("input[name='programId'], input[name='seasonId'], input[name='branchId']");
    expect(await rawGuidInputs.count()).toBe(0);

    // 3g. Navigate to Trials
    await page.goto("/academy/trials", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/academy/trials");
    expect(await page.locator("text=Request failed with status code 404").count()).toBe(0);

    // 3h. Navigate to Enrollments
    await page.goto("/academy/enrollments", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/academy/enrollments");
    expect(await page.locator("text=Request failed with status code 404").count()).toBe(0);

    // 3i. Navigate to Training Groups
    await page.goto("/academy/groups", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/academy/groups");
    expect(await page.locator("text=Request failed with status code 404").count()).toBe(0);
  });
});
