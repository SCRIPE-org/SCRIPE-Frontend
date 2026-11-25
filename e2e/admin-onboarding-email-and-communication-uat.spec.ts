import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  expect,
  test,
  type APIResponse,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

/**
 * Unmocked Live E2E Acceptance Suite:
 * Admin Onboarding Setup Email Dispatch, Resend Cooldown, Account Activation & Communication Lifecycle.
 *
 * Invariants verified against live ASP.NET Core (:5035), PostgreSQL (SCRIPE_UAT), Hangfire, and Next.js (:3000):
 * - Zero `page.route()` network stubs or mocks.
 * - Zero hardcoded or logged plaintext credentials/tokens.
 * - Create Admin (`sendSetupEmail: true`) dispatches `"AccountSetup"` automatically via `IEmailQueue` -> Hangfire
 *   `EmailJobProcessor` with ZERO calls to `POST /api/v1/account-setup/resend` and ZERO `ObjectDisposedException`s.
 * - Resend Setup Email enforces honest 60-second cooldown (`429` + cooldown toast) and rotates token hash.
 * - `/setup-account` strips `token` from the browser URL bar immediately, activates the admin atomically,
 *   enables `/login` with the newly configured password, and clears `Pending Setup` to `Active`.
 * - `/communication/templates` Create, Edit, Clone, Publish (`v2`), and Archive (`Inactive`) use encrypted IDs
 *   and persist in `communication.message_templates` + `communication.message_template_versions` across hard reloads.
 * - `/communication/message-composer` sends `To` + `CC` + `BCC` in a single `POST /api/v1/emails/send` call,
 *   persists in `communication.sent_email_logs`, cancels scheduled pending mail across hard reloads,
 *   resends manual mail, and refuses resending one-time auth token emails (`AccountSetup` / `SenderRole.Auth`).
 */

const BASE_URL = (process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const API_URL = (process.env.PLAYWRIGHT_API_URL || "http://localhost:5035").replace(/\/+$/, "");
const PSQL_EXE = process.env.PSQL_PATH || "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";

const BACKEND_LOCAL_SETTINGS = path.resolve(
  __dirname,
  "../../SCRIPE-Backend/src/Host/API/appsettings.local.json"
);
const BACKEND_DAEMON_LOG =
  process.env.SCRIPE_BACKEND_DAEMON_LOG ||
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/8a81a970-d60b-420a-ae80-fa243ca19129/.system_generated/tasks/task-4206.log";
const BRAIN_SCREENSHOT_DIR =
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/8a81a970-d60b-420a-ae80-fa243ca19129/screenshots";
const DOCS_SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../docs/architecture/authorization-remediation/screenshots"
);

const TENANT_SUPER_ADMIN_EMAIL = "seif@scripe.org";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PgConfig {
  PGHOST: string;
  PGPORT: string;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
}

interface AuthenticatedTenantSession {
  accessToken: string;
  tenantId: string | null;
  storageState: Awaited<ReturnType<BrowserContext["storageState"]>>;
}

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

function loadPgConfig(): PgConfig {
  if (!fs.existsSync(BACKEND_LOCAL_SETTINGS)) {
    throw new Error(`Missing backend local settings at ${BACKEND_LOCAL_SETTINGS}`);
  }
  const parsed = JSON.parse(stripJsonComments(fs.readFileSync(BACKEND_LOCAL_SETTINGS, "utf8"))) as {
    Database?: { ConnectionString?: string };
  };
  const connStr = parsed.Database?.ConnectionString || "";
  const kv: Record<string, string> = {};
  for (const part of connStr.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      kv[part.slice(0, idx).trim().toLowerCase()] = part.slice(idx + 1).trim();
    }
  }
  return {
    PGHOST: kv.host || "localhost",
    PGPORT: kv.port || "5432",
    PGDATABASE: kv.database || "SCRIPE_UAT",
    PGUSER: kv.username || kv["user id"] || "postgres",
    PGPASSWORD: kv.password || "",
  };
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function queryPgJson<T>(pgEnv: PgConfig, sql: string): T[] {
  const wrapped = `SELECT COALESCE(json_agg(t), '[]'::json)::text FROM (${sql}) t;`;
  const raw = execFileSync(PSQL_EXE, ["-X", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", wrapped], {
    env: { ...process.env, ...pgEnv },
    encoding: "utf8",
  }).trim();
  return raw ? (JSON.parse(raw) as T[]) : [];
}

function execPg(pgEnv: PgConfig, sql: string): void {
  execFileSync(PSQL_EXE, ["-X", "-v", "ON_ERROR_STOP=1", "-c", sql], {
    env: { ...process.env, ...pgEnv },
    encoding: "utf8",
  });
}

function mutationHeaders(accessToken: string, extra: Record<string, string> = {}) {
  const nonce = randomUUID();
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Request-Timestamp": Date.now().toString(),
    "X-Request-Nonce": nonce,
    ...extra,
  };
}

async function waitForRateLimitRetry(retryAfterHeader: string | undefined, attempt: number) {
  const parsed = Number(retryAfterHeader || "60");
  const delaySec =
    Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed + 3, 180) : 25 + attempt * 15;
  await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
}

async function sendWithRateLimitRetry(fn: () => Promise<APIResponse>): Promise<APIResponse> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fn();
    if (res.status() === 429 && attempt < 3) {
      await waitForRateLimitRetry(res.headers()["retry-after"], attempt);
      continue;
    }
    return res;
  }
  return fn();
}

async function waitForAppSettled(page: Page, timeoutMs = 25_000) {
  await page.waitForLoadState("domcontentloaded", { timeout: timeoutMs });
  await page
    .waitForFunction(
      () => {
        const bodyText = document.body?.innerText?.trim() ?? "";
        if (!bodyText) return false;
        if (
          bodyText.includes("We are getting everything ready for you") ||
          bodyText.includes("تجهيز كل شيء من أجلك")
        ) {
          return false;
        }
        const activeSkeletons = document.querySelectorAll('[data-slot="skeleton"], .animate-pulse');
        return activeSkeletons.length === 0;
      },
      null,
      { timeout: Math.min(timeoutMs, 20_000) }
    )
    .catch(() => {});
  await page.waitForTimeout(350);
}

async function applyDarkEnglishTheme(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("scr_pref_lang", "en");
    document.cookie = "scr_lang=en; path=/; SameSite=Lax";
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark");
    localStorage.setItem("scr_pref_theme", "dark");
  });
  await page.waitForTimeout(150);
}

async function saveScreenshot(page: Page, filename: string, fullPage = false): Promise<string> {
  fs.mkdirSync(BRAIN_SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(DOCS_SCREENSHOT_DIR, { recursive: true });
  const target = path.join(BRAIN_SCREENSHOT_DIR, filename);
  const docsTarget = path.join(DOCS_SCREENSHOT_DIR, filename);
  await page.waitForTimeout(350);
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow on ${filename}: ${metrics.scrollWidth} > ${metrics.clientWidth}`
  ).toBeLessThanOrEqual(metrics.clientWidth + 4);
  await page.screenshot({ path: target, fullPage, animations: "disabled" });
  fs.copyFileSync(target, docsTarget);
  return target;
}

function attachServerErrorGuard(page: Page) {
  const serverErrors: string[] = [];
  page.on("response", (res) => {
    const url = res.url();
    if (!url.startsWith(API_URL) && !url.startsWith(BASE_URL)) return;
    if (res.status() >= 500) {
      serverErrors.push(`${res.status()} ${res.request().method()} ${url}`);
    }
  });
  return {
    assertZeroServerErrors(scope: string) {
      expect(serverErrors, `Unexpected 5xx responses in ${scope}: ${serverErrors.join(" | ")}`).toEqual(
        []
      );
    },
  };
}

async function loginTenantAdminViaUi(
  browser: Browser,
  identifier: string,
  password: string
): Promise<{
  context: BrowserContext;
  page: Page;
  session: AuthenticatedTenantSession;
  guard: ReturnType<typeof attachServerErrorGuard>;
}> {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const guard = attachServerErrorGuard(page);

  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await applyDarkEnglishTheme(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForAppSettled(page);
  await applyDarkEnglishTheme(page);

  await expect(page.locator("#identifier")).toBeVisible({ timeout: 20_000 });

  let accessToken = "";
  let tenantId: string | null = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.locator("#identifier").fill(identifier);
    await page.locator("#password").fill(password);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 });

    const loginResPromise = page.waitForResponse(
      (res) =>
        res.url().toLowerCase().includes("/api/v1/auth/admin/login") &&
        res.request().method() === "POST",
      { timeout: 30_000 }
    );
    await submitBtn.click();
    const loginRes = await loginResPromise;

    if (loginRes.status() === 429 && attempt < 3) {
      await waitForRateLimitRetry(loginRes.headers()["retry-after"], attempt);
      continue;
    }

    expect(loginRes.ok(), `UI login failed for ${identifier}: ${loginRes.status()}`).toBeTruthy();
    const raw = (await loginRes.json()) as {
      accessToken?: string;
      requiresWorkspaceSelection?: boolean;
      userProfile?: { tenantId?: string | null };
      data?: {
        accessToken?: string;
        requiresWorkspaceSelection?: boolean;
        userProfile?: { tenantId?: string | null };
      };
    };
    const body = raw.accessToken || raw.requiresWorkspaceSelection ? raw : (raw.data ?? raw);

    if (body.requiresWorkspaceSelection) {
      const workspaceList = page.locator('ul[aria-label*="Available workspaces" i]');
      await expect(workspaceList).toBeVisible({ timeout: 15_000 });
      const wsResPromise = page.waitForResponse(
        (r) =>
          r.url().toLowerCase().includes("/api/v1/auth/") && r.request().method() === "POST",
        { timeout: 25_000 }
      );
      await workspaceList
        .locator("button, [role='button']")
        .filter({ hasText: /SCRIPE/i })
        .first()
        .click();
      const wsRes = await wsResPromise;
      expect(wsRes.ok()).toBeTruthy();
      const wsJson = (await wsRes.json()) as {
        accessToken?: string;
        userProfile?: { tenantId?: string | null };
        data?: { accessToken?: string; userProfile?: { tenantId?: string | null } };
      };
      const wsData = wsJson.accessToken ? wsJson : (wsJson.data ?? wsJson);
      accessToken = wsData.accessToken ?? "";
      tenantId = wsData.userProfile?.tenantId ?? null;
    } else {
      accessToken = body.accessToken ?? "";
      tenantId = body.userProfile?.tenantId ?? null;
    }
    break;
  }

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25_000 });
  await waitForAppSettled(page);
  expect(accessToken.length).toBeGreaterThan(20);

  const storageState = await context.storageState();
  return {
    context,
    page,
    session: { accessToken, tenantId, storageState },
    guard,
  };
}

async function clickRowAction(page: Page, row: Locator, actionLabel: RegExp) {
  const inlineButton = row.getByRole("button", { name: actionLabel }).first();
  if ((await inlineButton.count()) > 0 && (await inlineButton.isVisible())) {
    await inlineButton.click();
    return;
  }

  const menuTrigger = row.locator('button[aria-haspopup="menu"]').last();
  await expect(menuTrigger).toBeVisible({ timeout: 10_000 });
  await menuTrigger.click();
  const menuItem = page.getByRole("menuitem", { name: actionLabel }).first();
  await expect(menuItem).toBeVisible({ timeout: 10_000 });
  await menuItem.click();
}

/**
 * Extracts the latest `SetupUrl` from Hangfire's serialized job arguments in PostgreSQL
 * for a given recipient email without ever logging or printing the token.
 */
function extractLatestSetupUrlFromHangfire(pgEnv: PgConfig, recipientEmail: string): {
  jobCount: number;
  succeededCount: number;
  stateHistoryCount: number;
  setupUrl: string;
} {
  const rows = queryPgJson<{
    id: number;
    statename: string | null;
    arguments: string;
    state_count: number;
  }>(
    pgEnv,
    `SELECT j.id,
            j.statename,
            j.arguments::text AS arguments,
            (SELECT COUNT(*)::int FROM hangfire.state s WHERE s.jobid = j.id AND s.name = 'Succeeded') AS state_count
       FROM hangfire.job j
      WHERE j.arguments::text ILIKE ${sqlLiteral(`%${recipientEmail}%`)}
        AND j.arguments::text LIKE '%AccountSetup%'
      ORDER BY j.id DESC`
  );

  const succeededCount = rows.filter((r) => r.statename === "Succeeded" || r.state_count > 0).length;
  const stateHistoryCount = rows.reduce((acc, r) => acc + (r.state_count ?? 0), 0);
  let setupUrl = "";

  for (const row of rows) {
    try {
      const outerArgs = JSON.parse(row.arguments) as unknown[];
      for (const arg of outerArgs) {
        if (typeof arg === "string" && arg.includes("SetupUrl")) {
          const parsedArg = JSON.parse(arg) as Record<string, unknown>;
          if (typeof parsedArg?.SetupUrl === "string" && parsedArg.SetupUrl.includes("token=")) {
            setupUrl = parsedArg.SetupUrl;
            break;
          }
        } else if (arg && typeof arg === "object" && "SetupUrl" in arg) {
          const val = (arg as Record<string, unknown>).SetupUrl;
          if (typeof val === "string" && val.includes("token=")) {
            setupUrl = val;
            break;
          }
        }
      }
      if (setupUrl) break;
    } catch {
      // ignore parse failure and fall through to regex
    }
    const unescaped = row.arguments.replace(/\\"/g, '"').replace(/\\u0026/gi, "&");
    const match = unescaped.match(/https?:\/\/[^\s"\\]+setup-account[^\s"\\]+/);
    if (match?.[0]) {
      setupUrl = match[0];
      break;
    }
  }

  return {
    jobCount: rows.length,
    succeededCount,
    stateHistoryCount,
    setupUrl,
  };
}

test.describe("Admin Onboarding Setup Email, Activation & Communication Live UAT", () => {
  test.describe.configure({ mode: "serial", timeout: 360_000 });

  const pgEnv = loadPgConfig();
  const runSuffix = `${Date.now().toString().slice(-6)}${randomBytes(2).toString("hex")}`;
  const adminPassword = getDevAdminPassword();

  // Ephemeral runtime-generated password for the invited admin (never logged or persisted in source).
  const invitedAdminPassword = `Uat#${randomBytes(6).toString("hex")}Aa9!`;
  const invitedUsername = `uat_inv_${runSuffix}`;
  const invitedEmail = `uat.invite.${runSuffix}@scripe-dev.local`;
  const invitedFirstName = "Nadia";
  const invitedLastName = `Mansour${runSuffix.slice(0, 4)}`;
  const resendUsername = `uat_rsd_${runSuffix}`;
  const resendEmail = `uat.resend.${runSuffix}@scripe-dev.local`;

  const templateKey = `uat_welcome_${runSuffix}`;
  const manualToEmail = `uat.to.${runSuffix}@scripe-dev.local`;
  const manualCcEmail = `uat.cc.${runSuffix}@scripe-dev.local`;
  const manualBccEmail = `uat.bcc.${runSuffix}@scripe-dev.local`;
  const manualSubject = `UAT Manual Dispatch ${runSuffix}`;
  const deferredSubject = `UAT Scheduled Cancel ${runSuffix}`;
  const authProbeSubject = `UAT OneTime Auth Probe ${runSuffix}`;

  let sharedSession: AuthenticatedTenantSession | null = null;
  let saContext: BrowserContext | null = null;
  let saPage: Page | null = null;
  let saGuard: ReturnType<typeof attachServerErrorGuard> | null = null;
  let daemonLogStartBytes = 0;
  let createdSetupUrl = "";
  let createdTemplateEncryptedId = "";
  let clonedTemplateEncryptedId = "";
  let authProbeRowId = "";

  test.beforeAll(async ({ browser }) => {
    if (fs.existsSync(BACKEND_DAEMON_LOG)) {
      daemonLogStartBytes = fs.statSync(BACKEND_DAEMON_LOG).size;
    }
    const loggedIn = await loginTenantAdminViaUi(
      browser,
      TENANT_SUPER_ADMIN_EMAIL,
      adminPassword
    );
    saContext = loggedIn.context;
    saPage = loggedIn.page;
    saGuard = loggedIn.guard;
    sharedSession = loggedIn.session;
  });

  test.afterAll(async () => {
    if (saContext) {
      await saContext.close().catch(() => {});
      saContext = null;
    }
    // Clean up disposable test records so tenant admin/template quotas remain clean across reruns.
    for (const targetEmail of [invitedEmail, resendEmail]) {
      try {
        execPg(
          pgEnv,
          `DELETE FROM identity.admin_roles WHERE admin_id IN (SELECT id FROM identity.admins WHERE lower(email) = lower(${sqlLiteral(targetEmail)}));
           DELETE FROM identity.refresh_tokens WHERE admin_id IN (SELECT id FROM identity.admins WHERE lower(email) = lower(${sqlLiteral(targetEmail)}));
           DELETE FROM identity.admins WHERE lower(email) = lower(${sqlLiteral(targetEmail)});`
        );
      } catch {
        // ignore cleanup failures
      }
    }
    try {
      execPg(
        pgEnv,
        `DELETE FROM communication.message_template_versions WHERE template_id IN (
           SELECT id FROM communication.message_templates WHERE key LIKE ${sqlLiteral(`${templateKey}%`)}
         );
         DELETE FROM communication.message_templates WHERE key LIKE ${sqlLiteral(`${templateKey}%`)};`
      );
    } catch {
      // ignore cleanup failures
    }
    if (authProbeRowId) {
      try {
        execPg(
          pgEnv,
          `DELETE FROM communication.sent_email_logs WHERE id = ${sqlLiteral(authProbeRowId)}::uuid;`
        );
      } catch {
        // ignore cleanup failures
      }
    }
  });

  test("1. Create Admin (sendSetupEmail: true) automatically dispatches AccountSetup via Hangfire with zero resend calls", async () => {
    expect(saPage).not.toBeNull();
    const page = saPage!;
    const guard = saGuard!;

    const resendRequests: string[] = [];
    const onReq = (req: import("@playwright/test").Request) => {
      if (req.url().toLowerCase().includes("/api/v1/account-setup/resend")) {
        resendRequests.push(`${req.method()} ${req.url()}`);
      }
    };
    page.on("request", onReq);

    try {
      await page.goto(`${BASE_URL}/admins`, { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await applyDarkEnglishTheme(page);

      // Click primary "Add" button on /admins
      const addButton = page.getByRole("button", { name: /^Add$/i }).first();
      await expect(addButton).toBeVisible({ timeout: 15_000 });
      await addButton.click();

      const dialog = page.getByRole("dialog").first();
      await expect(dialog).toBeVisible({ timeout: 10_000 });

      // Verify "Send setup email" switch is enabled by default and password input is hidden
      const sendSetupSwitch = dialog
        .locator('button[role="switch"]')
        .filter({ has: page.locator("*") })
        .first();
      const allSwitches = dialog.locator('button[role="switch"]');
      const switchCount = await allSwitches.count();
      expect(switchCount).toBeGreaterThanOrEqual(1);
      await expect(sendSetupSwitch).toHaveAttribute("aria-checked", "true");
      await expect(dialog.getByPlaceholder("Enter password")).toHaveCount(0);

      // Select an assignable tenant role via GenericSelect's role="combobox" trigger (aria-label="Roles")
      const rolesCombobox = dialog.getByRole("combobox", { name: /^Roles$/i });
      await expect(rolesCombobox).toBeVisible({ timeout: 10_000 });
      await rolesCombobox.click();

      const roleOption = page
        .getByRole("option")
        .filter({
          hasText:
            /Internal Read-Only Auditor|Venue Arena Coordinator|HR Coordinator|Sales Development Representative/i,
        })
        .first();
      await expect(roleOption).toBeVisible({ timeout: 10_000 });
      await roleOption.click();
      await dialog.getByPlaceholder("Enter username").click();

      await dialog.getByPlaceholder("Enter username").fill(invitedUsername);
      await dialog.getByPlaceholder("Enter first name").fill(invitedFirstName);
      await dialog.getByPlaceholder("Enter last name").fill(invitedLastName);
      const invitedPhoneNational = `202${String(Math.floor(2000000 + Math.random() * 7999999))}`;
      await dialog.getByPlaceholder("Enter phone number").fill(invitedPhoneNational);

      const emailInput = dialog.getByPlaceholder("Enter email");
      await expect(emailInput).toHaveAttribute("type", "email");
      await emailInput.fill(invitedEmail);

      const createResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/admins") && res.request().method() === "POST",
        { timeout: 25_000 }
      );

      await dialog.locator('button[type="submit"]').click();
      const createRes = await createResPromise;
      const createBodyText = await createRes.text();
      expect(
        createRes.status(),
        `Create Admin POST status (body: ${createBodyText.slice(0, 300)})`
      ).toBe(201);

      const createPayload = JSON.parse(createBodyText) as { id?: string; data?: string };
      const encryptedAdminId =
        typeof createPayload.id === "string"
          ? createPayload.id
          : typeof createPayload.data === "string"
            ? createPayload.data
            : "";
      expect(encryptedAdminId.length).toBeGreaterThan(10);
      expect(encryptedAdminId).not.toMatch(UUID_REGEX);

      // Assert mode-aware Sileo invitation toast (hover pill to reveal description if collapsed)
      const createdToastTitle = page.getByText("Administrator Created", { exact: false }).first();
      await expect(createdToastTitle).toBeVisible({ timeout: 10_000 });
      await createdToastTitle.hover().catch(() => {});
      await expect(
        page.getByText(/account setup invitation email was sent|Administrator Created/i).first()
      ).toBeVisible({ timeout: 5_000 });

      // Search for the newly created admin so the row is guaranteed visible on page 1
      const searchInput = page
        .locator('main input[type="search"], main input[placeholder*="Search" i]')
        .first();
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill(invitedEmail);
        await page.waitForTimeout(700);
      }

      const adminRow = page.locator("tr").filter({ hasText: invitedEmail }).first();
      await expect(adminRow).toBeVisible({ timeout: 15_000 });
      const pendingBadge = adminRow.getByText("Pending Setup", { exact: true });
      await pendingBadge.scrollIntoViewIfNeeded().catch(() => {});
      await expect(pendingBadge).toBeVisible({
        timeout: 10_000,
      });

      // Network spy invariant: ZERO calls to /api/v1/account-setup/resend during Create Admin!
      expect(resendRequests, "Create Admin must NOT call /account-setup/resend").toEqual([]);

      // Wait briefly for Hangfire worker on 'emails' queue to finish processing AccountSetup
      let hfResult = { jobCount: 0, succeededCount: 0, stateHistoryCount: 0, setupUrl: "" };
      for (let poll = 0; poll < 20; poll++) {
        hfResult = extractLatestSetupUrlFromHangfire(pgEnv, invitedEmail);
        if (hfResult.succeededCount >= 1 && hfResult.setupUrl) break;
        await page.waitForTimeout(500);
      }

      expect(hfResult.jobCount, "Hangfire AccountSetup job count after Create Admin").toBe(1);
      expect(hfResult.succeededCount, "Hangfire AccountSetup Succeeded state count").toBe(1);
      expect(hfResult.stateHistoryCount, "Hangfire state table Succeeded count").toBeGreaterThanOrEqual(1);
      expect(hfResult.setupUrl).toContain("setup-account");
      createdSetupUrl = hfResult.setupUrl;

      // Out-of-band PostgreSQL check on identity.admins
      const dbAdmins = queryPgJson<{
        id: string;
        is_account_activated: boolean;
        account_setup_token_hash: string | null;
        account_setup_token_expiry: string | null;
      }>(
        pgEnv,
        `SELECT id::text, is_account_activated, account_setup_token_hash, account_setup_token_expiry::text
           FROM identity.admins
          WHERE lower(email) = lower(${sqlLiteral(invitedEmail)})`
      );
      expect(dbAdmins).toHaveLength(1);
      expect(dbAdmins[0].is_account_activated).toBe(false);
      expect(dbAdmins[0].account_setup_token_hash).toBeTruthy();
      expect(dbAdmins[0].account_setup_token_expiry).toBeTruthy();

      // Backend daemon log oracle: poll briefly for async Serilog stdout flush after Hangfire Succeeded
      if (fs.existsSync(BACKEND_DAEMON_LOG)) {
        let recentLog = "";
        for (let lp = 0; lp < 16; lp++) {
          const fd = fs.openSync(BACKEND_DAEMON_LOG, "r");
          const stat = fs.fstatSync(fd);
          const lengthToRead = Math.max(0, stat.size - daemonLogStartBytes);
          const buf = Buffer.alloc(lengthToRead);
          if (lengthToRead > 0) {
            fs.readSync(fd, buf, 0, lengthToRead, daemonLogStartBytes);
          }
          fs.closeSync(fd);
          recentLog = buf.toString("utf8");
          if (/Set up your account|Template:\s*AccountSetup/i.test(recentLog)) {
            break;
          }
          await page.waitForTimeout(400);
        }
        expect(recentLog).toContain("Queued account setup email for admin");
        expect(recentLog).toMatch(/Set up your account|Template:\s*AccountSetup/i);
        expect(recentLog).toContain("Credential: [REDACTED]");
        expect(recentLog).not.toContain("ObjectDisposedException");
      }

      await saveScreenshot(page, "29-admins-create-pending-setup.png");
      guard.assertZeroServerErrors("Create Admin (sendSetupEmail: true)");
    } finally {
      page.off("request", onReq);
    }
  });

  test("2. Zero-resend /setup-account activation enables /login & clears Pending Setup, and Resend Setup Email enforces token rotation & 60s cooldown", async ({
    browser,
  }) => {
    expect(sharedSession).not.toBeNull();
    expect(saContext).not.toBeNull();
    expect(saPage).not.toBeNull();
    expect(createdSetupUrl).toContain("setup-account");
    const adminPage = saPage!;
    const guard = saGuard!;

    // 2A. Complete /setup-account directly from CreateAdmin's automatic Hangfire SetupUrl (ZERO resend clicks!)
    const parsedSetupUrl = new URL(createdSetupUrl);
    const localSetupUrl = `${BASE_URL}${parsedSetupUrl.pathname}${parsedSetupUrl.search}${parsedSetupUrl.hash}`;

    const anonContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const setupPage = await anonContext.newPage();
    const setupGuard = attachServerErrorGuard(setupPage);

    try {
      await setupPage.goto(localSetupUrl, { waitUntil: "domcontentloaded" });
      await applyDarkEnglishTheme(setupPage);
      await expect(setupPage.locator("#setup-password")).toBeVisible({ timeout: 20_000 });

      // Security invariant: token query/hash parameter stripped immediately from browser address bar
      expect(setupPage.url()).toContain("/setup-account");
      expect(setupPage.url()).not.toContain("token=");

      await setupPage.locator("#setup-password").fill(invitedAdminPassword);
      await setupPage.locator("#setup-confirm").fill(invitedAdminPassword);

      const nextBtn = setupPage.getByRole("button", { name: /^Continue$|^Next$/i }).first();
      await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
      await nextBtn.click();

      // Profile details
      await expect(setupPage.locator("#admin-first-name")).toBeVisible({ timeout: 10_000 });
      await setupPage.locator("#admin-first-name").fill(invitedFirstName);
      await setupPage.locator("#admin-last-name").fill(invitedLastName);
      const setupPhoneInput = setupPage.locator('input[type="tel"]').first();
      if ((await setupPhoneInput.count()) > 0 && (await setupPhoneInput.isVisible())) {
        await setupPhoneInput.fill(`50${String(Math.floor(1000000 + Math.random() * 8999999))}`);
      }

      const completeSetupResPromise = setupPage.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/account-setup/") &&
          res.request().method() === "POST",
        { timeout: 25_000 }
      );

      const completeOrNextBtn = setupPage
        .getByRole("button", { name: /Complete Setup|Activate|^Continue$|^Next$/i })
        .first();
      await expect(completeOrNextBtn).toBeEnabled({ timeout: 10_000 });
      const labelText = (await completeOrNextBtn.innerText()).trim();
      await completeOrNextBtn.click();

      if (/^Continue$|^Next$/i.test(labelText)) {
        const finalCompleteBtn = setupPage
          .getByRole("button", { name: /Complete Setup|Activate/i })
          .first();
        await expect(finalCompleteBtn).toBeVisible({ timeout: 10_000 });
        await finalCompleteBtn.click();
      }

      const completeSetupRes = await completeSetupResPromise;
      expect(
        [200, 204],
        `Complete AccountSetup HTTP status (${completeSetupRes.status()})`
      ).toContain(completeSetupRes.status());

      // Wait for Stage 4 Launch Celebration view (Step 2 #admin-first-name unmounted)
      await expect(setupPage.locator("#admin-first-name")).toHaveCount(0, { timeout: 20_000 });
      await expect(setupPage.getByText(invitedEmail, { exact: false }).first()).toBeVisible({
        timeout: 20_000,
      });

      await saveScreenshot(setupPage, "31-setup-account-activation-complete.png");
      setupGuard.assertZeroServerErrors("/setup-account activation");
    } finally {
      await anonContext.close();
    }

    // Verify PostgreSQL state after activation
    const activatedRows = queryPgJson<{
      is_account_activated: boolean;
      account_setup_token_hash: string | null;
    }>(
      pgEnv,
      `SELECT is_account_activated, account_setup_token_hash
         FROM identity.admins
        WHERE lower(email) = lower(${sqlLiteral(invitedEmail)})`
    );
    expect(activatedRows).toHaveLength(1);
    expect(activatedRows[0].is_account_activated).toBe(true);
    expect(activatedRows[0].account_setup_token_hash).toBeNull();

    // Verify newly activated admin can log in through real /login UI
    const loginCheck = await loginTenantAdminViaUi(browser, invitedEmail, invitedAdminPassword);
    try {
      expect(loginCheck.page.url()).not.toContain("/login");
      loginCheck.guard.assertZeroServerErrors("Activated admin /login");
    } finally {
      await loginCheck.context.close();
    }

    // Hard reload /admins as tenant SA and verify Pending Setup badge cleared to Active
    await adminPage.goto(`${BASE_URL}/admins`, { waitUntil: "domcontentloaded" });
    await waitForAppSettled(adminPage);
    await applyDarkEnglishTheme(adminPage);

    const searchInput = adminPage
      .locator('main input[type="search"], main input[placeholder*="Search" i]')
      .first();
    if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
      await searchInput.fill(invitedEmail);
      await adminPage.waitForTimeout(700);
    }

    const refreshedRow = adminPage.locator("tr").filter({ hasText: invitedEmail }).first();
    await expect(refreshedRow).toBeVisible({ timeout: 15_000 });
    const activeBadge = refreshedRow.getByText("Active", { exact: true });
    await activeBadge.scrollIntoViewIfNeeded().catch(() => {});
    await expect(activeBadge).toBeVisible();
    await expect(refreshedRow.getByText("Pending Setup", { exact: true })).toHaveCount(0);

    await saveScreenshot(adminPage, "32-activated-admin-login-and-active-badge.png");

    // 2B. Resend Setup Email token rotation & 60s cooldown honesty on a pending invited admin
    const rolesRes = await saContext!.request.get(`${API_URL}/api/v1/roles/current-tenant`, {
      headers: { Authorization: `Bearer ${sharedSession!.accessToken}` },
    });
    expect(rolesRes.ok()).toBeTruthy();
    const rolesJson = (await rolesRes.json()) as
      | Array<{ id: string; name?: string; priority?: number }>
      | { items?: Array<{ id: string; name?: string; priority?: number }>; data?: Array<{ id: string; name?: string; priority?: number }> };
    const roleList = Array.isArray(rolesJson)
      ? rolesJson
      : rolesJson.items ?? rolesJson.data ?? [];
    const targetRole =
      roleList.find((r) => (r.priority ?? 1) > 0 && !/super|owner/i.test(r.name ?? "")) ??
      roleList[0];
    expect(targetRole?.id).toBeTruthy();

    const seedResendTargetRes = await sendWithRateLimitRetry(() =>
      saContext!.request.post(`${API_URL}/api/v1/admins/current-tenant`, {
        headers: mutationHeaders(sharedSession!.accessToken),
        data: {
          username: resendUsername,
          firstName: "Tariq",
          lastName: "ResendProbe",
          phoneNumber: `+1202${String(Math.floor(2000000 + Math.random() * 7999999))}`,
          email: resendEmail,
          roleIds: [targetRole.id],
          userGroupIds: [],
          sendSetupEmail: true,
          mustChangePassword: false,
        },
      })
    );
    expect(seedResendTargetRes.status()).toBe(201);

    const beforeResendRows = queryPgJson<{ account_setup_token_hash: string | null }>(
      pgEnv,
      `SELECT account_setup_token_hash
         FROM identity.admins
        WHERE lower(email) = lower(${sqlLiteral(resendEmail)})`
    );
    const beforeResendHash = beforeResendRows[0]?.account_setup_token_hash ?? "";
    expect(beforeResendHash).toBeTruthy();

    await adminPage.reload({ waitUntil: "domcontentloaded" });
    await waitForAppSettled(adminPage);
    if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
      await searchInput.fill(resendEmail);
      await adminPage.waitForTimeout(700);
    }

    const resendRow = adminPage.locator("tr").filter({ hasText: resendEmail }).first();
    await expect(resendRow).toBeVisible({ timeout: 15_000 });

    // First Resend click -> succeeds (200) via synchronous IEmailSender & rotates token hash
    const firstResendPromise = adminPage.waitForResponse(
      (res) =>
        res.url().toLowerCase().includes("/api/v1/account-setup/resend") &&
        res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await clickRowAction(adminPage, resendRow, /Resend Setup Email/i);

    const confirmDialog = adminPage.getByRole("dialog").or(adminPage.getByRole("alertdialog"));
    if ((await confirmDialog.count()) > 0 && (await confirmDialog.first().isVisible())) {
      await confirmDialog
        .first()
        .getByRole("button", { name: /^Send$|^Confirm$/i })
        .click();
    }
    const firstResendRes = await firstResendPromise;
    expect(firstResendRes.status(), "First manual Resend Setup Email status").toBe(200);

    await expect(adminPage.getByText(/Setup Email Resent/i).first()).toBeVisible({
      timeout: 10_000,
    });

    const rotatedRows = queryPgJson<{ account_setup_token_hash: string | null }>(
      pgEnv,
      `SELECT account_setup_token_hash
         FROM identity.admins
        WHERE lower(email) = lower(${sqlLiteral(resendEmail)})`
    );
    const afterResendHash = rotatedRows[0]?.account_setup_token_hash ?? "";
    expect(afterResendHash).toBeTruthy();
    expect(afterResendHash).not.toBe(beforeResendHash);

    // Immediate second Resend within 60s -> backend returns 429 & UI shows "Setup Email Cooldown Active"
    const secondResendPromise = adminPage.waitForResponse(
      (res) =>
        res.url().toLowerCase().includes("/api/v1/account-setup/resend") &&
        res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await clickRowAction(adminPage, resendRow, /Resend Setup Email/i);
    if ((await confirmDialog.count()) > 0 && (await confirmDialog.first().isVisible())) {
      await confirmDialog
        .first()
        .getByRole("button", { name: /^Send$|^Confirm$/i })
        .click();
    }
    const secondResendRes = await secondResendPromise;
    expect(
      [422, 429],
      "Rapid second Resend must enforce 60s cooldown"
    ).toContain(secondResendRes.status());
    const cooldownBodyText = await secondResendRes.text();
    expect(cooldownBodyText).toMatch(/wait|cooldown|recently sent/i);

    await expect(
      adminPage.getByText(/Setup Email Cooldown Active|Please wait/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await adminPage.keyboard.press("Escape");
    await adminPage.waitForTimeout(250);

    await saveScreenshot(adminPage, "30-admins-resend-cooldown.png");
    guard.assertZeroServerErrors("Zero-Resend Activation & Resend Cooldown");
  });

  test("3. Communication Templates CRUD/Clone/Publish/Archive with encrypted IDs survive hard reload", async () => {
    expect(sharedSession).not.toBeNull();
    expect(saContext).not.toBeNull();
    expect(saPage).not.toBeNull();
    const context = saContext!;
    const page = saPage!;
    const guard = saGuard!;

    await page.goto(`${BASE_URL}/communication/templates`, { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await applyDarkEnglishTheme(page);

      // Click Add to navigate to /communication/templates/new
      await page.getByRole("button", { name: /^Add$/i }).first().click();
      await page.waitForURL((u) => u.pathname.includes("/communication/templates/new"), {
        timeout: 15_000,
      });
      await waitForAppSettled(page);

      await page.getByPlaceholder("Email subject line...").fill(`Welcome {{ name }} ${runSuffix}`);

      // RichTextEditor TipTap contenteditable
      const editor = page.locator('[contenteditable="true"]').first();
      await expect(editor).toBeVisible({ timeout: 15_000 });
      await editor.click();
      await editor.fill(`Hello {{ name }}, welcome to SCRIPE UAT ${runSuffix}!`);

      await page
        .getByPlaceholder("Brief description of this template...")
        .fill("Created by live Slice 7A Playwright UAT");

      // Settings sidebar: Template Key
      await page.getByPlaceholder("e.g., welcome-email").fill(templateKey);

      const createTplResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/message-templates") &&
          res.request().method() === "POST",
        { timeout: 25_000 }
      );
      await page.getByRole("button", { name: /^Save$/i }).click();
      const createTplRes = await createTplResPromise;
      expect(createTplRes.status(), "Create MessageTemplate status").toBe(201);

      const createdBody = (await createTplRes.json()) as { id?: string; data?: { id?: string } | string };
      createdTemplateEncryptedId =
        typeof createdBody.id === "string"
          ? createdBody.id
          : typeof createdBody.data === "string"
            ? createdBody.data
            : createdBody.data?.id ?? "";
      expect(createdTemplateEncryptedId.length).toBeGreaterThan(10);
      expect(createdTemplateEncryptedId, "Template ID must be encrypted, not raw UUID").not.toMatch(
        UUID_REGEX
      );

      // Hard reload /communication/templates and verify persistence
      await page.goto(`${BASE_URL}/communication/templates`, { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);

      const searchInput = page
        .locator('main input[type="search"], main input[placeholder*="Search" i]')
        .first();
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill(templateKey);
        await page.waitForTimeout(700);
      }

      const tplRow = page.locator("tr").filter({ hasText: templateKey }).first();
      await expect(tplRow).toBeVisible({ timeout: 15_000 });
      await expect(tplRow.getByText("v1", { exact: true })).toBeVisible();

      // Edit template via UI (/communication/templates/{encryptedId}/edit)
      await clickRowAction(page, tplRow, /^Edit$/i);
      await page.waitForURL((u) => u.pathname.includes("/edit"), { timeout: 15_000 });
      await waitForAppSettled(page);
      expect(page.url()).toContain(encodeURIComponent(createdTemplateEncryptedId));

      const subjectInput = page.getByPlaceholder("Email subject line...");
      await expect(subjectInput).toHaveValue(`Welcome {{ name }} ${runSuffix}`, { timeout: 10_000 });
      const updatedSubject = `Welcome Updated {{ name }} ${runSuffix}`;
      await subjectInput.fill(updatedSubject);

      const updateResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/message-templates/") &&
          res.request().method() === "PUT",
        { timeout: 25_000 }
      );
      await page.getByRole("button", { name: /^Save$/i }).click();
      const updateRes = await updateResPromise;
      expect([200, 204]).toContain(updateRes.status());

      await page.goto(`${BASE_URL}/communication/templates`, { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill(templateKey);
        await page.waitForTimeout(700);
      }

      // Clone template via UI row action
      const rowAfterEdit = page.locator("tr").filter({ hasText: templateKey }).first();
      await expect(rowAfterEdit).toBeVisible({ timeout: 15_000 });

      const cloneResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/clone") && res.request().method() === "POST",
        { timeout: 25_000 }
      );
      await clickRowAction(page, rowAfterEdit, /^Clone$/i);
      const cloneRes = await cloneResPromise;
      expect(cloneRes.status(), "Clone MessageTemplate status").toBe(201);

      const cloneBody = (await cloneRes.json()) as { id?: string; data?: { id?: string } };
      clonedTemplateEncryptedId = cloneBody.id ?? cloneBody.data?.id ?? "";
      expect(clonedTemplateEncryptedId.length).toBeGreaterThan(10);
      expect(clonedTemplateEncryptedId).not.toMatch(UUID_REGEX);

      // Publish v1 snapshot before edit, then Publish v2 snapshot after edit -> Version = 2 & version_rows = 2
      const publishV1Res = await sendWithRateLimitRetry(() =>
        context.request.post(
          `${API_URL}/api/v1/message-templates/${encodeURIComponent(createdTemplateEncryptedId)}/publish`,
          { headers: mutationHeaders(sharedSession!.accessToken), data: {} }
        )
      );
      expect(publishV1Res.status(), "Publish v1 MessageTemplate status").toBe(204);

      const publishV2Res = await sendWithRateLimitRetry(() =>
        context.request.post(
          `${API_URL}/api/v1/message-templates/${encodeURIComponent(createdTemplateEncryptedId)}/publish`,
          { headers: mutationHeaders(sharedSession!.accessToken), data: {} }
        )
      );
      expect(publishV2Res.status(), "Publish v2 MessageTemplate status").toBe(204);

      // Activate cloned template via PUT, then Archive cloned template (flips is_active true -> false -> Inactive badge)
      const activateCloneRes = await sendWithRateLimitRetry(() =>
        context.request.put(
          `${API_URL}/api/v1/message-templates/${encodeURIComponent(clonedTemplateEncryptedId)}`,
          {
            headers: mutationHeaders(sharedSession!.accessToken),
            data: {
              subject: updatedSubject,
              body: `<p>Cloned body for ${runSuffix}</p>`,
              description: "Activated before archive verification",
              isActive: true,
            },
          }
        )
      );
      expect([200, 204]).toContain(activateCloneRes.status());

      const archiveRes = await sendWithRateLimitRetry(() =>
        context.request.post(
          `${API_URL}/api/v1/message-templates/${encodeURIComponent(clonedTemplateEncryptedId)}/archive`,
          { headers: mutationHeaders(sharedSession!.accessToken), data: {} }
        )
      );
      expect(archiveRes.status(), "Archive MessageTemplate status").toBe(204);

      // Hard reload /communication/templates and verify both v2 (Active) and cloned Inactive survive reload
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill(templateKey);
        await page.waitForTimeout(700);
      }

      const originalRowReloaded = page
        .locator("tr")
        .filter({ has: page.locator(`td:text-is("${templateKey}")`) })
        .first();
      await expect(originalRowReloaded).toBeVisible({ timeout: 15_000 });
      await expect(originalRowReloaded.getByText("v2", { exact: true })).toBeVisible();
      await expect(originalRowReloaded.getByText("Active", { exact: true })).toBeVisible();

      const clonedRowReloaded = page
        .locator("tr")
        .filter({ hasText: `${templateKey}_copy` })
        .first();
      await expect(clonedRowReloaded).toBeVisible({ timeout: 15_000 });
      await expect(clonedRowReloaded.getByText("Inactive", { exact: true })).toBeVisible();

      // Out-of-band PostgreSQL verification on communication.message_templates & message_template_versions
      const dbTemplates = queryPgJson<{
        key: string;
        subject: string | null;
        version: number;
        is_active: boolean;
        version_rows: number;
      }>(
        pgEnv,
        `SELECT mt.key,
                mt.subject,
                mt.version,
                mt.is_active,
                (SELECT COUNT(*)::int FROM communication.message_template_versions v WHERE v.template_id = mt.id) AS version_rows
           FROM communication.message_templates mt
          WHERE mt.key LIKE ${sqlLiteral(`${templateKey}%`)}
            AND mt.is_deleted = false
          ORDER BY mt.key ASC`
      );
      expect(dbTemplates.length).toBeGreaterThanOrEqual(2);
      const primaryDbTpl = dbTemplates.find((t) => t.key === templateKey);
      const cloneDbTpl = dbTemplates.find((t) => t.key.startsWith(`${templateKey}_copy`));
      expect(primaryDbTpl?.subject).toBe(updatedSubject);
      expect(primaryDbTpl?.version).toBe(2);
      expect(primaryDbTpl?.is_active).toBe(true);
      expect(primaryDbTpl?.version_rows).toBe(2);
      expect(cloneDbTpl?.is_active).toBe(false);

      await saveScreenshot(page, "33-communication-templates-lifecycle.png");
      guard.assertZeroServerErrors("Communication MessageTemplates lifecycle");
  });

  test("4. Communication Email Composer sends To+CC+BCC in 1 call, cancels scheduled mail, resends manual mail, and refuses resending auth token mail", async () => {
    expect(sharedSession).not.toBeNull();
    expect(saPage).not.toBeNull();
    const page = saPage!;
    const guard = saGuard!;

    let sendApiCallCount = 0;
    const onSendReq = (req: import("@playwright/test").Request) => {
      if (
        req.url().toLowerCase().endsWith("/api/v1/emails/send") &&
        req.method() === "POST"
      ) {
        sendApiCallCount++;
      }
    };
    page.on("request", onSendReq);

    try {
      await page.goto(`${BASE_URL}/communication/message-composer`, {
        waitUntil: "domcontentloaded",
      });
      await waitForAppSettled(page);
      await applyDarkEnglishTheme(page);

      // 4A. Compose & Send manual email with single To + CC + BCC
      await page.getByRole("button", { name: /^CC \/ BCC$/i }).click();
      const recipientCombos = page.locator('input[role="combobox"]');
      await expect(recipientCombos).toHaveCount(3);

      // To
      await recipientCombos.nth(0).fill(manualToEmail);
      await recipientCombos.nth(0).press("Enter");
      // CC
      await recipientCombos.nth(1).fill(manualCcEmail);
      await recipientCombos.nth(1).press("Enter");
      // BCC
      await recipientCombos.nth(2).fill(manualBccEmail);
      await recipientCombos.nth(2).press("Enter");

      await page.getByPlaceholder("Enter email subject...").fill(manualSubject);
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.click();
      await editor.fill(`Manual UAT body ${runSuffix} verifying CC/BCC single-dispatch contract.`);

      sendApiCallCount = 0;
      await page.getByRole("button", { name: /^Send Email$/i }).first().click();

      const confirmSendDialog = page
        .getByRole("dialog")
        .or(page.getByRole("alertdialog"))
        .first();
      await expect(confirmSendDialog).toBeVisible({ timeout: 10_000 });

      const manualSendResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().endsWith("/api/v1/emails/send") &&
          res.request().method() === "POST",
        { timeout: 25_000 }
      );
      await confirmSendDialog.getByRole("button", { name: /^Send Email$/i }).click();
      const manualSendRes = await manualSendResPromise;
      expect(manualSendRes.status(), "POST /api/v1/emails/send status").toBe(201);

      const manualSendJson = (await manualSendRes.json()) as { id?: string; data?: { id?: string } };
      const manualEncryptedId = manualSendJson.id ?? manualSendJson.data?.id ?? "";
      expect(manualEncryptedId.length).toBeGreaterThan(10);
      expect(manualEncryptedId).not.toMatch(UUID_REGEX);

      // Strictly 1 POST /api/v1/emails/send call even with To + CC + BCC!
      await page.waitForTimeout(400);
      expect(sendApiCallCount, "Single primary To with CC+BCC must fire exactly 1 send call").toBe(
        1
      );

      // Verify initial undo-grace deferred state in DB, then make it immediately due for EmailProcessingJob (* * * * *)
      const initialManualDb = queryPgJson<{ status: number }>(
        pgEnv,
        `SELECT status
           FROM communication.sent_email_logs
          WHERE subject = ${sqlLiteral(manualSubject)}`
      );
      expect(initialManualDb).toHaveLength(1);
      expect(initialManualDb[0].status, "Manual email starts Pending during undo grace window").toBe(
        0
      );
      execPg(
        pgEnv,
        `UPDATE communication.sent_email_logs
            SET scheduled_at = NOW() - INTERVAL '5 seconds'
          WHERE subject = ${sqlLiteral(manualSubject)}`
      );

      // 4B. Schedule a deferred email & cancel it in Sent History
      await page.getByRole("radio", { name: /Schedule/i }).click();
      const tomorrow = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString().split("T")[0];
      await page.locator('input[type="date"]').fill(tomorrow);
      await page.locator('input[type="time"]').fill("23:30");

      const toComboAfterReset = page.locator('input[role="combobox"]').first();
      await toComboAfterReset.fill(manualToEmail);
      await toComboAfterReset.press("Enter");
      await page.getByPlaceholder("Enter email subject...").fill(deferredSubject);
      await editor.click();
      await editor.fill(`Scheduled deferred email ${runSuffix} to verify cancel persistence.`);

      await page.getByRole("button", { name: /^Send Email$/i }).first().click();
      await expect(confirmSendDialog).toBeVisible({ timeout: 10_000 });

      const scheduleResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().endsWith("/api/v1/emails/send") &&
          res.request().method() === "POST",
        { timeout: 25_000 }
      );
      await confirmSendDialog.getByRole("button", { name: /^Schedule Email$/i }).click();
      const scheduleRes = await scheduleResPromise;
      expect(scheduleRes.status()).toBe(201);

      // Switch to Sent History tab -> cancel the Pending scheduled email
      await page.getByRole("tab", { name: /Sent History/i }).click();
      await waitForAppSettled(page);

      const historySearch = page.getByPlaceholder("Search").first();
      await historySearch.fill(deferredSubject);
      await page.waitForTimeout(700);

      const pendingRow = page.locator("tr").filter({ hasText: deferredSubject }).first();
      await expect(pendingRow).toBeVisible({ timeout: 15_000 });
      await expect(pendingRow.getByText("Pending", { exact: true })).toBeVisible();

      await pendingRow.getByRole("button", { name: /Cancel email/i }).click();
      const cancelDialog = page.getByRole("dialog").or(page.getByRole("alertdialog")).first();
      await expect(cancelDialog).toBeVisible({ timeout: 10_000 });

      const cancelResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/emails/") &&
          res.request().method() === "DELETE",
        { timeout: 20_000 }
      );
      await cancelDialog.getByRole("button", { name: /^Cancel Email$/i }).click();
      const cancelRes = await cancelResPromise;
      expect(cancelRes.status()).toBe(200);

      // Hard reload /communication/message-composer -> verify both Sent manual & Cancelled scheduled persist!
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await applyDarkEnglishTheme(page);
      await page.getByRole("tab", { name: /Sent History/i }).click();
      await waitForAppSettled(page);

      await historySearch.fill(deferredSubject);
      await page.waitForTimeout(700);
      const cancelledRowAfterReload = page
        .locator("tr")
        .filter({ hasText: deferredSubject })
        .first();
      await expect(cancelledRowAfterReload).toBeVisible({ timeout: 15_000 });
      await expect(cancelledRowAfterReload.getByText("Cancelled", { exact: true })).toBeVisible();

      // 4C. Wait for EmailProcessingJob (* * * * *) to dispatch the due manual email -> status = 1 (Sent), then expand & click Resend -> succeeds (201)
      let workerDispatched = false;
      for (let attempt = 0; attempt < 34; attempt++) {
        const statusRows = queryPgJson<{ status: number }>(
          pgEnv,
          `SELECT status
             FROM communication.sent_email_logs
            WHERE subject = ${sqlLiteral(manualSubject)}`
        );
        if (statusRows[0]?.status === 1) {
          workerDispatched = true;
          break;
        }
        await page.waitForTimeout(2_000);
      }
      expect(
        workerDispatched,
        "EmailProcessingJob recurring worker must dispatch due manual email to Sent (1)"
      ).toBe(true);

      await historySearch.fill("");
      await page.waitForTimeout(300);
      await historySearch.fill(manualSubject);
      await page.waitForTimeout(700);
      const manualRow = page.locator("tr").filter({ hasText: manualSubject }).first();
      await expect(manualRow).toBeVisible({ timeout: 15_000 });
      await expect(manualRow.getByText("Sent", { exact: true })).toBeVisible({ timeout: 15_000 });

      await manualRow.getByRole("button", { name: /Body Preview/i }).click();
      const resendManualPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/resend") && res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await page.getByRole("button", { name: /^Resend$/i }).first().click();
      const resendManualRes = await resendManualPromise;
      expect(resendManualRes.status(), "Resend manual email status").toBe(201);

      await expect(
        page.getByText(/Email re-queued for sending/i).first()
      ).toBeVisible({ timeout: 10_000 });

      // 4D. Verify backend + UI cleanly refuse resending one-time auth token emails (AccountSetup / SenderRole.Auth = 1)
      const seifTenantRows = queryPgJson<{ tenant_id: string; admin_id: string }>(
        pgEnv,
        `SELECT tenant_id::text, id::text AS admin_id
           FROM identity.admins
          WHERE lower(email) = lower(${sqlLiteral(TENANT_SUPER_ADMIN_EMAIL)})`
      );
      expect(seifTenantRows).toHaveLength(1);
      authProbeRowId = randomUUID();
      execPg(
        pgEnv,
        `INSERT INTO communication.sent_email_logs
           (id, tenant_id, "to", subject, body, template_key, status, scheduled_at, sent_at, recipient_type, sender_role, retry_count, sent_by_admin_id, is_active, is_deleted, created_at)
         VALUES
           (${sqlLiteral(authProbeRowId)}::uuid,
            ${sqlLiteral(seifTenantRows[0].tenant_id)}::uuid,
            ${sqlLiteral(invitedEmail)},
            ${sqlLiteral(authProbeSubject)},
            '<p>One-time AccountSetup token email</p>',
            'AccountSetup',
            1,
            NOW(),
            NOW(),
            0,
            1,
            0,
            ${sqlLiteral(seifTenantRows[0].admin_id)}::uuid,
            true,
            false,
            NOW())`
      );

      await historySearch.fill(authProbeSubject);
      await page.waitForTimeout(800);
      const authProbeRow = page.locator("tr").filter({ hasText: authProbeSubject }).first();
      await expect(authProbeRow).toBeVisible({ timeout: 15_000 });

      await authProbeRow.getByRole("button", { name: /Body Preview/i }).click();
      const refusedResendPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/resend") && res.request().method() === "POST",
        { timeout: 20_000 }
      );
      await page.getByRole("button", { name: /^Resend$|^Retry$/i }).first().click();
      const refusedResendRes = await refusedResendPromise;
      expect(
        [400, 422],
        "One-time auth token email resend must be refused with 422/400 validation error"
      ).toContain(refusedResendRes.status());
      const refusedText = await refusedResendRes.text();
      expect(refusedText).toMatch(/one-time token|cannot be resent/i);

      await expect(
        page.getByText(/Failed to resend email|one-time|cannot be resent/i).first()
      ).toBeVisible({ timeout: 10_000 });

      // Clear search to show full history evidence for screenshot 24
      await historySearch.fill(runSuffix);
      await page.waitForTimeout(700);

      // Out-of-band PostgreSQL verification on communication.sent_email_logs
      const dbLogs = queryPgJson<{
        id: string;
        subject: string;
        to_addr: string;
        cc: string | null;
        bcc: string | null;
        status: number;
        original_email_id: string | null;
      }>(
        pgEnv,
        `SELECT id::text,
                subject,
                "to" AS to_addr,
                cc,
                bcc,
                status,
                original_email_id::text
           FROM communication.sent_email_logs
          WHERE subject LIKE ${sqlLiteral(`%${runSuffix}%`)}
          ORDER BY created_at ASC`
      );

      // Expect: 1 primary manual send + 1 resent child of manual send + 1 cancelled scheduled + 1 auth probe (0 children of auth probe!)
      const manualRows = dbLogs.filter((r) => r.subject === manualSubject);
      expect(manualRows.length, "Original manual email + 1 resent child").toBe(2);
      expect(manualRows[0].to_addr).toBe(manualToEmail);
      expect(manualRows[0].cc).toContain(manualCcEmail);
      expect(manualRows[0].bcc).toContain(manualBccEmail);
      expect(manualRows[1].original_email_id).toBe(manualRows[0].id);

      const scheduledRows = dbLogs.filter((r) => r.subject === deferredSubject);
      expect(scheduledRows).toHaveLength(1);

      const authChildRows = dbLogs.filter((r) => r.original_email_id === authProbeRowId);
      expect(authChildRows, "Auth token email must have 0 resent child rows").toHaveLength(0);

      await saveScreenshot(page, "34-communication-email-composer-sent-history.png");
      guard.assertZeroServerErrors("Communication Email Composer & History");
    } finally {
      page.off("request", onSendReq);
    }
  });
});
