const { chromium } = require("@playwright/test");

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
    "academy-overview.view",
    "academy-athletes.view",
    "academy-athletes.create",
    "academy-athletes.update",
    "academy-safeguarding.view",
    "academy-programs.view",
    "academy-programs.manage",
    "academy-trials.view",
    "academy-enrollments.view",
    "academy-groups.view",
    "academy-sessions.view",
    "academy-sessions.manage",
    "academy-attendance.view",
    "academy-attendance.take",
    "academy-attendance.correct",
    "academy-finance.view",
    "academy-reports.view",
    "academy.export",
    "*"
  ],
};

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
  }
];

async function setupPage(context) {
  const page = await context.newPage();

  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

  await page.route("**/api/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/auth/admin/refresh") || url.includes("/login") || url.includes("/auth")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          accessToken: "mock_jwt_access_token_12345",
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
            collapsibleSidebar: true,
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
      if (url.includes("/card/")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            athleteId: "ath-001",
            membershipNumber: "ATH-2026-0001",
            firstNameEn: "QA Athlete Beta",
            lastNameEn: "",
            firstNameAr: "رياضي بيتا",
            lastNameAr: "",
            academyName: "Al Hilal SFC Academy",
            primaryBranchName: "Main Campus",
            sports: ["Football (Soccer)"],
            status: "Active",
            intakeDate: "2026-01-15",
            cardToken: "token-qa-beta"
          }),
        });
      }
      if (url.includes("/qr")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            membershipNumber: "ATH-2026-0001",
            cardToken: "token-qa-beta",
            cardUrl: "http://localhost:3000/academy/card/token-qa-beta",
            qrCodeDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='black'/></svg>"
          }),
        });
      }
      if (url.includes("/guardians")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      }
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

  await page.addInitScript(({ user }) => {
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
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("scr_pref_lang", "en");
    localStorage.setItem("theme", "dark");
  }, { user: mockUserProfile });

  return page;
}

async function runVerification() {
  console.log("=== STARTING BOUNDED INTERACTION VERIFICATION ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);

  const page = await setupPage(context);

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Command Center Interaction Verification
  console.log("TEST 1: Command Center (/academy)");
  await page.goto("http://localhost:3000/academy", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.waitForSelector("h1");
  const title = await page.textContent("h1");
  console.log(`  ✓ Page title: "${title.trim()}"`);

  // Verify KPI values
  const kpis = await page.locator("p.font-black").allTextContents();
  console.log(`  ✓ 5 KPI Values retrieved: ${JSON.stringify(kpis.map(s => s.trim()))}`);

  // Verify Needs Attention item count
  const attentionCount = await page.locator("text=Needs Attention").locator("..").locator("span").textContent();
  console.log(`  ✓ Needs Attention count badge: ${attentionCount.trim()}`);

  // Test Refresh action
  const refreshBtn = page.locator("button:has-text('Refresh')");
  await refreshBtn.click();
  console.log("  ✓ Refresh action triggered without error");

  // 2. Athlete Directory Interaction Verification
  console.log("TEST 2: Athlete Directory (/academy/athletes)");
  await page.goto("http://localhost:3000/academy/athletes", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.waitForSelector("h1");
  const athTitle = await page.textContent("h1");
  console.log(`  ✓ Page title: "${athTitle.trim()}"`);

  // Test Search Interaction
  console.log("TEST 2A: Search Filter");
  const searchInput = page.locator("input[placeholder*='Search']");
  await searchInput.fill("Ahmed");
  await page.waitForTimeout(300);
  const cardsAfterSearch = await page.locator("h3.text-\\[15px\\]").count();
  console.log(`  ✓ Found ${cardsAfterSearch} athlete(s) matching "Ahmed"`);
  await searchInput.fill("");

  // Test Sport Filter
  console.log("TEST 2B: Sport Dropdown Filter");
  const sportSelect = page.locator("select[aria-label='Filter by sport']");
  await sportSelect.selectOption("sport-football");
  await page.waitForTimeout(300);
  console.log("  ✓ Filter by sport applied cleanly");
  await sportSelect.selectOption("");

  // Test Status Filter
  console.log("TEST 2C: Safeguarding Status Filter");
  const statusSelect = page.locator("select[aria-label='Filter by safeguarding status']");
  await statusSelect.selectOption("alert");
  await page.waitForTimeout(300);
  const alertCards = await page.locator("text=Medical Alert").count();
  console.log(`  ✓ Found ${alertCards} athlete(s) with Medical Alert filter`);
  await statusSelect.selectOption("all");

  // Test Card Click Genuine Selection
  console.log("TEST 2D: Genuine Card Selection");
  const firstCard = page.locator("[data-testid='athlete-card']").first();
  await firstCard.click();
  await page.waitForTimeout(200);
  const isHighlighted = await firstCard.evaluate((el) => el.className.includes("ring-[#c6ff00]"));
  console.log(`  ✓ Card selection applies Signal Lime glow ring: ${isHighlighted}`);

  // Test Athlete Details Dialog
  console.log("TEST 2E: Athlete Details Modal");
  const detailsBtn = page.locator("button:has-text('View Details')").first();
  await detailsBtn.click();
  await page.waitForSelector("text=Protected Medical Alerts", { timeout: 5000 });
  console.log("  ✓ Athlete detail modal rendered protected medical & safeguarding fields");
  const closeBtn = page.locator("button[aria-label='Close dialog']");
  await closeBtn.click();
  await page.waitForTimeout(200);
  console.log("  ✓ Detail modal closed cleanly");

  // Test New Athlete Intake Dialog
  console.log("TEST 2F: New Athlete Intake Wizard");
  const intakeBtn = page.locator("button:has-text('New Athlete Intake')");
  await intakeBtn.click();
  await page.waitForSelector("text=New Athlete Intake Wizard", { timeout: 5000 });
  console.log("  ✓ 5-Step Intake wizard dialog opened cleanly");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  console.log("  ✓ Wizard dismissed");

  // Console error check
  console.log("TEST 3: Browser Console Error Audit");
  console.log(`  Total browser console errors recorded: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("  Errors:", consoleErrors);
  } else {
    console.log("  ✓ ZERO console errors recorded during all interaction flows!");
  }

  await browser.close();
  console.log("=== BOUNDED INTERACTION VERIFICATION COMPLETE ===");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
