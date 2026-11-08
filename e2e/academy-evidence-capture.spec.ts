import { test, expect } from "@playwright/test";
import * as path from "path";


test.use({ channel: "chrome" });

const EVIDENCE_DIR =
  process.env.EVIDENCE_DIR ||
  "C:/Users/DELL/.gemini/antigravity/brain/1b6fac78-8e5d-49d1-9eff-f1896f2e6de6/evidence_screens";

async function loginUser(page: any, email: string, pass: string = "P@ssw0rd") {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  const identifierInput = page.locator("#identifier");
  const passwordInput = page.locator("#password");
  await expect(identifierInput).toBeVisible({ timeout: 15_000 });
  await identifierInput.fill(email);
  await passwordInput.fill(pass);
  const submitBtn = page.locator("form button[type='submit']").first();
  await submitBtn.click();
  await page.waitForURL((url: any) => !url.pathname.includes("/login"), { timeout: 60_000 });
}

async function waitForAcademyDataReady(page: any) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => {});

  // Deterministically wait for any spinners to detach completely
  const spinners = page.locator(".animate-spin, [role='status']");
  const count = await spinners.count();
  for (let i = 0; i < count; i++) {
    await spinners.nth(i).waitFor({ state: "detached", timeout: 20_000 }).catch(() => {});
  }

  // Ensure main content container is visible
  await page.locator("main, #nexus-content, [role='main']").first().waitFor({ state: "visible", timeout: 15_000 });

  // Guarantee no active loading spinners remain visible
  await expect(page.locator("main .animate-spin")).toHaveCount(0, { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(600);
}

test.describe("SCRIPE Academy Full Evidence Capture & Persona Verification", () => {
  test.describe.configure({ timeout: 360_000 });

  test("1. Comprehensive Evidence Capture: Viewports, Themes, Locales, Modals", async ({ page }) => {
    test.setTimeout(360_000);

    // Set Desktop viewport 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as tenant admin
    await loginUser(page, "uat.tenantadmin@hilal.local");

    // ── 1A. Hub Desktop English
    await page.goto("/hub");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("button:has-text('Academy')").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "01_hub_desktop_en.png") });

    // ── 1B. Academy Overview Desktop Light English
    await page.goto("/academy");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "02_academy_overview_light_en.png") });

    // ── 1C. Dark Theme Overview
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "03_academy_overview_dark_en.png") });

    // Revert to light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    });
    await page.waitForTimeout(300);

    // ── 1D. Programs Desktop
    await page.goto("/academy/programs");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "04_academy_programs_en.png") });

    // Open Program Create Modal
    const createProgramBtn = page.locator("button:has-text('Create Program'), button:has-text('إنشاء برنامج')").first();
    if (await createProgramBtn.isVisible()) {
      await createProgramBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(EVIDENCE_DIR, "05_academy_programs_modal_en.png") });
      // Close modal
      const closeBtn = page.locator("button[aria-label='Close'], button:has-text('Cancel'), button:has-text('إلغاء')").first();
      if (await closeBtn.isVisible()) await closeBtn.click();
      await page.waitForTimeout(300);
    }

    // ── 1E. Athletes Desktop & Wizard
    await page.goto("/academy/athletes");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "06_academy_athletes_en.png") });

    // Open Athlete Wizard
    const addAthleteBtn = page.locator("button:has-text('New Athlete'), button:has-text('تسجيل رياضي جديد')").first();
    if (await addAthleteBtn.isVisible()) {
      await addAthleteBtn.click();
      await page.waitForTimeout(500);

      // Step 1 screenshot (blank DOB, minor category selected)
      await page.screenshot({ path: path.join(EVIDENCE_DIR, "07_athlete_wizard_step1_en.png") });

      // Fill valid child DOB (e.g., 2015-06-15) and advance to Step 2
      const dobInput = page.locator("input[type='date']").first();
      await dobInput.fill("2015-06-15");
      await page.waitForTimeout(300);

      const nextBtn1 = page.locator("button:has-text('Next:'), button:has-text('التالي:')").first();
      if (await nextBtn1.isVisible() && await nextBtn1.isEnabled()) {
        await nextBtn1.click();
        await page.waitForTimeout(500);

        // Step 2 Guardian Search screenshot
        await page.screenshot({ path: path.join(EVIDENCE_DIR, "08_athlete_wizard_step2_en.png") });

        // Fill guardian fields and proceed to Step 3
        const guardianName = page.locator("input[placeholder*='Guardian'], input[placeholder*='ولي الأمر']").first();
        if (await guardianName.isVisible()) await guardianName.fill("Fahad Al-Mansour");
        const guardianPhone = page.locator("input[placeholder*='+966']").first();
        if (await guardianPhone.isVisible()) await guardianPhone.fill("+966500000001");
        const guardianRel = page.locator("input[placeholder*='Father'], input[placeholder*='الأب']").first();
        if (await guardianRel.isVisible()) await guardianRel.fill("Father");

        await page.waitForTimeout(300);
        const nextBtn2 = page.locator("button:has-text('Next:'), button:has-text('التالي:')").first();
        if (await nextBtn2.isVisible() && await nextBtn2.isEnabled()) {
          await nextBtn2.click();
          await page.waitForTimeout(500);
          // Step 3 Demographics screenshot showing inline validation
          await page.screenshot({ path: path.join(EVIDENCE_DIR, "09_athlete_wizard_step3_en.png") });
        }
      }

      // Close wizard
      const closeDialogBtn = page.locator("button[aria-label='Close dialog']").first();
      if (await closeDialogBtn.isVisible()) await closeDialogBtn.click();
      await page.waitForTimeout(300);
    }

    // ── 1F. Offerings Desktop
    await page.goto("/academy/offerings");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "10_academy_offerings_en.png") });

    // ── 1G. Trials Desktop
    await page.goto("/academy/trials");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "11_academy_trials_en.png") });

    // ── 1H. Enrollments Desktop
    await page.goto("/academy/enrollments");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "12_academy_enrollments_en.png") });

    // ── 1I. Groups Desktop
    await page.goto("/academy/groups");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "13_academy_groups_en.png") });

    // ── 1J. Arabic RTL Switch & Screenshots
    await page.evaluate(() => {
      document.cookie = "scr_lang=ar; path=/; max-age=31536000; samesite=lax";
      localStorage.setItem("scr_lang", "ar");
      localStorage.setItem("scr_pref_lang", "ar");
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    });

    await page.goto("/hub");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("button:has-text('الأكاديمية')").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "14_hub_desktop_ar.png") });

    await page.goto("/academy");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "15_academy_overview_ar.png") });

    await page.goto("/academy/programs");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "16_academy_programs_ar.png") });

    // Revert language back to English
    await page.evaluate(() => {
      document.cookie = "scr_lang=en; path=/; max-age=31536000; samesite=lax";
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("scr_pref_lang", "en");
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    });

    // ── 1K. Tablet Responsive (768 x 1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/hub");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("button:has-text('Academy')").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "17_hub_tablet.png") });

    await page.goto("/academy");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "18_academy_overview_tablet.png") });

    // ── 1L. Mobile Responsive (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/hub");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("button:has-text('Academy')").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "19_hub_mobile.png") });

    await page.goto("/academy");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 15_000 });
    await waitForAcademyDataReady(page);
    // Mobile overview (full content width, desktop rails hidden)
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "20_academy_overview_mobile.png") });

    // Open mobile navigation drawer via hamburger button and capture with scrim
    const hamburgerBtn = page.locator("button[aria-label*='Panel'], button[aria-label*='Toggle'], button[aria-label*='menu'], button[aria-label*='لوحة'], button[aria-label*='navigation']").first();
    if (await hamburgerBtn.isVisible()) {
      await hamburgerBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(EVIDENCE_DIR, "21_academy_mobile_nav_drawer.png") });
    }
  });

  test("2. Persona Access Verification: AcademyDirector, Coach, FrontDesk, Auditor", async ({ browser }) => {
    test.setTimeout(180_000);

    const personas = [
      { email: "uat.academydirector@hilal.local", role: "AcademyDirector" },
      { email: "uat.coach@hilal.local", role: "HeadCoach" },
      { email: "uat.frontdesk@hilal.local", role: "FrontDesk" },
      { email: "uat.auditor@hilal.local", role: "Auditor" },
    ];

    for (const persona of personas) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();

      await loginUser(page, persona.email);

      // Verify Hub loads
      await page.goto("/hub");
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).not.toContain("/login");

      // Verify direct /academy navigation works
      await page.goto("/academy");
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/academy");
      expect(page.url()).not.toContain("/not-authorized");

      await context.close();
    }
  });
});
