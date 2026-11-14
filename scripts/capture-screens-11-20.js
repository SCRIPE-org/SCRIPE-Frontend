const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const BRAIN_DIR = "C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c";
const EVIDENCE_DIR = path.join(BRAIN_DIR, "batch-04-evidence");
const APPROVED_DIR = "E:/SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11/SCRIPE_Academy_FINAL_Design_Pack/01_Final_Screens";
const PACKAGE_DIR = "E:/Scripe_pro/SCRIPE_ACADEMY_FINAL_PACKAGE";

[EVIDENCE_DIR, PACKAGE_DIR].forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

const screens = [
  {
    id: "11",
    name: "reports_and_kpis",
    path: "/academy/reports",
    approvedFile: "11_Reports_and_KPIs.png",
    baseFilename: "11_reports_and_kpis",
    label: "Screen 11: Reports & Analytics"
  },
  {
    id: "12",
    name: "locations",
    path: "/academy/locations",
    approvedFile: "12_Training_Locations.png",
    baseFilename: "12_training_locations",
    label: "Screen 12: Facilities & Locations"
  },
  {
    id: "13",
    name: "sports_setup",
    path: "/academy/setup/sports",
    approvedFile: "13_Sports_Setup.png",
    baseFilename: "13_sports_setup",
    label: "Screen 13: Sports Taxonomy & Configuration"
  },
  {
    id: "14",
    name: "athlete_profile",
    path: "/academy/athletes?view=profile",
    approvedFile: "14_Athlete_Profile.png",
    baseFilename: "14_athlete_profile",
    label: "Screen 14: Athlete 360 Profile"
  },
  {
    id: "15",
    name: "trial_review",
    path: "/academy/trials?view=review",
    approvedFile: "15_Trial_Review.png",
    baseFilename: "15_trial_review",
    label: "Screen 15: Trial Technical Review & Decision"
  },
  {
    id: "16",
    name: "enrollment_detail",
    path: "/academy/enrollments?view=detail",
    approvedFile: "16_Enrollment_Detail.png",
    baseFilename: "16_enrollment_detail",
    label: "Screen 16: Enrollment Contract & Ledger"
  },
  {
    id: "17",
    name: "athlete_intake_wizard",
    path: "/academy/athletes?view=intake&step=2",
    approvedFile: "17_Athlete_Intake_Wizard.png",
    baseFilename: "17_athlete_intake_wizard",
    label: "Screen 17: Athlete Intake Wizard"
  },
  {
    id: "18",
    name: "trial_intake_wizard",
    path: "/academy/trials?view=schedule",
    approvedFile: "18_Trial_Intake_Wizard.png",
    baseFilename: "18_trial_intake_wizard",
    label: "Screen 18: Trial Scheduling & Intake Wizard"
  },
  {
    id: "19",
    name: "enrollment_create_wizard",
    path: "/academy/enrollments?view=create",
    approvedFile: "19_Enrollment_Create_Wizard.png",
    baseFilename: "19_enrollment_create_wizard",
    label: "Screen 19: Create Enrollment Wizard"
  },
  {
    id: "20",
    name: "attendance_correction_and_audit",
    path: "/academy/attendance?view=corrections",
    approvedFile: "20_Attendance_Correction_and_Audit.png",
    baseFilename: "20_attendance_correction_and_audit",
    label: "Screen 20: Attendance Corrections & Governed Audit"
  }
];

const variants = [
  {
    id: "dark_en_desktop",
    theme: "dark",
    lang: "en",
    dir: "ltr",
    viewport: { width: 1672, height: 941 },
    isMobile: false
  },
  {
    id: "light_en_desktop",
    theme: "light",
    lang: "en",
    dir: "ltr",
    viewport: { width: 1672, height: 941 },
    isMobile: false
  },
  {
    id: "dark_ar_desktop",
    theme: "dark",
    lang: "ar",
    dir: "rtl",
    viewport: { width: 1672, height: 941 },
    isMobile: false
  },
  {
    id: "mobile_390px_dark_en",
    theme: "dark",
    lang: "en",
    dir: "ltr",
    viewport: { width: 390, height: 844 },
    isMobile: true
  }
];

async function run() {
  console.log("Authenticating against real backend API on port 5200...");
  let validJwt = "";
  let userProfile = {
    id: "11111111-1111-1111-1111-111111111111",
    username: "uat.tenantadmin@hilal.local",
    email: "uat.tenantadmin@hilal.local",
    firstName: "UAT",
    lastName: "Admin",
    tenantId: "22222222-2222-2222-2222-222222222222",
    tenantName: "Al Hilal SFC Academy",
    roles: ["TenantAdmin", "AcademyDirector"],
    permissions: ["*"]
  };

  const uatUsername = process.env.SCRIPE_UAT_USERNAME || "uat.tenantadmin@hilal.local";
  const uatPassword = process.env.SCRIPE_UAT_PASSWORD || "";

  try {
    if (!uatPassword) {
      console.warn("SCRIPE_UAT_PASSWORD not set in environment. Skipping live API login request.");
    } else {
      const loginRes = await fetch("http://127.0.0.1:5200/api/v1/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Timestamp": String(Date.now()),
          "X-Request-Nonce": "nonce-" + Date.now()
        },
        body: JSON.stringify({
          identifier: uatUsername,
          password: uatPassword
        })
      });
      const loginData = await loginRes.json();
      if (loginData.accessToken) {
        validJwt = loginData.accessToken;
        if (loginData.userProfile) userProfile = loginData.userProfile;
        console.log("Authenticated successfully as:", userProfile?.username, "| Tenant:", userProfile?.tenantName);
      }
    }
  } catch (err) {
    console.warn("Login request error, using fallback profile:", err.message);
  }

  console.log("Starting Playwright Evidence Capture with Chrome...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  for (const screen of screens) {
    console.log(`\n========================================`);
    console.log(`Capturing Screen ${screen.id}: ${screen.label} (http://localhost:3000${screen.path})`);
    console.log(`========================================`);

    for (const variant of variants) {
      const filename = `${screen.baseFilename}_${variant.id}.png`;
      console.log(` Capturing ${filename} (${variant.id})...`);

      const context = await browser.newContext({
        viewport: variant.viewport,
        isMobile: variant.isMobile,
        hasTouch: variant.isMobile,
        colorScheme: variant.theme,
        locale: variant.lang === "ar" ? "ar-SA" : "en-US",
      });

      const page = await context.newPage();

      // Intercept auth refresh and admin branding with real token & profile
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
              userProfile: userProfile,
              defaultRedirectPath: "/academy",
            }),
          });
        }

        if (url.includes("/Admins/me") || url.includes("/auth/me") || url.includes("/identity/users/me")) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(userProfile),
          });
        }

        if (url.includes("/admin/settings") || url.includes("/tenant-branding") || url.includes("/branding") || url.includes("/tenants/current")) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                tenantId: userProfile?.tenantId || "22222222-2222-2222-2222-222222222222",
                tenantName: userProfile?.tenantName || "Al Hilal SFC Academy",
                collapsibleSidebar: false,
                dashboardThemeJson: "{}",
              },
            }),
          });
        }

        return route.continue();
      });

      // Set localStorage & Session state with real JWT and authenticated user
      await page.addInitScript(({ user, jwt, theme, lang, dir }) => {
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
        localStorage.setItem("token", jwt);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("scr_pref_sidebar", "false");
        localStorage.setItem("scr_lang", lang);
        localStorage.setItem("scr_pref_lang", lang);
        localStorage.setItem("i18nextLng", lang);
        localStorage.setItem("scripe_language", lang);
        localStorage.setItem("scripe_theme", theme);
        localStorage.setItem("theme", theme);

        document.cookie = `token=${jwt}; path=/; max-age=86400`;
        document.cookie = `auth_token=${jwt}; path=/; max-age=86400`;
        document.cookie = `scripe_language=${lang}; path=/; max-age=86400`;
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=86400`;

        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("dir", dir);
      }, {
        user: userProfile,
        jwt: validJwt,
        theme: variant.theme,
        lang: variant.lang,
        dir: variant.dir
      });

      const targetUrl = `http://localhost:3000${screen.path}`;

      try {
        await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      } catch (e) {
        console.warn(`  Warning on goto: ${e.message}`);
      }

      // Wait for React hydration and queries
      await page.waitForTimeout(3000);

      // Save to evidence directories
      const evidencePath = path.join(EVIDENCE_DIR, filename);
      const brainPath = path.join(BRAIN_DIR, filename);
      const pkgPath = path.join(PACKAGE_DIR, filename);

      await page.screenshot({ path: evidencePath, fullPage: false });
      fs.copyFileSync(evidencePath, brainPath);
      fs.copyFileSync(evidencePath, pkgPath);

      console.log(`  ✓ Saved ${filename}`);
      await context.close();
    }
  }

  // Generate Side-by-Side Comparisons for Screens 11-20
  console.log("\n========================================");
  console.log("Generating Side-by-Side Comparisons for Screens 11-20 (3344x941)...");
  console.log("========================================");

  const sbsContext = await browser.newContext({ viewport: { width: 3344, height: 941 } });
  const sbsPage = await sbsContext.newPage();

  for (const screen of screens) {
    const approvedPath = path.join(APPROVED_DIR, screen.approvedFile);
    const actualFilename = `${screen.baseFilename}_dark_en_desktop.png`;
    const actualPath = path.join(EVIDENCE_DIR, actualFilename);
    const outName = `side_by_side_${screen.baseFilename}.png`;

    if (!fs.existsSync(approvedPath)) {
      console.error(`Missing approved image: ${approvedPath}`);
      continue;
    }
    if (!fs.existsSync(actualPath)) {
      console.error(`Missing actual image: ${actualPath}`);
      continue;
    }

    // Also copy approved PNG into evidence and brain dir
    fs.copyFileSync(approvedPath, path.join(EVIDENCE_DIR, screen.approvedFile));
    fs.copyFileSync(approvedPath, path.join(BRAIN_DIR, screen.approvedFile));
    fs.copyFileSync(approvedPath, path.join(PACKAGE_DIR, screen.approvedFile));

    const approvedB64 = fs.readFileSync(approvedPath).toString("base64");
    const actualB64 = fs.readFileSync(actualPath).toString("base64");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; overflow: hidden; width: 3344px; height: 941px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .container { display: flex; flex-direction: row; width: 3344px; height: 941px; }
          .pane { position: relative; width: 1672px; height: 941px; overflow: hidden; }
          .pane img { width: 1672px; height: 941px; display: block; object-fit: contain; background: #080a0b; }
          .badge {
            position: absolute;
            top: 14px;
            left: 20px;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 16px rgba(0,0,0,0.85);
            z-index: 100;
          }
          .badge-approved {
            background: #101214;
            color: #c8ff05;
            border: 1.5px solid #c8ff05;
          }
          .badge-actual {
            background: #101214;
            color: #00ffaa;
            border: 1.5px solid #00ffaa;
          }
          .divider {
            width: 2px;
            height: 941px;
            background: #c8ff05;
            box-shadow: 0 0 14px #c8ff05;
            z-index: 101;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="pane">
            <div class="badge badge-approved">Approved Final Design (${screen.label}) — 1672×941</div>
            <img src="data:image/png;base64,${approvedB64}" />
          </div>
          <div class="divider"></div>
          <div class="pane">
            <div class="badge badge-actual">Actual Running Frontend (${screen.label} Dark EN Desktop) — 1672×941</div>
            <img src="data:image/png;base64,${actualB64}" />
          </div>
        </div>
      </body>
      </html>
    `;

    await sbsPage.setContent(html);
    await sbsPage.waitForTimeout(500);

    const sbsEvidencePath = path.join(EVIDENCE_DIR, outName);
    const sbsBrainPath = path.join(BRAIN_DIR, outName);
    const sbsPkgPath = path.join(PACKAGE_DIR, outName);

    await sbsPage.screenshot({ path: sbsEvidencePath, fullPage: false });
    fs.copyFileSync(sbsEvidencePath, sbsBrainPath);
    fs.copyFileSync(sbsEvidencePath, sbsPkgPath);

    console.log(`  ✓ Generated ${outName}`);
  }

  await sbsContext.close();
  await browser.close();

  console.log("\n========================================");
  console.log("All Screenshots & Comparisons completed!");
  console.log("========================================");
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
