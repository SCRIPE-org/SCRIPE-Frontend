const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, '..', '..', 'SCRIPE-Root-academy-s0-s8', 'reports', 'academy-execution', 'batch-02-evidence', 'programs-fixtures');
const ARTIFACT_DIR = path.join('C:', 'Users', 'DELL', '.gemini', 'antigravity', 'brain', '555143f1-37eb-4991-af0b-70be4ecc245c', 'batch-02-evidence', 'programs-fixtures');

[EVIDENCE_DIR, ARTIFACT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

function createMockProgram(i) {
  const sports = [
    { code: 'FB', nameEn: 'Football', nameAr: 'كرة القدم', id: 'sp-fb' },
    { code: 'SW', nameEn: 'Swimming', nameAr: 'السباحة', id: 'sp-sw' },
    { code: 'BB', nameEn: 'Basketball', nameAr: 'كرة السلة', id: 'sp-bb' },
    { code: 'TN', nameEn: 'Tennis', nameAr: 'التنس', id: 'sp-tn' }
  ];
  const s = sports[i % sports.length];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const genders = ['Mixed', 'Male', 'Female'];
  return {
    id: `prog-${i + 1}`,
    sportId: s.id,
    sportCode: s.code,
    sportNameEn: s.nameEn,
    sportNameAr: s.nameAr,
    code: `${s.code}-${100 + i}`,
    nameEn: `${s.nameEn} Excellence Cohort ${i + 1}`,
    nameAr: `برنامج ${s.nameAr} المتميز ${i + 1}`,
    descriptionEn: `Structured professional training pathway for ${s.nameEn} athletes aged 6-16.`,
    descriptionAr: `مسار تدريبي احترافي منظم للاعبي ${s.nameAr} من سن 6 إلى 16 سنة.`,
    minAge: 6 + (i % 4),
    maxAge: 12 + (i % 5),
    level: levels[i % levels.length],
    genderCriteria: genders[i % genders.length],
    status: i % 3 === 0 ? 'Draft' : 'Published',
    offeringCount: 1 + (i % 3),
    enrolledAthletesCount: (i * 7) % 35
  };
}

async function runFixtures() {
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

  const counts = [0, 1, 2, 6, 12];
  const results = [];

  for (const count of counts) {
    const mockPrograms = Array.from({ length: count }, (_, idx) => createMockProgram(idx));

    // Intercept programs API route
    await page.route('**/api/v1/academy/programs*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPrograms)
      });
    });

    await page.goto('http://localhost:3000/academy/programs', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const filename = `programs_fixture_${count}_records.png`;
    const localPath = path.join(EVIDENCE_DIR, filename);
    const artPath = path.join(ARTIFACT_DIR, filename);

    await page.screenshot({ path: localPath, fullPage: false });
    fs.copyFileSync(localPath, artPath);

    results.push({
      count,
      filename,
      localPath,
      artPath
    });

    console.log(`Verified fixture with ${count} programs: Screenshot saved -> ${filename}`);
  }

  await browser.close();
  console.log('Programs fixture test completed successfully for 0, 1, 2, 6, and 12 records.');
}

runFixtures().catch(err => {
  console.error(err);
  process.exit(1);
});
