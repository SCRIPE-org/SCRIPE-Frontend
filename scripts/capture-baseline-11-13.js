const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

(async () => {
  const uatUsername = process.env.SCRIPE_UAT_USERNAME || "uat.tenantadmin@hilal.local";
  const uatPassword = process.env.SCRIPE_UAT_PASSWORD || "";
  let validJwt = "";
  let userProfile = null;

  if (uatPassword) {
    const loginRes = await fetch("http://127.0.0.1:5136/api/v1/auth/admin/login", {
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
    validJwt = loginData.accessToken;
    userProfile = loginData.userProfile;
    console.log("Logged in:", userProfile?.username);
  } else {
    console.warn("SCRIPE_UAT_PASSWORD not provided in environment; live login skipped.");
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1672, height: 941 },
    colorScheme: "dark",
    locale: "en-US"
  });

  await context.addCookies([
    { name: "token", value: validJwt, domain: "localhost", path: "/" },
    { name: "auth_token", value: validJwt, domain: "localhost", path: "/" },
    { name: "accessToken", value: validJwt, domain: "localhost", path: "/" },
    { name: "scripe_access_token", value: validJwt, domain: "localhost", path: "/" }
  ]);

  const page = await context.newPage();

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
          defaultRedirectPath: "/academy"
        })
      });
    }
    if (url.includes("/Admins/me") || url.includes("/auth/me") || url.includes("/identity/users/me")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(userProfile)
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
            dashboardThemeJson: "{}"
          }
        })
      });
    }
    return route.continue();
  });

  await page.addInitScript(
    ({ user, jwt }) => {
      sessionStorage.setItem("dev_access_token", jwt);
      localStorage.setItem(
        "app-storage",
        JSON.stringify({
          state: {
            sidebarOpen: true,
            user: user,
            isAuthenticated: true,
            permissions: ["*"],
            roles: ["TenantAdmin", "AcademyDirector"],
            tenantCode: "hilal",
            _hasHydrated: true
          },
          version: 0
        })
      );
      localStorage.setItem("token", jwt);
      localStorage.setItem("auth_token", jwt);
      localStorage.setItem("accessToken", jwt);
      localStorage.setItem("scripe_access_token", jwt);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("scripe_user", JSON.stringify(user));
      localStorage.setItem("scr_pref_sidebar", "false");
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("scr_pref_lang", "en");
      localStorage.setItem("i18nextLng", "en");
      localStorage.setItem("scripe_language", "en");
      localStorage.setItem("scripe_theme", "dark");
      localStorage.setItem("theme", "dark");

      document.cookie = `token=${jwt}; path=/; max-age=86400`;
      document.cookie = `auth_token=${jwt}; path=/; max-age=86400`;
      document.cookie = `scripe_language=en; path=/; max-age=86400`;
      document.cookie = `NEXT_LOCALE=en; path=/; max-age=86400`;

      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.setAttribute("dir", "ltr");
    },
    { user: userProfile, jwt: validJwt }
  );

  const screens = [
    { name: "11_reports", url: "/academy/reports" },
    { name: "12_locations", url: "/academy/locations" },
    { name: "13_sports", url: "/academy/setup/sports" }
  ];

  for (const s of screens) {
    console.log("Navigating to", s.url);
    await page.goto("http://localhost:3000" + s.url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4500);
    const fname = s.name + "_baseline.png";
    const outPath = "C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c/" + fname;
    await page.screenshot({ path: outPath });
    console.log("Saved", outPath);
  }

  await browser.close();
  console.log("Done capturing initial views");
})();
