const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const OUT_DIRS = [
  path.resolve("E:/Scripe_pro/SCRIPE-Root-academy-s0-s8/reports/academy-execution/batch-03-evidence/baseline"),
  path.resolve("C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c/batch-03-evidence/baseline"),
];

OUT_DIRS.forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
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
  isProtected: false,
  isAccountActivated: true,
  mustChangePassword: false,
  createdAt: "2026-01-01T00:00:00Z",
  tenantId: "22222222-2222-2222-2222-222222222222",
  tenantName: "Al Hilal SFC Academy",
  roles: [
    {
      roleId: "44444444-4444-4444-4444-444444444444",
      roleNameEn: "Tenant Admin",
      roleNameAr: "مدير المستأجر",
      roleCode: "TenantAdmin",
    },
    {
      roleId: "55555555-5555-5555-5555-555555555555",
      roleNameEn: "Academy Director",
      roleNameAr: "مدير الأكاديمية",
      roleCode: "AcademyDirector",
    },
  ],
  permissions: ["*"],
};

const screens = [
  { id: "06", name: "06_groups_baseline.png", path: "/academy/groups" },
  { id: "07", name: "07_seasons_baseline.png", path: "/academy/seasons" },
  { id: "08", name: "08_sessions_baseline.png", path: "/academy/sessions" },
  { id: "09", name: "09_attendance_baseline.png", path: "/academy/attendance" },
  { id: "10", name: "10_fees_receivables_baseline.png", path: "/academy/fees-receivables" },
];

async function captureBaseline() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1672, height: 941 },
    locale: "en-US",
  });

  const page = await context.newPage();

  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/auth/admin/refresh")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          accessToken: validJwt,
          mustChangePassword: false,
          subscriptionStatus: "Active",
          userProfile: mockUserProfile,
          defaultRedirectPath: "/academy",
        }),
      });
    }

    if (url.includes("/Admins/me") || url.includes("/auth/me")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUserProfile),
      });
    }

    if (url.includes("/admin/settings") || url.includes("/tenant-branding") || url.includes("/branding") || url.includes("/tenants/current")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            tenantId: "22222222-2222-2222-2222-222222222222",
            tenantName: "Al Hilal SFC Academy",
            collapsibleSidebar: false,
            dashboardThemeJson: "{}",
          },
        }),
      });
    }

    // Default: continue to real API backend
    return route.continue();
  });

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

  for (const s of screens) {
    const targetUrl = `http://localhost:3000${s.path}`;
    console.log(`Capturing baseline: ${s.name} from ${targetUrl}...`);
    try {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(2000);
      for (const d of OUT_DIRS) {
        const outPath = path.join(d, s.name);
        await page.screenshot({ path: outPath, fullPage: false });
        console.log(`  ✓ Saved: ${outPath}`);
      }
    } catch (e) {
      console.error(`  ✗ Error capturing ${s.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log("Baseline capture completed for Batch 03.");
}

captureBaseline().catch((err) => {
  console.error(err);
  process.exit(1);
});
