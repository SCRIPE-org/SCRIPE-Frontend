const { chromium } = require('@playwright/test');

const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJ1c2VybmFtZSI6InVhdC50ZW5hbnRhZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const mockUserProfile = {
  id: "11111111-1111-1111-1111-111111111111",
  username: "uat.tenantadmin",
  email: "uat.tenantadmin@hilal.local",
  firstName: "UAT",
  lastName: "Admin",
  isActive: true,
  isSuperAdmin: true,
  tenantId: "22222222-2222-2222-2222-222222222222",
  tenantName: "Al Hilal SFC Academy",
  roles: [{ roleCode: "TenantAdmin" }, { roleCode: "AcademyDirector" }],
  permissions: ["*"],
};

async function verifyWorkflows() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1672, height: 941 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  await page.addInitScript(({ user, jwt }) => {
    sessionStorage.setItem("dev_access_token", jwt);
    localStorage.setItem("app-storage", JSON.stringify({
      state: {
        sidebarOpen: true,
        user: user,
        isAuthenticated: true,
        permissions: ["*"],
        roles: ["TenantAdmin", "AcademyDirector"],
        tenantCode: "hilal",
        _hasHydrated: true,
      },
      version: 0,
    }));
    localStorage.setItem("scr_pref_sidebar", "false");
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("scr_pref_lang", "en");
    localStorage.setItem("i18nextLng", "en");
    localStorage.setItem("scripe_language", "en");
    localStorage.setItem("scripe_theme", "dark");
    localStorage.setItem("theme", "dark");
    document.cookie = `token=${jwt}; path=/; max-age=86400`;
    document.cookie = `auth_token=${jwt}; path=/; max-age=86400`;
    document.cookie = `scripe_language=en; path=/; max-age=86400`;
    document.cookie = `NEXT_LOCALE=en; path=/; max-age=86400`;
  }, { user: mockUserProfile, jwt: validJwt });

  const report = {};

  // 1. Verify Screen 03 (Trials) Workflows
  console.log("Testing Screen 03: Academy Trials...");
  await page.goto("http://localhost:3000/academy/trials", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Check Schedule CTA / New Trial Intake modal
  const scheduleBtn = page.locator('button:has-text("Schedule Trial"), button:has-text("Book Trial"), button:has-text("Schedule Assessment")').first();
  const hasScheduleBtn = await scheduleBtn.isVisible();
  report.trialsScheduleBtnVisible = hasScheduleBtn;

  if (hasScheduleBtn) {
    await scheduleBtn.click();
    await page.waitForTimeout(500);
    const modalVisible = await page.locator('text=Athlete, text=Offering, text=Date, [role="dialog"], div:has-text("Schedule Assessment Session")').first().isVisible();
    report.trialsIntakeModalOperational = modalVisible;
    // Close modal
    const closeBtn = page.locator('button:has-text("Cancel"), button:has([class*="lucide-x"]), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // Check Date Stepper navigation
  const prevDateBtn = page.locator('button:has-text("‹"), button:has-text("Previous Day")').first();
  const nextDateBtn = page.locator('button:has-text("›"), button:has-text("Next Day")').first();
  report.trialsDateStepperPresent = (await prevDateBtn.isVisible()) || (await nextDateBtn.isVisible());
  if (await nextDateBtn.isVisible()) {
    await nextDateBtn.click();
    await page.waitForTimeout(500);
  }

  // 2. Verify Screen 04 (Enrollments) Workflows
  console.log("Testing Screen 04: Academy Enrollments...");
  await page.goto("http://localhost:3000/academy/enrollments", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const newEnrollmentBtn = page.locator('button:has-text("New Enrollment"), button:has-text("Enroll Athlete")').first();
  const hasNewEnrollmentBtn = await newEnrollmentBtn.isVisible();
  report.enrollmentNewBtnVisible = hasNewEnrollmentBtn;

  if (hasNewEnrollmentBtn) {
    await newEnrollmentBtn.click();
    await page.waitForTimeout(500);
    const enrollModalVisible = await page.locator('text=Program Offering, text=Enrollment Fee, [role="dialog"]').first().isVisible();
    report.enrollmentModalOperational = enrollModalVisible;
    const cancelEnrollBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelEnrollBtn.isVisible()) await cancelEnrollBtn.click();
    await page.waitForTimeout(300);
  }

  // Click on an enrollment row to inspect detail panel
  const firstRow = page.locator('div.cursor-pointer[class*="grid-cols-12"]').first();
  if (await firstRow.isVisible()) {
    await firstRow.click();
    await page.waitForTimeout(500);
    const capacityVisible = await page.locator('text=Group Capacity').isVisible();
    report.enrollmentGroupCapacityDynamic = capacityVisible;

    // Check Handoff to Finance button
    const financeBtn = page.locator('button:has-text("Handoff to Finance"), button:has-text("Forward to Billing")').first();
    report.financeHandoffBtnVisible = await financeBtn.isVisible();
  }

  // 3. Verify Screen 05 (Programs) Workflows
  console.log("Testing Screen 05: Academy Programs...");
  await page.goto("http://localhost:3000/academy/programs", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const newProgramBtn = page.locator('button:has-text("New Program"), button:has-text("Create Program")').first();
  const hasNewProgramBtn = await newProgramBtn.isVisible();
  report.programsCreateBtnVisible = hasNewProgramBtn;

  if (hasNewProgramBtn) {
    await newProgramBtn.click();
    await page.waitForTimeout(500);
    const programModalVisible = await page.locator('text=Program Name, text=Sport, [role="dialog"]').first().isVisible();
    report.programsCreateModalOperational = programModalVisible;
    const cancelProgBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelProgBtn.isVisible()) await cancelProgBtn.click();
    await page.waitForTimeout(300);
  }

  // Check sport tab filters
  const sportTabs = await page.locator('button:has-text("All Sports"), button:has-text("Football"), button:has-text("Swimming")').count();
  report.programsSportTabsCount = sportTabs;

  console.log("Workflows verification report:");
  console.log(JSON.stringify(report, null, 2));

  await browser.close();
}

verifyWorkflows().catch(err => {
  console.error(err);
  process.exit(1);
});
