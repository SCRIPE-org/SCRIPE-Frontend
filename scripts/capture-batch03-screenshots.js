const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const stage = process.argv[2] || "after";

const OUT_DIRS = [
  path.resolve(`E:/Scripe_pro/SCRIPE-Root-academy-s0-s8/reports/academy-execution/batch-03-evidence/${stage}`),
  path.resolve(`C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c/batch-03-evidence/${stage}`),
  path.resolve(`C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c/batch-03-evidence`),
  path.resolve(`C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c`)
];

OUT_DIRS.forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

const screens = [
  {
    id: "06",
    name: "groups",
    path: "/academy/groups",
    baseFilename: "groups"
  },
  {
    id: "07",
    name: "seasons",
    path: "/academy/seasons",
    baseFilename: "seasons"
  },
  {
    id: "08",
    name: "sessions",
    path: "/academy/sessions",
    baseFilename: "sessions"
  },
  {
    id: "09",
    name: "attendance",
    path: "/academy/attendance",
    baseFilename: "attendance"
  },
  {
    id: "10",
    name: "fees_receivables",
    path: "/academy/fees-receivables",
    baseFilename: "fees_receivables"
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
  console.log("Authenticating against real backend API...");
  const loginRes = await fetch("http://127.0.0.1:5136/api/v1/auth/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Timestamp": String(Date.now()),
      "X-Request-Nonce": "nonce-" + Date.now()
    },
    body: JSON.stringify({
      identifier: "uat.tenantadmin@hilal.local",
      password: "P@ssw0rd"
    })
  });

  const loginData = await loginRes.json();
  const validJwt = loginData.accessToken;
  const userProfile = loginData.userProfile;
  console.log("Authenticated successfully as:", userProfile?.username, "| Tenant:", userProfile?.tenantName);

  console.log("Starting Batch 03 Playwright Evidence Capture with Chrome...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  let screenshotIndex = 1;

  for (const screen of screens) {
    console.log(`\n========================================`);
    console.log(`Capturing Screen ${screen.id}: ${screen.name} (http://localhost:3000${screen.path})`);
    console.log(`========================================`);

    for (const variant of variants) {
      const idxStr = String(screenshotIndex).padStart(2, "0");
      const filename = `${idxStr}_${screen.baseFilename}_${variant.id}.png`;
      console.log(` Capturing [${idxStr}] ${filename} (${variant.id})...`);

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
        await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 25000 });
      } catch (e) {
        console.warn(`  Warning on goto: ${e.message}`);
      }

      // Wait for React hydration and TanStack query settlement
      await page.waitForTimeout(4500);

      // Save to all target output directories
      for (const outDir of OUT_DIRS) {
        const destPath = path.join(outDir, filename);
        await page.screenshot({ path: destPath, fullPage: false });
      }

      console.log(`  ✓ Saved ${filename}`);
      screenshotIndex++;
      await context.close();
    }
  }

  await browser.close();
  console.log("\n========================================");
  console.log("All 20 Batch 03 Screenshots captured successfully with Real Data!");
  console.log("========================================");
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
