import { execFileSync } from "node:child_process";
import { createHash, createHmac, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Locator, type Page, type Response } from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const PSQL_EXE = process.env.PSQL_PATH || "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";
const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-Backend/docs/security/auth-remediation/screenshots"
);
const BACKEND_LOCAL_SETTINGS = path.resolve(
  __dirname,
  "../../SCRIPE-Backend/src/Host/API/appsettings.local.json"
);

// Designated active seeded accounts verified in identity.admins (SCRIPE_UAT)
const PLATFORM_ADMIN_EMAIL = "admin-seif@scripe.org";
const PRO_ADMIN_EMAIL = "city.admin@scripe-dev.local";
const LOCKOUT_ADMIN_EMAIL = "apex.booking@scripe-dev.local";
const OTP_RESET_ADMIN_EMAIL = "city.admin@scripe-dev.local";
const MAGIC_LINK_ADMIN_EMAIL = "community.admin@scripe-dev.local";
const MANDATORY_MFA_ADMIN_EMAIL = "ahly.admin@scripe-dev.local";
const TARGET_DIALOG_ADMIN_EMAIL = "opsadmin@scripe-dev.local";

interface RuntimeBackendConfig {
  verifierKey: string;
  refreshCookieName: string;
  pgEnv: {
    PGHOST: string;
    PGPORT: string;
    PGDATABASE: string;
    PGUSER: string;
    PGPASSWORD: string;
  };
}

interface AdminCredentialSnapshot {
  id: string;
  email: string;
  password_hash: string;
  password_last_changed: string | null;
  failed_login_attempts: number;
  lockout_end: string | null;
}

/**
 * Strips JSONC comments (`//` and block comments) safely without corrupting URLs inside strings.
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
    Verification?: { VerifierKey?: string };
    Branding?: { CookiePrefix?: string };
  };

  const connStr = parsed.Database?.ConnectionString;
  const verifierKey = parsed.Verification?.VerifierKey;
  if (!connStr || !verifierKey) {
    throw new Error("appsettings.local.json must define Database.ConnectionString and Verification.VerifierKey.");
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
    verifierKey,
    refreshCookieName: `${prefix}_refresh_token`,
    pgEnv: {
      PGHOST: kv.host || "localhost",
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

/**
 * Inverts a 6-digit OTP locally from an `identity.otp_codes` verifier row using
 * the exact HMAC-SHA256 construction in `OtpService.Crypto.cs`:
 * `A` + base64url(HMAC-SHA256(UTF8(VerifierKey), `${idNoDashes}|${purpose}|${email.length}:${email}|${code}`)).slice(0, 9).
 */
function invertOtpCode(
  otpId: string,
  purpose: number,
  email: string,
  storedVerifier: string,
  verifierKey: string
): string {
  if (!storedVerifier.startsWith("A") || storedVerifier.length !== 10) {
    throw new Error(`Unexpected OTP verifier format (length=${storedVerifier.length}).`);
  }

  const keyBytes = Buffer.from(verifierKey, "utf8");
  const idNoDashes = otpId.replace(/-/g, "").toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const prefix = `${idNoDashes}|${purpose}|${normalizedEmail.length}:${normalizedEmail}|`;

  for (let i = 0; i < 1_000_000; i++) {
    const code = String(i).padStart(6, "0");
    const digest = createHmac("sha256", keyBytes).update(`${prefix}${code}`).digest();
    const encoded = digest.subarray(0, 7).toString("base64url").slice(0, 9);
    if (`A${encoded}` === storedVerifier) {
      return code;
    }
  }

  throw new Error(`Failed to invert 6-digit OTP for ${normalizedEmail} (otpId=${otpId}).`);
}

function sha256LowerHex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex").toLowerCase();
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
          "main, #hub-content, #nexus-content, aside, #identifier, [data-testid='mfa-enrollment-required-banner'], [data-testid='password-policy-checklist']"
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
      // Ignore storage access errors
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

async function toggleAuthTheme(page: Page, target: "light" | "dark"): Promise<void> {
  const isCurrentlyDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  const wantsDark = target === "dark";
  if (isCurrentlyDark === wantsDark) return;
  const switcher = page
    .locator(
      'button[aria-label*="light" i], button[aria-label*="dark" i], button[aria-label*="الفاتح"], button[aria-label*="الداكن"]'
    )
    .first();
  await expect(switcher).toBeVisible({ timeout: 10_000 });
  await switcher.click();
  await page.waitForFunction(
    (darkExpected) => document.documentElement.classList.contains("dark") === darkExpected,
    wantsDark,
    { timeout: 10_000 }
  );
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

async function logoutViaUi(page: Page): Promise<void> {
  const userMenuTrigger = page
    .locator("nav button[aria-haspopup='menu'], aside button[aria-haspopup='menu'], header button[aria-haspopup='menu']")
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
  await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 25_000 });
  await waitForAppSettled(page, true);
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
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      violations,
    };
  });
  expect(
    overflow.violations,
    `Horizontal overflow detected in ${label}: ${overflow.violations.join(", ")}`
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
  const onPageError = (err: Error) => pageErrors.push(err.message);
  const onResponse = (res: Response) => {
    if (res.status() >= 500 && res.url().includes("/api/")) {
      serverErrors.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    }
  };
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  return {
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

test.describe.serial("Identity Authentication, Recovery & Security Policy Certification", () => {
  let cfg: RuntimeBackendConfig;
  let devPassword: string;
  let snapshots: Record<string, AdminCredentialSnapshot> = {};
  let resetSignedInState: {
    cookies: Awaited<ReturnType<ReturnType<Page["context"]>["cookies"]>>;
    localStorageEntries: Array<[string, string]>;
    currentPassword: string;
  } | null = null;

  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    cfg = loadRuntimeBackendConfig();
    devPassword = getDevAdminPassword();

    const targetEmails = Array.from(
      new Set([
        PLATFORM_ADMIN_EMAIL,
        PRO_ADMIN_EMAIL,
        LOCKOUT_ADMIN_EMAIL,
        OTP_RESET_ADMIN_EMAIL,
        MAGIC_LINK_ADMIN_EMAIL,
        MANDATORY_MFA_ADMIN_EMAIL,
      ])
    );
    const rows = queryPgJson<AdminCredentialSnapshot>(
      cfg,
      `SELECT id::text, lower(email) AS email, password_hash, password_last_changed::text, failed_login_attempts, lockout_end::text
       FROM identity.admins
       WHERE lower(email) IN (${targetEmails.map(sqlLiteral).join(", ")}) AND is_deleted = false`
    );

    for (const row of rows) {
      snapshots[row.email] = row;
    }

    for (const email of targetEmails) {
      expect(snapshots[email], `Seeded admin missing in SCRIPE_UAT: ${email}`).toBeTruthy();
    }

    // Ensure clean pre-test baseline for accounts mutated during lockout/recovery checks
    execPg(
      cfg,
      `UPDATE identity.admins
       SET failed_login_attempts = 0, lockout_end = NULL
       WHERE lower(email) IN (${targetEmails.map(sqlLiteral).join(", ")});`
    );
  });

  test.afterAll(() => {
    if (!cfg) return;
    const touchedEmails = [
      LOCKOUT_ADMIN_EMAIL,
      OTP_RESET_ADMIN_EMAIL,
      MAGIC_LINK_ADMIN_EMAIL,
      PRO_ADMIN_EMAIL,
      MANDATORY_MFA_ADMIN_EMAIL,
      PLATFORM_ADMIN_EMAIL,
    ];

    for (const email of Array.from(new Set([OTP_RESET_ADMIN_EMAIL, MAGIC_LINK_ADMIN_EMAIL, PRO_ADMIN_EMAIL]))) {
      const snap = snapshots[email];
      if (!snap) continue;
      const lastChangedClause = snap.password_last_changed
        ? sqlLiteral(snap.password_last_changed)
        : "NULL";
      execPg(
        cfg,
        `UPDATE identity.admins
         SET password_hash = ${sqlLiteral(snap.password_hash)},
             password_last_changed = ${lastChangedClause},
             failed_login_attempts = 0,
             lockout_end = NULL
         WHERE id = ${sqlLiteral(snap.id)}::uuid;`
      );
      execPg(
        cfg,
        `DELETE FROM identity.password_histories WHERE principal_id = ${sqlLiteral(snap.id)}::uuid;`
      );
    }

    execPg(
      cfg,
      `UPDATE identity.admins
       SET failed_login_attempts = 0, lockout_end = NULL
       WHERE lower(email) IN (${touchedEmails.map(sqlLiteral).join(", ")});`
    );

    execPg(
      cfg,
      `DELETE FROM identity.otp_codes WHERE lower(email) IN (${touchedEmails.map(sqlLiteral).join(", ")});
       DELETE FROM identity.password_reset_tokens WHERE normalized_email IN (${touchedEmails.map(sqlLiteral).join(", ")});`
    );

    const touchedIds = Object.values(snapshots).map((s) => `${sqlLiteral(s.id)}::uuid`);
    if (touchedIds.length > 0) {
      execPg(
        cfg,
        `DELETE FROM identity.refresh_tokens WHERE admin_id IN (${touchedIds.join(", ")});`
      );
    }
  });

  test("1. Login, HttpOnly cookie parity, hard refresh persistence, logout revocation, and Pro tenant lockout", async ({
    page,
  }) => {
    const monitor = attachRuntimeErrorMonitor(page);
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await resetBrowserSession(page, "en");
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page, true);
      await expect(page.locator("#identifier")).toBeVisible({ timeout: 20_000 });

      // Capture Login EN/LTR Dark Desktop
      await toggleAuthTheme(page, "dark");
      await capturePng(page, "01-login-en-dark-desktop.png");

      // Capture Login AR/RTL Light Desktop
      await switchUiLanguage(page, "ar");
      await toggleAuthTheme(page, "light");
      await expect(page.locator("form button[type='submit']").first()).toContainText("دخول");
      await capturePng(page, "02-login-ar-rtl-light-desktop.png");

      // Restore EN/Dark for functional login parity checks
      await switchUiLanguage(page, "en");
      await toggleAuthTheme(page, "dark");

      // 1A. Platform SuperAdmin login + HttpOnly cookie + hard reload + logout revocation
      await loginViaUi(page, PLATFORM_ADMIN_EMAIL, devPassword);
      const platformSessionCheck = await page.evaluate(() => ({
        devToken: sessionStorage.getItem("dev_access_token"),
        appStorage: localStorage.getItem("app-storage"),
      }));
      expect(platformSessionCheck.devToken).toBeNull();
      expect(platformSessionCheck.appStorage).toBeTruthy();

      const platformCookies = await page.context().cookies();
      const platformRefreshCookie = platformCookies.find((c) => c.name === cfg.refreshCookieName);
      expect(platformRefreshCookie, `Missing HttpOnly cookie ${cfg.refreshCookieName}`).toBeTruthy();
      expect(platformRefreshCookie?.httpOnly).toBe(true);
      expect(platformRefreshCookie?.value.length).toBeGreaterThan(10);

      // Hard refresh persistence check
      const authedUrlBeforeReload = page.url();
      await page.reload({ waitUntil: "networkidle" });
      await waitForAppSettled(page);
      expect(page.url()).not.toContain("/login");
      expect(new URL(page.url()).pathname).toBe(new URL(authedUrlBeforeReload).pathname);

      // UI Logout & DB revocation check
      await logoutViaUi(page);
      const cookiesAfterLogout = await page.context().cookies();
      const remainingRefresh = cookiesAfterLogout.find((c) => c.name === cfg.refreshCookieName);
      expect(!remainingRefresh || remainingRefresh.value === "").toBe(true);

      const platformSnap = snapshots[PLATFORM_ADMIN_EMAIL];
      const activeTokensAfterLogout = queryPgJson<{ cnt: number }>(
        cfg,
        `SELECT count(*)::int AS cnt FROM identity.refresh_tokens
         WHERE admin_id = ${sqlLiteral(platformSnap.id)}::uuid AND revoked_at IS NULL`
      );
      expect(activeTokensAfterLogout[0]?.cnt ?? -1).toBe(0);

      // 1B. Failed-attempt lockout on Pro tenant test admin (`apex.booking@scripe-dev.local`, threshold = 5; 6th probe renders locked minutes)
      await resetBrowserSession(page, "en");
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page, true);
      await expect(page.locator("#identifier")).toBeVisible({ timeout: 20_000 });

      const wrongCandidate = `WrongPass!${Date.now()}#0`;
      for (let attempt = 1; attempt <= 6; attempt++) {
        await page.locator("#identifier").fill(LOCKOUT_ADMIN_EMAIL);
        await page.locator("#password").fill(wrongCandidate);
        const failResPromise = page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes("/api/v1/auth/admin/login") &&
            res.request().method() === "POST",
          { timeout: 20_000 }
        );
        await page.locator("form button[type='submit']").first().click();
        const failRes = await failResPromise;
        expect([401, 403, 423]).toContain(failRes.status());
        const bodyText = await failRes.text().catch(() => "");
        if (/ACCOUNT_LOCKED|locked due to/i.test(bodyText)) {
          break;
        }
      }

      const lockoutAlert = page.locator("[role='alert']").first();
      await expect(lockoutAlert).toBeVisible({ timeout: 10_000 });
      await expect(lockoutAlert).toContainText(/locked|attempts|lockout|مقفل|محاولات/i);
      const lockoutText = (await lockoutAlert.innerText()).trim();
      expect(lockoutText, `Unrendered template placeholder in lockout alert: ${lockoutText}`).not.toContain("{minutes}");
      expect(lockoutText, `Expected numeric lockout minutes in alert: ${lockoutText}`).toMatch(/\d+/);
      await capturePng(page, "03-login-lockout-error-en-desktop.png");

      const lockoutDb = queryPgJson<{ failed_login_attempts: number; lockout_end: string | null }>(
        cfg,
        `SELECT failed_login_attempts, lockout_end::text FROM identity.admins WHERE lower(email) = ${sqlLiteral(LOCKOUT_ADMIN_EMAIL)}`
      );
      expect(lockoutDb[0]?.failed_login_attempts).toBeGreaterThanOrEqual(5);
      expect(lockoutDb[0]?.lockout_end).toBeTruthy();

      monitor.assertClean("Test 1 Login/Lockout");
    } finally {
      monitor.dispose();
    }
  });

  test("2. Forgot & Reset Password: uniform 202 acceptance, OTP inversion, 422 preserves OTP, reset success without auto-login, and #token= scrubbing", async ({
    page,
  }) => {
    const monitor = attachRuntimeErrorMonitor(page);
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await resetBrowserSession(page, "en");

      // 2A. Uniform acceptance UI for unknown email vs valid active email
      await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#fp-email")).toBeVisible({ timeout: 20_000 });
      await page.locator("#fp-email").fill("unknown-recovery-probe@scripe-dev.local");
      await page.locator("form button[type='submit']").first().click();

      const unknownOtpBtn = page.getByRole("button", { name: /Verification code/i });
      await expect(unknownOtpBtn).toBeVisible({ timeout: 10_000 });
      const unknownReqPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/request-password-reset") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await unknownOtpBtn.click();
      const unknownRes = await unknownReqPromise;
      expect(unknownRes.status()).toBe(202);
      await expect(page.locator("input[data-input-otp='true'], input#reset-otp").first()).toBeVisible({
        timeout: 10_000,
      });

      // Restart cleanly for valid active Pro admin (`apex.finance@scripe-dev.local`)
      await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#fp-email")).toBeVisible({ timeout: 20_000 });
      await page.locator("#fp-email").fill(OTP_RESET_ADMIN_EMAIL);
      await page.locator("form button[type='submit']").first().click();

      const validOtpBtn = page.getByRole("button", { name: /Verification code/i });
      await expect(validOtpBtn).toBeVisible({ timeout: 10_000 });
      await capturePng(page, "04-forgot-password-method-en-desktop.png");

      const validReqPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/request-password-reset") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await validOtpBtn.click();
      const validRes = await validReqPromise;
      expect(validRes.status()).toBe(202);
      const otpInput = page.locator("input[data-input-otp='true'], input#reset-otp").first();
      await expect(otpInput).toBeVisible({ timeout: 10_000 });

      // Mobile + AR/RTL check on OTP step
      await page.setViewportSize({ width: 390, height: 844 });
      await switchUiLanguage(page, "ar");
      await assertNoHorizontalOverflow(page, "OTP Step Mobile AR/RTL");
      await capturePng(page, "05-forgot-password-otp-ar-rtl-mobile.png");

      // Restore Desktop + EN before submitting OTP
      await switchUiLanguage(page, "en");
      await page.setViewportSize({ width: 1440, height: 900 });

      // Out-of-band DB oracle: fetch latest unused PasswordReset OTP row & invert locally
      const otpRows = queryPgJson<{ id: string; code: string; purpose: number; is_used: boolean }>(
        cfg,
        `SELECT id::text, code, purpose, is_used
         FROM identity.otp_codes
         WHERE lower(email) = ${sqlLiteral(OTP_RESET_ADMIN_EMAIL)}
           AND purpose = 3
           AND is_used = false
         ORDER BY created_at DESC
         LIMIT 1`
      );
      expect(otpRows.length).toBe(1);
      const otpRecord = otpRows[0];
      const sixDigitOtp = invertOtpCode(
        otpRecord.id,
        otpRecord.purpose,
        OTP_RESET_ADMIN_EMAIL,
        otpRecord.code,
        cfg.verifierKey
      );

      // Submit real OTP (triggers onComplete -> verify-reset-otp)
      const verifyOtpPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/verify-reset-otp") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await otpInput.fill(sixDigitOtp);
      const verifyOtpRes = await verifyOtpPromise;
      expect(verifyOtpRes.status()).toBe(200);

      // Check optional multi-workspace selector if any multi-tenant email is seeded; single-tenant advances to NewPasswordStep
      const multiTenantCount = queryPgJson<{ cnt: number }>(
        cfg,
        `SELECT count(*)::int AS cnt FROM (
           SELECT lower(email) FROM identity.admins
           WHERE is_deleted = false AND is_active = true AND is_account_activated = true
           GROUP BY lower(email) HAVING count(*) > 1
         ) sub`
      );
      if ((multiTenantCount[0]?.cnt ?? 0) > 0) {
        const wsConfirm = page.getByRole("button", { name: /Reset All Workspaces|Reset .* Workspaces/i });
        if (await wsConfirm.isVisible().catch(() => false)) {
          await wsConfirm.click();
        }
      }

      // Live PasswordPolicyChecklist matching APEX server policy (MinLength=8, Upper=true, Digit=true)
      const newPwdInput = page.locator("#fp-new-password");
      const confirmPwdInput = page.locator("#fp-confirm-password");
      await expect(newPwdInput).toBeVisible({ timeout: 10_000 });
      const checklist = page.getByTestId("password-policy-checklist");
      await expect(checklist).toBeVisible({ timeout: 10_000 });

      // Short password keeps submit disabled & minLength unmet
      await newPwdInput.fill("Ab1");
      await confirmPwdInput.fill("Ab1");
      await expect(page.getByTestId("pwd-rule-minLength")).toHaveAttribute("data-met", "false");
      const resetSubmitBtn = page.locator("form button[type='submit']").first();
      await expect(resetSubmitBtn).toBeDisabled();

      // Breached syntactically-valid password passes client checklist -> hits server HTTP 422 -> OTP stays unburned!
      const breachedCandidate = "Password123";
      await newPwdInput.fill(breachedCandidate);
      await confirmPwdInput.fill(breachedCandidate);
      await expect(page.getByTestId("pwd-rule-minLength")).toHaveAttribute("data-met", "true");
      await expect(page.getByTestId("pwd-rule-uppercase")).toHaveAttribute("data-met", "true");
      await expect(page.getByTestId("pwd-rule-number")).toHaveAttribute("data-met", "true");
      await expect(resetSubmitBtn).toBeEnabled();

      const failedResetPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/reset-password") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await resetSubmitBtn.click();
      const failedResetRes = await failedResetPromise;
      expect(failedResetRes.status()).toBe(422);

      await expect(page.locator("[role='alert']").first()).toBeVisible({ timeout: 10_000 });
      await capturePng(page, "06-reset-password-policy-422-en-desktop.png");

      // Prove OTP & ResetGrantToken were NOT burned on 422
      const otpAfter422 = queryPgJson<{ is_used: boolean }>(
        cfg,
        `SELECT is_used FROM identity.otp_codes WHERE id = ${sqlLiteral(otpRecord.id)}::uuid`
      );
      expect(otpAfter422[0]?.is_used).toBe(false);

      const grantAfter422 = queryPgJson<{ is_consumed: boolean }>(
        cfg,
        `SELECT is_consumed FROM identity.password_reset_tokens
         WHERE normalized_email = ${sqlLiteral(OTP_RESET_ADMIN_EMAIL)}
           AND purpose = 'reset-grant'
         ORDER BY created_at DESC LIMIT 1`
      );
      expect(grantAfter422[0]?.is_consumed).toBe(false);

      // Retry with the SAME OTP / resetGrantToken using a strong valid password (zero context/brand tokens)
      const newStrongPassword = `AuroraPeak!${Date.now().toString(36)}#Q8`;
      await newPwdInput.fill(newStrongPassword);
      await confirmPwdInput.fill(newStrongPassword);
      await expect(resetSubmitBtn).toBeEnabled();

      const successResetPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/reset-password") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await resetSubmitBtn.click();
      const successResetRes = await successResetPromise;
      expect(successResetRes.status()).toBe(204);

      // Success step -> Go to Login -> `/login?reset=success` (NO auto-login!)
      const goToLoginBtn = page.getByRole("button", { name: /Go to Login|تسجيل الدخول/i });
      await expect(goToLoginBtn).toBeVisible({ timeout: 10_000 });
      await goToLoginBtn.click();

      await page.waitForURL((url) => url.pathname === "/login" && url.searchParams.get("reset") === "success", {
        timeout: 20_000,
      });
      await waitForAppSettled(page, true);
      await expect(page.getByTestId("login-reset-success-banner")).toBeVisible({ timeout: 10_000 });
      await capturePng(page, "08-login-reset-success-banner-en-desktop.png");

      // Verify NO auto-login occurred
      const cookiesAtLoginBanner = await page.context().cookies();
      expect(cookiesAtLoginBanner.find((c) => c.name === cfg.refreshCookieName)).toBeUndefined();
      const storageStateAfterReset = await page.evaluate(() => localStorage.getItem("app-storage"));
      if (storageStateAfterReset) {
        const parsed = JSON.parse(storageStateAfterReset) as { state?: { isAuthenticated?: boolean } };
        expect(parsed.state?.isAuthenticated).not.toBe(true);
      }

      // Verify sign-in succeeds with NEW password, HttpOnly cookie parity, and capture state for Test 3
      await loginViaUi(page, OTP_RESET_ADMIN_EMAIL, newStrongPassword);
      await page.reload({ waitUntil: "networkidle" });
      await waitForAppSettled(page);
      expect(page.url()).not.toContain("/login");
      const resetCookies = await page.context().cookies();
      const resetRefresh = resetCookies.find((c) => c.name === cfg.refreshCookieName);
      expect(resetRefresh?.httpOnly).toBe(true);
      const resetLsEntries = await page.evaluate(() =>
        Object.entries(localStorage)
      );
      resetSignedInState = {
        cookies: resetCookies,
        localStorageEntries: resetLsEntries,
        currentPassword: newStrongPassword,
      };

      // 2B. `#token=` fragment arrival + `history.replaceState` URL scrubbing check (`community.admin@scripe-dev.local`)
      await resetBrowserSession(page, "en");
      await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#fp-email")).toBeVisible({ timeout: 20_000 });
      await page.locator("#fp-email").fill(MAGIC_LINK_ADMIN_EMAIL);
      await page.locator("form button[type='submit']").first().click();

      const magicBtn = page.getByRole("button", { name: /Magic link/i });
      await expect(magicBtn).toBeVisible({ timeout: 10_000 });
      const magicReqPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/request-password-reset") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await magicBtn.click();
      const magicReqRes = await magicReqPromise;
      expect(magicReqRes.status()).toBe(202);

      // Bind known ephemeral token hash on the freshly minted magic-link row (out-of-band inbox oracle)
      const magicRows = queryPgJson<{ id: string }>(
        cfg,
        `SELECT id::text FROM identity.password_reset_tokens
         WHERE normalized_email = ${sqlLiteral(MAGIC_LINK_ADMIN_EMAIL)}
           AND purpose = 'magic-link'
           AND is_consumed = false
         ORDER BY created_at DESC LIMIT 1`
      );
      expect(magicRows.length).toBe(1);
      const rawMagicToken = randomBytes(24).toString("base64url");
      const hashedMagicToken = sha256LowerHex(rawMagicToken);
      execPg(
        cfg,
        `UPDATE identity.password_reset_tokens
         SET token_hash = ${sqlLiteral(hashedMagicToken)}
         WHERE id = ${sqlLiteral(magicRows[0].id)}::uuid;`
      );

      // Navigate via `#token=...&email=...` fragment on Mobile 390x844 and assert URL scrubbing
      await page.setViewportSize({ width: 390, height: 844 });
      const magicVerifyPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/verify-reset-otp") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await page.goto(
        `/reset-password#token=${encodeURIComponent(rawMagicToken)}&email=${encodeURIComponent(MAGIC_LINK_ADMIN_EMAIL)}&method=magic-link`,
        { waitUntil: "domcontentloaded" }
      );
      const magicVerifyRes = await magicVerifyPromise;
      expect(magicVerifyRes.status()).toBe(200);

      await expect(page.locator("#fp-new-password")).toBeVisible({ timeout: 15_000 });
      const scrubbedUrl = await page.evaluate(() => ({
        hash: window.location.hash,
        search: window.location.search,
        href: window.location.href,
      }));
      expect(scrubbedUrl.hash).toBe("");
      expect(scrubbedUrl.search).not.toContain("token");
      expect(scrubbedUrl.href).not.toContain(rawMagicToken);
      await assertNoHorizontalOverflow(page, "Magic-Link New Password Mobile");
      await capturePng(page, "07-reset-password-magic-link-mobile.png");

      const magicNewPwd = `QuartzHarbor!${Date.now().toString(36)}#M7`;
      await page.locator("#fp-new-password").fill(magicNewPwd);
      await page.locator("#fp-confirm-password").fill(magicNewPwd);
      const magicResetPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/reset-password") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await page.locator("form button[type='submit']").first().click();
      const magicResetRes = await magicResetPromise;
      expect(magicResetRes.status()).toBe(204);

      monitor.assertClean("Test 2 Forgot/Reset Password");
    } finally {
      monitor.dispose();
    }
  });

  test("3. Authenticated profile change password (/account/security) performs in-place cookie rotation and survives hard reload", async ({
    page,
  }) => {
    const monitor = attachRuntimeErrorMonitor(page);
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await resetBrowserSession(page, "en");
      let activeCurrentPassword = devPassword;
      if (resetSignedInState) {
        await page.context().addCookies(resetSignedInState.cookies);
        await page.evaluate((entries) => {
          localStorage.clear();
          for (const [k, v] of entries) {
            localStorage.setItem(k, v);
          }
        }, resetSignedInState.localStorageEntries);
        activeCurrentPassword = resetSignedInState.currentPassword;
      } else {
        await loginViaUi(page, PRO_ADMIN_EMAIL, devPassword);
      }

      await page.goto("/account/security", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      const newPwdInput = page.locator("#account-security-new-password");
      await expect(newPwdInput).toBeVisible({ timeout: 20_000 });

      const currentPwdInput = page.locator("input[autocomplete='current-password']").first();
      const confirmPwdInput = page.locator("input[autocomplete='new-password']").nth(1);
      const rotatedPassword = `VeloSummit!${Date.now().toString(36)}#R4`;

      await currentPwdInput.fill(activeCurrentPassword);
      await newPwdInput.fill(rotatedPassword);
      await confirmPwdInput.fill(rotatedPassword);

      const updateBtn = page.getByRole("button", { name: /Update Password|تحديث كلمة المرور/i });
      await expect(updateBtn).toBeEnabled({ timeout: 10_000 });

      const changeResPromise = page.waitForResponse(
        (res) =>
          /\/api\/v1\/admins\/[^/]+\/change-password/i.test(res.url()) &&
          res.request().method() === "POST" &&
          res.status() !== 403,
        { timeout: 25_000 }
      );
      await updateBtn.click();

      const sudoModal = page.getByTestId("sudo-verification-modal");
      await expect(sudoModal).toBeVisible({ timeout: 15_000 });
      const pwdTab = sudoModal.getByTestId("sudo-tab-password");
      if ((await pwdTab.count()) > 0) {
        await pwdTab.click();
      }
      const sudoPwdInput = sudoModal.getByTestId("sudo-password-input");
      await expect(sudoPwdInput).toBeVisible({ timeout: 10_000 });
      await sudoPwdInput.fill(activeCurrentPassword);

      const sudoVerifyPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/sudo/verify") &&
          res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await sudoModal.getByTestId("sudo-verify-submit-btn").click();
      expect((await sudoVerifyPromise).status()).toBe(200);
      await expect(sudoModal).toBeHidden({ timeout: 15_000 });

      const changeRes = await changeResPromise;
      expect(changeRes.status()).toBe(200);

      // Verify in-place cookie rotation & refreshToken stripped from JSON body
      const changeBody = unwrapApiData<Record<string, unknown>>(await changeRes.json());
      expect(changeBody.refreshToken ?? null).toBeNull();
      const cookiesAfterChange = await page.context().cookies();
      const rotatedCookie = cookiesAfterChange.find((c) => c.name === cfg.refreshCookieName);
      expect(rotatedCookie?.httpOnly).toBe(true);
      expect(rotatedCookie?.value.length).toBeGreaterThan(10);

      await expect(page.getByTestId("password-change-success")).toBeVisible({ timeout: 10_000 });
      await capturePng(page, "09-account-security-change-password-en-desktop.png");

      // Hard reload must keep caller signed in on /account/security
      await page.reload({ waitUntil: "networkidle" });
      await waitForAppSettled(page);
      expect(new URL(page.url()).pathname).toBe("/account/security");
      await expect(newPwdInput).toBeVisible({ timeout: 15_000 });

      monitor.assertClean("Test 3 Profile Change Password");
    } finally {
      monitor.dispose();
    }
  });

  test("4. Mandatory 2FA wall (mfa_enroll=true) blocks tenant dashboard bypass on Enterprise AHLY admin and verifies AR/RTL mobile responsiveness", async ({
    page,
  }) => {
    const monitor = attachRuntimeErrorMonitor(page);
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await resetBrowserSession(page, "en");

      const { payload } = await loginViaUi(page, MANDATORY_MFA_ADMIN_EMAIL, devPassword, {
        expectPath: /\/account\/security/,
      });
      expect(payload.requireMfaEnrollment).toBe(true);
      expect(page.url()).toContain("mfa_enroll=true");

      const mfaBanner = page.getByTestId("mfa-enrollment-required-banner");
      await expect(mfaBanner).toBeVisible({ timeout: 15_000 });
      await capturePng(page, "10-account-security-mfa-enroll-wall-en-desktop.png");

      // Attempt bypass directly to dashboard routes without enrolling MFA
      await page.goto("/overview", { waitUntil: "domcontentloaded" });
      await page.waitForURL((url) => url.pathname === "/account/security" && url.searchParams.get("mfa_enroll") === "true", {
        timeout: 20_000,
      });
      await expect(mfaBanner).toBeVisible({ timeout: 15_000 });

      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForURL((url) => url.pathname === "/account/security" && url.searchParams.get("mfa_enroll") === "true", {
        timeout: 20_000,
      });

      // Switch to Mobile 390x844 + AR/RTL + Light theme and verify layout & zero horizontal overflow
      await page.setViewportSize({ width: 390, height: 844 });
      await switchUiLanguage(page, "ar");
      await toggleAuthTheme(page, "light");
      await expect(mfaBanner).toBeVisible({ timeout: 10_000 });
      await assertNoHorizontalOverflow(page, "Mandatory 2FA Wall Mobile AR/RTL Light");
      await capturePng(page, "11-account-security-mfa-enroll-ar-rtl-mobile.png");

      monitor.assertClean("Test 4 Mandatory 2FA Wall");
    } finally {
      monitor.dispose();
    }
  });

  test("5. Admin management dialog (/admins) enforces dynamic tenant password policy without hardcoded defaults", async ({
    page,
  }) => {
    const monitor = attachRuntimeErrorMonitor(page);
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await resetBrowserSession(page, "en");
      await loginViaUi(page, PLATFORM_ADMIN_EMAIL, devPassword);

      const policyResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/password-policy") &&
          res.request().method() === "GET",
        { timeout: 20_000 }
      );
      await page.goto("/admins", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      const policyRes = await policyResPromise;
      expect(policyRes.status()).toBe(200);

      const policyPayload = unwrapApiData<Record<string, unknown>>(await policyRes.json());
      const expectedMinLength = Number(policyPayload.minLength ?? 8);
      expect(expectedMinLength).toBeGreaterThanOrEqual(8);

      const searchInput = page
        .locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="بحث"]')
        .first();
      await expect(searchInput).toBeVisible({ timeout: 20_000 });

      const searchResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/admins") &&
          res.request().method() === "GET" &&
          res.url().toLowerCase().includes("opsadmin"),
        { timeout: 20_000 }
      );
      await searchInput.fill("opsadmin");
      const searchRes = await searchResPromise;
      expect(searchRes.status()).toBe(200);

      const targetRow = page.locator("tr", { hasText: TARGET_DIALOG_ADMIN_EMAIL }).first();
      await expect(targetRow).toBeVisible({ timeout: 15_000 });

      const rowActionsBtn: Locator = targetRow
        .locator('button[aria-label="Actions"], button[aria-label="الإجراءات"], button')
        .last();
      await rowActionsBtn.click();

      const resetPwdMenuItem = page.getByRole("menuitem", { name: /Reset Password|إعادة تعيين كلمة المرور/i });
      await expect(resetPwdMenuItem).toBeVisible({ timeout: 10_000 });
      await resetPwdMenuItem.click();

      const dialog = page.locator("[role='dialog']").last();
      await expect(dialog).toBeVisible({ timeout: 10_000 });
      await expect(dialog).not.toContainText("Reset Password Description");
      await expect(dialog).toContainText(/Reset password for|إعادة تعيين كلمة المرور/i);

      const dialogInput = page.locator("#admin-reset-password");
      await expect(dialogInput).toBeVisible({ timeout: 10_000 });
      await expect(dialogInput).toHaveValue("");

      // Verify dynamic server password policy rendered inside ResetPasswordDialog
      const checklist = page.getByTestId("password-policy-checklist");
      await expect(checklist).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("pwd-rule-minLength")).toContainText(String(expectedMinLength));

      // Enter weak short value -> confirm Reset Password submit remains disabled
      await dialogInput.fill("Ab1");
      await expect(page.getByTestId("pwd-rule-minLength")).toHaveAttribute("data-met", "false");
      const dialogSubmitBtn = page
        .locator("[role='dialog'] button")
        .filter({ hasText: /Reset Password|إعادة تعيين كلمة المرور/i })
        .last();
      await expect(dialogSubmitBtn).toBeDisabled();

      await capturePng(page, "12-admins-reset-password-policy-dialog-en-desktop.png");

      await page
        .locator("[role='dialog'] button")
        .filter({ hasText: /Cancel|إلغاء/i })
        .first()
        .click();

      monitor.assertClean("Test 5 Admins Reset Password Dialog");
    } finally {
      monitor.dispose();
    }
  });
});
