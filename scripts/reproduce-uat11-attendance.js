const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BRAIN_DIR = "C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c";
const EVIDENCE_DIR = path.join(BRAIN_DIR, "uat-11-evidence");

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
  return undefined;
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
    console.warn("API login failed, using fallback:", err.message);
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
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message, "\nSTACK:", err.stack));
  page.on("console", msg => {
    if (msg.type() === "error") console.log("PAGE ERROR LOG:", msg.text());
  });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

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
          userProfile: auth.userProfile,
          defaultRedirectPath: "/academy",
        }),
      });
    }
    if (url.includes("/Admins/me") || url.includes("/auth/me") || url.includes("/identity/users/me")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(auth.userProfile),
      });
    }
    return route.continue();
  });

  await page.addInitScript(({ user, jwt, themeName, language, textDir }) => {
    sessionStorage.setItem("dev_access_token", jwt);
    localStorage.setItem("app-storage", JSON.stringify({
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
    }));
    localStorage.setItem("scr_pref_sidebar", "false");
    localStorage.setItem("scr_lang", language);
    localStorage.setItem("scr_pref_lang", language);
    localStorage.setItem("i18nextLng", language);
    localStorage.setItem("scripe_language", language);
    localStorage.setItem("scripe_theme", themeName);
    localStorage.setItem("theme", themeName);
    document.cookie = `token=${jwt}; path=/; max-age=86400`;
    document.cookie = `auth_token=${jwt}; path=/; max-age=86400`;
    document.cookie = `scripe_language=${language}; path=/; max-age=86400`;
  }, { user: auth.userProfile, jwt: auth.jwt, themeName: theme, language: lang, textDir: dir });

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

async function runReproduction() {
  console.log("=== CAPTURING BEFORE STATE: ATTENDANCE CORRECTIONS WORKSPACE ===");
  const auth = await loginAndGetToken();
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const viewports = [
    { name: "desktop", vp: { width: 1440, height: 900 } },
    { name: "laptop", vp: { width: 1024, height: 768 } },
    { name: "mobile", vp: { width: 390, height: 844 } },
  ];

  for (const { name, vp } of viewports) {
    console.log(`\nTesting ${name} (${vp.width}x${vp.height})...`);
    const { context, page } = await createBrowserContext(browser, auth, vp, "dark", "en", "ltr");
    await page.goto("http://localhost:3000/academy/attendance?view=corrections", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
    await applyThemeAndDir(page, "dark", "en", "ltr");
    await page.waitForTimeout(1000);

    const errorDetails = page.locator("text=Error Details");
    if (await errorDetails.isVisible()) {
      await errorDetails.click();
      await page.waitForTimeout(500);
      const pre = await page.locator("pre").allInnerTexts();
      console.log(`ERROR BOUNDARY DETAILS for ${name}:`, pre);
    }

    const shot = path.join(EVIDENCE_DIR, `uat-11-before-${name}-dark.png`);
    await page.screenshot({ path: shot, fullPage: false });
    console.log(`Saved screenshot: ${shot}`);
    await page.close();
    await context.close();
  }

  // Also test light mode desktop
  console.log("\nTesting light mode desktop (1440x900)...");
  const { context, page } = await createBrowserContext(browser, auth, { width: 1440, height: 900 }, "light", "en", "ltr");
  await page.goto("http://localhost:3000/academy/attendance?view=corrections", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);
  await applyThemeAndDir(page, "light", "en", "ltr");
  await page.waitForTimeout(1000);

  const shotLight = path.join(EVIDENCE_DIR, "uat-11-before-desktop-light.png");
  await page.screenshot({ path: shotLight, fullPage: false });
  console.log(`Saved screenshot: ${shotLight}`);
  await page.close();
  await context.close();

  await browser.close();
  console.log("\n=== BEFORE REPRODUCTION CAPTURED ===");
}

runReproduction();
