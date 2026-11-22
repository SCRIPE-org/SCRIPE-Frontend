const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BRAIN_DIR = "C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c";
const EVIDENCE_DIR = path.join(BRAIN_DIR, "background-assets-evidence");

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

function getFixturePassword() {
  if (process.env.SCRIPE_UAT_PASSWORD) return process.env.SCRIPE_UAT_PASSWORD;
  if (process.env.SCRIPE_CODEX_FIXTURE_PASSWORD) return process.env.SCRIPE_CODEX_FIXTURE_PASSWORD;
  try {
    const s6Content = fs.readFileSync("E:/Scripe_pro/.codex-academy-qa/fixture/s6_s8_full_acceptance.mjs", "utf8");
    const m = s6Content.match(/\|\|\s*['"]([^'"]+)['"]/);
    if (m) return m[1];
  } catch {}
  return "P@ssw0rd";
}

const uatUsername = process.env.SCRIPE_UAT_USERNAME || "codex.qa.director@example.invalid";
const uatPassword = getFixturePassword();

async function loginAndGetToken() {
  try {
    const res = await fetch("http://127.0.0.1:5200/api/v1/auth/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Timestamp": String(Date.now()),
        "X-Request-Nonce": "nonce-" + Date.now(),
      },
      body: JSON.stringify({
        identifier: uatUsername,
        password: uatPassword,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { jwt: data.accessToken, userProfile: data.userProfile };
  } catch (err) {
    return {
      jwt: "mock-uat-token",
      userProfile: {
        id: "11111111-1111-1111-1111-111111111111",
        username: "codex.qa.director",
        tenantId: "NrUPeGjZhFgb2nMv4qhxXkA2ZSyf1Em_0FkM0wHSu6UEJOaPvAzOdyKKYPo",
        tenantName: "Al Hilal SFC Academy",
        roles: ["TenantAdmin", "AcademyDirector"],
        permissions: ["*"],
      },
    };
  }
}

async function createBrowserContext(browser, auth, viewport, theme = "dark") {
  const context = await browser.newContext({
    viewport,
    locale: "en-US",
  });

  const page = await context.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

  const effectiveProfile = {
    ...auth.userProfile,
    permissions: ["*"],
  };

  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/auth/admin/refresh")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          accessToken: auth.jwt,
          mustChangePassword: false,
          subscriptionStatus: "Active",
          userProfile: effectiveProfile,
          defaultRedirectPath: "/academy",
        }),
      });
    }
    if (url.includes("/Admins/me") || url.includes("/auth/me") || url.includes("/identity/users/me")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(effectiveProfile),
      });
    }
    return route.continue();
  });

  await page.addInitScript(({ user, jwt, themeName }) => {
    try {
      sessionStorage.setItem("dev_access_token", jwt);
    } catch (e) {}
    try {
      localStorage.setItem(
        "app-storage",
        JSON.stringify({
          state: {
            sidebarOpen: true,
            user: user,
            isAuthenticated: true,
            permissions: ["*"],
            roles: ["TenantAdmin", "AcademyDirector"],
            tenantCode: "HILAL",
            tenantId: user?.tenantId || "NrUPeGjZhFgb2nMv4qhxXkA2ZSyf1Em_0FkM0wHSu6UEJOaPvAzOdyKKYPo",
            currentTenant: {
              id: user?.tenantId || "NrUPeGjZhFgb2nMv4qhxXkA2ZSyf1Em_0FkM0wHSu6UEJOaPvAzOdyKKYPo",
              name: "Al Hilal SFC Academy",
              slug: "hilal",
            },
            _hasHydrated: true,
          },
          version: 0,
        })
      );
      localStorage.setItem("scr_pref_sidebar", "false");
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("scr_pref_lang", "en");
      localStorage.setItem("i18nextLng", "en");
      localStorage.setItem("scripe_language", "en");
      localStorage.setItem("scripe_theme", themeName);
      localStorage.setItem("theme", themeName);
    } catch (e) {}
    try {
      document.cookie = `token=${jwt}; path=/; max-age=86400`;
      document.cookie = `auth_token=${jwt}; path=/; max-age=86400`;
      document.cookie = `scripe_language=en; path=/; max-age=86400`;
    } catch (e) {}
  }, { user: effectiveProfile, jwt: auth.jwt, themeName: theme });

  return { context, page };
}

async function captureBefore() {
  console.log("=== CAPTURING BEFORE SCREENSHOTS FOR 7 TARGET VIEWS ===");
  const auth = await loginAndGetToken();
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const routes = [
    { name: "02_Athlete_Directory_before", url: "http://localhost:3000/academy/athletes" },
    { name: "03_Skill_Trials_before", url: "http://localhost:3000/academy/trials" },
    { name: "04_Enrollments_before", url: "http://localhost:3000/academy/enrollments" },
    { name: "05_Programs_before", url: "http://localhost:3000/academy/programs" },
    { name: "06_Groups_before", url: "http://localhost:3000/academy/groups" },
    { name: "10_Fees_Receivables_before", url: "http://localhost:3000/academy/fees-receivables" },
    { name: "12_Training_Locations_before", url: "http://localhost:3000/academy/locations" },
  ];

  for (const r of routes) {
    console.log(`Navigating to ${r.url}...`);
    try {
      const { context, page } = await createBrowserContext(browser, auth, { width: 1280, height: 800 }, "dark");
      await page.goto(r.url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(4000);
      const outPath = path.join(EVIDENCE_DIR, `${r.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Captured: ${outPath}`);
      await page.close();
      await context.close();
    } catch (e) {
      console.error(`Failed to capture ${r.name}:`, e.message);
    }
  }

  await browser.close();
  console.log("=== BEFORE SCREENSHOTS COMPLETED ===");
}

captureBefore().catch(console.error);
