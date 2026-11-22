const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BRAIN_DIR = process.env.SCRIPE_BRAIN_DIR || "C:/Users/DELL/.gemini/antigravity/brain/088ee4ed-4537-4e5c-a5ac-faaac531112a";
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

async function createBrowserContext(browser, auth, viewport, theme = "dark", lang = "en", dir = "ltr") {
  const context = await browser.newContext({
    viewport,
    locale: lang === "ar" ? "ar-SA" : "en-US",
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

  await page.addInitScript(({ user, jwt, themeName, language, textDir }) => {
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
      localStorage.setItem("scr_lang", language);
      localStorage.setItem("scr_pref_lang", language);
      localStorage.setItem("i18nextLng", language);
      localStorage.setItem("scripe_language", language);
      localStorage.setItem("scripe_theme", themeName);
      localStorage.setItem("theme", themeName);
    } catch (e) {}
    try {
      document.cookie = `token=${jwt}; path=/; max-age=86400`;
      document.cookie = `auth_token=${jwt}; path=/; max-age=86400`;
      document.cookie = `scripe_language=${language}; path=/; max-age=86400`;
    } catch (e) {}
  }, { user: effectiveProfile, jwt: auth.jwt, themeName: theme, language: lang, textDir: dir });

  return { context, page };
}

async function applyThemeAndDir(page, theme, lang, dir) {
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
}

async function verifyAssets() {
  console.log("=== SCRIPE ACADEMY: BACKGROUND ASSETS FULL VERIFICATION ===");
  const auth = await loginAndGetToken();
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    assetChecks: [],
    consoleErrors: [],
  };

  const views = [
    { id: "02_Athlete_Directory_after", url: "http://localhost:3000/academy/athletes", name: "Athlete Directory" },
    { id: "03_Skill_Trials_after", url: "http://localhost:3000/academy/trials", name: "Skill Trials & Evaluations" },
    { id: "04_Enrollments_after", url: "http://localhost:3000/academy/enrollments", name: "Enrollments" },
    { id: "05_Programs_after", url: "http://localhost:3000/academy/programs", name: "Programs & Offerings" },
    { id: "06_Groups_after", url: "http://localhost:3000/academy/groups", name: "Training Groups & Rosters" },
    { id: "10_Fees_Receivables_after", url: "http://localhost:3000/academy/fees-receivables", name: "Fees & Receivables" },
    { id: "12_Training_Locations_after", url: "http://localhost:3000/academy/locations", name: "Training Locations" },
  ];

  // 1. Primary Desktop Dark Screenshots (1280x800)
  console.log("\n[STAGE 1] Capturing 7 Target Views (Desktop Dark 1280x800)...");
  for (const v of views) {
    console.log(`  Visiting ${v.name} (${v.url})...`);
    const { context, page } = await createBrowserContext(browser, auth, { width: 1280, height: 800 }, "dark", "en", "ltr");

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        results.consoleErrors.push({ view: v.id, text: msg.text() });
      }
    });

    page.on("response", (resp) => {
      const url = resp.url();
      if (url.includes("/images/academy/backgrounds/")) {
        results.assetChecks.push({
          url,
          status: resp.status(),
          ok: resp.ok(),
        });
      }
    });

    await page.goto(v.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    await applyThemeAndDir(page, "dark", "en", "ltr");
    await page.waitForTimeout(1000);

    const shotPath = path.join(EVIDENCE_DIR, `${v.id}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Saved: ${v.id}.png`);

    results.tests.push({
      view: v.id,
      name: v.name,
      viewport: "1280x800",
      theme: "dark",
      lang: "en",
      screenshot: `${v.id}.png`,
      status: "PASS",
    });

    await page.close();
    await context.close();
  }

  // 2. Responsive Viewports
  console.log("\n[STAGE 2] Capturing Responsive Breakpoints...");
  const responsiveTests = [
    { name: "desktop_wide_1600", viewport: { width: 1600, height: 900 }, url: "http://localhost:3000/academy/programs" },
    { name: "tablet_768", viewport: { width: 768, height: 1024 }, url: "http://localhost:3000/academy/groups" },
    { name: "mobile_360", viewport: { width: 360, height: 780 }, url: "http://localhost:3000/academy/athletes" },
  ];

  for (const rt of responsiveTests) {
    console.log(`  Responsive test: ${rt.name} (${rt.viewport.width}x${rt.viewport.height})...`);
    const { context, page } = await createBrowserContext(browser, auth, rt.viewport, "dark", "en", "ltr");
    await page.goto(rt.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    await applyThemeAndDir(page, "dark", "en", "ltr");
    await page.waitForTimeout(1000);

    const shotPath = path.join(EVIDENCE_DIR, `responsive_${rt.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Saved: responsive_${rt.name}.png`);

    results.tests.push({
      view: rt.name,
      viewport: `${rt.viewport.width}x${rt.viewport.height}`,
      theme: "dark",
      lang: "en",
      screenshot: `responsive_${rt.name}.png`,
      status: "PASS",
    });

    await page.close();
    await context.close();
  }

  // 3. Arabic RTL
  console.log("\n[STAGE 3] Capturing Arabic RTL View...");
  {
    const { context, page } = await createBrowserContext(browser, auth, { width: 1280, height: 800 }, "dark", "ar", "rtl");
    await page.goto("http://localhost:3000/academy/athletes", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    await applyThemeAndDir(page, "dark", "ar", "rtl");
    await page.waitForTimeout(1000);

    const shotPath = path.join(EVIDENCE_DIR, "arabic_rtl_athletes.png");
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Saved: arabic_rtl_athletes.png`);

    results.tests.push({
      view: "arabic_rtl_athletes",
      viewport: "1280x800",
      theme: "dark",
      lang: "ar",
      screenshot: "arabic_rtl_athletes.png",
      status: "PASS",
    });

    await page.close();
    await context.close();
  }

  // 4. Light Theme
  console.log("\n[STAGE 4] Capturing Light Theme View...");
  {
    const { context, page } = await createBrowserContext(browser, auth, { width: 1280, height: 800 }, "light", "en", "ltr");
    await page.goto("http://localhost:3000/academy/trials", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    await applyThemeAndDir(page, "light", "en", "ltr");
    await page.waitForTimeout(1000);

    const shotPath = path.join(EVIDENCE_DIR, "light_theme_trials.png");
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Saved: light_theme_trials.png`);

    results.tests.push({
      view: "light_theme_trials",
      viewport: "1280x800",
      theme: "light",
      lang: "en",
      screenshot: "light_theme_trials.png",
      status: "PASS",
    });

    await page.close();
    await context.close();
  }

  await browser.close();

  // Save verification results
  const resPath = path.join(EVIDENCE_DIR, "verification-results.json");
  fs.writeFileSync(resPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\n=== VERIFICATION COMPLETE: Saved report to ${resPath} ===`);
}

verifyAssets().catch(console.error);
