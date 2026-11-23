import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  expect,
  test,
  type BrowserContext,
  type CDPSession,
  type Locator,
  type Page,
  type Response,
} from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const PSQL_EXE = process.env.PSQL_PATH || "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";
const API_BASE_URL = (process.env.E2E_API_URL || "http://localhost:5035").replace(/\/+$/, "");
const SCREENSHOT_DIR = path.resolve(
  process.env.E2E_SCREENSHOT_DIR ||
    "C:/Users/seifmoustafa/.gemini/antigravity/brain/ea30c2d9-eddd-4014-a7e2-2e8d39f0d02f/screenshots"
);
const BACKEND_LOCAL_SETTINGS = path.resolve(
  __dirname,
  "../../SCRIPE-Backend/src/Host/API/appsettings.local.json"
);

// Designated active seeded accounts verified in identity.admins (SCRIPE_UAT)
const PLATFORM_ADMIN_EMAIL = "admin-seif@scripe.org";
const PRO_ADMIN_EMAIL = "city.admin@scripe-dev.local";
const MANDATORY_MFA_ADMIN_EMAIL = "ahly.admin@scripe-dev.local";
const TARGET_PROTECTION_ADMIN_EMAIL = "opsadmin@scripe-dev.local";
const TARGET_IDP_SLUG = "microsoft";

interface RuntimeBackendConfig {
  refreshCookieName: string;
  oidcSessionCookieName: string;
  pgEnv: {
    PGHOST: string;
    PGPORT: string;
    PGDATABASE: string;
    PGUSER: string;
    PGPASSWORD: string;
  };
}

interface AdminSecuritySnapshot {
  id: string;
  email: string;
  is_two_factor_enabled: boolean;
  two_factor_secret: string | null;
  backup_codes_json: string | null;
  last_two_factor_code_used: string | null;
  last_two_factor_code_used_at: string | null;
  failed_login_attempts: number;
  lockout_end: string | null;
  is_active: boolean;
  password_hash: string;
  password_last_changed: string | null;
}

interface PasskeyDbRow {
  id: string;
  admin_id: string;
  credential_id: string;
  device_name: string;
  rp_id: string | null;
  registration_origin: string | null;
  is_deleted: boolean;
}

interface IdentityProviderSnapshot {
  id: string;
  slug: string;
  is_active: boolean;
}

/**
 * Strips JSONC line and block comments safely without corrupting URLs inside string literals.
 */
function stripJsonComments(raw: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (inLineComment) {
      if (ch === "\n" || ch === "\r") {
        inLineComment = false;
        out += ch;
      }
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      out += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }

    if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }

    out += ch;
  }

  return out;
}

function loadRuntimeBackendConfig(): RuntimeBackendConfig {
  if (!fs.existsSync(BACKEND_LOCAL_SETTINGS)) {
    throw new Error(`Missing backend local config at ${BACKEND_LOCAL_SETTINGS}`);
  }
  const parsed = JSON.parse(stripJsonComments(fs.readFileSync(BACKEND_LOCAL_SETTINGS, "utf8"))) as {
    Database?: { ConnectionString?: string };
    Branding?: { CookiePrefix?: string; RefreshTokenCookie?: string; OidcSessionCookie?: string };
  };

  const connStr = parsed.Database?.ConnectionString;
  if (!connStr) {
    throw new Error("appsettings.local.json must define Database.ConnectionString.");
  }

  const kv: Record<string, string> = {};
  for (const part of connStr.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      kv[part.slice(0, idx).trim().toLowerCase()] = part.slice(idx + 1).trim();
    }
  }

  const prefix = (parsed.Branding?.CookiePrefix || "scr").trim();
  return {
    refreshCookieName: parsed.Branding?.RefreshTokenCookie?.trim() || `${prefix}_refresh_token`,
    oidcSessionCookieName: parsed.Branding?.OidcSessionCookie?.trim() || `${prefix}.oidc.session`,
    pgEnv: {
      PGHOST: kv.host || kv.server || "localhost",
      PGPORT: kv.port || "5432",
      PGDATABASE: kv.database || "SCRIPE_UAT",
      PGUSER: kv.username || kv["user id"] || "postgres",
      PGPASSWORD: kv.password || "",
    },
  };
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function queryPgJson<T>(cfg: RuntimeBackendConfig, sql: string): T[] {
  const wrapped = `SELECT COALESCE(json_agg(t), '[]'::json)::text FROM (${sql}) t;`;
  const raw = execFileSync(
    PSQL_EXE,
    ["-X", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", wrapped],
    {
      env: { ...process.env, ...cfg.pgEnv },
      encoding: "utf8",
    }
  ).trim();
  return raw ? (JSON.parse(raw) as T[]) : [];
}

function execPg(cfg: RuntimeBackendConfig, sql: string): void {
  execFileSync(PSQL_EXE, ["-X", "-v", "ON_ERROR_STOP=1", "-c", sql], {
    env: { ...process.env, ...cfg.pgEnv },
    encoding: "utf8",
  });
}

function decodeBase32(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const ch of cleaned) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates an RFC 6238 SHA-1 6-digit TOTP code from a Base32 setup secret returned by `/2fa/enable`.
 */
function generateTotpCode(base32Secret: string, timestampMs = Date.now()): string {
  const key = decodeBase32(base32Secret);
  const counter = Math.floor(timestampMs / 1000 / 30);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter), 0);

  const hmac = createHmac("sha1", key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1_000_000).padStart(6, "0");
}

function unwrapApiData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in (json as Record<string, unknown>)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

async function waitForAppSettled(page: Page, allowRoot = false): Promise<void> {
  await page.waitForFunction(
    (allowRootPath) => {
      const text = document.body?.innerText || "";
      if (!text.trim()) return false;
      const stillLoading =
        text.includes("Preparing your workspace") ||
        text.includes("getting everything ready for you") ||
        text.includes("جاري تجهيز مساحة العمل") ||
        text.includes("نحن نقوم بتجهيز");
      if (stillLoading) return false;
      if (!allowRootPath && window.location.pathname === "/") return false;
      return Boolean(
        document.querySelector(
          "main, #hub-content, #nexus-content, aside, #identifier, [data-testid='mfa-enrollment-required-banner'], [data-testid='mfa-enroll-locked-controls-notice']"
        )
      );
    },
    allowRoot,
    { timeout: 30_000 }
  );
}

async function resetBrowserSession(page: Page, lang: "en" | "ar" = "en"): Promise<void> {
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate((targetLang) => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage access errors in restricted browsing contexts
    }
    localStorage.setItem("scr_lang", targetLang);
    localStorage.setItem("scr_pref_lang", targetLang);
    localStorage.setItem("theme", "dark");
    document.cookie = `scr_lang=${targetLang}; path=/; SameSite=Lax`;
  }, lang);
}

async function switchUiLanguage(page: Page, target: "ar" | "en"): Promise<void> {
  const trigger = page
    .locator('button[aria-label="Change language"], button[aria-label="تغيير اللغة"]')
    .first();
  await expect(trigger).toBeVisible({ timeout: 10_000 });
  await trigger.click();
  const optionText = target === "ar" ? "العربية" : "English";
  await page.getByRole("menuitemradio", { name: optionText }).click();
  await expect(page.locator("[dir]").first()).toHaveAttribute(
    "dir",
    target === "ar" ? "rtl" : "ltr",
    { timeout: 10_000 }
  );
  await expect(page.getByRole("menu")).toBeHidden({ timeout: 5_000 }).catch(() => undefined);
  await page.waitForTimeout(150);
}

async function loginViaUi(
  page: Page,
  email: string,
  password: string,
  options: { expectPath?: RegExp } = {}
): Promise<{ payload: Record<string, unknown> }> {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await waitForAppSettled(page, true);
  await expect(page.locator("#identifier")).toBeVisible({ timeout: 20_000 });

  await page.locator("#identifier").fill(email);
  await page.locator("#password").fill(password);

  const loginResPromise = page.waitForResponse(
    (res) =>
      res.url().toLowerCase().includes("/api/v1/auth/admin/login") &&
      res.request().method() === "POST",
    { timeout: 25_000 }
  );
  await page.locator("form button[type='submit']").first().click();
  const loginRes = await loginResPromise;
  expect(loginRes.status(), `Expected 200 login for ${email}, got ${loginRes.status()}`).toBe(200);

  const payload = unwrapApiData<Record<string, unknown>>(await loginRes.json());
  if (options.expectPath) {
    await page.waitForURL(options.expectPath, { timeout: 30_000 });
  } else {
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
  }
  await waitForAppSettled(page);
  return { payload };
}

async function logoutViaUi(page: Page): Promise<{ requestBody: string | null; status: number }> {
  const userMenuTrigger = page
    .locator(
      "nav button[aria-haspopup='menu'], aside button[aria-haspopup='menu'], header button[aria-haspopup='menu']"
    )
    .last();
  await expect(userMenuTrigger).toBeVisible({ timeout: 15_000 });
  await userMenuTrigger.click();

  const logoutPromise = page.waitForResponse(
    (res) =>
      res.url().toLowerCase().includes("/api/v1/auth/admin/logout") &&
      res.request().method() === "POST",
    { timeout: 20_000 }
  );
  await page
    .getByRole("menuitem", { name: /sign out|logout|تسجيل الخروج/i })
    .first()
    .click();
  const res = await logoutPromise;
  expect(res.ok(), `Logout endpoint returned ${res.status()}`).toBeTruthy();
  const requestBody = res.request().postData();
  await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 25_000 });
  await waitForAppSettled(page, true);
  return { requestBody, status: res.status() };
}

async function assertNoHorizontalOverflow(page: Page, label: string): Promise<void> {
  const overflow = await page.evaluate(() => {
    const violations: string[] = [];
    if (document.documentElement.scrollWidth > window.innerWidth + 1) {
      violations.push(
        `documentElement(${document.documentElement.scrollWidth}>${window.innerWidth})`
      );
    }
    document.querySelectorAll('.sx-screen, [role="dialog"], main, form').forEach((el, idx) => {
      if (el instanceof HTMLElement && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className ? `.${String(el.className).trim().split(/\s+/)[0]}` : "";
        violations.push(`${tag}${cls}[${idx}](${el.scrollWidth}>${el.clientWidth})`);
      }
    });
    return violations;
  });
  expect(
    overflow,
    `Horizontal overflow detected in ${label}: ${overflow.join(", ")}`
  ).toEqual([]);
}

async function capturePng(page: Page, filename: string): Promise<void> {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, filename),
    fullPage: true,
  });
}

function attachRuntimeErrorMonitor(page: Page) {
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];
  const forbiddenResponses: string[] = [];
  const onPageError = (err: Error) => pageErrors.push(err.message);
  const onResponse = (res: Response) => {
    if (!res.url().includes("/api/")) return;
    if (res.status() >= 500) {
      serverErrors.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    } else if (res.status() === 403) {
      forbiddenResponses.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    }
  };
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  return {
    getForbiddenResponses: () => [...forbiddenResponses],
    clearForbiddenResponses: () => {
      forbiddenResponses.length = 0;
    },
    assertClean(label: string) {
      expect(pageErrors, `Uncaught pageerrors in ${label}`).toEqual([]);
      expect(serverErrors, `5xx API errors in ${label}`).toEqual([]);
    },
    dispose() {
      page.off("pageerror", onPageError);
      page.off("response", onResponse);
    },
  };
}

async function submitSudoPassword(page: Page, password: string): Promise<void> {
  const modal = page.getByTestId("sudo-verification-modal");
  await expect(modal).toBeVisible({ timeout: 15_000 });
  const pwdTab = modal.getByTestId("sudo-tab-password");
  if ((await pwdTab.count()) > 0) {
    await pwdTab.click();
  }
  const pwdInput = modal.getByTestId("sudo-password-input");
  await expect(pwdInput).toBeVisible({ timeout: 10_000 });
  await pwdInput.fill(password);

  const verifyPromise = page.waitForResponse(
    (res) =>
      res.url().toLowerCase().includes("/api/v1/auth/sudo/verify") &&
      res.request().method() === "POST",
    { timeout: 20_000 }
  );
  await modal.getByTestId("sudo-verify-submit-btn").click();
  const verifyRes = await verifyPromise;
  expect(verifyRes.status(), `Password Sudo verify returned ${verifyRes.status()}`).toBe(200);
  await expect(modal).toBeHidden({ timeout: 15_000 });
}

async function submitSudoPasskey(page: Page): Promise<void> {
  const modal = page.getByTestId("sudo-verification-modal");
  await expect(modal).toBeVisible({ timeout: 15_000 });
  await expect(modal.getByTestId("sudo-policy-badge")).toContainText(/passkey/i, {
    timeout: 10_000,
  });
  await expect(modal.getByTestId("sudo-panel-passkey")).toBeVisible({ timeout: 10_000 });

  const beginPromise = page.waitForResponse(
    (res) =>
      res.url().toLowerCase().includes("/api/v1/auth/sudo/passkey/begin") &&
      res.request().method() === "POST",
    { timeout: 20_000 }
  );
  const verifyPromise = page.waitForResponse(
    (res) =>
      res.url().toLowerCase().includes("/api/v1/auth/sudo/verify") &&
      res.request().method() === "POST",
    { timeout: 20_000 }
  );
  await modal.getByTestId("sudo-verify-submit-btn").click();
  const [beginRes, verifyRes] = await Promise.all([beginPromise, verifyPromise]);
  expect(beginRes.status(), `Passkey Sudo begin returned ${beginRes.status()}`).toBe(200);
  expect(verifyRes.status(), `Passkey Sudo verify returned ${verifyRes.status()}`).toBe(200);
  await expect(modal).toBeHidden({ timeout: 15_000 });
}

async function cancelSudoModal(page: Page): Promise<void> {
  const modal = page.getByTestId("sudo-verification-modal");
  await expect(modal).toBeVisible({ timeout: 15_000 });
  await modal.getByRole("button", { name: /^Cancel$|^إلغاء$/i }).first().click();
  await expect(modal).toBeHidden({ timeout: 10_000 });
}

async function assertNoSpuriousErrorToasts(page: Page, contextLabel: string): Promise<void> {
  await page.waitForTimeout(350);
  const toastAlerts = await page.evaluate(() => {
    const suspicious: string[] = [];
    const selectors = [
      "[data-sileo-toast]",
      "[data-sonner-toast]",
      "[role='status']",
      "[role='alert']",
    ].join(", ");
    document.querySelectorAll(selectors).forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const text = (el.innerText || "").trim();
      if (!text) return;
      if (
        /sudo verification was cancelled|sudo session (locked|reset)|sudo.?required|identity\.sudorequired|update failed|action failed|forbidden|unexpected error/i.test(
          text
        )
      ) {
        suspicious.push(text);
      }
    });
    return suspicious;
  });
  expect(
    toastAlerts,
    `Unexpected Sudo-cancel error toast(s) in ${contextLabel}: ${toastAlerts.join(" | ")}`
  ).toEqual([]);
}

async function attachVirtualPasskeyAuthenticator(
  page: Page
): Promise<{
  cdp: CDPSession;
  authenticatorId: string;
  dispose: () => Promise<void>;
}> {
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

  return {
    cdp,
    authenticatorId,
    async dispose() {
      await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId }).catch(() => undefined);
      await cdp.send("WebAuthn.disable").catch(() => undefined);
      await cdp.detach().catch(() => undefined);
    },
  };
}

function getRefreshCookie(
  cookies: Awaited<ReturnType<BrowserContext["cookies"]>>,
  cfg: RuntimeBackendConfig
) {
  return cookies.find(
    (c) =>
      c.name === cfg.refreshCookieName ||
      c.name === "scr_refresh_token" ||
      c.name === "scripe_refresh_token"
  );
}

test.describe.serial(
  "Central Identity Federation, Passkeys, Sudo Step-Up & Account Security Certification",
  () => {
    let cfg: RuntimeBackendConfig;
    let devPassword: string;
    let adminSnapshots: Record<string, AdminSecuritySnapshot> = {};
    let baselinePasskeyIds: string[] = [];
    let providerSnapshots: Record<string, IdentityProviderSnapshot> = {};

    function restoreCleanDatabaseState(): void {
      if (!cfg) return;
      const touchedEmails = [
        PLATFORM_ADMIN_EMAIL,
        PRO_ADMIN_EMAIL,
        MANDATORY_MFA_ADMIN_EMAIL,
        TARGET_PROTECTION_ADMIN_EMAIL,
      ];
      const touchedIds = Object.values(adminSnapshots).map((s) => `${sqlLiteral(s.id)}::uuid`);

      if (touchedIds.length > 0) {
        if (baselinePasskeyIds.length > 0) {
          const keepClause = baselinePasskeyIds.map((id) => `${sqlLiteral(id)}::uuid`).join(", ");
          execPg(
            cfg,
            `DELETE FROM identity.admin_passkeys WHERE admin_id IN (${touchedIds.join(", ")}) AND id NOT IN (${keepClause});`
          );
        } else {
          execPg(
            cfg,
            `DELETE FROM identity.admin_passkeys WHERE admin_id IN (${touchedIds.join(", ")});`
          );
        }

        execPg(
          cfg,
          `DELETE FROM identity.web_authn_challenges WHERE admin_id IN (${touchedIds.join(", ")});
           DELETE FROM identity.refresh_tokens WHERE admin_id IN (${touchedIds.join(", ")});`
        );
      }

      for (const email of touchedEmails) {
        const snap = adminSnapshots[email.toLowerCase()];
        if (!snap) continue;
        const twoFaSecretClause = snap.two_factor_secret ? sqlLiteral(snap.two_factor_secret) : "NULL";
        const backupCodesClause = snap.backup_codes_json ? sqlLiteral(snap.backup_codes_json) : "NULL";
        const lastUsedCodeClause = snap.last_two_factor_code_used
          ? sqlLiteral(snap.last_two_factor_code_used)
          : "NULL";
        const lastUsedAtClause = snap.last_two_factor_code_used_at
          ? `${sqlLiteral(snap.last_two_factor_code_used_at)}::timestamptz`
          : "NULL";
        const pwdChangedClause = snap.password_last_changed
          ? `${sqlLiteral(snap.password_last_changed)}::timestamptz`
          : "NULL";

        execPg(
          cfg,
          `UPDATE identity.admins
           SET is_two_factor_enabled = ${snap.is_two_factor_enabled ? "true" : "false"},
               two_factor_secret = ${twoFaSecretClause},
               backup_codes_json = ${backupCodesClause},
               last_two_factor_code_used = ${lastUsedCodeClause},
               last_two_factor_code_used_at = ${lastUsedAtClause},
               failed_login_attempts = 0,
               lockout_end = NULL,
               is_active = ${snap.is_active ? "true" : "false"},
               password_hash = ${sqlLiteral(snap.password_hash)},
               password_last_changed = ${pwdChangedClause}
           WHERE id = ${sqlLiteral(snap.id)}::uuid;`
        );
      }

      for (const provider of Object.values(providerSnapshots)) {
        execPg(
          cfg,
          `UPDATE identity.identity_providers
           SET is_active = ${provider.is_active ? "true" : "false"}
           WHERE id = ${sqlLiteral(provider.id)}::uuid;`
        );
      }
    }

    test.beforeAll(() => {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      cfg = loadRuntimeBackendConfig();
      devPassword = getDevAdminPassword();

      const targetEmails = [
        PLATFORM_ADMIN_EMAIL,
        PRO_ADMIN_EMAIL,
        MANDATORY_MFA_ADMIN_EMAIL,
        TARGET_PROTECTION_ADMIN_EMAIL,
      ];
      const rows = queryPgJson<AdminSecuritySnapshot>(
        cfg,
        `SELECT id::text,
                lower(email) AS email,
                is_two_factor_enabled,
                two_factor_secret,
                backup_codes_json,
                last_two_factor_code_used,
                last_two_factor_code_used_at::text,
                failed_login_attempts,
                lockout_end::text,
                is_active,
                password_hash,
                password_last_changed::text
         FROM identity.admins
         WHERE lower(email) IN (${targetEmails.map(sqlLiteral).join(", ")}) AND is_deleted = false`
      );
      for (const row of rows) {
        adminSnapshots[row.email] = row;
      }
      for (const email of targetEmails) {
        expect(
          adminSnapshots[email.toLowerCase()],
          `Seeded admin missing in SCRIPE_UAT: ${email}`
        ).toBeTruthy();
      }

      const ids = Object.values(adminSnapshots).map((s) => `${sqlLiteral(s.id)}::uuid`);
      const existingPasskeys = queryPgJson<{ id: string }>(
        cfg,
        `SELECT id::text FROM identity.admin_passkeys WHERE admin_id IN (${ids.join(", ")})`
      );
      baselinePasskeyIds = existingPasskeys.map((row) => row.id);

      const idps = queryPgJson<IdentityProviderSnapshot>(
        cfg,
        `SELECT id::text, slug, is_active FROM identity.identity_providers WHERE is_deleted = false AND lower(slug) IN (${sqlLiteral(TARGET_IDP_SLUG)})`
      );
      for (const idp of idps) {
        providerSnapshots[idp.slug.toLowerCase()] = idp;
      }
      expect(
        providerSnapshots[TARGET_IDP_SLUG],
        `Seeded identity provider '${TARGET_IDP_SLUG}' missing in SCRIPE_UAT`
      ).toBeTruthy();

      restoreCleanDatabaseState();
    });

    test.afterEach(() => {
      restoreCleanDatabaseState();
    });

    test.afterAll(() => {
      restoreCleanDatabaseState();
    });

    test("1. CDP WebAuthn Passkey lifecycle: enroll, passwordless passkey sign-in, biometric Sudo rename/delete, and filtered-index re-registration", async ({
      page,
    }) => {
      const monitor = attachRuntimeErrorMonitor(page);
      const authenticator = await attachVirtualPasskeyAuthenticator(page);

      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await resetBrowserSession(page, "en");
        await loginViaUi(page, PRO_ADMIN_EMAIL, devPassword);

        await page.goto("/account/security", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);
        await expect(page.getByTestId("open-enroll-passkey-btn")).toBeVisible({ timeout: 15_000 });

        // Step A: Enroll first Passkey via CDP Virtual Authenticator (triggers password Sudo first)
        await page.getByTestId("open-enroll-passkey-btn").click();
        await expect(page.getByTestId("passkey-option-platform")).toBeVisible({ timeout: 10_000 });
        await page.getByTestId("passkey-option-platform").click();

        const nameInput = page.getByTestId("passkey-name-input");
        await expect(nameInput).toBeVisible({ timeout: 10_000 });
        await nameInput.fill("E2E Workstation Passkey");

        const regBeginPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/passkeys/registration/begin") &&
            res.request().method() === "POST",
          { timeout: 25_000 }
        );
        const regCompletePromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/passkeys/registration/complete") &&
            res.request().method() === "POST",
          { timeout: 25_000 }
        );

        await page.getByTestId("passkey-activate-btn").click();
        await submitSudoPassword(page, devPassword);

        const [regBeginRes, regCompleteRes] = await Promise.all([
          regBeginPromise,
          regCompletePromise,
        ]);
        expect(regBeginRes.status()).toBe(200);
        expect(regCompleteRes.status()).toBe(200);

        const regOptions = unwrapApiData<Record<string, unknown>>(await regBeginRes.json());
        const authSelection = regOptions.authenticatorSelection as
          | Record<string, unknown>
          | undefined;
        expect(["required", "preferred"]).toContain(
          String(authSelection?.userVerification || "").toLowerCase()
        );
        expect(authSelection?.userVerification).not.toBe("discouraged");
        expect(regOptions.rpId).toBe("localhost");

        await expect(page.getByTestId("passkey-done-btn")).toBeVisible({ timeout: 15_000 });
        await page.getByTestId("passkey-done-btn").click();

        const proAdminId = adminSnapshots[PRO_ADMIN_EMAIL.toLowerCase()].id;
        const activeRows = queryPgJson<PasskeyDbRow>(
          cfg,
          `SELECT id::text, admin_id::text, credential_id, device_name, rp_id, registration_origin, is_deleted
           FROM identity.admin_passkeys
           WHERE admin_id = ${sqlLiteral(proAdminId)}::uuid AND is_deleted = false`
        );
        expect(activeRows.length).toBe(1);
        expect(activeRows[0].device_name).toBe("E2E Workstation Passkey");
        expect(activeRows[0].rp_id).toBe("localhost");
        expect(activeRows[0].registration_origin).toBe("http://localhost:3000");

        const firstPasskeyRow = page.locator("[data-testid^='passkey-row-']").first();
        await expect(firstPasskeyRow).toBeVisible({ timeout: 15_000 });
        await expect(firstPasskeyRow).toContainText("E2E Workstation Passkey");
        await capturePng(page, "track2-01-passkey-enrolled-vault-en-desktop.png");

        // Step B: Sign out and sign back IN passwordlessly using Passkey
        await logoutViaUi(page);
        await expect(page.getByTestId("login-passkey-chip")).toBeVisible({ timeout: 15_000 });
        await page.getByTestId("login-passkey-chip").click();

        const authBeginPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/passkeys/authentication/begin") &&
            res.request().method() === "POST",
          { timeout: 25_000 }
        );
        const authVerifyPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/passkeys/authentication/verify") &&
            res.request().method() === "POST",
          { timeout: 25_000 }
        );

        await expect(page.getByTestId("passkey-authenticate-btn")).toBeVisible({ timeout: 10_000 });
        await page.getByTestId("passkey-authenticate-btn").click();

        const [authBeginRes, authVerifyRes] = await Promise.all([
          authBeginPromise,
          authVerifyPromise,
        ]);
        expect(authBeginRes.status()).toBe(200);
        expect(authVerifyRes.status()).toBe(200);

        await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
        await waitForAppSettled(page);

        // Step C: Rename Passkey using Biometric Passkey Sudo enforcement (PasskeyRequired)
        await page.goto("/account/security", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);

        const renameBtn = page.locator("[data-testid^='rename-passkey-btn-']").first();
        await expect(renameBtn).toBeVisible({ timeout: 15_000 });
        await renameBtn.click();

        await expect(page.locator("#rename-passkey-input")).toBeVisible({ timeout: 10_000 });
        await page.locator("#rename-passkey-input").fill("Renamed E2E Authenticator");

        const renamePatchPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/passkeys/") &&
            res.url().toLowerCase().endsWith("/name") &&
            res.request().method() === "PATCH",
          { timeout: 25_000 }
        );
        await page
          .locator("[role='dialog']")
          .last()
          .locator("button[type='submit']")
          .click();

        await submitSudoPasskey(page);
        const renameRes = await renamePatchPromise;
        expect(renameRes.status()).toBe(200);
        await expect(page.locator("[data-testid^='passkey-row-']").first()).toContainText(
          "Renamed E2E Authenticator",
          { timeout: 15_000 }
        );

        // Step D: Delete Passkey using active Passkey Sudo session & verify soft delete
        const deleteBtn = page.locator("[data-testid^='delete-passkey-btn-']").first();
        await deleteBtn.click();
        const confirmDeleteBtn = page.getByTestId("confirm-delete-passkey-btn");
        await expect(confirmDeleteBtn).toBeVisible({ timeout: 10_000 });

        const deleteResPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/passkeys/") &&
            res.request().method() === "DELETE",
          { timeout: 25_000 }
        );
        await confirmDeleteBtn.click();
        const deleteRes = await deleteResPromise;
        expect([200, 204]).toContain(deleteRes.status());
        await expect(page.locator("[data-testid^='passkey-row-']")).toHaveCount(0, {
          timeout: 15_000,
        });

        const deletedRows = queryPgJson<PasskeyDbRow>(
          cfg,
          `SELECT id::text, admin_id::text, credential_id, device_name, rp_id, registration_origin, is_deleted
           FROM identity.admin_passkeys
           WHERE admin_id = ${sqlLiteral(proAdminId)}::uuid AND is_deleted = true`
        );
        expect(deletedRows.length).toBeGreaterThanOrEqual(1);

        // Step E: Lock passkey-bound Sudo ticket cleanly (no downgrade conflict), then re-register passkey (PK-01 filtered index)
        const lockSudoBtn = page.getByTestId("lock-sudo-security-btn");
        if (await lockSudoBtn.isVisible().catch(() => false)) {
          await lockSudoBtn.click();
          await expect(page.getByTestId("step-up-sudo-btn")).toBeVisible({ timeout: 10_000 });
        }

        await page.getByTestId("open-enroll-passkey-btn").click();
        await page.getByTestId("passkey-option-platform").click();
        await page.getByTestId("passkey-name-input").fill("Re-enrolled E2E Passkey");

        const reEnrollCompletePromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/passkeys/registration/complete") &&
            res.request().method() === "POST",
          { timeout: 25_000 }
        );
        await page.getByTestId("passkey-activate-btn").click();
        await submitSudoPassword(page, devPassword);

        const reEnrollCompleteRes = await reEnrollCompletePromise;
        expect(reEnrollCompleteRes.status()).toBe(200);
        await expect(page.getByTestId("passkey-done-btn")).toBeVisible({ timeout: 15_000 });
        await page.getByTestId("passkey-done-btn").click();

        await expect(page.locator("[data-testid^='passkey-row-']").first()).toContainText(
          "Re-enrolled E2E Passkey",
          { timeout: 15_000 }
        );

        const postReEnrollRows = queryPgJson<PasskeyDbRow>(
          cfg,
          `SELECT id::text, admin_id::text, credential_id, device_name, rp_id, registration_origin, is_deleted
           FROM identity.admin_passkeys
           WHERE admin_id = ${sqlLiteral(proAdminId)}::uuid`
        );
        expect(postReEnrollRows.filter((r) => !r.is_deleted).length).toBe(1);
        expect(postReEnrollRows.filter((r) => r.is_deleted).length).toBeGreaterThanOrEqual(1);

        monitor.assertClean("Test 1 CDP Passkey Lifecycle");
      } finally {
        await authenticator.dispose();
        monitor.dispose();
      }
    });

    test("2. Security Vault 2FA Wizard (BACKUP recovery step persistence), /account/sessions Revoke Other Sessions, and mandatory MFA wall zero-403 AR/RTL mobile", async ({
      browser,
      page,
    }) => {
      const monitor = attachRuntimeErrorMonitor(page);
      const secondaryContext = await browser.newContext();

      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await resetBrowserSession(page, "en");
        await loginViaUi(page, PRO_ADMIN_EMAIL, devPassword);

        // Create a real second active session in an isolated browser context so Revoke All Others has a live peer session
        const secondaryLoginRes = await secondaryContext.request.post(
          `${API_BASE_URL}/api/v1/auth/admin/login`,
          {
            data: { identifier: PRO_ADMIN_EMAIL, password: devPassword },
          }
        );
        expect(secondaryLoginRes.status()).toBe(200);
        const secondaryCookies = await secondaryContext.cookies();
        const secondaryRefreshCookie = getRefreshCookie(secondaryCookies, cfg);
        expect(secondaryRefreshCookie?.value.length ?? 0).toBeGreaterThan(10);

        // Step A: /account/sessions Revoke All Other Sessions retains caller session across reload
        await page.goto("/account/sessions", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);

        const revokeAllBtn = page.getByTestId("revoke-all-other-sessions-btn");
        await expect(revokeAllBtn).toBeVisible({ timeout: 20_000 });
        await revokeAllBtn.click();

        const confirmRevokeAllBtn = page.getByTestId("confirm-revoke-all-sessions-btn");
        await expect(confirmRevokeAllBtn).toBeVisible({ timeout: 10_000 });

        const revokeAllPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/admin/sessions/revoke-all") &&
            res.request().method() === "POST" &&
            res.status() !== 403,
          { timeout: 25_000 }
        );
        await confirmRevokeAllBtn.click();
        await submitSudoPassword(page, devPassword);

        const revokeAllRes = await revokeAllPromise;
        expect([200, 204]).toContain(revokeAllRes.status());
        await expect(revokeAllBtn).toBeHidden({ timeout: 15_000 });
        await capturePng(page, "track2-04-account-sessions-revoke-others-en-desktop.png");

        // Reload caller tab -> caller MUST remain authenticated while secondary refresh token is revoked
        await page.reload({ waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);
        expect(page.url()).toContain("/account/sessions");
        await expect(revokeAllBtn).toBeHidden({ timeout: 10_000 });

        const secondaryRefreshAttempt = await secondaryContext.request.post(
          `${API_BASE_URL}/api/v1/auth/admin/refresh`,
          {
            data: { refreshToken: secondaryRefreshCookie!.value },
          }
        );
        expect(secondaryRefreshAttempt.status()).toBe(401);

        // Step B: /account/security TOTP 2FA Wizard stays open on BACKUP step until Done
        await page.goto("/account/security", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);

        const enable2FaBtn = page.getByRole("button", { name: /^Enable$/i }).first();
        await expect(enable2FaBtn).toBeVisible({ timeout: 15_000 });

        const enable2FaPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/admin/2fa/enable") &&
            res.request().method() === "POST",
          { timeout: 20_000 }
        );
        await enable2FaBtn.click();
        const enable2FaRes = await enable2FaPromise;
        expect(enable2FaRes.status()).toBe(200);

        const setupPayload = unwrapApiData<{
          qrCodeDataUri: string;
          manualEntryKey: string;
          backupCodes: string[];
        }>(await enable2FaRes.json());
        expect(setupPayload.manualEntryKey.length).toBeGreaterThanOrEqual(16);
        expect(setupPayload.qrCodeDataUri).toMatch(/^data:image\//);
        expect(setupPayload.backupCodes.length).toBe(10);

        const wizardDialog = page.locator("[role='dialog']").last();
        await expect(wizardDialog).toBeVisible({ timeout: 10_000 });
        await expect(wizardDialog).toContainText(setupPayload.manualEntryKey);
        await capturePng(page, "track2-02-2fa-wizard-scan-en-desktop.png");

        await wizardDialog.getByRole("button", { name: /^Continue$/i }).click();
        const totpInput = wizardDialog.locator("#totp-input");
        await expect(totpInput).toBeVisible({ timeout: 10_000 });

        const totpCode = generateTotpCode(setupPayload.manualEntryKey);
        await totpInput.fill(totpCode);

        const confirm2FaPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/admin/2fa/confirm") &&
            res.request().method() === "POST",
          { timeout: 20_000 }
        );
        await wizardDialog.getByRole("button", { name: /Verify/i }).click();
        const confirm2FaRes = await confirm2FaPromise;
        expect(confirm2FaRes.status()).toBe(200);

        // Critical invariant (FE-HIGH-01): wizard stays open on BACKUP step showing all 10 codes until Done
        await expect(wizardDialog).toBeVisible({ timeout: 10_000 });
        await expect(wizardDialog).toContainText(setupPayload.backupCodes[0]);
        await expect(wizardDialog).toContainText(setupPayload.backupCodes[9]);
        await capturePng(page, "track2-03-2fa-wizard-backup-codes-en-desktop.png");

        await wizardDialog.getByRole("button", { name: /^Done$/i }).click();
        await expect(wizardDialog).toBeHidden({ timeout: 10_000 });
        await expect(page.getByText(/10 \/ 10/)).toBeVisible({ timeout: 15_000 });
        await expect(page.getByRole("button", { name: /^Disable$/i }).first()).toBeVisible({
          timeout: 15_000,
        });

        await page.reload({ waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);
        await expect(page.getByText(/10 \/ 10/)).toBeVisible({ timeout: 15_000 });

        // Step C: Mandatory MFA wall (ahly.admin@scripe-dev.local) zero-403 UI & AR RTL mobile 390x844
        await resetBrowserSession(page, "en");
        monitor.clearForbiddenResponses();
        await loginViaUi(page, MANDATORY_MFA_ADMIN_EMAIL, devPassword, {
          expectPath: /\/account\/security.*mfa_enroll=true/,
        });

        await expect(page.getByTestId("mfa-enrollment-required-banner")).toBeVisible({
          timeout: 15_000,
        });
        await expect(page.getByTestId("mfa-enroll-locked-controls-notice")).toBeVisible({
          timeout: 15_000,
        });
        expect(
          monitor.getForbiddenResponses(),
          "Expected zero 403 API failures when loading mandatory mfa_enroll=true security vault"
        ).toEqual([]);

        await switchUiLanguage(page, "ar");
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(250);
        await assertNoHorizontalOverflow(page, "mfa_enroll=true AR/RTL Mobile 390x844");
        await capturePng(page, "track2-05-mfa-enroll-wall-ar-rtl-mobile.png");

        monitor.assertClean("Test 2 2FA Wizard, Sessions Revoke & Mandatory MFA Wall");
      } finally {
        await secondaryContext.close();
        monitor.dispose();
      }
    });

    test("3. Global SudoVerificationModal (SUDO-02) across /admins, /settings/identity-providers, and /account/security with toast-free cancellation", async ({
      page,
    }) => {
      const monitor = attachRuntimeErrorMonitor(page);

      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await resetBrowserSession(page, "en");
        await loginViaUi(page, PLATFORM_ADMIN_EMAIL, devPassword);

        // Route 1: /admins ((modules)/layout) — Transfer Protection triggers Sudo, cancel yields zero toast spam
        await page.goto("/admins", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);

        const searchInput = page
          .locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="بحث"]')
          .first();
        await expect(searchInput).toBeVisible({ timeout: 20_000 });
        const searchPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/admins") &&
            res.request().method() === "GET" &&
            res.url().toLowerCase().includes("opsadmin"),
          { timeout: 20_000 }
        );
        await searchInput.fill("opsadmin");
        expect((await searchPromise).status()).toBe(200);

        const targetRow = page.locator("tr", { hasText: TARGET_PROTECTION_ADMIN_EMAIL }).first();
        await expect(targetRow).toBeVisible({ timeout: 15_000 });
        await targetRow
          .locator('button[aria-label="Actions"], button[aria-label="الإجراءات"], button')
          .last()
          .click();

        const transferItem = page.getByRole("menuitem", {
          name: /Transfer Protection|نقل الحماية/i,
        });
        await expect(transferItem).toBeVisible({ timeout: 10_000 });
        await transferItem.click();

        const confirmDialog = page.locator("[role='dialog'], [role='alertdialog']").last();
        await expect(confirmDialog).toBeVisible({ timeout: 10_000 });
        await confirmDialog.getByRole("button", { name: /^Confirm$|^تأكيد$/i }).click();

        await expect(page.getByTestId("sudo-verification-modal")).toBeVisible({ timeout: 15_000 });
        await capturePng(page, "track2-06-global-sudo-admins-cancel-en-desktop.png");
        await cancelSudoModal(page);
        await assertNoSpuriousErrorToasts(page, "/admins Transfer Protection Sudo cancel");

        // Route 2: /settings/identity-providers ((modules)/layout) — Toggle active switch triggers Sudo, cancel rolls back without error toast, then verify completes cleanly
        await page.goto("/settings/identity-providers", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);

        const idpSwitch = page.getByTestId(`toggle-active-switch-${TARGET_IDP_SLUG}`);
        await expect(idpSwitch).toBeVisible({ timeout: 20_000 });
        await expect(idpSwitch).toHaveAttribute("aria-checked", "true");

        await idpSwitch.click();
        await expect(page.getByTestId("sudo-verification-modal")).toBeVisible({ timeout: 15_000 });
        await cancelSudoModal(page);
        await assertNoSpuriousErrorToasts(page, "/settings/identity-providers toggle Sudo cancel");
        await expect(idpSwitch).toHaveAttribute("aria-checked", "true", { timeout: 10_000 });

        const updateIdpPromise1 = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/identity-providers/") &&
            res.request().method() === "PUT" &&
            (res.status() === 200 || res.status() === 204),
          { timeout: 25_000 }
        );
        await idpSwitch.click();
        await submitSudoPassword(page, devPassword);
        await updateIdpPromise1;
        await expect(idpSwitch).toHaveAttribute("aria-checked", "false", { timeout: 10_000 });
        await capturePng(page, "track2-07-global-sudo-identity-providers-en-desktop.png");

        // Restore active=true using active Sudo session seamlessly
        const updateIdpPromise2 = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/identity-providers/") &&
            res.request().method() === "PUT" &&
            (res.status() === 200 || res.status() === 204),
          { timeout: 25_000 }
        );
        await idpSwitch.click();
        await updateIdpPromise2;
        await expect(idpSwitch).toHaveAttribute("aria-checked", "true", { timeout: 10_000 });

        // Route 3: /account/security ((account)/layout) — Sudo modal mounts cleanly & cancels cleanly
        await page.goto("/account/security", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);
        const lockBtn = page.getByTestId("lock-sudo-security-btn");
        if (await lockBtn.isVisible().catch(() => false)) {
          await lockBtn.click();
        }
        await expect(page.getByTestId("step-up-sudo-btn")).toBeVisible({ timeout: 15_000 });
        await page.getByTestId("step-up-sudo-btn").click();
        await cancelSudoModal(page);
        await assertNoSpuriousErrorToasts(page, "/account/security Sudo cancel");

        monitor.assertClean("Test 3 Global SudoVerificationModal");
      } finally {
        monitor.dispose();
      }
    });

    test("4. Central /sso/continue, localized & malformed SAML errors, custom-domain /api/auth/session/* negative checks, split logout (GAP-05), and cross-tab localStorage isolation", async ({
      page,
    }) => {
      const monitor = attachRuntimeErrorMonitor(page);

      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await resetBrowserSession(page, "en");

        // Part A: Central /sso/continue & SAML error localization + malformed percent-encoding guard (FE-HIGH-04)
        await page.goto("/sso/continue", { waitUntil: "domcontentloaded" });
        await expect(page.getByText(/Sign-In Failed/i)).toBeVisible({ timeout: 15_000 });

        await page.goto("/sso/saml/callback?error=account_locked", { waitUntil: "domcontentloaded" });
        await expect(page.getByText(/Sign-In Failed/i)).toBeVisible({ timeout: 15_000 });
        await expect(
          page.getByText(/Your account is temporarily locked/i)
        ).toBeVisible({ timeout: 15_000 });
        await capturePng(page, "track2-08-saml-error-localized-en-desktop.png");

        await page.goto("/sso/saml/callback?error=%E0%A4%A", { waitUntil: "domcontentloaded" });
        await expect(page.getByText(/Sign-In Failed/i)).toBeVisible({ timeout: 15_000 });
        await expect(
          page.getByText(/An unexpected error occurred during SSO login/i)
        ).toBeVisible({ timeout: 15_000 });

        // Part B: Custom-domain first-party session relay negative security checks (GET -> 405, cross-site -> 403)
        for (const relayPath of [
          "/api/auth/session/establish",
          "/api/auth/session/refresh",
          "/api/auth/session/logout",
        ]) {
          const getRes = await page.request.get(relayPath);
          expect(getRes.status(), `GET ${relayPath} must return 405`).toBe(405);
          expect(getRes.headers()["allow"]).toBe("POST");

          const crossSiteRes = await page.request.post(relayPath, {
            headers: {
              Origin: "http://localhost:3000",
              "Sec-Fetch-Site": "cross-site",
            },
            data: {},
          });
          expect(crossSiteRes.status(), `Cross-site POST ${relayPath} must return 403`).toBe(403);
          const body = (await crossSiteRes.json()) as { error?: string };
          expect(body.error).toBe("cross_site_request_forbidden");
        }

        // Part C & D: Cross-tab localStorage/BroadcastChannel isolation + Split Logout (GAP-05)
        await loginViaUi(page, PRO_ADMIN_EMAIL, devPassword);
        await page.goto("/account/security", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(page);

        const tabAPrincipalKey = await page.evaluate(() =>
          window.sessionStorage.getItem("scr_active_principal_key")
        );
        expect(tabAPrincipalKey).toMatch(/^admin:/);

        // Seed central IdP session cookie alongside active app refresh cookie to verify split logout preservation
        await page.context().addCookies([
          {
            name: cfg.oidcSessionCookieName,
            value: "e2e-central-oidc-session",
            domain: "localhost",
            path: "/",
            httpOnly: false,
            sameSite: "Lax",
          },
        ]);

        // Open sibling tab in same BrowserContext sharing localStorage & BroadcastChannel
        const tabB = await page.context().newPage();
        await tabB.setViewportSize({ width: 1440, height: 900 });
        await tabB.goto("/account/dossier", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(tabB);
        expect(tabB.url()).toContain("/account/dossier");

        // Foreign-tenant app-scoped LOGOUT broadcast from sibling tab must be ignored by page (tabA)
        await tabB.evaluate(() => {
          const ch = new BroadcastChannel("scr_auth");
          ch.postMessage({
            type: "LOGOUT",
            scope: {
              origin: window.location.origin,
              tenantId: "00000000-0000-0000-0000-000000000099",
              principalId: "00000000-0000-0000-0000-000000000099",
              logoutScope: "app",
            },
          });
          ch.close();
        });
        await page.waitForTimeout(300);
        expect(page.url()).toContain("/account/security");

        // Same-principal UI logout in tabB clears scr_refresh_token, preserves scr.oidc.session (app scope),
        // and logs out tabA via localStorage/BroadcastChannel isolation
        const { requestBody } = await logoutViaUi(tabB);
        const parsedLogoutBody = requestBody
          ? (JSON.parse(requestBody) as { logoutScope?: string })
          : {};
        expect(parsedLogoutBody.logoutScope || "app").toBe("app");

        await page.bringToFront();
        await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 20_000 });

        const postAppLogoutCookies = await page.context().cookies();
        expect(getRefreshCookie(postAppLogoutCookies, cfg)).toBeUndefined();
        expect(
          postAppLogoutCookies.find((c) => c.name === cfg.oidcSessionCookieName)?.value
        ).toBe("e2e-central-oidc-session");

        await tabB.close();

        // Explicit central logoutScope clears BOTH scr_refresh_token and scr.oidc.session
        const centralLogoutRes = await page.request.post(
          `${API_BASE_URL}/api/v1/auth/admin/logout`,
          {
            headers: {
              Cookie: `${cfg.oidcSessionCookieName}=e2e-central-oidc-session`,
            },
            data: { logoutScope: "central" },
          }
        );
        expect(centralLogoutRes.status()).toBe(204);
        const setCookieJoined = centralLogoutRes
          .headersArray()
          .filter((h) => h.name.toLowerCase() === "set-cookie")
          .map((h) => h.value)
          .join("\n");
        expect(setCookieJoined).toContain(`${cfg.oidcSessionCookieName}=;`);

        monitor.assertClean("Test 4 Central SSO, Relay Negative Checks, Split Logout & Cross-Tab Isolation");
      } finally {
        monitor.dispose();
      }
    });
  }
);
