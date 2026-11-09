const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const SCREENSHOT_DIR = path.resolve("E:/Scripe_pro/SCRIPE-Root-academy-s0-s8/reports/academy-execution/screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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

const mockSessionData = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  tenantId: "22222222-2222-2222-2222-222222222222",
  groupId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  groupNameEn: "U12 Elite Football",
  groupNameAr: "فريق النخبة تحت 12 سنة",
  offeringId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
  offeringNameEn: "Football Development Term 1",
  offeringNameAr: "تطوير كرة القدم - الفصل 1",
  branchId: "33333333-3333-3333-3333-333333333333",
  startUtc: "2026-11-10T15:00:00Z",
  endUtc: "2026-11-10T16:30:00Z",
  timeZoneId: "Asia/Riyadh",
  status: "Scheduled",
  locationMode: "ExternalLocation",
  locationNameEn: "Hilal Pitch A",
  locationNameAr: "ملعب الهلال أ",
  coaches: [
    { staffMemberId: "dddddddd-dddd-dddd-dddd-dddddddddddd", fullName: "Coach Ahmed Al-Ghamdi", isSubstitute: false }
  ],
  objectivesEn: "Tactical positioning, defensive coordination, and transition speed drills",
  objectivesAr: "تمارين التمركز التكتيكي والتنسيق الدفاعي وسرعة التحول",
  canReschedule: true,
  canStart: true,
  canComplete: false,
  canCancel: true,
  version: "AAAAAA==",
  createdAt: "2026-11-01T10:00:00Z",
  modifiedAt: null,
};

const mockAttendanceRegister = {
  session: mockSessionData,
  canRecord: true,
  canCorrect: true,
  rows: [
    {
      athleteId: "11111111-0001-0000-0000-000000000001",
      displayNameEn: "Tariq Al-Mansour",
      displayNameAr: "طارق المنصور",
      isEligible: true,
      attendance: {
        athleteId: "11111111-0001-0000-0000-000000000001",
        status: "Present",
        reason: null,
        recordedBy: "Coach Ahmed",
        recordedAtUtc: "2026-11-10T15:05:00Z",
        version: "AAAAAA==",
      },
    },
    {
      athleteId: "11111111-0002-0000-0000-000000000002",
      displayNameEn: "Ziyad Al-Harbi",
      displayNameAr: "زياد الحربي",
      isEligible: true,
      attendance: {
        athleteId: "11111111-0002-0000-0000-000000000002",
        status: "Late",
        reason: "Traffic delay on King Fahd Rd",
        recordedBy: "Coach Ahmed",
        recordedAtUtc: "2026-11-10T15:20:00Z",
        version: "AAAAAA==",
      },
    },
    {
      athleteId: "11111111-0003-0000-0000-000000000003",
      displayNameEn: "Rayan Al-Otaibi",
      displayNameAr: "ريان العتيبي",
      isEligible: true,
      attendance: {
        athleteId: "11111111-0003-0000-0000-000000000003",
        status: "Medical",
        reason: "Mild ankle sprain during warm-up",
        recordedBy: "Coach Ahmed",
        recordedAtUtc: "2026-11-10T15:10:00Z",
        version: "AAAAAA==",
      },
    },
    {
      athleteId: "11111111-0004-0000-0000-000000000004",
      displayNameEn: "Sami Al-Dosari",
      displayNameAr: "سامي الدوسري",
      isEligible: true,
      attendance: null,
    },
  ],
};

const mockFeesReceivables = {
  items: [
    {
      enrollmentId: "e1111111-0001-0000-0000-000000000001",
      athleteId: "11111111-0002-0000-0000-000000000002",
      athleteNameEn: "Ziyad Al-Harbi",
      athleteNameAr: "زياد الحربي",
      offeringId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      offeringNameEn: "Football Development Term 1",
      offeringNameAr: "تطوير كرة القدم - الفصل 1",
      programId: "p1111111-0000-0000-0000-000000000001",
      programNameEn: "Football Academy",
      branchId: "33333333-3333-3333-3333-333333333333",
      enrollmentDate: "2026-10-01",
      enrollmentStatus: "Active",
      billingStatus: "Paid",
      quoteAmount: 1500,
      priceCurrency: "SAR",
      financeInvoiceReference: "INV-2026-001",
      financeInvoiceStatus: "Paid",
      totalInvoicedAmount: 1500,
      paidAmount: 1500,
      outstandingAmount: 0,
      issuedAtUtc: "2026-10-01T00:00:00Z",
      dueAtUtc: "2026-10-15T00:00:00Z",
      isOverdue: false,
      daysOverdue: 0,
      allocations: [
        {
          paymentId: "pay-001",
          paymentNumber: "PAY-001",
          amount: 1500,
          currencyCode: "SAR",
          allocatedAtUtc: "2026-10-05T12:00:00Z",
          receiptNumber: "REC-001"
        }
      ]
    },
    {
      enrollmentId: "e1111111-0002-0000-0000-000000000002",
      athleteId: "11111111-0002-0000-0000-000000000002",
      athleteNameEn: "Ziyad Al-Harbi",
      athleteNameAr: "زياد الحربي",
      offeringId: "c2222222-cccc-cccc-cccc-cccccccccccc",
      offeringNameEn: "Elite Swimming Term 1",
      offeringNameAr: "السباحة المتقدمة - الفصل 1",
      programId: "p2222222-0000-0000-0000-000000000002",
      programNameEn: "Swimming Academy",
      branchId: "33333333-3333-3333-3333-333333333333",
      enrollmentDate: "2026-10-05",
      enrollmentStatus: "Active",
      billingStatus: "PartiallyPaid",
      quoteAmount: 1000,
      priceCurrency: "SAR",
      financeInvoiceReference: "INV-2026-002",
      financeInvoiceStatus: "PartiallyPaid",
      totalInvoicedAmount: 1000,
      paidAmount: 500,
      outstandingAmount: 500,
      issuedAtUtc: "2026-10-05T00:00:00Z",
      dueAtUtc: "2026-10-25T00:00:00Z",
      isOverdue: false,
      daysOverdue: 0,
      allocations: [
        {
          paymentId: "pay-002",
          paymentNumber: "PAY-002",
          amount: 500,
          currencyCode: "SAR",
          allocatedAtUtc: "2026-10-10T12:00:00Z",
          receiptNumber: "REC-002"
        }
      ]
    },
    {
      enrollmentId: "e1111111-0003-0000-0000-000000000003",
      athleteId: "11111111-0003-0000-0000-000000000003",
      athleteNameEn: "Rayan Al-Otaibi",
      athleteNameAr: "ريان العتيبي",
      offeringId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      offeringNameEn: "Football Development Term 1",
      offeringNameAr: "تطوير كرة القدم - الفصل 1",
      programId: "p1111111-0000-0000-0000-000000000001",
      programNameEn: "Football Academy",
      branchId: "33333333-3333-3333-3333-333333333333",
      enrollmentDate: "2026-09-15",
      enrollmentStatus: "Active",
      billingStatus: "Invoiced",
      quoteAmount: 1500,
      priceCurrency: "SAR",
      financeInvoiceReference: "INV-2026-003",
      financeInvoiceStatus: "Overdue",
      totalInvoicedAmount: 1500,
      paidAmount: 0,
      outstandingAmount: 1500,
      issuedAtUtc: "2026-09-15T00:00:00Z",
      dueAtUtc: "2026-10-01T00:00:00Z",
      isOverdue: true,
      daysOverdue: 39,
      allocations: []
    },
    {
      enrollmentId: "e1111111-0004-0000-0000-000000000004",
      athleteId: "11111111-0004-0000-0000-000000000004",
      athleteNameEn: "Sami Al-Dosari",
      athleteNameAr: "سامي الدوسري",
      offeringId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      offeringNameEn: "Football Development Term 1",
      offeringNameAr: "تطوير كرة القدم - الفصل 1",
      programId: "p1111111-0000-0000-0000-000000000001",
      programNameEn: "Football Academy",
      branchId: "33333333-3333-3333-3333-333333333333",
      enrollmentDate: "2026-10-01",
      enrollmentStatus: "Active",
      billingStatus: "Waived",
      quoteAmount: 1500,
      priceCurrency: "SAR",
      financeInvoiceReference: null,
      financeInvoiceStatus: null,
      totalInvoicedAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      issuedAtUtc: null,
      dueAtUtc: null,
      isOverdue: false,
      daysOverdue: 0,
      allocations: []
    }
  ],
  summaries: [
    {
      currencyCode: "SAR",
      totalInvoiced: 4000,
      totalPaid: 2000,
      totalOutstanding: 2000,
      totalOverdue: 1500,
      invoicedCount: 3,
      paidCount: 1,
      outstandingCount: 2,
      overdueCount: 1,
      waivedCount: 1,
      unbilledCount: 0
    }
  ],
  totalCount: 4,
  page: 1,
  pageSize: 25,
  asOfUtc: "2026-11-09T12:00:00Z"
};

const mockOperationalMetrics = {
  totalRegisteredAthletes: 25,
  uniqueAthletesWithEnrollments: 20,
  totalEnrollmentsCount: 22,
  activeEnrollmentsCount: 22,
  totalUniqueAthletes: 20,
  multiSportAthletesCount: 2,
  enrollmentsByStatus: {
    Active: 22,
    Pending: 3,
    Suspended: 0
  },
  enrollmentsBySport: [
    {
      sportId: "sport-football",
      sportNameEn: "Football",
      sportNameAr: "كرة القدم",
      enrollmentCount: 14,
      uniqueAthletesCount: 13
    },
    {
      sportId: "sport-swimming",
      sportNameEn: "Swimming",
      sportNameAr: "السباحة",
      enrollmentCount: 8,
      uniqueAthletesCount: 7
    }
  ],
  enrollmentsByProgram: [
    {
      programId: "p1111111-0000-0000-0000-000000000001",
      programNameEn: "Football Academy Development",
      programNameAr: "تطوير أكاديمية كرة القدم",
      enrollmentCount: 14
    },
    {
      programId: "p2222222-0000-0000-0000-000000000002",
      programNameEn: "Elite Swimming Squad",
      programNameAr: "فريق النخبة للسباحة",
      enrollmentCount: 8
    }
  ],
  enrollmentsByBranch: [
    {
      branchId: "33333333-3333-3333-3333-333333333333",
      enrollmentCount: 22,
      uniqueAthletesCount: 20
    }
  ],
  enrollmentsBySeason: [
    {
      seasonId: "season-2026-term1",
      seasonNameEn: "Term 1 (Autumn 2026)",
      seasonNameAr: "الفصل 1 (خريف 2026)",
      enrollmentCount: 22
    }
  ],
  groupCapacityUtilization: {
    totalGroups: 3,
    totalCapacity: 25,
    totalActiveMembers: 22,
    averageFillRatePercent: 88.0,
    groups: [
      {
        groupId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        groupNameEn: "U12 Elite Football",
        groupNameAr: "فريق النخبة تحت 12 سنة",
        offeringId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        offeringNameEn: "Football Development Term 1",
        branchId: "33333333-3333-3333-3333-333333333333",
        minCapacity: 8,
        maxCapacity: 15,
        activeMembers: 12,
        fillRatePercent: 80.0,
        status: "Active"
      },
      {
        groupId: "bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb",
        groupNameEn: "U14 Advanced Swimming",
        groupNameAr: "فريق السباحة المتقدم تحت 14",
        offeringId: "c2222222-cccc-cccc-cccc-cccccccccccc",
        offeringNameEn: "Elite Swimming Term 1",
        branchId: "33333333-3333-3333-3333-333333333333",
        minCapacity: 5,
        maxCapacity: 10,
        activeMembers: 10,
        fillRatePercent: 100.0,
        status: "Active"
      },
      {
        groupId: "bbbbbbbb-3333-bbbb-bbbb-bbbbbbbbbbbb",
        groupNameEn: "Intake Assessment Group",
        groupNameAr: "مجموعة تقييم واكتشاف المواهب",
        offeringId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        offeringNameEn: "Football Development Term 1",
        branchId: "33333333-3333-3333-3333-333333333333",
        minCapacity: 0,
        maxCapacity: 0,
        activeMembers: 0,
        fillRatePercent: 0.0,
        status: "Open"
      }
    ]
  },
  trialFunnel: {
    totalTrials: 3,
    requestedCount: 1,
    scheduledCount: 0,
    completedCount: 0,
    acceptedCount: 2,
    rejectedCount: 1,
    conversionRatePercent: 66.7
  },
  financialReceivables: {
    asOfUtc: "2026-11-09T12:00:00Z"
  },
  deferredCodexMetrics: {
    attendanceRatePercent: 87.5,
    coachSessionWorkloadHours: 32.5,
    sessionUtilizationRatePercent: 91.0,
    status: "INTEGRATED",
    reason: "Bound to live Codex S5 TrainingSessions and S6 SessionAttendances queries"
  },
  metadata: {
    asOfUtc: "2026-11-09T12:00:00Z",
    tenantId: "22222222-2222-2222-2222-222222222222",
    scopedBranchIds: ["33333333-3333-3333-3333-333333333333"]
  }
};

async function setupPage(context, isDark = false, lang = "en") {
  const page = await context.newPage();

  // Intercept all API routes with consistent mock contracts
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/auth/admin/refresh")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          accessToken: "mock_jwt_access_token_12345",
          mustChangePassword: false,
          subscriptionStatus: "Active",
          gracePhase: null,
          editionName: "Enterprise",
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
            collapsibleSidebar: true,
            dashboardThemeJson: "{}",
          },
        }),
      });
    }

    if (url.includes("/academy/attendance/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAttendanceRegister),
      });
    }

    if (url.includes("/academy/attendance")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [mockSessionData],
          totalCount: 1,
          page: 1,
          pageSize: 25,
        }),
      });
    }

    if (url.includes("/academy/sessions/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: mockSessionData }),
      });
    }

    if (url.includes("/academy/sessions")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockSessionData],
          totalCount: 1,
          page: 1,
          pageSize: 25,
        }),
      });
    }

    if (url.includes("/academy/finance/fees-receivables")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockFeesReceivables),
      });
    }

    if (url.includes("/academy/analytics/operational-metrics")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: mockOperationalMetrics }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.addInitScript(({ user, dark, language }) => {
    const authState = {
      state: {
        sidebarOpen: true,
        density: "comfortable",
        user: user,
        isAuthenticated: true,
        permissions: ["*"],
        roles: ["TenantAdmin", "AcademyDirector"],
        tenantCode: "hilal",
        _hasHydrated: true,
      },
      version: 0,
    };
    localStorage.setItem("app-storage", JSON.stringify(authState));
    localStorage.setItem("scr_lang", language);
    localStorage.setItem("scr_pref_lang", language);
    if (dark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  }, { user: mockUserProfile, dark: isDark, language: lang });

  return page;
}

async function captureScreen(page, url, outputPath, isDark = false, isAr = false) {
  console.log(`Capturing: ${url} -> ${path.basename(outputPath)}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

  if (isDark) {
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);
  }

  if (isAr) {
    await page.evaluate(() => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    });
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: outputPath, fullPage: false });
  console.log(`Saved screenshot: ${path.basename(outputPath)}`);
}

async function run() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const viewports = {
    mobile: { width: 390, height: 844 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 },
  };

  try {
    // 1. Mobile 390px Session Detail - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/sessions/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "06_s5_session_detail_390px_mobile_light_en.png"));
      await context.close();
    }

    // 2. Mobile 390px Session Detail - Light AR (RTL)
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "ar");
      await captureScreen(page, "http://localhost:3000/academy/sessions/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "07_s5_session_detail_390px_mobile_light_ar.png"), false, true);
      await context.close();
    }

    // 3. Mobile 390px Session Detail - Dark EN
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, true, "en");
      await captureScreen(page, "http://localhost:3000/academy/sessions/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "08_s5_session_detail_390px_mobile_dark_en.png"), true, false);
      await context.close();
    }

    // 4. Tablet 768px Session Detail - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.tablet });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/sessions/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "09_s5_session_detail_768px_tablet_en.png"));
      await context.close();
    }

    // 5. Desktop 1440px Session Detail - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/sessions/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "10_s5_session_detail_1440px_desktop_en.png"));
      await context.close();
    }

    // 6. Mobile 390px Sessions List - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/sessions",
        path.join(SCREENSHOT_DIR, "11_s5_sessions_list_390px_mobile_en.png"));
      await context.close();
    }

    // 7. Mobile 390px S6 Attendance Register - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/attendance/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "12_s6_attendance_register_390px_mobile_en.png"));
      await context.close();
    }

    // 8. Desktop 1440px S6 Attendance Register - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/attendance/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "13_s6_attendance_register_1440px_desktop_en.png"));
      await context.close();
    }

    // 9. Desktop 1440px S6 Attendance Register - Light AR
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "ar");
      await captureScreen(page, "http://localhost:3000/academy/attendance/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        path.join(SCREENSHOT_DIR, "14_s6_attendance_register_1440px_desktop_ar.png"), false, true);
      await context.close();
    }

    // 10. Mobile 390px A7 Fees Receivables - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/fees-receivables",
        path.join(SCREENSHOT_DIR, "15_a7_fees_receivables_390px_mobile_en.png"));
      await context.close();
    }

    // 11. Desktop 1440px A7 Fees Receivables - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/fees-receivables",
        path.join(SCREENSHOT_DIR, "16_a7_fees_receivables_1440px_desktop_en.png"));
      await context.close();
    }

    // 12. Desktop 1440px A7 Fees Receivables - Light AR
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "ar");
      await captureScreen(page, "http://localhost:3000/academy/fees-receivables",
        path.join(SCREENSHOT_DIR, "17_a7_fees_receivables_1440px_desktop_ar.png"), false, true);
      await context.close();
    }

    // 13. Mobile 390px A8 Analytics Reports - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.mobile });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/reports",
        path.join(SCREENSHOT_DIR, "18_a8_analytics_reports_390px_mobile_en.png"));
      await context.close();
    }

    // 14. Desktop 1440px A8 Analytics Reports - Light EN
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "en");
      await captureScreen(page, "http://localhost:3000/academy/reports",
        path.join(SCREENSHOT_DIR, "19_a8_analytics_reports_1440px_desktop_en.png"));
      await context.close();
    }

    // 15. Desktop 1440px A8 Analytics Reports - Light AR
    {
      const context = await browser.newContext({ viewport: viewports.desktop });
      await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
      const page = await setupPage(context, false, "ar");
      await captureScreen(page, "http://localhost:3000/academy/reports",
        path.join(SCREENSHOT_DIR, "20_a8_analytics_reports_1440px_desktop_ar.png"), false, true);
      await context.close();
    }

    console.log("All real application screenshots successfully captured!");
  } finally {
    await browser.close();
  }
}

run();
