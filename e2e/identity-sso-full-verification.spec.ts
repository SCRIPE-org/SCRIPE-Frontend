import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { getDevAdminPassword } from "./helpers/auth-credentials";

/**
 * SCRIPE Enterprise Identity, Multi-Tenant SSO & Zero-Trust Verification Suite
 *
 * Strictly unmocked E2E + live API verification against:
 * - Backend API: http://localhost:5035
 * - Frontend Web: http://localhost:3000
 *
 * Covers BAM-01..BAM-10, SEC-02..SEC-12, Dark/Light themes, Arabic RTL, and 10 executive screenshots.
 */

const API_URL = process.env.E2E_API_URL || "http://localhost:5035";
const PRIMARY_SCREENSHOT_DIR =
  process.env.E2E_SCREENSHOT_DIR ||
  "C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\4dcb09e0-ccd8-45ae-bbb2-22d9ac47fa31\\screenshots";
const MIRROR_SCREENSHOT_DIRS = [
  "C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\3bbd5292-7bc2-4f8e-9528-5ebfb39de33e\\screenshots",
  path.resolve(process.cwd(), "e2e-evidence", "identity-v3", "screenshots"),
];

for (const dir of [PRIMARY_SCREENSHOT_DIR, ...MIRROR_SCREENSHOT_DIRS]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const AHLY_ADMIN_EMAIL = "ahly.admin@scripe-dev.local";
const PLATFORM_ADMIN_ID = "superadmin";

async function safeScreenshot(page: Page, filename: string, fullPage = true) {
  const targetPath = path.join(PRIMARY_SCREENSHOT_DIR, filename);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      if (fs.existsSync(targetPath)) {
        try {
          fs.unlinkSync(targetPath);
        } catch {
          // ignore transient lock
        }
      }
      await page.screenshot({ path: targetPath, fullPage });
      for (const mirrorDir of MIRROR_SCREENSHOT_DIRS) {
        if (path.resolve(mirrorDir) === path.resolve(PRIMARY_SCREENSHOT_DIR)) continue;
        try {
          fs.copyFileSync(targetPath, path.join(mirrorDir, filename));
        } catch {
          // best-effort mirror copy
        }
      }
      return;
    } catch (err) {
      if (attempt === 3) throw err;
      await page.waitForTimeout(300);
    }
  }
}

async function waitForAppSettled(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/i")
    .waitFor({ state: "detached", timeout: 30_000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(350);
}

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((mode) => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("theme", mode);
  }, theme);
  await page.waitForTimeout(300);
}

async function setLanguageAndReload(page: Page, lang: "en" | "ar") {
  await page.evaluate((targetLang) => {
    localStorage.setItem("scr_lang", targetLang);
    localStorage.setItem("scr_pref_lang", targetLang);
    document.cookie = `scr_lang=${targetLang}; path=/; SameSite=Lax`;
  }, lang);
  await page.reload();
  await waitForAppSettled(page);
  await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr", {
    timeout: 15_000,
  });
}

async function clearBrowserSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore on about:blank
    }
  });
}

async function loginViaUi(
  page: Page,
  identifier: string,
  password: string,
  loginUrl = "/login"
): Promise<string> {
  await page.goto(loginUrl);
  await waitForAppSettled(page);
  await expect(page.locator("#identifier")).toBeVisible({ timeout: 20_000 });

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.locator("#identifier").fill(identifier);
    await page.locator("#password").fill(password);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });

    const loginResPromise = page.waitForResponse(
      (res) => res.url().includes("/api/v1/auth/admin/login") && res.request().method() === "POST"
    );
    await submitBtn.click();
    const loginRes = await loginResPromise;

    if (loginRes.status() === 429 && attempt < 3) {
      const retrySec = Number(loginRes.headers()["retry-after"] || "62");
      await page.waitForTimeout(Math.min(Math.max(retrySec + 2, 15), 310) * 1000);
      continue;
    }

    expect(loginRes.ok(), `UI login failed for ${identifier}: ${loginRes.status()}`).toBeTruthy();
    const loginPayload = (await loginRes.json()) as {
      accessToken?: string;
      data?: { accessToken?: string };
    };
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    await waitForAppSettled(page);
    return loginPayload.accessToken ?? loginPayload.data?.accessToken ?? "";
  }
  throw new Error(`UI login rate-limited after retries for ${identifier}`);
}

async function gotoLoginWithSsoDiscovery(page: Page, url: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const ssoResPromise = page
      .waitForResponse((res) => res.url().includes("/api/v1/auth/oidc/providers/"), {
        timeout: 8_000,
      })
      .catch(() => null);
    await page.goto(url);
    const ssoRes = await ssoResPromise;
    await waitForAppSettled(page);
    if (ssoRes && ssoRes.status() === 429 && attempt < 2) {
      const retrySec = Number(ssoRes.headers()["retry-after"] || "62");
      await page.waitForTimeout(Math.min(Math.max(retrySec + 2, 15), 310) * 1000);
      continue;
    }
    return;
  }
}

function mutationHeaders(accessToken: string, extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Request-Timestamp": Date.now().toString(),
    "X-Request-Nonce": randomUUID(),
    ...extra,
  };
}

const apiLoginCache = new Map<string, { accessToken: string }>();

async function loginViaApi(
  request: APIRequestContext,
  identifier: string,
  password: string,
  isPlatformAdmin = false
): Promise<{ accessToken: string }> {
  const key = `${identifier}::${isPlatformAdmin ? "1" : "0"}`;
  const cached = apiLoginCache.get(key);
  if (cached?.accessToken) return cached;

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await request.post(`${API_URL}/api/v1/auth/admin/login`, {
      data: { identifier, password, isPlatformAdmin },
    });
    if (res.status() === 429 && attempt < 3) {
      const retrySec = Number(res.headers()["retry-after"] || "62");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retrySec + 2, 15), 310) * 1000));
      continue;
    }
    expect(res.ok(), `API login failed for ${identifier}: ${res.status()} ${await res.text()}`).toBeTruthy();
    const raw = (await res.json()) as {
      accessToken?: string;
      data?: { accessToken?: string };
    };
    const payload = { accessToken: raw.accessToken ?? raw.data?.accessToken ?? "" };
    expect(payload.accessToken, `Missing accessToken for ${identifier}`).toBeTruthy();
    apiLoginCache.set(key, payload);
    return payload;
  }
  throw new Error(`API login exhausted retries for ${identifier}`);
}

test.describe("SCRIPE Identity & Multi-Tenant SSO Live Verification (Unmocked)", () => {
  test.describe.configure({ mode: "serial", timeout: 420_000 });

  let password = "";
  const ahlyStoragePath = path.resolve(process.cwd(), "test-results", ".ahly-auth-state.json");

  test.beforeAll(() => {
    password = getDevAdminPassword();
  });

  test("Test 1 — Tenant Login SSO Discovery & Fail-Closed (BAM-04, BAM-05)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1A. Inherit mode via ?_tenant=AHLY
    await gotoLoginWithSsoDiscovery(page, "http://localhost:3000/login?_tenant=AHLY");
    await setTheme(page, "dark");

    await expect(page.locator("body")).toContainText(/Al[-\s]Ahly Sporting Club/i, {
      timeout: 20_000,
    });

    await expect(page.getByRole("button", { name: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Microsoft/i })).toBeVisible({ timeout: 10_000 });

    // Verify zero horizontal overflow on login SSO buttons (#84/#85 regression guard)
    const overflowMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(overflowMetrics.scrollWidth).toBeLessThanOrEqual(overflowMetrics.innerWidth + 2);
    const ahlyBtnBox = await page
      .getByRole("button", { name: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i })
      .boundingBox();
    expect(ahlyBtnBox).toBeTruthy();
    expect(ahlyBtnBox!.x + ahlyBtnBox!.width).toBeLessThanOrEqual(1440);

    await safeScreenshot(page, "03-tenant-login-inherit-mode.png", true);

    // 1B. Subdomain resolution via http://ahly.localhost:3000/login (without ?_tenant=AHLY)
    await gotoLoginWithSsoDiscovery(page, "http://ahly.localhost:3000/login");
    await expect(page.locator("body")).toContainText(/Al[-\s]Ahly Sporting Club/i, { timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i })).toBeVisible({
      timeout: 15_000,
    });

    // 1C. Fail-closed on unknown tenant ?_tenant=UNKNOWN_999
    await page.goto("http://localhost:3000/login?_tenant=UNKNOWN_999");
    await waitForAppSettled(page);

    await expect(page.getByRole("heading", { name: /Not Found/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Google/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Microsoft/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i })).toHaveCount(0);
  });

  test("Test 2 — Tenant /account/security (AE) Live DB SSO + Sudo Connect Dialog (BAM-02, SEC-02)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await clearBrowserSession(page);
    const ahlyTok = await loginViaUi(page, AHLY_ADMIN_EMAIL, password);
    if (ahlyTok) {
      apiLoginCache.set(`${AHLY_ADMIN_EMAIL}::0`, { accessToken: ahlyTok });
    }

    await page.goto("/account/security");
    await waitForAppSettled(page);
    await setTheme(page, "dark");

    const ssoCard = page.getByTestId("connected-enterprise-sso-card");
    await expect(ssoCard).toBeVisible({ timeout: 20_000 });

    // Real DB providers must be rendered
    await expect(page.getByTestId("enterprise-sso-tile-ahly-okta")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("enterprise-sso-tile-google")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("enterprise-sso-tile-microsoft")).toBeVisible({ timeout: 15_000 });

    const cardText = await ssoCard.innerText();
    expect(cardText).toContain("Al Ahly SC Enterprise SSO");
    expect(cardText).toContain("Google Workspace SSO");
    expect(cardText).toContain("Microsoft Entra ID");

    // Zero hardcoded fake catalog entries
    expect(cardText).not.toContain("Okta Workforce Identity SAML 2.0");
    expect(cardText).not.toContain("GitHub Enterprise");

    await ssoCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await safeScreenshot(page, "01-tenant-account-security-dark.png", true);

    // Toggle Light Theme
    await setTheme(page, "light");
    await safeScreenshot(page, "01b-tenant-account-security-light.png", true);

    // Switch to Arabic (RTL) in Dark Mode
    await setTheme(page, "dark");
    await setLanguageAndReload(page, "ar");
    await setTheme(page, "dark");
    await expect(page.getByTestId("connected-enterprise-sso-card")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("connected-enterprise-sso-card")).toContainText(/[\u0600-\u06FF]/);
    await safeScreenshot(page, "08-account-security-ar-rtl.png", true);

    // Restore EN + Dark Mode
    await setLanguageAndReload(page, "en");
    await setTheme(page, "dark");
    await expect(page.getByTestId("enterprise-sso-tile-ahly-okta")).toBeVisible({ timeout: 20_000 });

    // Open Sudo-gated Federated Handshake Dialog on Al Ahly SC Enterprise SSO
    await page.getByTestId("connect-sso-ahly-okta").click();
    const dialog = page.getByTestId("enterprise-sso-connect-dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // Verify zero corporate email input and zero dead /api/v1/auth/callback/oidc copy
    await expect(dialog.locator("input")).toHaveCount(0);
    const dialogText = await dialog.innerText();
    expect(dialogText).not.toContain("/api/v1/auth/callback/oidc");
    expect(dialogText).toContain("Al Ahly SC Enterprise SSO");
    await expect(page.getByTestId("initiate-sso-handshake-btn")).toBeVisible();

    await safeScreenshot(page, "09-sso-connect-federated-dialog.png", false);
    await page.keyboard.press("Escape");

    // Persist Ahly browser session for Test 3 to avoid unnecessary repeated logins
    await page.context().storageState({ path: ahlyStoragePath });
  });

  test("Test 3 — IdP CRUD /settings/identity-providers Persistence & Validation (BAM-01, BAM-03, BAM-10)", async ({
    browser,
  }) => {
    const ahlyContext = fs.existsSync(ahlyStoragePath)
      ? await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: ahlyStoragePath })
      : await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ahlyContext.newPage();
    try {
      if (!fs.existsSync(ahlyStoragePath)) {
        await loginViaUi(page, AHLY_ADMIN_EMAIL, password);
      }

      await page.goto("/settings/identity-providers");
      await waitForAppSettled(page);
      if (page.url().includes("/login")) {
        await loginViaUi(page, AHLY_ADMIN_EMAIL, password);
        await page.goto("/settings/identity-providers");
        await waitForAppSettled(page);
      }
      await setTheme(page, "dark");

      const ahlyCard = page.getByTestId("identity-provider-card-ahly-okta");
      await expect(ahlyCard).toBeVisible({ timeout: 20_000 });
      await expect(ahlyCard).toContainText("Al Ahly SC Enterprise SSO");

      await safeScreenshot(page, "05-tenant-idp-settings-verified.png", true);

      const activeSwitch = page.getByTestId("toggle-active-switch-ahly-okta");
      await expect(activeSwitch).toBeVisible();
      await expect(activeSwitch).toHaveAttribute("aria-checked", "true");

      try {
        // Toggle OFF -> wait for PUT -> reload -> verify persistence
        const putOffPromise = page.waitForResponse(
          (res) => res.url().includes("/api/v1/identity-providers/") && res.request().method() === "PUT"
        );
        await activeSwitch.click();
        const putOffRes = await putOffPromise;
        expect(putOffRes.ok(), `Toggle OFF PUT failed: ${putOffRes.status()}`).toBeTruthy();

        await page.reload();
        await waitForAppSettled(page);
        await expect(page.getByTestId("toggle-active-switch-ahly-okta")).toHaveAttribute("aria-checked", "false", {
          timeout: 15_000,
        });

        // Verify /login?_tenant=AHLY hides Al Ahly SC Enterprise SSO while inactive
        const anonContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const anonPage = await anonContext.newPage();
        try {
          await gotoLoginWithSsoDiscovery(anonPage, "http://localhost:3000/login?_tenant=AHLY");
          await expect(anonPage.getByRole("button", { name: /Google/i })).toBeVisible({ timeout: 15_000 });
          await expect(
            anonPage.getByRole("button", { name: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i })
          ).toHaveCount(0);
        } finally {
          await anonContext.close();
        }
      } finally {
        // Always restore Active ON & verify persistence after reload
        await page.goto("/settings/identity-providers");
        await waitForAppSettled(page);
        const restoreSwitch = page.getByTestId("toggle-active-switch-ahly-okta");
        await expect(restoreSwitch).toBeVisible({ timeout: 15_000 });
        const state = await restoreSwitch.getAttribute("aria-checked");
        if (state !== "true") {
          const putOnPromise = page.waitForResponse(
            (res) => res.url().includes("/api/v1/identity-providers/") && res.request().method() === "PUT"
          );
          await restoreSwitch.click();
          const putOnRes = await putOnPromise;
          expect(putOnRes.ok(), `Toggle ON PUT failed: ${putOnRes.status()}`).toBeTruthy();
        }
        await page.reload();
        await waitForAppSettled(page);
        await expect(page.getByTestId("toggle-active-switch-ahly-okta")).toHaveAttribute("aria-checked", "true", {
          timeout: 15_000,
        });
      }
    } finally {
      await ahlyContext.close();
    }
  });

  test("Test 4 — Platform Sovereign @superadmin /account/security + /tenants/[id] Dual-Surface Governance (BAM-02, BAM-03)", async ({
    page,
    request,
    browser,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await clearBrowserSession(page);
    const platTok = await loginViaUi(page, PLATFORM_ADMIN_ID, password);
    if (platTok) {
      apiLoginCache.set(`${PLATFORM_ADMIN_ID}::1`, { accessToken: platTok });
    }

    // 4A. Platform SuperAdmin /account/security shows Connected Enterprise SSO even with 0 linked accounts
    await page.goto("/account/security");
    await waitForAppSettled(page);
    await setTheme(page, "dark");

    const ssoCard = page.getByTestId("connected-enterprise-sso-card");
    await expect(ssoCard).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("enterprise-sso-tile-google")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("enterprise-sso-tile-microsoft")).toBeVisible({ timeout: 15_000 });

    await ssoCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await safeScreenshot(page, "02-platform-admin-account-security.png", true);

    // 4B. Resolve Al-Ahly encrypted tenant ID from live API
    const platformApi = await loginViaApi(request, PLATFORM_ADMIN_ID, password, true);
    const tenantsRes = await request.get(`${API_URL}/api/v1/tenants?pageSize=50`, {
      headers: { Authorization: `Bearer ${platformApi.accessToken}` },
    });
    expect(tenantsRes.ok(), `Failed listing tenants: ${tenantsRes.status()}`).toBeTruthy();
    const tenantsJson = await tenantsRes.json();
    const tenantsList: Array<{ id: string; code?: string; name?: string }> = Array.isArray(tenantsJson)
      ? tenantsJson
      : tenantsJson?.items ?? tenantsJson?.data ?? [];
    const ahlyTenant = tenantsList.find(
      (t) => t.code?.toUpperCase() === "AHLY" || /ahly/i.test(t.name ?? "")
    );
    expect(ahlyTenant?.id, "Al-Ahly tenant not found in /api/v1/tenants").toBeTruthy();
    const ahlyEncryptedId = ahlyTenant!.id;

    // Visit /tenants/[id] and open Identity Providers tab
    await page.goto(`/tenants/${ahlyEncryptedId}`);
    await waitForAppSettled(page);
    await setTheme(page, "dark");

    const idpTab = page.getByRole("tab", { name: /Identity Providers/i });
    await expect(idpTab).toBeVisible({ timeout: 20_000 });
    await idpTab.click();
    await waitForAppSettled(page);

    await expect(page.locator("body")).toContainText("Al Ahly SC Enterprise SSO", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Test Connection/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Add (Identity )?Provider/i })).toBeVisible();

    await safeScreenshot(page, "06-platform-admin-tenant-detail-idp-tab.png", true);

    // 4C. Open Settings -> Edit Settings -> Identity Provider Mode selector
    const settingsTab = page.getByRole("tab", { name: /Settings/i });
    await expect(settingsTab).toBeVisible();
    await settingsTab.click();
    await waitForAppSettled(page);

    // Click the Edit icon button on the Security settings card in the "Settings" tab
    const editSecurityBtn = page
      .getByRole("tabpanel", { name: /Settings/i })
      .locator("xpath=//div[contains(., 'Security')]/following-sibling::button[@aria-label='Edit']");
    await expect(editSecurityBtn).toBeVisible({ timeout: 15_000 });
    await editSecurityBtn.click();

    const idpModeTrigger = page.locator("#dialog-idp-mode");
    await expect(idpModeTrigger).toBeVisible({ timeout: 10_000 });

    await safeScreenshot(page, "07-tenant-settings-idp-mode-dialog.png", false);

    try {
      // Switch Identity Provider Mode to "custom" and Save
      await idpModeTrigger.click();
      const customOption = page.getByRole("option", { name: /Custom/i });
      await expect(customOption).toBeVisible({ timeout: 5_000 });
      await customOption.click();

      const savePutPromise = page.waitForResponse(
        (res) => res.url().includes("/settings") && res.request().method() === "PUT"
      );
      await page.getByRole("dialog").getByRole("button", { name: /Save/i }).click();
      const savePutRes = await savePutPromise;
      expect(savePutRes.ok(), `Saving custom IdP mode failed: ${savePutRes.status()}`).toBeTruthy();

      // Verify /login?_tenant=AHLY in custom mode shows ONLY Al Ahly SC Enterprise SSO (Google & Microsoft hidden)
      const anonContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const anonPage = await anonContext.newPage();
      try {
        await gotoLoginWithSsoDiscovery(anonPage, "http://localhost:3000/login?_tenant=AHLY");
        await setTheme(anonPage, "dark");

        await expect(
          anonPage.getByRole("button", { name: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i })
        ).toBeVisible({ timeout: 15_000 });
        await expect(anonPage.getByRole("button", { name: /Google/i })).toHaveCount(0);
        await expect(anonPage.getByRole("button", { name: /Microsoft/i })).toHaveCount(0);

        await safeScreenshot(anonPage, "04-tenant-login-custom-mode.png", true);
      } finally {
        await anonContext.close();
      }
    } finally {
      // Restore Al-Ahly identityProviderMode cleanly back to "inherit"
      const restoreRes = await request.put(`${API_URL}/api/v1/tenants/${ahlyEncryptedId}/settings`, {
        headers: mutationHeaders(platformApi.accessToken),
        data: { identityProviderMode: "inherit" },
      });
      expect(
        restoreRes.ok(),
        `Failed restoring identityProviderMode=inherit: ${restoreRes.status()} ${await restoreRes.text()}`
      ).toBeTruthy();
    }
  });

  test("Test 5 — Live OWASP & Runtime Security Smoke Checks (BAM-06..BAM-09)", async ({ request }) => {
    const ahlySession = await loginViaApi(request, AHLY_ADMIN_EMAIL, password);

    async function sendSkippingRateLimit<T extends { status(): number; headers(): Record<string, string> }>(
      fn: () => Promise<T>
    ): Promise<T> {
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fn();
        if (res.status() === 429 && attempt < 2) {
          const retrySec = Number(res.headers()["retry-after"] || "62");
          await new Promise((r) => setTimeout(r, Math.min(Math.max(retrySec + 2, 15), 310) * 1000));
          continue;
        }
        return res;
      }
      return fn();
    }

    // 5A. Unsigned forged Apple JWT must be rejected (401 or 422, NEVER 200)
    const forgedAppleJwt =
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwic3ViIjoiZmFrZS1hdHRhY2tlciIsImVtYWlsIjoiYWhseS5hZG1pbkBzY3JpcGUtZGV2LmxvY2FsIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwiZXhwIjo0MTAyNDQ0ODAwfQ.";
    const appleRes = await sendSkippingRateLimit(() =>
      request.post(`${API_URL}/api/v1/auth/user/login/apple`, {
        data: { token: forgedAppleJwt },
      })
    );
    expect([400, 401, 422]).toContain(appleRes.status());
    expect(appleRes.status()).not.toBe(200);

    // 5B. Legacy direct link endpoint must return 410 Gone
    const legacyLinkRes = await request.post(`${API_URL}/api/v1/auth/admin/external-logins/link`, {
      headers: mutationHeaders(ahlySession.accessToken),
      data: { provider: "google", providerKey: "forged-sub", email: AHLY_ADMIN_EMAIL },
    });
    expect(legacyLinkRes.status()).toBe(410);

    // 5C. initiate-link without X-Sudo-Token must return 401 or 403
    const initNoSudoRes = await request.post(
      `${API_URL}/api/v1/auth/admin/external-logins/initiate-link`,
      {
        headers: mutationHeaders(ahlySession.accessToken),
        data: { identityProviderId: "fake-id", redirectUri: "http://localhost:3000/sso/callback" },
      }
    );
    expect([401, 403]).toContain(initNoSudoRes.status());

    // 5D. /connect/authorize with javascript:alert(1) redirect_uri must be blocked (400, never redirects to javascript:)
    const getAuthzRes = await sendSkippingRateLimit(() =>
      request.get(
        `${API_URL}/connect/authorize?client_id=scripe-athlete-portal&response_type=code&redirect_uri=${encodeURIComponent("javascript:alert(1)")}&scope=openid`,
        { maxRedirects: 0 }
      )
    );
    expect(getAuthzRes.status()).toBe(400);
    expect(getAuthzRes.headers()["location"] || "").not.toMatch(/^javascript:/i);

    const postDenyRes = await sendSkippingRateLimit(() =>
      request.post(`${API_URL}/connect/authorize`, {
        maxRedirects: 0,
        form: {
          client_id: "scripe-athlete-portal",
          response_type: "code",
          redirect_uri: "javascript:alert(1)",
          scope: "openid",
          decision: "deny",
        },
      })
    );
    expect(postDenyRes.status()).toBe(400);
    expect(postDenyRes.headers()["location"] || "").not.toMatch(/^javascript:/i);

    // 5E. Live PAT scr_pat_... lifecycle: create with narrow scope -> allowed (200) -> out-of-scope (403) -> revoke -> 401
    const sudoRes = await sendSkippingRateLimit(() =>
      request.post(`${API_URL}/api/v1/auth/sudo/verify`, {
        headers: mutationHeaders(ahlySession.accessToken),
        data: { method: "password", password },
      })
    );
    expect(sudoRes.ok(), `Sudo verify failed: ${sudoRes.status()}`).toBeTruthy();
    const { sudoToken } = (await sudoRes.json()) as { sudoToken: string };
    expect(sudoToken).toBeTruthy();

    const patCreateRes = await request.post(`${API_URL}/api/v1/account/integrations`, {
      headers: mutationHeaders(ahlySession.accessToken, { "X-Sudo-Token": sudoToken }),
      data: {
        itemType: "PAT",
        name: `QA Scoped PAT ${Date.now().toString().slice(-5)}`,
        description: "Live BAM-08 scope enforcement smoke test",
        scopes: ["identity_providers.view"],
        expiresInDays: 7,
      },
    });
    expect(
      patCreateRes.ok(),
      `PAT creation failed: ${patCreateRes.status()} ${await patCreateRes.text()}`
    ).toBeTruthy();
    const patCreated = (await patCreateRes.json()) as {
      id: string;
      oneTimePlaintextSecret?: string;
    };
    expect(patCreated.id).toBeTruthy();
    expect(patCreated.oneTimePlaintextSecret).toMatch(/^scr_pat_/);
    const patToken = patCreated.oneTimePlaintextSecret!;

    try {
      // Allowed endpoint with identity_providers.view scope -> 200
      const allowedRes = await request.get(`${API_URL}/api/v1/identity-providers`, {
        headers: { Authorization: `Bearer ${patToken}` },
      });
      expect(allowedRes.status()).toBe(200);

      // Out-of-scope endpoint (roles.view not granted to this PAT) -> 403
      const forbiddenRes = await request.get(`${API_URL}/api/v1/roles/current-tenant`, {
        headers: { Authorization: `Bearer ${patToken}` },
      });
      expect(forbiddenRes.status()).toBe(403);
    } finally {
      // Revoke PAT (Sudo-gated)
      const revokeRes = await request.delete(
        `${API_URL}/api/v1/account/integrations/PAT/${patCreated.id}`,
        {
          headers: mutationHeaders(ahlySession.accessToken, { "X-Sudo-Token": sudoToken }),
        }
      );
      expect(
        revokeRes.ok(),
        `PAT revocation failed: ${revokeRes.status()} ${await revokeRes.text()}`
      ).toBeTruthy();
    }

    // Revoked PAT must now return 401
    const afterRevokeRes = await request.get(`${API_URL}/api/v1/identity-providers`, {
      headers: { Authorization: `Bearer ${patToken}` },
    });
    expect(afterRevokeRes.status()).toBe(401);
  });

  test("Test 6 — Passkey Registration (FIDO2 WebAuthn), Real UI Logout & Cross-Tenant Isolation", async ({
    browser,
    request,
    browserName,
  }) => {
    const ahlyContext = fs.existsSync(ahlyStoragePath)
      ? await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: ahlyStoragePath })
      : await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ahlyContext.newPage();

    const runTag = Date.now().toString().slice(-6);
    const passkeyLabel = `QA Identity Key ${runTag}`;

    try {
      if (!fs.existsSync(ahlyStoragePath)) {
        const tok = await loginViaUi(page, AHLY_ADMIN_EMAIL, password);
        if (tok) apiLoginCache.set(`${AHLY_ADMIN_EMAIL}::0`, { accessToken: tok });
      } else {
        await page.goto("/account/security");
        await waitForAppSettled(page);
        if (page.url().includes("/login")) {
          const tok = await loginViaUi(page, AHLY_ADMIN_EMAIL, password);
          if (tok) apiLoginCache.set(`${AHLY_ADMIN_EMAIL}::0`, { accessToken: tok });
        }
      }

      // 6A. Cross-tenant & platform-boundary isolation checks for Tenant Admin (ahly.admin)
      const tenantAccessToken = (await loginViaApi(request, AHLY_ADMIN_EMAIL, password)).accessToken;
      const platformApi = await loginViaApi(request, PLATFORM_ADMIN_ID, password, true);

      // Resolve a sibling competitor tenant (e.g. City / Falcon / Apex) via Platform Admin
      const allTenantsRes = await request.get(`${API_URL}/api/v1/tenants?pageSize=50`, {
        headers: { Authorization: `Bearer ${platformApi.accessToken}` },
      });
      expect(allTenantsRes.ok()).toBeTruthy();
      const allTenantsBody = await allTenantsRes.json();
      const allTenants: Array<{ id: string; code?: string; name?: string }> = Array.isArray(allTenantsBody)
        ? allTenantsBody
        : allTenantsBody?.items ?? allTenantsBody?.data ?? [];
      const foreignTenant = allTenants.find(
        (t) => t.code && !/ahly/i.test(t.code) && !/ahly/i.test(t.name ?? "")
      );
      expect(foreignTenant?.id, "Expected at least one non-Ahly tenant in seeded DB").toBeTruthy();

      // 1) Scoped hierarchy query for ahly.admin must NEVER leak foreign tenants (City, Falcon, Apex, etc.)
      const scopedTenantsRes = await request.get(`${API_URL}/api/v1/tenants?pageSize=50`, {
        headers: { Authorization: `Bearer ${tenantAccessToken}` },
      });
      if (scopedTenantsRes.ok()) {
        const scopedBody = await scopedTenantsRes.json();
        const scopedItems: Array<{ id: string; code?: string; name?: string }> = Array.isArray(scopedBody)
          ? scopedBody
          : scopedBody?.items ?? scopedBody?.data ?? [];
        expect(scopedItems.some((t) => t.id === foreignTenant!.id)).toBe(false);
      } else {
        expect([401, 403]).toContain(scopedTenantsRes.status());
      }

      // 2) Direct access to foreign tenant details by real encrypted ID must fail closed (403 or 404)
      const foreignDetailRes = await request.get(`${API_URL}/api/v1/tenants/${foreignTenant!.id}`, {
        headers: { Authorization: `Bearer ${tenantAccessToken}` },
      });
      expect([403, 404]).toContain(foreignDetailRes.status());

      // 3) [PlatformAdminOnly] tenant IdP governance surface must deny tenant admin (403)
      const platformIdpSurfaceRes = await request.get(
        `${API_URL}/api/v1/tenants/${foreignTenant!.id}/identity-providers`,
        {
          headers: { Authorization: `Bearer ${tenantAccessToken}` },
        }
      );
      expect([401, 403]).toContain(platformIdpSurfaceRes.status());

      // 6B. Real FIDO2 WebAuthn Passkey Registration via Chromium CDP Virtual Authenticator
      if (browserName === "chromium") {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("WebAuthn.enable", { enableUI: false });
        const { authenticatorId } = await cdp.send("WebAuthn.addVirtualAuthenticator", {
          options: {
            protocol: "ctap2",
            transport: "internal",
            hasResidentKey: true,
            hasUserVerification: true,
            isUserVerified: true,
            automaticPresenceSimulation: true,
          },
        });

        async function satisfySudoModalIfPrompted() {
          const sudoDialog = page
            .getByTestId("sudo-verification-modal")
            .or(page.getByRole("dialog", { name: /Confirm Identity/i }));
          const appeared = await sudoDialog
            .first()
            .waitFor({ state: "visible", timeout: 4_000 })
            .then(() => true)
            .catch(() => false);
          if (!appeared) return;

          const pwdInput = page
            .getByTestId("sudo-password-input")
            .or(page.getByPlaceholder(/Enter account password/i));
          if (await pwdInput.first().isVisible().catch(() => false)) {
            await pwdInput.first().fill(password);
          } else {
            const pwdTab = page.getByTestId("sudo-tab-password");
            if (await pwdTab.isVisible().catch(() => false)) {
              await pwdTab.click();
              await pwdInput.first().fill(password);
            }
          }
          const verifyBtn = page
            .getByTestId("sudo-verify-submit-btn")
            .or(page.getByRole("button", { name: /Verify & Elevate Sudo/i }));
          await expect(verifyBtn.first()).toBeEnabled({ timeout: 5_000 });
          await verifyBtn.first().click();
          await expect(sudoDialog.first()).toBeHidden({ timeout: 20_000 });
        }

        let enrolledPasskeyId = "";
        try {
          await page.goto("/account/security");
          await waitForAppSettled(page);
          await setTheme(page, "dark");

          await page.getByTestId("open-enroll-passkey-btn").click();
          await expect(page.getByTestId("passkey-option-platform")).toBeVisible({ timeout: 10_000 });
          await safeScreenshot(page, "10-passkey-enrollment-wizard.png", false);

          await page.getByTestId("passkey-option-platform").click();
          await page.getByTestId("passkey-name-input").fill(passkeyLabel);
          await page.getByTestId("passkey-activate-btn").click();

          // Complete Biometric Sudo step-up if session Sudo window is locked
          await satisfySudoModalIfPrompted();

          await expect(page.getByTestId("passkey-done-btn")).toBeVisible({ timeout: 20_000 });
          await page.getByTestId("passkey-done-btn").click();

          const { credentials } = await cdp.send("WebAuthn.getCredentials", { authenticatorId });
          expect(credentials.length).toBeGreaterThanOrEqual(1);

          const enrolledRow = page
            .locator('[data-testid^="passkey-row-"]')
            .filter({ hasText: passkeyLabel })
            .first();
          await expect(enrolledRow).toBeVisible({ timeout: 15_000 });
          const rowAttr = (await enrolledRow.getAttribute("data-testid")) || "";
          enrolledPasskeyId = rowAttr.replace("passkey-row-", "");
          expect(enrolledPasskeyId.length).toBeGreaterThan(0);

          await enrolledRow.scrollIntoViewIfNeeded();
          await safeScreenshot(page, "11-passkey-registered-account-security.png", true);

          // 6C. Real UI Logout from Account Portal User Menu -> /login + unauthenticated guard check
          const userMenuBtn = page.locator('header button[aria-haspopup="menu"]').last();
          await expect(userMenuBtn).toBeVisible({ timeout: 10_000 });
          await userMenuBtn.click();

          const signOutItem = page.getByRole("menuitem", { name: /sign out|log out|تسجيل الخروج/i });
          await expect(signOutItem).toBeVisible({ timeout: 5_000 });
          await signOutItem.click();

          await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 20_000 });
          await waitForAppSettled(page);
          await safeScreenshot(page, "12-post-logout-login-screen.png", true);

          // Unauthenticated visit to /account/security after logout MUST redirect back to /login
          await page.goto("/account/security");
          await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 15_000 });
          expect(page.url()).toContain("/login");

          // 6D. Passwordless Sign-In using newly registered WebAuthn Passkey + clean teardown
          await page.locator("#identifier").fill(AHLY_ADMIN_EMAIL);
          await page.getByTestId("login-passkey-chip").click();
          await expect(page.getByTestId("passkey-authenticate-btn")).toBeVisible({ timeout: 10_000 });
          await page.waitForTimeout(550);
          await safeScreenshot(page, "13-passkey-login-challenge.png", false);

          await page.getByTestId("passkey-authenticate-btn").click();
          await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 25_000 });
          await waitForAppSettled(page);

          // Verify registered passkey persists across logout + WebAuthn login + hard reload
          await page.goto("/account/security");
          await waitForAppSettled(page);
          await expect(page.getByTestId(`passkey-row-${enrolledPasskeyId}`)).toContainText(
            passkeyLabel,
            { timeout: 15_000 }
          );
          await safeScreenshot(page, "14-post-passkey-login-verified.png", true);
        } finally {
          await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId }).catch(() => {});
          await cdp.detach().catch(() => {});
        }
      } else {
        // Non-Chromium fallback: verify Real UI Logout & post-logout guard
        await page.goto("/account/security");
        await waitForAppSettled(page);
        const userMenuBtn = page.locator('header button[aria-haspopup="menu"]').last();
        await expect(userMenuBtn).toBeVisible({ timeout: 10_000 });
        await userMenuBtn.click();
        await page.getByRole("menuitem", { name: /sign out|log out|تسجيل الخروج/i }).click();
        await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 20_000 });
        await page.goto("/account/security");
        await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 15_000 });
      }
    } finally {
      await ahlyContext.close();
    }
  });
});
