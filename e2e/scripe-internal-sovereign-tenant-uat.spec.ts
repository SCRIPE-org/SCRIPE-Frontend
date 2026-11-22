import {
  test,
  expect,
  type Page,
  type APIRequestContext,
  type Response,
} from "@playwright/test";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { getDevAdminPassword } from "./helpers/auth-credentials";

/**
 * SCRIPE Internal Sovereign Tenant — Live Unmocked End-to-End Verification Suite
 *
 * Executes strictly against live ASP.NET Core API (:5035), Next.js Portal (:3000),
 * and PostgreSQL persistence with ZERO page.route() mocks.
 */

const API_URL = process.env.E2E_API_URL || "http://localhost:5035";
const PRIMARY_SCREENSHOT_DIR =
  "d:/01_PROJECTS/SCRIPE/SCRIPE-CRM/EXECUTION_REPORTS/SCRIPE_INTERNAL_TENANT/screenshots";
const MIRROR_SCREENSHOT_DIR =
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/11e0d0eb-78c8-4bb4-becd-b13bc9673dbc/screenshots";
const BACKEND_LOGS_DIR = "d:/01_PROJECTS/SCRIPE/SCRIPE-Backend/src/Host/API/Logs";

const PLATFORM_SUPERADMIN_EMAIL = "admin-seif@scripe.org";
const SCRIPE_ADMIN_EMAIL = "seif@scripe.org";
const SCRIPE_ADMIN_USERNAME = "scripeadmin";
const AHLY_ADMIN_EMAIL = "ahly.admin@scripe-dev.local";
const SCRIPE_TENANT_CODE = "SCRIPE";
const SCRIPE_EDITION_NAME = "scripe-internal";

for (const dir of [PRIMARY_SCREENSHOT_DIR, MIRROR_SCREENSHOT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

interface ZeroErrorMonitor {
  pageErrors: string[];
  serverErrors: string[];
  assertClean: (contextLabel: string) => void;
  detach: () => void;
}

function attachZeroErrorMonitor(page: Page): ZeroErrorMonitor {
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];

  const onPageError = (err: Error) => {
    pageErrors.push(`${err.name}: ${err.message}`);
  };
  const onResponse = (res: Response) => {
    if (res.status() >= 500 && !res.url().includes("favicon")) {
      serverErrors.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    }
  };

  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  return {
    pageErrors,
    serverErrors,
    assertClean(contextLabel: string) {
      expect(pageErrors, `Uncaught pageerrors in ${contextLabel}`).toEqual([]);
      expect(serverErrors, `HTTP 5xx responses in ${contextLabel}`).toEqual([]);
    },
    detach() {
      page.off("pageerror", onPageError);
      page.off("response", onResponse);
    },
  };
}

async function safeScreenshot(page: Page, filename: string, fullPage = true) {
  const targetPath = path.join(PRIMARY_SCREENSHOT_DIR, filename);
  const mirrorPath = path.join(MIRROR_SCREENSHOT_DIR, filename);

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      if (fs.existsSync(targetPath)) {
        try {
          fs.unlinkSync(targetPath);
        } catch {
          // ignore transient handle lock
        }
      }
      await page.screenshot({ path: targetPath, fullPage });
      fs.copyFileSync(targetPath, mirrorPath);
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

async function resetLanguageCookie(page: Page, lang: "en" | "ar" = "en") {
  await page.evaluate((targetLang) => {
    localStorage.setItem("scr_lang", targetLang);
    localStorage.setItem("scr_pref_lang", targetLang);
    document.cookie = `scr_lang=${targetLang}; path=/; SameSite=Lax`;
  }, lang);
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

function mutationHeaders(accessToken: string, extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Request-Timestamp": Date.now().toString(),
    "X-Request-Nonce": randomUUID(),
    ...extra,
  };
}

async function sendSkippingRateLimit<
  T extends { status(): number; headers(): Record<string, string> },
>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fn();
    if (res.status() === 429 && attempt < 2) {
      const retrySec = Number(res.headers()["retry-after"] || "30");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retrySec + 2, 10), 75) * 1000));
      continue;
    }
    return res;
  }
  return fn();
}

interface ApiLoginResult {
  accessToken: string;
  refreshToken?: string;
  mustChangePassword?: boolean;
  tenantId?: string | null;
}

const apiLoginCache = new Map<string, ApiLoginResult>();

async function loginViaApi(
  request: APIRequestContext,
  identifier: string,
  password: string,
  options: { isPlatformAdmin?: boolean; tenantId?: string; skipCache?: boolean } = {}
): Promise<ApiLoginResult> {
  const isPlatformAdmin = options.isPlatformAdmin ?? false;
  const cacheKey = `${identifier}::${isPlatformAdmin ? "1" : "0"}::${options.tenantId ?? ""}`;
  const cached = !options.skipCache ? apiLoginCache.get(cacheKey) : undefined;
  if (cached && !cached.mustChangePassword) {
    const probe = await request.get(`${API_URL}/api/v1/auth/admin/principal`, {
      headers: { Authorization: `Bearer ${cached.accessToken}` },
    });
    if (probe.ok()) {
      return cached;
    }
    apiLoginCache.delete(cacheKey);
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await request.post(`${API_URL}/api/v1/auth/admin/login`, {
      data: {
        identifier,
        password,
        isPlatformAdmin,
        ...(options.tenantId ? { tenantId: options.tenantId } : {}),
      },
    });
    if (res.status() === 429 && attempt < 2) {
      const retryAfterSec = Number(res.headers()["retry-after"] || "30");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retryAfterSec + 2, 10), 75) * 1000));
      continue;
    }
    expect(res.ok(), `API login failed for ${identifier}: ${res.status()}`).toBeTruthy();
    const payload = (await res.json()) as ApiLoginResult;
    if (!payload.mustChangePassword && !options.skipCache) {
      apiLoginCache.set(cacheKey, payload);
    }
    return payload;
  }
  throw new Error(`API login exhausted retries for ${identifier}`);
}

async function loginViaUi(
  page: Page,
  identifier: string,
  password: string,
  loginUrl = "http://localhost:3000/login"
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
      (res) =>
        res.url().toLowerCase().includes("/api/v1/auth/admin/login") &&
        res.request().method() === "POST",
      { timeout: 25_000 }
    );
    await submitBtn.click();
    const loginRes = await loginResPromise;

    if (loginRes.status() === 429 && attempt < 3) {
      const retrySec = Number(loginRes.headers()["retry-after"] || "30");
      await page.waitForTimeout(Math.min(Math.max(retrySec + 2, 10), 75) * 1000);
      continue;
    }

    expect(loginRes.ok(), `UI login failed for ${identifier}: ${loginRes.status()}`).toBeTruthy();
    const payload = (await loginRes.json()) as {
      accessToken?: string;
      data?: { accessToken?: string };
    };
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    await waitForAppSettled(page);
    return payload.accessToken ?? payload.data?.accessToken ?? "";
  }
  throw new Error(`UI login rate-limited after retries for ${identifier}`);
}

async function assertNoHorizontalOverflow(page: Page, contextLabel: string) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow on ${contextLabel}: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth + 4);
}

async function resolveScripeTenantAndEdition(request: APIRequestContext, superadminToken: string) {
  const headers = { Authorization: `Bearer ${superadminToken}` };
  const tenantsRes = await request.get(`${API_URL}/api/v1/tenants?page=1&pageSize=100`, {
    headers,
  });
  expect(tenantsRes.ok()).toBeTruthy();
  const tenantsJson = (await tenantsRes.json()) as {
    items?: Array<{
      id: string;
      code: string;
      name: string;
      description?: string | null;
      tenantKind?: string;
      isInternal?: boolean;
      editionName?: string;
    }>;
  };
  const scripeTenant = (tenantsJson.items ?? []).find((t) => t.code === SCRIPE_TENANT_CODE);
  expect(scripeTenant, "SCRIPE tenant must exist in /api/v1/tenants").toBeTruthy();

  const editionsRes = await request.get(`${API_URL}/api/v1/editions?page=1&pageSize=100`, {
    headers,
  });
  expect(editionsRes.ok()).toBeTruthy();
  const editionsJson = (await editionsRes.json()) as {
    items?: Array<{
      id: string;
      name: string;
      scope?: string;
      isFree?: boolean;
      isSystem?: boolean;
    }>;
  };
  const scripeEdition = (editionsJson.items ?? []).find((e) => e.name === SCRIPE_EDITION_NAME);
  expect(scripeEdition, "scripe-internal edition must exist in /api/v1/editions").toBeTruthy();

  return {
    scripeTenant: scripeTenant!,
    scripeEdition: scripeEdition!,
  };
}

async function waitForToastCleared(page: Page, timeoutMs = 8_000): Promise<void> {
  const toast = page.locator("[data-sileo-toast]");
  if ((await toast.count()) > 0) {
    await toast
      .first()
      .waitFor({ state: "hidden", timeout: timeoutMs })
      .catch(() => {});
    await page.waitForTimeout(250);
  }
}

async function readLatestSignupOtpFromLogs(email: string, timeoutMs = 20_000): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  const escaped = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const codePattern = new RegExp(
    `(?:\\[DEV EMAIL(?: FALLBACK)?\\])[^\\r\\n]*?To:\\s*${escaped}\\b[^\\r\\n]*?Verification Code:\\s*(\\d{6})`,
    "i"
  );

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const candidateFiles: string[] = [];
    const envLogPath = process.env.SCRIPE_API_LOG_PATH?.trim();
    if (envLogPath && fs.existsSync(envLogPath)) {
      candidateFiles.push(envLogPath);
    }
    if (fs.existsSync(BACKEND_LOGS_DIR)) {
      const logFiles = fs
        .readdirSync(BACKEND_LOGS_DIR)
        .filter((f) => f.startsWith("log-") && f.endsWith(".txt"))
        .map((f) => ({
          fullPath: path.join(BACKEND_LOGS_DIR, f),
          mtimeMs: fs.statSync(path.join(BACKEND_LOGS_DIR, f)).mtimeMs,
        }))
        .sort((a, b) => b.mtimeMs - a.mtimeMs)
        .slice(0, 2)
        .map((x) => x.fullPath);
      candidateFiles.push(...logFiles);
    }

    for (const fullPath of candidateFiles) {
      const content = fs.readFileSync(fullPath, "utf8").replace(/\x1b\[[0-9;]*m/g, "");
      const lines = content.split(/\r?\n/);
      for (let i = lines.length - 1; i >= 0; i--) {
        const match = lines[i].match(codePattern);
        if (match?.[1]) {
          return match[1];
        }
      }
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  throw new Error(`Timed out waiting for signup OTP log entry for ${normalizedEmail}`);
}

test.describe("SCRIPE Internal Sovereign Tenant — Live Unmocked QA Suite", () => {
  test.describe.configure({ mode: "default", timeout: 420_000 });

  let password = "";
  let superadminToken = "";
  let scripeEncryptedId = "";
  let scripeEditionId = "";
  let originalScripeDescription = "";
  const runTag = Date.now().toString().slice(-6);
  const createdAhlyAdminIds: string[] = [];

  test.beforeAll(async ({ request }, testInfo) => {
    testInfo.setTimeout(180_000);
    password = getDevAdminPassword();
    const sa = await loginViaApi(request, PLATFORM_SUPERADMIN_EMAIL, password, {
      isPlatformAdmin: true,
    });
    superadminToken = sa.accessToken;
    const resolved = await resolveScripeTenantAndEdition(request, superadminToken);
    scripeEncryptedId = resolved.scripeTenant.id;
    scripeEditionId = resolved.scripeEdition.id;
    originalScripeDescription = resolved.scripeTenant.description ?? "";
  });

  test.afterAll(async ({ request }) => {
    if (createdAhlyAdminIds.length > 0) {
      try {
        const ahlySession = await loginViaApi(request, AHLY_ADMIN_EMAIL, password);
        for (const id of createdAhlyAdminIds) {
          await request.delete(`${API_URL}/api/v1/admins/${id}`, {
            headers: mutationHeaders(ahlySession.accessToken),
          });
        }
      } catch {
        // best effort cleanup
      }
    }
  });

  // =========================================================================
  // QA-01: Platform Root /tenants & /tenants/{id} Protection
  // =========================================================================
  test("QA-01 — Platform Root /tenants list, EditTenantDialog guard, /tenants/{id} detail EN+AR, and negative API guards", async ({
    browser,
    request,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    try {
      await loginViaUi(page, PLATFORM_SUPERADMIN_EMAIL, password, "http://localhost:3000/login");
      await resetLanguageCookie(page, "en");
      await setTheme(page, "dark");

      // Navigate to /tenants
      await page.goto("http://localhost:3000/tenants");
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      // Confirm real subtitle copy (no raw i18n keys) & SCRIPE card displays Internal badge
      await expect(page.locator("body")).toContainText(
        /Manage tenant workspaces, hierarchical sub-tenants, and active edition assignments\./i,
        { timeout: 20_000 }
      );
      await expect(page.locator("body")).not.toContainText(/tenant\.listDescription/);

      const scripeHeaderBtn = page
        .locator("button[aria-expanded]")
        .filter({ hasText: /\(SCRIPE\)/ })
        .first();
      await expect(scripeHeaderBtn).toBeVisible({ timeout: 20_000 });
      await expect(scripeHeaderBtn.getByText(/^Internal$/)).toBeVisible();

      await safeScreenshot(page, "01-platform-tenants-list-en-dark.png", true);

      // Light theme variant of /tenants list
      await setTheme(page, "light");
      await safeScreenshot(page, "01b-platform-tenants-list-en-light.png", true);
      await setTheme(page, "dark");

      // Expand SCRIPE accordion card
      if ((await scripeHeaderBtn.getAttribute("aria-expanded")) !== "true") {
        await scripeHeaderBtn.click();
        await page.waitForTimeout(300);
      }

      const scripeCard = scripeHeaderBtn.locator("xpath=ancestor::div[contains(@class,'group/card')]").first();
      const viewDetailsBtn = scripeCard.getByRole("button", { name: /View Tenant Details/i });
      const editBtn = scripeCard.getByRole("button", { name: /^Edit$/i });
      await expect(viewDetailsBtn).toBeVisible({ timeout: 10_000 });
      await expect(editBtn).toBeVisible({ timeout: 10_000 });
      await expect(scripeCard.getByRole("button", { name: /Delete/i })).toHaveCount(0);

      // Open EditTenantDialog and verify code chip, read-only badge, char counter & NO isActive toggle
      await editBtn.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible({ timeout: 10_000 });
      await expect(dialog.locator("[role='switch']")).toHaveCount(0);
      await expect(dialog).not.toContainText(/Active Status/i);
      await expect(dialog.locator("code", { hasText: "SCRIPE" })).toBeVisible();
      await expect(dialog).toContainText(/Internal.*Protected/i);
      await expect(dialog).toContainText(/\d+\/100/);
      await expect(dialog).toContainText(/\d+\/500/);

      await safeScreenshot(page, "04-platform-tenant-scripe-edit-dialog-en.png", false);

      // Edit description, save, reload, confirm persistence, then restore
      const descBox = dialog.locator("textarea").first();
      const initialDesc = await descBox.inputValue();
      const editedDesc = `Sovereign internal platform company (verified ${runTag})`;
      await descBox.fill(editedDesc);

      const updatePromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/tenants/") &&
          res.request().method() === "PUT",
        { timeout: 25_000 }
      );
      await dialog.getByRole("button", { name: /Save/i }).click();
      const updateRes = await updatePromise;
      expect(updateRes.ok(), `Tenant description update failed: ${updateRes.status()}`).toBeTruthy();
      await expect(dialog).toBeHidden({ timeout: 10_000 });

      await page.reload();
      await waitForAppSettled(page);
      const reloadedHeader = page
        .locator("button[aria-expanded]")
        .filter({ hasText: /\(SCRIPE\)/ })
        .first();
      await reloadedHeader.click();
      const reloadedCard = reloadedHeader
        .locator("xpath=ancestor::div[contains(@class,'group/card')]")
        .first();
      await expect(reloadedCard).toContainText(editedDesc, { timeout: 10_000 });

      // Restore original description cleanly
      await reloadedCard.getByRole("button", { name: /^Edit$/i }).click();
      const restoreDialog = page.getByRole("dialog");
      await expect(restoreDialog).toBeVisible({ timeout: 10_000 });
      await restoreDialog.locator("textarea").first().fill(initialDesc || originalScripeDescription);
      const restorePromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/tenants/") &&
          res.request().method() === "PUT",
        { timeout: 25_000 }
      );
      await restoreDialog.getByRole("button", { name: /Save/i }).click();
      const restoreRes = await restorePromise;
      expect(restoreRes.ok()).toBeTruthy();
      await expect(restoreDialog).toBeHidden({ timeout: 10_000 });

      // Navigate to /tenants/{encryptedId} via View Tenant Details button
      await reloadedCard.getByRole("button", { name: /View Tenant Details/i }).click();
      await page.waitForURL(/\/tenants\/[^/]+$/, { timeout: 20_000 });
      const detailTenantId = new URL(page.url()).pathname.split("/").pop() || scripeEncryptedId;
      expect(detailTenantId).toBeTruthy();
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      // Verify TenantHeader shows Internal badge and hides Deactivate / Delete
      await expect(page.getByText(/^SCRIPE$/).first()).toBeVisible();
      await expect(page.getByText(/^Internal$/).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /Deactivate/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Delete$/i })).toHaveCount(0);

      // Verify TenantEntitlementsTab hides Manage Subscription button
      await expect(page.getByRole("button", { name: /Manage Subscription/i })).toHaveCount(0);

      // Verify TenantSubscriptionCard shows Internal Sovereign banner, NO Free Plan,
      // NO commercial action buttons, and preserves Resync Permissions
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).toContain("Internal Sovereign");
      expect(bodyText).not.toContain("Free Plan");
      for (const forbiddenBtn of [
        /Assign Plan/i,
        /Change Plan/i,
        /Reassign Plan/i,
        /^Renew$/i,
        /Convert Trial/i,
        /^Resume$/i,
        /Change Currency/i,
        /^Suspend$/i,
      ]) {
        await expect(page.getByRole("button", { name: forbiddenBtn })).toHaveCount(0);
      }
      await expect(
        page.getByRole("button", { name: /Re-?sync Permissions/i }).first()
      ).toBeVisible();

      // Verify ∞ No Expiry badge (no full-width 100% progress bar) & zero header overlap
      await expect(page.getByText(/∞\s*No Expiry/i).first()).toBeVisible();
      await expect(page.locator("#nexus-content div.bg-nx-raised > div.rounded-full[style*='width']")).toHaveCount(0);
      await waitForToastCleared(page);

      const editHeaderBtn = page.getByRole("button", { name: /^Edit$/i }).first();
      const enterTenantBtn = page.getByRole("button", { name: /Enter Tenant/i }).first();
      const editBox = await editHeaderBtn.boundingBox();
      const enterBox = await enterTenantBtn.boundingBox();
      expect(editBox && enterBox).toBeTruthy();
      expect(editBox!.x).toBeGreaterThanOrEqual(enterBox!.x + enterBox!.width - 1);

      await safeScreenshot(page, "02-platform-tenant-scripe-detail-en.png", true);

      // Switch to Arabic RTL and capture 03-platform-tenant-scripe-detail-ar-rtl.png
      await setLanguageAndReload(page, "ar");
      await setTheme(page, "dark");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("body")).toContainText(/[\u0600-\u06FF]/);
      await expect(page.locator("body")).toContainText(/بدون انتهاء|لا ينتهي/);
      const arDetailText = await page.locator("#nexus-content").innerText();
      expect(
        arDetailText,
        "Arabic tenant detail dates must be localized cleanly without raw English month abbreviations"
      ).not.toMatch(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/);
      await expect(page.locator("#nexus-content div.bg-nx-raised > div.rounded-full[style*='width']")).toHaveCount(0);
      await waitForToastCleared(page);
      await safeScreenshot(page, "03-platform-tenant-scripe-detail-ar-rtl.png", true);
      await setLanguageAndReload(page, "en");

      // Negative API security checks (superadmin token)
      const deleteRes = await sendSkippingRateLimit(() =>
        request.delete(`${API_URL}/api/v1/tenants/${scripeEncryptedId}`, {
          headers: mutationHeaders(superadminToken),
        })
      );
      expect(deleteRes.status(), "DELETE on internal SCRIPE tenant must return 403").toBe(403);

      const putCountryRes = await sendSkippingRateLimit(() =>
        request.put(`${API_URL}/api/v1/tenants/${scripeEncryptedId}`, {
          headers: mutationHeaders(superadminToken),
          data: {
            name: "SCRIPE",
            description: originalScripeDescription || "SCRIPE Internal Company",
            address: null,
            isActive: true,
            countryCode: "US",
            timeZone: "Africa/Cairo",
          },
        })
      );
      expect(putCountryRes.status(), "Changing countryCode on SCRIPE must return 403").toBe(403);

      const putTzRes = await sendSkippingRateLimit(() =>
        request.put(`${API_URL}/api/v1/tenants/${scripeEncryptedId}`, {
          headers: mutationHeaders(superadminToken),
          data: {
            name: "SCRIPE",
            description: originalScripeDescription || "SCRIPE Internal Company",
            address: null,
            isActive: true,
            countryCode: "EG",
            timeZone: "UTC",
          },
        })
      );
      expect(putTzRes.status(), "Changing timeZone on SCRIPE must return 403").toBe(403);

      // Verify random unknown GUID route rejection on API (does not leak internal tenant)
      const rawGuidGet = await request.get(`${API_URL}/api/v1/tenants/${crypto.randomUUID()}`, {
        headers: { Authorization: `Bearer ${superadminToken}` },
      });
      expect([400, 403, 404]).toContain(rawGuidGet.status());

      monitor.assertClean("QA-01 Platform Root Tenants Protection");
    } finally {
      monitor.detach();
      await context.close();
    }
  });

  // =========================================================================
  // QA-02: Entitlements Subscription & Editions Guards
  // =========================================================================
  test("QA-02 — Entitlements Subscription & Editions Guards for SCRIPE and scripe-internal", async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    try {
      await loginViaUi(page, PLATFORM_SUPERADMIN_EMAIL, password, "http://localhost:3000/login");
      await resetLanguageCookie(page, "en");
      await setTheme(page, "dark");

      // 1. /entitlements/subscriptions/{scripeEncryptedId}
      await page.goto(`http://localhost:3000/entitlements/subscriptions/${scripeEncryptedId}`);
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      await expect(page.locator("body")).toContainText(/Internal Sovereign/i, { timeout: 20_000 });
      await expect(page.locator("body")).toContainText(/scripe-internal/i);
      const subText = await page.locator("body").innerText();
      expect(subText).toContain("None (Lifetime)");
      expect(subText).not.toContain("Fallback");
      expect(subText).not.toContain("Free Plan");
      expect(subText).not.toContain("Free Edition");
      for (const forbiddenAction of [
        /Change Plan/i,
        /^Change$/i,
        /^Suspend$/i,
        /^Cancel$/i,
        /Change Currency/i,
        /^Manage$/i,
      ]) {
        await expect(page.getByRole("button", { name: forbiddenAction })).toHaveCount(0);
      }
      await expect(page.getByRole("button", { name: /Resync/i })).toBeVisible();

      await safeScreenshot(page, "05-entitlements-subscription-scripe-en.png", true);

      // 2. /entitlements/editions — inspect live GET /api/v1/editions payload + row actions
      const editionsApiPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/editions") &&
          res.request().method() === "GET",
        { timeout: 25_000 }
      );
      await page.goto("http://localhost:3000/entitlements/editions");
      const editionsApiRes = await editionsApiPromise;
      expect(editionsApiRes.ok()).toBeTruthy();
      const editionsPayload = (await editionsApiRes.json()) as {
        items?: Array<{ id: string; name: string; scope?: string; isFree?: boolean }>;
      };
      const internalItem = (editionsPayload.items ?? []).find(
        (e) => e.name === SCRIPE_EDITION_NAME
      );
      expect(internalItem, "GET /api/v1/editions must include scripe-internal").toBeTruthy();
      expect(internalItem!.scope).toBe("Internal");
      expect(internalItem!.isFree).toBe(false);

      await waitForAppSettled(page);
      const scripeRow = page.locator("tr", { hasText: SCRIPE_EDITION_NAME }).first();
      await expect(scripeRow).toBeVisible({ timeout: 20_000 });
      await expect(scripeRow.getByText(/^Internal$/)).toBeVisible();
      // Edit (pencil) and Delete (trash) buttons must be hidden for scripe-internal
      await expect(scripeRow.locator("svg.lucide-pencil")).toHaveCount(0);
      await expect(scripeRow.locator("svg.lucide-trash-2")).toHaveCount(0);

      // 3. /entitlements/editions/{scripeInternalId}
      await page.goto(`http://localhost:3000/entitlements/editions/${scripeEditionId}`);
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      await expect(page.locator("body")).toContainText(/SCRIPE Internal/i, { timeout: 20_000 });
      await expect(page.getByTestId("edition-features-readonly-alert")).toBeVisible();
      await expect(page.getByTestId("edition-features-readonly-alert")).toContainText(
        /Read-Only System Configuration/i
      );
      await expect(page.locator("#nexus-content")).toContainText(/Catalog & Pricing/);
      await expect(page.locator("#nexus-content")).not.toContainText(/CatalogPricing/);
      await expect(page.getByRole("button", { name: /Edit Settings/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Pricing$/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Promotions$/i })).toHaveCount(0);

      // FeaturesTab: expand CRM module card and verify zero Trash2 buttons + disabled toggles/inputs
      const crmModuleHeading = page.getByRole("heading", { name: /^CRM$/i }).first();
      await expect(crmModuleHeading).toBeVisible();
      await crmModuleHeading.click();
      await page.waitForTimeout(300);

      await expect(page.locator("svg.lucide-trash-2")).toHaveCount(0);
      const overflowTrigger = page.locator("button[role='combobox']").first();
      await expect(overflowTrigger).toBeDisabled();
      const firstFeatureSwitch = page.locator("button[role='switch']").first();
      if ((await firstFeatureSwitch.count()) > 0) {
        await expect(firstFeatureSwitch).toBeDisabled();
      }
      const firstFeatureInput = page.locator("input:not([type='hidden'])").first();
      if ((await firstFeatureInput.count()) > 0) {
        await expect(firstFeatureInput).toBeDisabled();
      }

      // Switch to Version History tab and verify Publish / Cancel buttons hidden
      const versionsTabBtn = page.getByRole("button", { name: /Version History|Versions/i }).first();
      await expect(versionsTabBtn).toBeVisible();
      await versionsTabBtn.click();
      await page.waitForTimeout(300);
      await expect(page.getByRole("button", { name: /^Publish$/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Cancel$/i })).toHaveCount(0);

      // Switch back to Features tab for crisp detail screenshot
      await page.getByRole("button", { name: /^Features$/i }).first().click();
      await page.waitForTimeout(300);
      await safeScreenshot(page, "06-entitlements-editions-scripe-internal-detail-en.png", true);

      // 4. /entitlements/editions/{scripeInternalId}/edit — locked EmptyState
      await page.goto(`http://localhost:3000/entitlements/editions/${scripeEditionId}/edit`);
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      await expect(page.locator("body")).toContainText(/Internal Sovereign Edition Is Immutable/i, {
        timeout: 20_000,
      });
      await expect(page.getByRole("button", { name: /Save Changes/i })).toHaveCount(0);
      await safeScreenshot(
        page,
        "07-entitlements-editions-scripe-internal-edit-locked-en.png",
        true
      );

      monitor.assertClean("QA-02 Entitlements Subscriptions & Editions Guards");
    } finally {
      monitor.detach();
      await context.close();
    }
  });

  // =========================================================================
  // QA-03: SCRIPE Subdomain & Query Login, CRM EGP & Venue Demo Arena
  // =========================================================================
  test("QA-03 — SCRIPE subdomain & ?_tenant=SCRIPE login, session reload persistence, CRM EGP, Venue Demo Arena & unlimited quotas", async ({
    browser,
  }) => {
    // Part A: Subdomain login on http://scripe.localhost:3000/login
    const subContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const subPage = await subContext.newPage();
    const subMonitor = attachZeroErrorMonitor(subPage);

    try {
      const resolvePromise = subPage
        .waitForResponse(
          (res) => res.url().includes("/api/v1/customization/resolve") && res.ok(),
          { timeout: 15_000 }
        )
        .catch(() => null);
      await subPage.goto("http://scripe.localhost:3000/login");
      const resolveRes = await resolvePromise;
      await waitForAppSettled(subPage);
      await setTheme(subPage, "dark");

      if (resolveRes) {
        const resolveJson = (await resolveRes.json()) as {
          name?: string;
          primaryColor?: string;
          loginHeadline?: string;
        };
        expect(resolveJson.name).toBe("SCRIPE");
        expect(resolveJson.primaryColor?.toUpperCase()).toBe("#84CC16");
      }
      await expect(subPage.locator("body")).toContainText(/SCRIPE/i, { timeout: 15_000 });
      await safeScreenshot(subPage, "08-scripe-subdomain-login-en.png", true);

      // Sign in as scripeadmin on subdomain origin and verify landing + /tenants block
      await loginViaUi(
        subPage,
        SCRIPE_ADMIN_USERNAME,
        password,
        "http://scripe.localhost:3000/login"
      );
      expect(subPage.url()).not.toContain("/login");

      // Platform /tenants must be blocked for scripeadmin
      await subPage.goto("http://scripe.localhost:3000/tenants");
      await waitForAppSettled(subPage);
      expect(subPage.url()).not.toMatch(/\/tenants$/);

      subMonitor.assertClean("QA-03A Subdomain scripe.localhost login");
    } finally {
      subMonitor.detach();
      await subContext.close();
    }

    // Part B: Query login on http://localhost:3000/login?_tenant=SCRIPE & SCRIPE Workspace Tour
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    try {
      const queryResolvePromise = page
        .waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/customization/resolve") && res.ok(),
          { timeout: 15_000 }
        )
        .catch(() => null);
      await loginViaUi(
        page,
        SCRIPE_ADMIN_EMAIL,
        password,
        "http://localhost:3000/login?_tenant=SCRIPE"
      );
      const queryResolveRes = await queryResolvePromise;
      if (queryResolveRes) {
        const queryResolveJson = (await queryResolveRes.json()) as { name?: string };
        expect(queryResolveJson.name).toBe("SCRIPE");
      }
      await resetLanguageCookie(page, "en");
      await setTheme(page, "dark");

      // Verify reload keeps session and /tenants is blocked
      await page.reload();
      await waitForAppSettled(page);
      expect(page.url()).not.toContain("/login");

      await page.goto("http://localhost:3000/tenants");
      await waitForAppSettled(page);
      expect(page.url()).not.toContain("/login");
      expect(page.url()).not.toMatch(/\/tenants$/);

      // CRM Settings (EGP dynamic approval thresholds, stripped pipe_role: prefix, full-width card, zero duplicate 1. numbering)
      await page.goto("http://localhost:3000/crm/settings");
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/\bEGP\b/, { timeout: 20_000 });
      const firstRoleCard = page.locator("[data-testid^='crm-settings-pipeline-role-']").first();
      await expect(firstRoleCard).toBeVisible({ timeout: 15_000 });
      const roleCardsText = await page.locator("[data-testid^='crm-settings-pipeline-role-']").allInnerTexts();
      expect(roleCardsText.join(" ")).toMatch(/EGP/i);
      expect(roleCardsText.join(" ")).not.toContain("$");
      expect(roleCardsText.join(" ")).not.toContain("pipe_role:");
      await expect(page.locator("#nexus-content")).not.toContainText(/1\. CRM Pipeline Roles/i);
      await expect(page.locator("#nexus-content")).not.toContainText(/1\. Multi-Currency/i);
      await expect(
        page.locator("div.lg\\:col-span-12").filter({ hasText: /CRM Pipeline Roles & Approval Queues/i }).first()
      ).toBeVisible();
      await safeScreenshot(page, "09-scripe-workspace-crm-settings-egp-en.png", true);

      // CRM Opportunities (EGP seeded B2B deals across multiple DISTINCT seeded Egyptian club accounts)
      await page.goto("http://localhost:3000/crm/opportunities");
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(
        /Nile Sporting Ventures|Egyptian Federation of Padel|Pyramids Sports Academy|Red Sea Resorts|Gezira Heritage/i,
        { timeout: 20_000 }
      );
      await expect(page.locator("body")).toContainText(/\bEGP\b/);
      const dealRows = page.locator("tbody tr");
      const rowCount = await dealRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(2);
      const accountNamesInRows = new Set<string>();
      for (let i = 0; i < rowCount; i++) {
        const accountText = await dealRows.nth(i).locator("td").nth(4).innerText().catch(() => "");
        if (accountText.trim()) accountNamesInRows.add(accountText.trim());
      }
      expect(
        accountNamesInRows.size,
        `CRM Opportunities must display multiple DISTINCT club accounts (saw: ${Array.from(accountNamesInRows).join(", ")})`
      ).toBeGreaterThanOrEqual(2);
      await assertNoHorizontalOverflow(page, "SCRIPE CRM Opportunities (1440x900)");
      await safeScreenshot(page, "10-scripe-workspace-crm-opportunities-egp-en.png", true);

      // CRM Leads
      await page.goto("http://localhost:3000/crm/leads");
      await waitForAppSettled(page);
      await expect(page.locator("body")).toContainText(
        /Cairo Padel Collective|Maadi FC|Egyptian Federation of Padel/i,
        { timeout: 20_000 }
      );

      // Venue Facilities (SCRIPE Demo Arena)
      await page.goto("http://localhost:3000/venue/facilities");
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/SCRIPE Demo Arena/i, { timeout: 20_000 });
      await safeScreenshot(page, "11-scripe-workspace-venue-demo-arena-en.png", true);

      // Venue Calendar in Arabic RTL (verify end-of-day 16:00+ slots & zero main horizontal overflow)
      await page.goto("http://localhost:3000/venue/calendar");
      await waitForAppSettled(page);
      await setLanguageAndReload(page, "ar");
      await setTheme(page, "dark");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("body")).toContainText(/[\u0600-\u06FF]/);
      const timeline = page.getByTestId("resource-timeline");
      await expect(timeline).toBeVisible({ timeout: 20_000 });
      await expect(timeline).toContainText(/16:00/);
      await assertNoHorizontalOverflow(page, "SCRIPE Venue Calendar Arabic RTL (1440x900)");
      await safeScreenshot(page, "12-scripe-workspace-venue-ar-rtl.png", true);
      await setLanguageAndReload(page, "en");

      // Unlimited -1 quota rendering on /account/plan & /my-subscription
      await page.goto("http://localhost:3000/account/plan");
      await waitForAppSettled(page);
      await expect(page.locator("body")).toContainText(/scripe-internal/i, { timeout: 20_000 });
      await expect(page.locator("body")).toContainText(/Unlimited/i);

      await page.goto("http://localhost:3000/my-subscription");
      await waitForAppSettled(page);
      if (page.url().includes("/my-subscription")) {
        await expect(page.locator("body")).toContainText(/scripe-internal/i, { timeout: 20_000 });
      } else {
        // Commercial self-service /my-subscription is intentionally gated off internal tenant menus;
        // RouteGuard falls back to an authorized workspace without errors.
        expect(page.url()).not.toContain("/login");
      }

      monitor.assertClean("QA-03B SCRIPE Workspace CRM, Venue & Unlimited Quotas");
    } finally {
      monitor.detach();
      await context.close();
    }
  });

  // =========================================================================
  // QA-04: Force-Change-Password 12-Char UI + Logout Cookie Revocation
  // =========================================================================
  test("QA-04 — Disposable commercial admin MustChangePassword 12-char checklist, EN+AR screenshots, and logout cookie/refresh revocation", async ({
    browser,
    request,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    let createdId: string | null = null;
    try {
      const ahlySession = await loginViaApi(request, AHLY_ADMIN_EMAIL, password);
      const rolesRes = await request.get(`${API_URL}/api/v1/roles/current-tenant`, {
        headers: { Authorization: `Bearer ${ahlySession.accessToken}` },
      });
      let roleIds: string[] = [];
      if (rolesRes.ok()) {
        const rolesBody = (await rolesRes.json()) as
          | Array<{ id?: string; priority?: number; name?: string }>
          | { items?: Array<{ id?: string; priority?: number; name?: string }> };
        const list = Array.isArray(rolesBody) ? rolesBody : (rolesBody.items ?? []);
        const role =
          list.find((r) => typeof r.priority === "number" && r.priority > 0) ?? list[0];
        if (role?.id) roleIds = [role.id];
      }

      const mcpUsername = `qa_mcp_${runTag}`;
      const mcpEmail = `qa.mcp.${runTag}@scripe-dev.local`;
      const createRes = await request.post(`${API_URL}/api/v1/admins/current-tenant`, {
        headers: mutationHeaders(ahlySession.accessToken),
        data: {
          username: mcpUsername,
          password,
          firstName: "QA",
          lastName: "MustChange",
          phoneNumber: "+201055501777",
          email: mcpEmail,
          notes: "Disposable admin for force-change-password and logout verification",
          roleIds,
          userGroupIds: [],
          sendSetupEmail: false,
          mustChangePassword: true,
        },
      });
      expect(
        createRes.ok(),
        `Failed creating disposable admin: ${createRes.status()}`
      ).toBeTruthy();
      const createdBody = (await createRes.json()) as { id: string };
      createdId = createdBody.id;
      createdAhlyAdminIds.push(createdId);

      // Sign in via UI -> verify redirect to /change-password
      await clearBrowserSession(page);
      await loginViaUi(page, mcpEmail, password, "http://localhost:3000/login");
      await page.waitForURL((url) => url.pathname.includes("/change-password"), { timeout: 20_000 });
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      const newInput = page.getByTestId("force-new-password");
      const confirmInput = page.getByTestId("force-confirm-password");
      const submitBtn = page.getByTestId("force-change-submit");
      const minLenRule = page.getByTestId("pwd-rule-minLength");

      await expect(newInput).toBeVisible();
      await expect(minLenRule).toBeVisible();

      // < 12 chars fails minLength rule checklist
      const shortPassword = `${password}A1!`;
      expect(shortPassword.length).toBeLessThan(12);
      await newInput.fill(shortPassword);
      await confirmInput.fill(shortPassword);
      await expect(minLenRule).toHaveAttribute("data-met", "false");
      await expect(submitBtn).toBeDisabled();

      // >= 12 chars passes minLength + complexity rules
      const longPassword = `${password}Aa1!99`;
      expect(longPassword.length).toBeGreaterThanOrEqual(12);
      await newInput.fill(longPassword);
      await confirmInput.fill(longPassword);
      await expect(minLenRule).toHaveAttribute("data-met", "true");
      await expect(submitBtn).toBeEnabled();

      // Verify ForceChangePasswordView header with brand + theme/language switchers
      const fcpHeader = page.locator("header").first();
      await expect(fcpHeader).toBeVisible();
      await expect(fcpHeader).toContainText(/SCRIPE/);
      expect(await fcpHeader.locator("button").count()).toBeGreaterThanOrEqual(2);

      await safeScreenshot(page, "15-force-change-password-en.png", true);

      // Capture Arabic RTL view on /change-password
      await setLanguageAndReload(page, "ar");
      await setTheme(page, "dark");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("header").first()).toContainText(/SCRIPE/);
      await page.getByTestId("force-new-password").fill(longPassword);
      await page.getByTestId("force-confirm-password").fill(longPassword);
      await expect(page.getByTestId("pwd-rule-minLength")).toHaveAttribute("data-met", "true");
      await safeScreenshot(page, "16-force-change-password-ar-rtl.png", true);
      await setLanguageAndReload(page, "en");

      // Snapshot httpOnly refresh cookie before logout so we can verify server-side DB revocation
      // Runtime BrandingSettings.RefreshTokenCookie resolves to "${CookiePrefix}_refresh_token" ("scripe_refresh_token")
      const isRefreshCookieName = (name: string) =>
        name === "scripe_refresh_token" || name === "scr_refresh_token" || name.endsWith("_refresh_token");
      const cookiesBeforeLogout = await context.cookies();
      const preLogoutRefreshCookie = cookiesBeforeLogout.find(
        (c) => isRefreshCookieName(c.name) && c.value.length > 0
      );
      expect(
        preLogoutRefreshCookie,
        `Refresh token cookie must exist before logout (found: ${cookiesBeforeLogout.map((c) => c.name).join(", ")})`
      ).toBeTruthy();

      // Click [data-testid="force-change-logout"] and verify real logout + cookie/refresh revocation
      const logoutResPromise = page.waitForResponse(
        (res) =>
          res.request().method() === "POST" &&
          res.url().toLowerCase().includes("/api/v1/auth/") &&
          res.url().toLowerCase().includes("/logout"),
        { timeout: 25_000 }
      );
      await page.getByTestId("force-change-logout").click();
      const logoutRes = await logoutResPromise;
      expect(
        logoutRes.status(),
        `Logout endpoint ${logoutRes.url()} must return 2xx`
      ).toBeGreaterThanOrEqual(200);
      expect(logoutRes.status()).toBeLessThan(300);

      await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 20_000 });
      await waitForAppSettled(page);

      // Verify auth refresh cookies are cleared across all browser origins/paths
      const cookiesAfterLogout = await context.cookies();
      const refreshCookie = cookiesAfterLogout.find(
        (c) => isRefreshCookieName(c.name) && c.value.length > 0
      );
      expect(refreshCookie, "Refresh token cookie must be cleared on logout").toBeUndefined();

      // Verify browser refresh call using cleared context fails (400/401 — no cookie sent)
      const emptyRefreshRes = await context.request.post(`${API_URL}/api/v1/auth/admin/refresh`, {
        data: {},
      });
      expect([400, 401]).toContain(emptyRefreshRes.status());

      // Verify replaying the old refresh token directly fails with 401 (server-side revocation)
      if (preLogoutRefreshCookie?.value) {
        const replayRefreshRes = await request.post(`${API_URL}/api/v1/auth/admin/refresh`, {
          data: { refreshToken: preLogoutRefreshCookie.value },
        });
        expect(
          replayRefreshRes.status(),
          "Replaying revoked refresh token after logout must fail with 401"
        ).toBe(401);
      }

      // Verify navigating to protected routes redirects to /login
      for (const protectedPath of ["/overview", "/account"]) {
        await page.goto(`http://localhost:3000${protectedPath}`);
        await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 15_000 });
      }

      monitor.assertClean("QA-04 Force Change Password & Logout Cookie Revocation");
    } finally {
      monitor.detach();
      await context.close();
      if (createdId) {
        try {
          const ahlySession = await loginViaApi(request, AHLY_ADMIN_EMAIL, password);
          await request.delete(`${API_URL}/api/v1/admins/${createdId}`, {
            headers: mutationHeaders(ahlySession.accessToken),
          });
        } catch {
          // handled by afterAll fallback
        }
      }
    }
  });

  // =========================================================================
  // QA-05: Public Signup, Reserved Subdomains, Register Guard & KPI Exclusion
  // =========================================================================
  test("QA-05 — Public signup editions/subdomain guards, /auth/user/register SCRIPE uniform rejection, and billing/analytics KPI exclusion", async ({
    browser,
    request,
  }) => {
    // 1. Live API checks for signup editions, reserved subdomains, and user/register uniformity
    const publicEditionsRes = await request.get(`${API_URL}/api/v1/auth/signup/editions`);
    expect(publicEditionsRes.ok()).toBeTruthy();
    const publicEditions = (await publicEditionsRes.json()) as Array<{
      id: string;
      name: string;
      scope?: string;
    }>;
    expect(
      publicEditions.some((e) => e.name === SCRIPE_EDITION_NAME || e.scope === "Internal"),
      "scripe-internal must NEVER appear in GET /api/v1/auth/signup/editions"
    ).toBe(false);

    const asciiSubRes = await request.get(
      `${API_URL}/api/v1/auth/signup/check-subdomain?subdomain=scripe`
    );
    expect(asciiSubRes.ok()).toBeTruthy();
    const asciiSubJson = (await asciiSubRes.json()) as {
      available: boolean;
      reason?: string | null;
    };
    expect(asciiSubJson.available).toBe(false);
    expect(["reserved", "taken"]).toContain(asciiSubJson.reason);

    const unicodeSubRes = await request.get(
      `${API_URL}/api/v1/auth/signup/check-subdomain?subdomain=${encodeURIComponent("ｓｃｒｉｐｅ")}`
    );
    expect(unicodeSubRes.ok()).toBeTruthy();
    const unicodeSubJson = (await unicodeSubRes.json()) as {
      available: boolean;
      reason?: string | null;
    };
    expect(unicodeSubJson.available).toBe(false);

    // Uniform rejection on POST /api/v1/auth/user/register for tenantCode: "SCRIPE"
    const regExistingRes = await sendSkippingRateLimit(() =>
      request.post(`${API_URL}/api/v1/auth/user/register`, {
        data: {
          username: SCRIPE_ADMIN_USERNAME,
          password: `${password}Aa1!99`,
          email: SCRIPE_ADMIN_EMAIL,
          phoneNumber: "+201055501234",
          tenantCode: SCRIPE_TENANT_CODE,
        },
      })
    );
    const regFakeRes = await sendSkippingRateLimit(() =>
      request.post(`${API_URL}/api/v1/auth/user/register`, {
        data: {
          username: `nonexistent_${runTag}`,
          password: `${password}Aa1!99`,
          email: `nonexistent.${runTag}@example.com`,
          phoneNumber: "+201055501235",
          tenantCode: SCRIPE_TENANT_CODE,
        },
      })
    );
    expect(regExistingRes.status()).toBe(regFakeRes.status());
    expect(regExistingRes.status()).toBeGreaterThanOrEqual(400);
    expect(regExistingRes.status()).toBeLessThan(500);
    expect(regExistingRes.status()).not.toBe(409);
    const existingBodyText = await regExistingRes.text();
    const fakeBodyText = await regFakeRes.text();
    expect(existingBodyText).toBe(fakeBodyText);

    // 2. Real browser /signup flow through WorkspaceStep for reserved/Unicode subdomain UI checks
    const signupContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const signupPage = await signupContext.newPage();
    const signupMonitor = attachZeroErrorMonitor(signupPage);

    try {
      const editionsUiPromise = signupPage
        .waitForResponse(
          (res) =>
            res.url().includes("/api/v1/auth/signup/editions") && res.request().method() === "GET",
          { timeout: 25_000 }
        )
        .catch(() => null);

      await signupPage.goto("http://localhost:3000/signup");
      await waitForAppSettled(signupPage);

      // Welcome -> Discovery
      await signupPage
        .getByRole("button", { name: /Get started|Start|ابدأ/i })
        .first()
        .click();
      await waitForAppSettled(signupPage);

      // Discovery -> Skip all to Plans ("Skip — show me the plans")
      await signupPage
        .getByRole("button", {
          name: /Skip all|Skip to plans|Skip — show me the plans|show me the plans|تخطي|تخطّي/i,
        })
        .first()
        .click();
      const editionsUiRes = await editionsUiPromise;
      if (editionsUiRes) {
        expect(editionsUiRes.ok()).toBeTruthy();
        const uiEditions = (await editionsUiRes.json()) as Array<{ name: string; scope?: string }>;
        expect(uiEditions.some((e) => e.name === SCRIPE_EDITION_NAME)).toBe(false);
      }
      await waitForAppSettled(signupPage);

      await expect(signupPage.locator("body")).not.toContainText(/SCRIPE Internal|scripe-internal/i);
      await expect(
        signupPage
          .locator("button")
          .filter({ hasText: /Get started free|Start Free|Start for free|Create free/i })
          .first()
      ).toBeVisible({ timeout: 20_000 });
      await setTheme(signupPage, "dark");
      await signupPage.waitForTimeout(500);
      await safeScreenshot(signupPage, "14b-public-signup-plan-picker-en.png", true);

      signupMonitor.assertClean("QA-05A Public Signup Plans & Edition Exclusion");
    } finally {
      signupMonitor.detach();
      await signupContext.close();
    }

    // 3. Superadmin /entitlements/billing-hub & /entitlements/analytics KPI exclusion
    const platformContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const platformPage = await platformContext.newPage();
    const platformMonitor = attachZeroErrorMonitor(platformPage);

    try {
      await loginViaUi(
        platformPage,
        PLATFORM_SUPERADMIN_EMAIL,
        password,
        "http://localhost:3000/login"
      );
      await resetLanguageCookie(platformPage, "en");
      await setTheme(platformPage, "dark");

      // API payload checks for commercial exclusion
      const authHeaders = { Authorization: `Bearer ${superadminToken}` };
      const [dashboardRes, subsRes, connectRes, eligibleRes, analyticsRes, healthRes] =
        await Promise.all([
          request.get(`${API_URL}/api/v1/billing/dashboard`, { headers: authHeaders }),
          request.get(`${API_URL}/api/v1/subscriptions?page=1&pageSize=50`, {
            headers: authHeaders,
          }),
          request.get(`${API_URL}/api/v1/stripe-connect/accounts?page=1&pageSize=50`, {
            headers: authHeaders,
          }),
          request.get(`${API_URL}/api/v1/stripe-connect/accounts/eligible-tenants`, {
            headers: authHeaders,
          }),
          request.get(`${API_URL}/api/v1/analytics/overview`, { headers: authHeaders }),
          request.get(`${API_URL}/api/v1/analytics/health?page=1&pageSize=50`, {
            headers: authHeaders,
          }),
        ]);

      expect(dashboardRes.ok()).toBeTruthy();
      const dashboardJson = await dashboardRes.json();
      expect(JSON.stringify(dashboardJson)).not.toContain(SCRIPE_EDITION_NAME);

      expect(subsRes.ok()).toBeTruthy();
      const subsJson = (await subsRes.json()) as {
        items?: Array<{ tenantId?: string; editionName?: string; tenantName?: string }>;
      };
      expect(
        (subsJson.items ?? []).some(
          (s) => s.tenantId === scripeEncryptedId || s.editionName === SCRIPE_EDITION_NAME
        )
      ).toBe(false);

      if (connectRes.ok()) {
        const connectText = await connectRes.text();
        expect(connectText).not.toContain(scripeEncryptedId);
      }
      if (eligibleRes.ok()) {
        const eligibleText = await eligibleRes.text();
        expect(eligibleText).not.toContain(scripeEncryptedId);
        expect(eligibleText).not.toMatch(/"code"\s*:\s*"SCRIPE"/);
      }

      expect(analyticsRes.ok()).toBeTruthy();
      expect(healthRes.ok()).toBeTruthy();
      const healthText = await healthRes.text();
      expect(healthText).not.toContain(scripeEncryptedId);

      // Navigate /entitlements/billing-hub
      await platformPage.goto("http://localhost:3000/entitlements/billing-hub");
      await waitForAppSettled(platformPage);
      await expect(platformPage.locator("body")).not.toContainText(SCRIPE_EDITION_NAME);

      // Navigate /entitlements/analytics and verify exclusion notice + KPI exclusion
      await platformPage.goto("http://localhost:3000/entitlements/analytics");
      await waitForAppSettled(platformPage);
      await setTheme(platformPage, "dark");
      await expect(platformPage.locator("body")).not.toContainText(SCRIPE_EDITION_NAME);
      await expect(platformPage.getByTestId("analytics-internal-exclusion-notice")).toBeVisible({
        timeout: 15_000,
      });
      await expect(platformPage.getByTestId("analytics-internal-exclusion-notice")).toContainText(
        /Commercial metrics exclude internal platform workspaces/i
      );
      await safeScreenshot(platformPage, "17-platform-analytics-kpi-exclusion-en.png", true);

      platformMonitor.assertClean("QA-05B Billing Hub & Analytics KPI Exclusion");
    } finally {
      platformMonitor.detach();
      await platformContext.close();
    }
  });

  // =========================================================================
  // QA-06: Mobile 390x844 Layout Audit (SCRIPE Workspace)
  // =========================================================================
  test("QA-06 — Mobile 390x844 responsive check with zero horizontal overflow", async ({
    browser,
  }) => {
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    const monitor = attachZeroErrorMonitor(mobilePage);

    try {
      await loginViaUi(
        mobilePage,
        SCRIPE_ADMIN_EMAIL,
        password,
        "http://localhost:3000/login?_tenant=SCRIPE"
      );
      await resetLanguageCookie(mobilePage, "en");
      await setTheme(mobilePage, "dark");

      await mobilePage.goto("http://localhost:3000/crm/opportunities");
      await waitForAppSettled(mobilePage);
      await setTheme(mobilePage, "dark");
      await assertNoHorizontalOverflow(mobilePage, "SCRIPE CRM Opportunities (390x844)");

      await mobilePage.goto("http://localhost:3000/venue/facilities");
      await waitForAppSettled(mobilePage);
      await setTheme(mobilePage, "dark");
      await expect(mobilePage.locator("body")).toContainText(/SCRIPE Demo Arena/i, {
        timeout: 20_000,
      });
      await assertNoHorizontalOverflow(mobilePage, "SCRIPE Venue Facilities (390x844)");

      // Verify scrollable TabsList stays bounded within 390px and responsive mobile nav drawer works
      const tabList = mobilePage.locator("[role='tablist']").first();
      await expect(tabList).toBeVisible();
      const tabBox = await tabList.boundingBox();
      expect(tabBox).toBeTruthy();
      expect(tabBox!.width).toBeLessThanOrEqual(390);
      const tabOverflowX = await tabList.evaluate((el) => getComputedStyle(el).overflowX);
      expect(["auto", "scroll"]).toContain(tabOverflowX);

      await safeScreenshot(mobilePage, "13-scripe-mobile-390x844-en.png", true);

      const mobileMenuToggle = mobilePage.locator("[data-nexus-topbar] button[aria-expanded]").first();
      await expect(mobileMenuToggle).toBeVisible();
      await mobileMenuToggle.click();
      await expect(mobileMenuToggle).toHaveAttribute("aria-expanded", "true");
      await mobilePage.keyboard.press("Escape");
      await expect(mobileMenuToggle).toHaveAttribute("aria-expanded", "false");

      await mobilePage.goto("http://localhost:3000/account/plan");
      await waitForAppSettled(mobilePage);
      await assertNoHorizontalOverflow(mobilePage, "SCRIPE Account Plan (390x844)");

      monitor.assertClean("QA-06 Mobile 390x844 SCRIPE Workspace");
    } finally {
      monitor.detach();
      await mobileContext.close();
    }
  });

  test("QA-05-Signup-Workspace-OTP — Public signup OTP advance to WorkspaceStep for reserved ASCII/Unicode subdomain UI & screenshot", async ({
    browser,
  }) => {
    const signupContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const signupPage = await signupContext.newPage();
    const signupMonitor = attachZeroErrorMonitor(signupPage);

    try {
      await signupPage.goto("http://localhost:3000/signup");
      await waitForAppSettled(signupPage);
      await setTheme(signupPage, "dark");

      await signupPage
        .getByRole("button", { name: /Get started|Start|ابدأ/i })
        .first()
        .click();
      await waitForAppSettled(signupPage);

      await signupPage
        .getByRole("button", {
          name: /Skip all|Skip to plans|Skip — show me the plans|show me the plans|تخطي|تخطّي/i,
        })
        .first()
        .click();
      await waitForAppSettled(signupPage);

      const freePlanBtn = signupPage
        .locator("button")
        .filter({ hasText: /Get started free|Start Free|Start for free|Create free/i })
        .first();
      await expect(freePlanBtn).toBeVisible({ timeout: 20_000 });
      await freePlanBtn.click();
      await waitForAppSettled(signupPage);

      const signupEmail = `qa.signup.${runTag}@scripe-test.local`;
      await signupPage.locator("#signup-fullname").fill("QA Signup Probe");
      await signupPage.locator("#signup-email").fill(signupEmail);
      await signupPage.locator("#signup-password").fill(`${password}Aa1!99`);
      await signupPage.locator("#signup-terms").click();

      for (let attempt = 0; attempt < 3; attempt++) {
        const sendOtpPromise = signupPage.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/signup/send-otp") &&
            res.request().method() === "POST",
          { timeout: 25_000 }
        );
        await signupPage.locator("form button[type='submit']").first().click();
        const sendOtpRes = await sendOtpPromise;
        if (sendOtpRes.status() === 429 && attempt < 2) {
          const retryAfter = Number(sendOtpRes.headers()["retry-after"] || "35");
          await signupPage.waitForTimeout(Math.min(Math.max(retryAfter, 5), 70) * 1000);
          continue;
        }
        expect(sendOtpRes.ok(), `send-otp failed with status ${sendOtpRes.status()}`).toBeTruthy();
        break;
      }
      await waitForAppSettled(signupPage);

      const otpCode = await readLatestSignupOtpFromLogs(signupEmail);
      const verifyOtpPromise = signupPage.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/signup/verify-otp") &&
          res.request().method() === "POST",
        { timeout: 25_000 }
      );
      await signupPage.locator("#signup-otp").fill(otpCode);
      const verifyOtpRes = await verifyOtpPromise;
      expect(verifyOtpRes.ok()).toBeTruthy();

      await expect(signupPage.locator("#signup-subdomain")).toBeVisible({ timeout: 20_000 });
      const autoSubCheckPromise = signupPage
        .waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/signup/check-subdomain") &&
            res.url().toLowerCase().includes("scripe-test-org"),
          { timeout: 10_000 }
        )
        .catch(() => null);
      await signupPage.locator("#signup-workspace").fill("SCRIPE Test Org");
      await autoSubCheckPromise;
      await signupPage.waitForTimeout(200);

      // Test NFKC full-width Unicode variant "ｓｃｒｉｐｅ"
      await signupPage.locator("#signup-subdomain").fill("ｓｃｒｉｐｅ");
      const statusRegion = signupPage.locator("#signup-subdomain-status");
      await expect(statusRegion.locator("[role='alert']")).toBeVisible({ timeout: 10_000 });
      await expect(statusRegion).toContainText(/invalid|unavailable|reserved|letter|digit/i, {
        timeout: 10_000,
      });

      // Test reserved ASCII subdomain "scripe" via live API check & capture screenshot
      const subCheckPromise = signupPage.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/signup/check-subdomain") &&
          res.url().toLowerCase().includes("subdomain=scripe"),
        { timeout: 25_000 }
      );
      await signupPage.locator("#signup-subdomain").fill("scripe");
      const subCheckRes = await subCheckPromise;
      expect(subCheckRes.ok()).toBeTruthy();
      const subCheckJson = (await subCheckRes.json()) as { available: boolean; reason?: string };
      expect(subCheckJson.available).toBe(false);
      await expect(statusRegion.locator("[role='alert']")).toBeVisible({ timeout: 10_000 });
      await expect(signupPage.locator("form button[type='submit']").first()).toBeDisabled();

      await safeScreenshot(signupPage, "14-public-signup-reserved-subdomain-blocked-en.png", true);
      signupMonitor.assertClean("QA-05-Signup-Workspace-OTP");
    } finally {
      signupMonitor.detach();
      await signupContext.close();
    }
  });

  test("QA-03-Subdomain-Reload — Subdomain scripe.localhost session persistence after reload", async ({
    browser,
  }) => {
    const subContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const subPage = await subContext.newPage();
    const monitor = attachZeroErrorMonitor(subPage);

    try {
      await loginViaUi(
        subPage,
        SCRIPE_ADMIN_USERNAME,
        password,
        "http://scripe.localhost:3000/login"
      );
      expect(subPage.url()).not.toContain("/login");

      const cookiesBeforeReload = await subContext.cookies();
      const subRefreshCookie = cookiesBeforeReload.find(
        (c) =>
          (c.name === "scripe_refresh_token" || c.name.endsWith("_refresh_token")) &&
          c.value.length > 0
      );
      expect(
        subRefreshCookie,
        `Subdomain login must persist refresh cookie across *.localhost (found: ${cookiesBeforeReload.map((c) => `${c.name}@${c.domain}`).join(", ")})`
      ).toBeTruthy();

      await subPage.reload();
      await waitForAppSettled(subPage);
      expect(subPage.url()).not.toContain("/login");

      monitor.assertClean("QA-03-Subdomain-Reload");
    } finally {
      monitor.detach();
      await subContext.close();
    }
  });
});
