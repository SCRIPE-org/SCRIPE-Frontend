const fs = require('fs');
const path = require('path');
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
  isProtected: false,
  isAccountActivated: true,
  mustChangePassword: false,
  createdAt: "2026-01-01T00:00:00Z",
  tenantId: "22222222-2222-2222-2222-222222222222",
  tenantName: "Al Hilal SFC Academy",
  roles: [
    { roleId: "44444444-4444-4444-4444-444444444444", roleNameEn: "Tenant Admin", roleCode: "TenantAdmin" },
    { roleId: "55555555-5555-5555-5555-555555555555", roleNameEn: "Academy Director", roleCode: "AcademyDirector" }
  ],
  permissions: ["*"]
};

const mockRoutes = [
  { id: "r-acad-root", slug: "academy", name: "Academy", nameEn: "Academy", path: "/academy", icon: "GraduationCap", order: 1, isAvailable: true },
  { id: "r-acad-ath", slug: "academy-athletes", name: "Athletes", nameEn: "Athletes", path: "/academy/athletes", icon: "Users", order: 2, isAvailable: true },
  { id: "r-acad-trials", slug: "academy-trials", name: "Trials", nameEn: "Trials", path: "/academy/trials", icon: "ClipboardCheck", order: 3, isAvailable: true },
  { id: "r-acad-enr", slug: "academy-enrollments", name: "Enrollments", nameEn: "Enrollments", path: "/academy/enrollments", icon: "FileCheck", order: 4, isAvailable: true },
  { id: "r-acad-prog", slug: "academy-programs", name: "Programs", nameEn: "Programs", path: "/academy/programs", icon: "Layers", order: 5, isAvailable: true },
];

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-evidence\\before';
  const brainDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\555143f1-37eb-4991-af0b-70be4ecc245c\\batch-02-evidence\\before';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(brainDir)) fs.mkdirSync(brainDir, { recursive: true });

  const screens = [
    { url: 'http://localhost:3000/academy/trials', file: '03_skill_trials_before_desktop.png' },
    { url: 'http://localhost:3000/academy/enrollments', file: '04_enrollments_before_desktop.png' },
    { url: 'http://localhost:3000/academy/programs', file: '05_programs_before_desktop.png' },
  ];

  for (const s of screens) {
    const context = await browser.newContext({ viewport: { width: 1672, height: 941 } });
    await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
    const page = await context.newPage();

    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/Menus/my/routes") || url.includes("/Menus/my")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            data: { routes: mockRoutes, workspaceRouteMap: { academy: mockRoutes } }
          })
        });
      }
      return route.continue();
    });

    await page.addInitScript(({ token, user }) => {
      sessionStorage.setItem("dev_access_token", token);
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("theme", "dark");
      localStorage.setItem("app-storage", JSON.stringify({
        state: { user, isAuthenticated: true, permissions: ["*"], roles: ["TenantAdmin", "AcademyDirector"], _hasHydrated: true },
        version: 0
      }));
    }, { token: validJwt, user: mockUserProfile });

    await page.goto(s.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);

    await page.evaluate(() => {
      const devOverlay = document.querySelector("nextjs-portal");
      if (devOverlay) devOverlay.style.display = "none";
    });

    const p1 = path.join(outDir, s.file);
    const p2 = path.join(brainDir, s.file);
    await page.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log(`Saved baseline: ${s.file}`);
    await context.close();
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
