const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const stage = process.argv[2] || "after";

const OUT_DIRS = [
  path.resolve(`E:/Scripe_pro/SCRIPE-Root-academy-s0-s8/reports/academy-execution/pilot-01-evidence/${stage}`),
  path.resolve(`C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c/pilot-01-evidence/${stage}`),
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
    "Academy.Programs.Manage",
    "Academy.Trials.View",
    "Academy.Enrollments.View",
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

const mockOverview = {
  isEnabled: true,
  tenantId: "22222222-2222-2222-2222-222222222222",
  maxAthletes: 500,
  maxPrograms: 20,
  maxTrainingGroups: 50,
  activeProgramsCount: 12,
  activeOfferingsCount: 18,
  activeEnrollmentsCount: 284,
  pendingTrialsCount: 7,
  configuredFeatures: ["Programs", "Offerings", "Athletes", "Trials", "Enrollments", "Groups", "Attendance", "Finance", "Reports"],
  statusMessage: "Multi-Sport Operations Active"
};

const mockSports = [
  { id: "sport-football", code: "FB", nameEn: "Football (Soccer)", nameAr: "كرة القدم", isActive: true },
  { id: "sport-swimming", code: "SW", nameEn: "Swimming", nameAr: "السباحة", isActive: true },
  { id: "sport-basketball", code: "BB", nameEn: "Basketball", nameAr: "كرة السلة", isActive: true },
  { id: "sport-tennis", code: "TN", nameEn: "Tennis", nameAr: "كرة المضرب", isActive: true },
  { id: "sport-martialarts", code: "MA", nameEn: "Martial Arts", nameAr: "فنون قتالية", isActive: true }
];

const mockAthletes = [
  {
    id: "ath-001",
    partyId: "pty-001",
    athleteProfileId: "prof-001",
    membershipNumber: "ATH-2026-0001",
    firstNameEn: "QA Athlete Beta",
    lastNameEn: "",
    firstNameAr: "رياضي بيتا",
    lastNameAr: "",
    dateOfBirth: "2012-11-09",
    gender: "Female",
    isMinor: true,
    guardianName: "Parent Beta",
    guardianPhone: "+966501112233",
    guardianRelationship: "Mother",
    medicalClearanceSigned: true,
    medicalNotes: null,
    guardianConsentSigned: true,
    intakeDate: "2026-01-15",
    status: "Active",
    participations: []
  },
  {
    id: "ath-002",
    partyId: "pty-002",
    athleteProfileId: "prof-002",
    membershipNumber: "ATH-2026-0002",
    firstNameEn: "QA Athlete Alpha",
    lastNameEn: "",
    firstNameAr: "رياضي ألفا",
    lastNameAr: "",
    dateOfBirth: "2014-11-09",
    gender: "Male",
    isMinor: true,
    guardianName: "Parent Alpha",
    guardianPhone: "+966502223344",
    guardianRelationship: "Father",
    medicalClearanceSigned: true,
    medicalNotes: "Asthma inhaler required during high exertion",
    guardianConsentSigned: true,
    intakeDate: "2026-01-15",
    status: "Active",
    participations: []
  },
  {
    id: "ath-003",
    partyId: "pty-003",
    athleteProfileId: "prof-003",
    membershipNumber: "ATH-2026-0003",
    firstNameEn: "Ahmed Essam",
    lastNameEn: "",
    firstNameAr: "أحمد عصام",
    lastNameAr: "",
    dateOfBirth: "2018-02-10",
    gender: "Male",
    isMinor: true,
    guardianName: "Essam",
    guardianPhone: "+966503334455",
    guardianRelationship: "Father",
    medicalClearanceSigned: true,
    medicalNotes: null,
    guardianConsentSigned: true,
    intakeDate: "2026-02-01",
    status: "Active",
    participations: [
      {
        id: "part-001",
        athleteProfileId: "prof-003",
        sportId: "sport-football",
        sportNameEn: "Football (Soccer)",
        sportNameAr: "كرة القدم",
        skillLevel: "Beginner",
        joinedDate: "2026-02-01",
        isActive: true
      },
      {
        id: "part-002",
        athleteProfileId: "prof-003",
        sportId: "sport-football",
        sportNameEn: "Football (Soccer)",
        sportNameAr: "كرة القدم",
        skillLevel: "Beginner",
        joinedDate: "2026-02-01",
        isActive: true
      }
    ]
  },
  {
    id: "ath-004",
    partyId: "pty-004",
    athleteProfileId: "prof-004",
    membershipNumber: "ATH-2026-0004",
    firstNameEn: "Ahmed Emam",
    lastNameEn: "",
    firstNameAr: "أحمد إمام",
    lastNameAr: "",
    dateOfBirth: "2004-08-21",
    gender: "Male",
    isMinor: false,
    phoneNumber: "+966504445566",
    medicalClearanceSigned: true,
    guardianConsentSigned: true,
    intakeDate: "2026-02-10",
    status: "Active",
    participations: []
  },
  {
    id: "ath-005",
    partyId: "pty-005",
    athleteProfileId: "prof-005",
    membershipNumber: "ATH-2026-0005",
    firstNameEn: "Mohamed Fares",
    lastNameEn: "",
    firstNameAr: "محمد فارس",
    lastNameAr: "",
    dateOfBirth: "2011-05-18",
    gender: "Male",
    isMinor: true,
    guardianName: "Fares Al-Mansour",
    guardianPhone: "+966505556677",
    guardianRelationship: "Father",
    medicalClearanceSigned: true,
    guardianConsentSigned: true,
    intakeDate: "2026-02-15",
    status: "Active",
    participations: []
  },
  {
    id: "ath-006",
    partyId: "pty-006",
    athleteProfileId: "prof-006",
    membershipNumber: "ATH-2026-0006",
    firstNameEn: "Amin Mahmoud",
    lastNameEn: "",
    firstNameAr: "أمين محمود",
    lastNameAr: "",
    dateOfBirth: "1998-09-07",
    gender: "Male",
    isMinor: false,
    phoneNumber: "+966506667788",
    medicalClearanceSigned: true,
    guardianConsentSigned: true,
    intakeDate: "2026-02-20",
    status: "Active",
    participations: []
  },
  {
    id: "ath-007",
    partyId: "pty-007",
    athleteProfileId: "prof-007",
    membershipNumber: "ATH-2026-0007",
    firstNameEn: "Kareem Tarek",
    lastNameEn: "",
    firstNameAr: "كريم طارق",
    lastNameAr: "",
    dateOfBirth: "2015-03-12",
    gender: "Male",
    isMinor: true,
    guardianName: "Tarek Al-Otaibi",
    guardianPhone: "+966507778899",
    guardianRelationship: "Father",
    medicalClearanceSigned: true,
    guardianConsentSigned: true,
    intakeDate: "2026-03-01",
    status: "Active",
    participations: []
  }
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

    if (url.includes("/Admins/me")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUserProfile),
      });
    }

    if (url.includes("/admin/settings") || url.includes("/tenant-branding") || url.includes("/branding")) {
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

    if (url.includes("/academy/overview")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockOverview),
      });
    }

    if (url.includes("/academy/sports")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSports),
      });
    }

    if (url.includes("/academy/athletes")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAthletes),
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
    if (dark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  }, { user: mockUserProfile, dark: isDark, language: lang, jwt: validJwt });

  return page;
}

async function captureScreen(page, url, filename, isDark = true, isAr = false) {
  console.log(`Capturing: ${url} -> ${filename} (Dark=${isDark}, RTL=${isAr})`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
  await page.waitForTimeout(2000);

  // Clean Next.js dev overlay artifacts for pixel-perfect screenshot evidence
  await page.evaluate(({ dark, rtl }) => {
    if (dark) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    if (rtl) {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }

    // Hide nextjs development overlay badges / toasts
    const devOverlay = document.querySelector("nextjs-portal");
    if (devOverlay) devOverlay.style.display = "none";
    const watcher = document.querySelector("#__next-build-watcher");
    if (watcher) watcher.style.display = "none";
  }, { dark: isDark, rtl: isAr });

  await page.waitForTimeout(500);

  for (const dir of OUT_DIRS) {
    const fullPath = path.join(dir, filename);
    await page.screenshot({ path: fullPath, fullPage: false, timeout: 15000 });
    console.log(`Saved screenshot: ${fullPath}`);
  }
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const viewports = {
    desktop: { width: 1672, height: 941 },
    mobile: { width: 390, height: 844 },
  };

  try {
    // 1. Command Center — Dark EN Desktop
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, true, "en");
      await captureScreen(page, "http://localhost:3000/academy", "01_command_center_dark_en_desktop.png", true, false);
      await context.close();
    }

    // 2. Command Center — Light EN Desktop
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy", "02_command_center_light_en_desktop.png", false, false);
      await context.close();
    }

    // 3. Command Center — Dark AR RTL Desktop
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, true, "ar");
      await captureScreen(page, "http://localhost:3000/academy", "03_command_center_dark_ar_desktop.png", true, true);
      await context.close();
    }

    // 4. Command Center — Mobile 390px (Dark EN)
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, true, "en");
      await captureScreen(page, "http://localhost:3000/academy", "04_command_center_mobile_390px_dark_en.png", true, false);
      await context.close();
    }

    // 5. Athlete Directory — Dark EN Desktop
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, true, "en");
      await captureScreen(page, "http://localhost:3000/academy/athletes", "05_athlete_directory_dark_en_desktop.png", true, false);
      await context.close();
    }

    // 6. Athlete Directory — Light EN Desktop
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/athletes", "06_athlete_directory_light_en_desktop.png", false, false);
      await context.close();
    }

    // 7. Athlete Directory — Dark AR RTL Desktop
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, true, "ar");
      await captureScreen(page, "http://localhost:3000/academy/athletes", "07_athlete_directory_dark_ar_desktop.png", true, true);
      await context.close();
    }

    // 8. Athlete Directory — Mobile 390px (Dark EN)
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, true, "en");
      await captureScreen(page, "http://localhost:3000/academy/athletes", "08_athlete_directory_mobile_390px_dark_en.png", true, false);
      await context.close();
    }

    console.log(`ALL 8 SCREENSHOTS FOR STAGE '${stage}' CAPTURED SUCCESSFULLY.`);
  } catch (err) {
    console.error("Screenshot capture failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
