import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const API_BASE = (process.env.E2E_API_URL || "http://localhost:5035").replace(/\/+$/, "");
const PLATFORM_ADMIN = "admin-seif@scripe.org";
const CITY_ADMIN = "city.admin@scripe-dev.local";
const AHLY_AUDITOR = "ahly.auditor@scripe-dev.local";
const AHLY_SUSPENDED = "ahly.suspended@scripe-dev.local";
const AHLY_TENANT_ID = "10000000-0000-0000-0000-000000000001";
const CITY_TENANT_ID = "10000000-0000-0000-0000-000000000002";

declare global {
  interface Window {
    __cspViolations?: string[];
    __xssExecuted?: boolean;
  }
}

async function attachCspViolationMonitor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      if (e.disposition === "enforce" && e.blockedURI !== "eval") {
        window.__cspViolations?.push(`${e.violatedDirective}:${e.blockedURI}:${e.sourceFile || ""}`);
      }
    });
  });
}

async function waitForSettled(page: Page, allowLogin = false): Promise<void> {
  await page.waitForFunction(
    (onLogin) => {
      const text = document.body?.innerText || "";
      if (!text.trim() || text.includes("Preparing your workspace")) return false;
      return onLogin
        ? Boolean(document.querySelector("#identifier, main, form"))
        : Boolean(document.querySelector("main, #hub-content, #nexus-content, aside"));
    },
    allowLogin,
    { timeout: 30_000 }
  );
}

async function apiLogin(
  request: APIRequestContext,
  identifier: string,
  password: string,
  isPlatformAdmin = false
) {
  const res = await request.post(`${API_BASE}/api/v1/auth/admin/login`, {
    data: { identifier, password, isPlatformAdmin },
  });
  const body = await res.json().catch(() => ({}));
  const data = (body?.data ?? body) as { accessToken?: string; user?: { tenantId?: string } };
  return { res, status: res.status(), token: data?.accessToken ?? "", body };
}

test.describe.serial("Platform Security Assurance & Adversarial Regression Matrix", () => {
  test.setTimeout(180_000);

  test("[S3-E2E-01] enforces nonced CSP, preview framing boundaries, and hardened backend headers", async ({
    page,
    request,
  }) => {
    await attachCspViolationMonitor(page);
    for (const route of ["/login", "/forgot-password"]) {
      const h = (await page.goto(route, { waitUntil: "domcontentloaded" }))!.headers();
      expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]{16,}'/);
      expect(h["content-security-policy"]).not.toContain("script-src 'self' 'unsafe-inline'");
      expect(h["content-security-policy"]).not.toContain("'strict-dynamic'");
      expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(h["x-frame-options"]).toBe("DENY");
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
      expect(h["permissions-policy"]).toContain("microphone=(), geolocation=()");
      expect(h["permissions-policy"]).not.toContain("interest-cohort");
      expect(h["cache-control"]).toContain("no-store");
    }

    const redirectRes = await request.get("/overview", { maxRedirects: 0 });
    expect([302, 307, 308]).toContain(redirectRes.status());
    expect(redirectRes.headers()["cache-control"]).toContain("no-store");

    await page.context().addCookies([{ name: "scr_auth_state", value: "1", domain: "localhost", path: "/" }]);
    for (const previewRoute of ["/studio-preview", "/dashboard-preview"]) {
      const ph = (await page.goto(previewRoute, { waitUntil: "domcontentloaded" }))!.headers();
      expect(ph["x-frame-options"]).toBe("SAMEORIGIN");
      expect(ph["content-security-policy"]).toContain("frame-ancestors 'self'");
    }

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const frameLoaded = await page.evaluate(
      async () =>
        await new Promise<boolean>((resolve) => {
          const iframe = document.createElement("iframe");
          iframe.src = "/studio-preview";
          iframe.onload = () => resolve(Boolean(iframe.contentDocument?.body));
          iframe.onerror = () => resolve(false);
          document.body.appendChild(iframe);
        })
    );
    expect(frameLoaded).toBe(true);
    expect(await page.evaluate(() => window.__cspViolations ?? [])).toEqual([]);

    const healthRes = await request.get(`${API_BASE}/health/ready`);
    expect(healthRes.status()).toBe(200);
    const hh = healthRes.headers();
    expect(hh["server"]).toBeUndefined();
    expect(hh["x-xss-protection"]).toBe("0");
    expect(hh["cross-origin-opener-policy"]).toBe("same-origin");
    expect(hh["cache-control"]).toContain("no-store");
    expect(hh["set-cookie"] ?? "").not.toContain("XSRF-TOKEN");

    const oidcDiscoveryRes = await request.get(`${API_BASE}/.well-known/openid-configuration`);
    expect(oidcDiscoveryRes.headers()["set-cookie"] ?? "").not.toContain("XSRF-TOKEN");
    expect([401, 403]).toContain((await request.get(`${API_BASE}/metrics`)).status());
  });

  test("[S3-E2E-02] rejects cross-origin and malformed postMessage payloads and XSS sinks in preview bridges", async ({
    page,
  }) => {
    await attachCspViolationMonitor(page);
    await page.context().addCookies([{ name: "scr_auth_state", value: "1", domain: "localhost", path: "/" }]);

    for (const previewPath of ["/studio-preview", "/dashboard-preview"]) {
      await page.goto(previewPath, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      const outcome = await page.evaluate(() => {
        const beforeTheme = document.documentElement.getAttribute("data-theme");
        const forgedPayloads = [
          { type: "SCRIPE_STUDIO_SET_THEME", theme: "evil-theme", __proto__: { polluted: "yes" } },
          {
            type: "SCRIPE_STUDIO_DRAFT_UPDATE",
            payload: {
              loginHeadingText: '<img src=x onerror="window.__xssExecuted=true">',
              customCss: "body { background: url(javascript:alert(1)); }",
            },
          },
          { type: "DASHBOARD_LAYOUT_UPDATE", payload: { title: '<svg onload="window.__xssExecuted=true"></svg>' } },
        ];
        for (const data of forgedPayloads) {
          for (const origin of ["https://evil.attacker.example", window.location.origin]) {
            window.dispatchEvent(new MessageEvent("message", { data, origin, source: null }));
          }
        }
        return {
          afterTheme: document.documentElement.getAttribute("data-theme"),
          beforeTheme,
          xssExecuted: Boolean(window.__xssExecuted),
          protoPolluted: Boolean((Object.prototype as Record<string, unknown>).polluted),
          hasInjectedImg: Boolean(document.querySelector('img[src="x"]')),
        };
      });
      expect(outcome.afterTheme).toBe(outcome.beforeTheme);
      expect(outcome.xssExecuted).toBe(false);
      expect(outcome.protoPolluted).toBe(false);
      expect(outcome.hasInjectedImg).toBe(false);
      expect(await page.evaluate(() => window.__cspViolations ?? [])).toEqual([]);
    }
  });

  test("[S3-E2E-03] enforces storage isolation, static-only service worker, and logout state purge", async ({
    page,
    request,
  }) => {
    await attachCspViolationMonitor(page);
    const swRes = await request.get("/sw.js");
    expect(swRes.status()).toBe(200);
    const swText = await swRes.text();
    expect(swText).toContain("scripe-v3-static-only");
    expect(swText).toContain("/api/");
    expect(swText).toContain("_rsc");

    await page.context().clearCookies();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await waitForSettled(page, true);
    const anonStorage = await page.evaluate(() => {
      const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
      return {
        anonDockKeys: allKeys.filter((k) => k.includes("scripe_data_exchange_jobs_store")),
        tokenKeys: allKeys.filter((k) => /access_token|refresh_token|jwt/i.test(k)),
      };
    });
    expect(anonStorage.anonDockKeys).toEqual([]);
    expect(anonStorage.tokenKeys).toEqual([]);

    let settingsPutCount = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/v1/admin/settings") && req.method() === "PUT") settingsPutCount++;
    });
    await page.evaluate(() => {
      localStorage.setItem(
        "scr_pending_settings",
        JSON.stringify({
          __scripeDeferredFlushV1: true,
          userId: "00000000-0000-0000-0000-999999999999",
          tenantId: "00000000-0000-0000-0000-888888888888",
          payload: { theme: "dark" },
        })
      );
    });

    await page.locator("#identifier").fill(CITY_ADMIN);
    await page.locator("#password").fill(getDevAdminPassword());
    const loginResPromise = page.waitForResponse(
      (r) => r.url().includes("/api/v1/auth/admin/login") && r.request().method() === "POST"
    );
    await page.locator("form button[type='submit']").first().click();
    const loginRes = await loginResPromise;
    expect(loginRes.status()).toBe(200);
    expect(loginRes.headers()["cache-control"]).toContain("no-store");
    expect(loginRes.headers()["pragma"]).toBe("no-cache");

    await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30_000 });
    await waitForSettled(page);
    expect(settingsPutCount).toBe(0);

    await page.evaluate((tenantId) => {
      sessionStorage.setItem(`scripe_data_exchange_jobs_store:${tenantId}:active-user`, "{}");
      sessionStorage.setItem(`scripe:crm:deal-package:${tenantId}:active-user:opp-1`, "{}");
    }, CITY_TENANT_ID);

    const userMenu = page
      .locator("nav button[aria-haspopup='menu'], aside button[aria-haspopup='menu'], header button[aria-haspopup='menu']")
      .last();
    await expect(userMenu).toBeVisible({ timeout: 15_000 });
    await userMenu.click();
    const logoutPromise = page.waitForResponse(
      (r) => r.url().includes("/api/v1/auth/admin/logout") && r.request().method() === "POST"
    );
    await page.getByRole("menuitem", { name: /sign out|logout|تسجيل الخروج/i }).first().click();
    expect((await logoutPromise).ok()).toBeTruthy();
    await page.waitForURL((u) => u.pathname.includes("/login"), { timeout: 25_000 });

    const postLogoutKeys = await page.evaluate(() => {
      const keys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
      return {
        dockKeys: keys.filter((k) => k.includes("scripe_data_exchange_jobs_store")),
        crmKeys: keys.filter((k) => k.startsWith("scripe:crm:")),
        pendingSettings: localStorage.getItem("scr_pending_settings"),
      };
    });
    expect(postLogoutKeys.dockKeys).toEqual([]);
    expect(postLogoutKeys.crmKeys).toEqual([]);
    expect(postLogoutKeys.pendingSettings).toBeNull();
    expect(await page.evaluate(() => window.__cspViolations ?? [])).toEqual([]);
  });

  test("[S3-E2E-04] enforces 4-tier domain x identity isolation, SQLi rejection, pagination bounds, and 429 rate limits", async ({
    request,
  }) => {
    const pwd = getDevAdminPassword();
    expect((await request.get(`${API_BASE}/api/v1/customization/resolve`)).status()).toBe(400);
    for (const d of ["scripe.admin.scripe.org", "ahly.admin.scripe.org", "city.admin.scripe.org", "ahly.localhost"]) {
      expect((await request.get(`${API_BASE}/api/v1/customization/resolve?domain=${d}`)).status()).toBe(200);
    }

    const falconResolve = await request.get(`${API_BASE}/api/v1/customization/resolve?domain=falcon.admin.scripe.org`);
    expect(falconResolve.status()).toBe(200);
    expect(JSON.stringify(await falconResolve.json())).toMatch(/custom|falcon/i);

    for (const unknownDomain of ["unknown-club.admin.scripe.org", "unverified.club.com"]) {
      const r = await request.get(`${API_BASE}/api/v1/customization/resolve?domain=${unknownDomain}`);
      expect(r.status()).toBe(404);
      expect(JSON.stringify(await r.json())).not.toMatch(/StatusReason|StackTrace/i);
    }

    for (const sqli of ["' OR '1'='1", "'; DROP TABLE tenants;--", "ahly' UNION SELECT NULL--"]) {
      const r1 = await request.get(`${API_BASE}/api/v1/customization/resolve?domain=${encodeURIComponent(sqli)}`);
      const r2 = await request.get(`${API_BASE}/api/v1/auth/oidc/providers/admin?tenantId=${encodeURIComponent(sqli)}`);
      expect([400, 404]).toContain(r1.status());
      expect([400, 404]).toContain(r2.status());
    }

    expect([401, 403]).toContain((await request.get(`${API_BASE}/api/v1/tenants`)).status());
    expect([401, 403]).toContain((await apiLogin(request, AHLY_SUSPENDED, pwd)).status);

    const auditorLogin = await apiLogin(request, AHLY_AUDITOR, pwd);
    expect(auditorLogin.status).toBe(200);
    expect((await request.get(`${API_BASE}/api/v1/tenants`, { headers: { Authorization: `Bearer ${auditorLogin.token}` } })).status()).toBe(403);

    const cityLogin = await apiLogin(request, CITY_ADMIN, pwd);
    expect(cityLogin.status).toBe(200);
    expect((await request.get(`${API_BASE}/api/v1/admins`, { headers: { Authorization: `Bearer ${cityLogin.token}`, "X-Tenant-Context": AHLY_TENANT_ID } })).status()).toBe(403);
    expect((await request.get(`${API_BASE}/api/v1/admins?page=-5&pageSize=-10`, { headers: { Authorization: `Bearer ${cityLogin.token}` } })).status()).toBe(200);

    const superLogin = await apiLogin(request, PLATFORM_ADMIN, pwd, true);
    expect(superLogin.status).toBe(200);
    expect((await request.get(`${API_BASE}/api/v1/tenants?page=1&pageSize=5`, { headers: { Authorization: `Bearer ${superLogin.token}` } })).status()).toBe(200);

    let saw429 = false;
    for (let i = 0; i < 16; i++) {
      const burst = await request.post(`${API_BASE}/api/v1/auth/passkeys/authentication/begin`, { data: { email: `rl-${i}@scripe-dev.local` } });
      if (burst.status() === 429) { saw429 = true; break; }
    }
    expect(saw429).toBe(true);
  });
});
