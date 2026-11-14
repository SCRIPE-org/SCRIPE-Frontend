const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const stage = process.argv[2] || "after";

const OUT_DIRS = [
  path.resolve(`E:/Scripe_pro/SCRIPE-Root-academy-s0-s8/reports/academy-execution/batch-02-evidence/${stage}`),
  path.resolve(`C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c/batch-02-evidence/${stage}`),
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
  permissions: [
    "Academy.Overview.View",
    "Academy.Athletes.View",
    "Academy.Athletes.Create",
    "Academy.Athletes.Update",
    "Academy.Safeguarding.View",
    "Academy.Programs.View",
    "Academy.Programs.Create",
    "Academy.Programs.Update",
    "Academy.Programs.Manage",
    "Academy.Trials.View",
    "Academy.Trials.Manage",
    "Academy.Enrollments.View",
    "Academy.Enrollments.Create",
    "Academy.Enrollments.Update",
    "Academy.Groups.View",
    "Academy.Sessions.View",
    "Academy.Sessions.Manage",
    "Academy.Attendance.View",
    "Academy.Attendance.Take",
    "Academy.Attendance.Correct",
    "Academy.Finance.View",
    "Academy.Reports.View",
    "Academy.Export",
    "*"
  ],
};

const academyMenuItems = [
  {
    id: "menu-ops",
    slug: "operations",
    nameEn: "Operations",
    nameAr: "العمليات",
    href: null,
    icon: "Activity",
    order: 1,
    children: [
      {
        id: "menu-cmd",
        slug: "command-center",
        nameEn: "Command Center",
        nameAr: "مركز القيادة",
        href: "/academy",
        icon: "GraduationCap",
        order: 1
      },
      {
        id: "menu-seasons",
        slug: "academic-seasons",
        nameEn: "Academic Seasons",
        nameAr: "المواسم الأكاديمية",
        href: "/academy/seasons",
        icon: "Calendar",
        order: 2
      },
      {
        id: "menu-schedule",
        slug: "session-schedule",
        nameEn: "Session Schedule",
        nameAr: "جدول الحصص",
        href: "/academy/sessions",
        icon: "Clock",
        order: 3
      },
      {
        id: "menu-attendance",
        slug: "session-attendance",
        nameEn: "Session Attendance",
        nameAr: "حضور الحصص",
        href: "/academy/attendance",
        icon: "CheckSquare",
        order: 4
      },
      {
        id: "menu-fees",
        slug: "fees-receivables",
        nameEn: "Fees & Receivables",
        nameAr: "الرسوم والمستحقات",
        href: "/academy/fees-receivables",
        icon: "CreditCard",
        order: 5
      },
      {
        id: "menu-reports",
        slug: "reports-kpis",
        nameEn: "Reports & KPIs",
        nameAr: "التقارير والمؤشرات",
        href: "/academy/reports",
        icon: "BarChart",
        order: 6
      }
    ]
  },
  {
    id: "menu-athletes-admissions",
    slug: "athletes-admissions",
    nameEn: "Athletes & Admissions",
    nameAr: "الرياضيون والقبول",
    href: null,
    icon: "Users",
    order: 2,
    children: [
      {
        id: "menu-athletes",
        slug: "athlete-directory",
        nameEn: "Athlete Directory",
        nameAr: "سجل الرياضيين",
        href: "/academy/athletes",
        icon: "Users",
        order: 1
      },
      {
        id: "menu-trials",
        slug: "skill-trials",
        nameEn: "Skill Trials & Evaluations",
        nameAr: "تجارب الأداء والتقييم",
        href: "/academy/trials",
        icon: "ClipboardCheck",
        order: 2
      },
      {
        id: "menu-enrollments",
        slug: "enrollments",
        nameEn: "Enrollments",
        nameAr: "التسجيلات",
        href: "/academy/enrollments",
        icon: "FileCheck",
        order: 3
      }
    ]
  },
  {
    id: "menu-training-delivery",
    slug: "training-delivery",
    nameEn: "Training Delivery",
    nameAr: "تقديم التدريب",
    href: null,
    icon: "Layers",
    order: 3,
    children: [
      {
        id: "menu-programs",
        slug: "programs-offerings",
        nameEn: "Programs & Offerings",
        nameAr: "البرامج والعروض",
        href: "/academy/programs",
        icon: "Layers",
        order: 1
      },
      {
        id: "menu-groups",
        slug: "groups-rosters",
        nameEn: "Groups & Rosters",
        nameAr: "المجموعات والقوائم",
        href: "/academy/groups",
        icon: "Users",
        order: 2
      }
    ]
  }
];

const mockWorkspaceGroup = {
  workspaceId: "ws-academy",
  workspaceKey: "academy",
  workspaceNameEn: "Academy Operations",
  workspaceNameAr: "عمليات الأكاديمية",
  workspaceIcon: "GraduationCap",
  workspaceType: "Module",
  workspaceSortOrder: 1,
  isLocked: false,
  homeRoute: "/academy",
  menuItems: academyMenuItems,
};

const mockRoutes = [
  "/academy",
  "/academy/athletes",
  "/academy/trials",
  "/academy/enrollments",
  "/academy/programs",
  "/academy/groups",
  "/academy/seasons",
  "/academy/sessions",
  "/academy/attendance",
  "/academy/fees-receivables",
  "/academy/reports",
  "/academy/locations",
  "/academy/setup/sports"
];

async function setupPage(context, isDark = true, lang = "en") {
  const page = await context.newPage();

  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

  await page.route("**/api/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/Menus/my/routes")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          data: {
            routes: mockRoutes,
            workspaceRouteMap: {
              academy: mockRoutes,
            },
          },
        }),
      });
    }

    if (url.includes("/Menus/my")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          message: "Success",
          data: {
            routes: mockRoutes,
            menuItems: academyMenuItems,
            workspaceGroups: [mockWorkspaceGroup],
          },
          errors: null,
        }),
      });
    }

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

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.addInitScript(({ user, dark, language, jwt }) => {
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
    localStorage.setItem("scr_lang", language);
    localStorage.setItem("scr_pref_lang", language);
    localStorage.setItem("i18nextLng", language);
    localStorage.setItem("scripe_language", language);
    localStorage.setItem("scripe_theme", dark ? "dark" : "light");
    if (dark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
    document.cookie = `token=${jwt}; path=/; max-age=86400`;
    document.cookie = `auth_token=${jwt}; path=/; max-age=86400`;
    document.cookie = `scripe_language=${language}; path=/; max-age=86400`;
    document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=86400`;
  }, { user: mockUserProfile, dark: isDark, language: lang, jwt: validJwt });

  return page;
}

const screensToCapture = [
  // Screen 03: Skill Trials & Evaluations
  {
    screenId: "03",
    name: "01_skill_trials_dark_en_desktop.png",
    path: "/academy/trials",
    viewport: { width: 1672, height: 941 },
    theme: "dark",
    lang: "en",
    dir: "ltr",
  },
  {
    screenId: "03",
    name: "02_skill_trials_light_en_desktop.png",
    path: "/academy/trials",
    viewport: { width: 1672, height: 941 },
    theme: "light",
    lang: "en",
    dir: "ltr",
  },
  {
    screenId: "03",
    name: "03_skill_trials_dark_ar_desktop.png",
    path: "/academy/trials",
    viewport: { width: 1672, height: 941 },
    theme: "dark",
    lang: "ar",
    dir: "rtl",
  },
  {
    screenId: "03",
    name: "04_skill_trials_mobile_390px_dark_en.png",
    path: "/academy/trials",
    viewport: { width: 390, height: 844 },
    theme: "dark",
    lang: "en",
    dir: "ltr",
  },

  // Screen 04: Enrollments
  {
    screenId: "04",
    name: "05_enrollments_dark_en_desktop.png",
    path: "/academy/enrollments",
    viewport: { width: 1672, height: 941 },
    theme: "dark",
    lang: "en",
    dir: "ltr",
  },
  {
    screenId: "04",
    name: "06_enrollments_light_en_desktop.png",
    path: "/academy/enrollments",
    viewport: { width: 1672, height: 941 },
    theme: "light",
    lang: "en",
    dir: "ltr",
  },
  {
    screenId: "04",
    name: "07_enrollments_dark_ar_desktop.png",
    path: "/academy/enrollments",
    viewport: { width: 1672, height: 941 },
    theme: "dark",
    lang: "ar",
    dir: "rtl",
  },
  {
    screenId: "04",
    name: "08_enrollments_mobile_390px_dark_en.png",
    path: "/academy/enrollments",
    viewport: { width: 390, height: 844 },
    theme: "dark",
    lang: "en",
    dir: "ltr",
  },

  // Screen 05: Programs & Offerings
  {
    screenId: "05",
    name: "09_programs_dark_en_desktop.png",
    path: "/academy/programs",
    viewport: { width: 1672, height: 941 },
    theme: "dark",
    lang: "en",
    dir: "ltr",
  },
  {
    screenId: "05",
    name: "10_programs_light_en_desktop.png",
    path: "/academy/programs",
    viewport: { width: 1672, height: 941 },
    theme: "light",
    lang: "en",
    dir: "ltr",
  },
  {
    screenId: "05",
    name: "11_programs_dark_ar_desktop.png",
    path: "/academy/programs",
    viewport: { width: 1672, height: 941 },
    theme: "dark",
    lang: "ar",
    dir: "rtl",
  },
  {
    screenId: "05",
    name: "12_programs_mobile_390px_dark_en.png",
    path: "/academy/programs",
    viewport: { width: 390, height: 844 },
    theme: "dark",
    lang: "en",
    dir: "ltr",
  },
];

async function capture() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  for (const item of screensToCapture) {
    const isDark = item.theme === "dark";
    const context = await browser.newContext({
      viewport: item.viewport,
      colorScheme: item.theme,
      locale: item.lang === "ar" ? "ar-SA" : "en-US",
    });

    const page = await setupPage(context, isDark, item.lang);

    const targetUrl = `http://localhost:3000${item.path}`;
    console.log(`Capturing ${item.name} from ${targetUrl} [${item.theme}, ${item.lang}, ${item.viewport.width}x${item.viewport.height}]...`);

    try {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(3000);

      // Clean dev artifacts & force theme/dir
      await page.evaluate(({ dark, rtl, theme, lang, dir }) => {
        if (dark) {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        }

        if (rtl) {
          document.documentElement.setAttribute("dir", "rtl");
          document.documentElement.setAttribute("lang", "ar");
          document.body.setAttribute("dir", "rtl");
        } else {
          document.documentElement.setAttribute("dir", "ltr");
          document.documentElement.setAttribute("lang", "en");
          document.body.setAttribute("dir", "ltr");
        }

        document.documentElement.setAttribute("data-theme", theme);

        // Hide dev toast or portal overlays
        const portals = document.querySelectorAll('nextjs-portal, [data-nextjs-toast]');
        portals.forEach(p => p.remove());
      }, {
        dark: isDark,
        rtl: item.dir === "rtl",
        theme: item.theme,
        lang: item.lang,
        dir: item.dir
      });

      await page.waitForTimeout(1000);

      for (const outDir of OUT_DIRS) {
        const fullPath = path.join(outDir, item.name);
        await page.screenshot({ path: fullPath, fullPage: false });
        console.log(`  ✓ Saved: ${fullPath}`);
      }
    } catch (err) {
      console.error(`  ✗ Error capturing ${item.name}:`, err.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log("\nAll Batch 02 screenshots re-captured successfully with authenticated session.");
}

capture().catch((err) => {
  console.error("Fatal capture error:", err);
  process.exit(1);
});
