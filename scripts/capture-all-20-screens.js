const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const BRAIN_DIR = process.env.SCRIPE_BRAIN_DIR || "C:/Users/DELL/.gemini/antigravity/brain/088ee4ed-4537-4e5c-a5ac-faaac531112a";
const EVIDENCE_DIR = path.join(BRAIN_DIR, "design-system-evidence");
const ZIP_OUTPUT = path.join(BRAIN_DIR, "ACADEMY_DESIGN_SYSTEM_EVIDENCE.zip");

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const mockUserProfile = {
  id: "11111111-1111-1111-1111-111111111111",
  username: "uat.tenantadmin@hilal.local",
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
    "Academy.Programs.View",
    "Academy.Programs.Manage",
    "Academy.Athletes.View",
    "Academy.Athletes.Manage",
    "Academy.Trials.View",
    "Academy.Trials.Manage",
    "Academy.Enrollments.View",
    "Academy.Enrollments.Manage",
    "Academy.Groups.View",
    "Academy.Groups.Manage",
    "Academy.Seasons.View",
    "Academy.Seasons.Manage",
    "Academy.Sessions.View",
    "Academy.Sessions.Manage",
    "Academy.Attendance.View",
    "Academy.Attendance.Take",
    "Academy.Attendance.Correct",
    "Academy.Finance.View",
    "Academy.Reports.View",
    "Academy.Locations.View",
    "Academy.Setup.Sports.View",
    "Academy.Export",
    "*"
  ],
};

const screens = [
  { id: "01", name: "01_academy_overview", path: "/academy", label: "Screen 01: Operations Command Center" },
  { id: "02", name: "02_athletes_directory", path: "/academy/athletes", label: "Screen 02: Athletes & Families Directory" },
  { id: "03", name: "03_trials_evaluations", path: "/academy/trials", label: "Screen 03: Trials & Evaluations" },
  { id: "04", name: "04_student_enrollments", path: "/academy/enrollments", label: "Screen 04: Student Enrollments" },
  { id: "05", name: "05_programs_pricing", path: "/academy/programs", label: "Screen 05: Multi-Sport Programs & Pricing" },
  { id: "06", name: "06_training_groups", path: "/academy/groups", label: "Screen 06: Training Groups & Rosters" },
  { id: "07", name: "07_seasons_terms", path: "/academy/seasons", label: "Screen 07: Seasons & Term Cycles" },
  { id: "08", name: "08_sessions_schedule", path: "/academy/sessions", label: "Screen 08: Sessions & Scheduling Master" },
  { id: "09", name: "09_attendance_register", path: "/academy/attendance", label: "Screen 09: Daily Attendance Register" },
  { id: "10", name: "10_fees_receivables", path: "/academy/fees-receivables", label: "Screen 10: Academy Fees & Receivables" },
  { id: "11", name: "11_reports_and_kpis", path: "/academy/reports", label: "Screen 11: Reports & Analytics" },
  { id: "12", name: "12_training_locations", path: "/academy/locations", label: "Screen 12: External Locations & Facilities" },
  { id: "13", name: "13_sports_setup", path: "/academy/setup/sports", label: "Screen 13: Sports Taxonomy & Age Matrix" },
  { id: "14", name: "14_athlete_profile", path: "/academy/athletes?view=profile", label: "Screen 14: Athlete 360 Profile" },
  { id: "15", name: "15_trial_review", path: "/academy/trials?view=review", label: "Screen 15: Trial Technical Review & Decision" },
  { id: "16", name: "16_enrollment_detail", path: "/academy/enrollments?view=detail", label: "Screen 16: Enrollment Contract & Ledger" },
  { id: "17", name: "17_athlete_intake_wizard", path: "/academy/athletes?view=intake&step=2", label: "Screen 17: Athlete Intake Wizard" },
  { id: "18", name: "18_trial_intake_wizard", path: "/academy/trials?view=schedule", label: "Screen 18: Trial Scheduling & Intake Wizard" },
  { id: "19", name: "19_enrollment_create_wizard", path: "/academy/enrollments?view=create", label: "Screen 19: Create Enrollment Wizard" },
  { id: "20", name: "20_attendance_correction_and_audit", path: "/academy/attendance?view=corrections", label: "Screen 20: Attendance Corrections & Governed Audit" }
];

const variants = [
  { id: "dark_en_desktop", theme: "dark", lang: "en", dir: "ltr", viewport: { width: 1440, height: 900 } },
  { id: "light_en_desktop", theme: "light", lang: "en", dir: "ltr", viewport: { width: 1440, height: 900 } },
  { id: "dark_ar_desktop", theme: "dark", lang: "ar", dir: "rtl", viewport: { width: 1440, height: 900 } },
  { id: "mobile_390px_dark_en", theme: "dark", lang: "en", dir: "ltr", viewport: { width: 390, height: 844 } }
];

async function setupPage(context, theme, lang, dir) {
  const page = await context.newPage();

  // Abort external fonts
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

  await page.addInitScript(({ user, themeName, language, textDir }) => {
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
    localStorage.setItem("theme", themeName);
  }, { user: mockUserProfile, themeName: theme, language: lang, textDir: dir });

  return page;
}

async function captureScreen(page, url, outputPath, theme, lang, dir) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1500);

  // Apply theme and direction
  await page.evaluate(({ themeName, language, textDir }) => {
    const html = document.documentElement;
    if (themeName === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
    html.lang = language;
    html.dir = textDir;
  }, { themeName: theme, language: lang, textDir: dir });

  await page.waitForTimeout(500);
  await page.screenshot({ path: outputPath, fullPage: false, timeout: 15000 });
}

async function run() {
  console.log("=== SCRIPE Academy: Capturing All 20 Screens Across 4 Variants ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const total = screens.length * variants.length;
  let completed = 0;

  for (const variant of variants) {
    console.log(`\n--- Capturing Variant: ${variant.id} (${variant.theme.toUpperCase()} / ${variant.lang.toUpperCase()} / ${variant.viewport.width}px) ---`);
    const context = await browser.newContext({ viewport: variant.viewport });
    await context.addCookies([{ name: "scr_auth_state", value: "true", domain: "localhost", path: "/" }]);
    const page = await setupPage(context, variant.theme, variant.lang, variant.dir);

    for (const screen of screens) {
      const filename = `${screen.name}_${variant.id}.png`;
      const outputPath = path.join(EVIDENCE_DIR, filename);
      const url = `http://localhost:3000${screen.path}`;

      try {
        await captureScreen(page, url, outputPath, variant.theme, variant.lang, variant.dir);
        completed++;
        console.log(`[${completed}/${total}] Captured: ${filename}`);
      } catch (err) {
        console.error(`[${completed}/${total}] FAILED: ${filename} - ${err.message}`);
      }
    }

    await page.close();
    await context.close();
  }

  await browser.close();
  console.log(`\nCompleted ${completed}/${total} screen captures.`);

  // Zip the evidence directory
  console.log(`Packaging evidence into: ${ZIP_OUTPUT}`);
  try {
    execSync(`powershell -Command "Compress-Archive -Path '${EVIDENCE_DIR}\\*.png' -DestinationPath '${ZIP_OUTPUT}' -Force"`);
    console.log("Archive created successfully.");
  } catch (zipErr) {
    console.error("Error creating zip archive:", zipErr.message);
  }
}

run().catch((err) => {
  console.error("Fatal capture error:", err);
  process.exit(1);
});
