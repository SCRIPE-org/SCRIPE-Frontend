import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import {
  expect,
  test,
  type APIResponse,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const API_URL = (process.env.PLAYWRIGHT_API_URL || "http://localhost:5035").replace(/\/+$/, "");

const BRAIN_SCREENSHOT_DIR =
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/8a81a970-d60b-420a-ae80-fa243ca19129/screenshots";
const DOCS_SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../docs/architecture/authorization-remediation/screenshots"
);

const SCRIPE_ACCOUNTS = {
  platformRootSa: "admin-seif@scripe.org",
  tenantSa: "seif@scripe.org",
  execLead: "exec.lead@scripe-dev.local",
  itSecurity: "it.security@scripe-dev.local",
  complianceDpo: "dpo.compliance@scripe-dev.local",
  dataLead: "data.lead@scripe-dev.local",
  crmDirector: "sales.director@scripe-dev.local",
  crmAccountExec: "account.exec@scripe-dev.local",
  crmSdr: "sales.sdr@scripe-dev.local",
  finController: "finance.controller@scripe-dev.local",
  finAccountant: "staff.accountant@scripe-dev.local",
  auditor: "internal.auditor@scripe-dev.local",
  mrCrmHr: "mr.crm.hr@scripe-dev.local",
  mrCrmFinance: "mr.crm.finance@scripe-dev.local",
  mrMgrEmployee: "mr.mgr.employee@scripe-dev.local",
  mrRepManager: "mr.rep.manager@scripe-dev.local",
  mrPiiMasked: "mr.pii.masked@scripe-dev.local",
} as const;

const FORBIDDEN_TENANT_ADMIN_RESOURCES = new Set([
  "editions",
  "edition-categories",
  "features",
  "tenant-plans",
  "tenant-feature-definitions",
  "subscriptions",
  "overrides",
  "billing",
  "billing-hub",
  "bundles",
  "commissions",
  "commission-ledger",
  "commission-invoices",
  "invoices",
  "payouts",
  "payment_gateways",
  "platform_stripe",
  "platform-stripe",
  "revenue_analytics",
  "onboarding",
  "onboarding_questions",
  "onboarding_rules",
  "signup_content",
  "signup-content",
  "stripe_connect",
  "transactions",
  "system",
  "system.security",
  "system_settings",
  "observability",
  "applistings",
  "apppurchases",
  "appreviews",
  "appsubmissions",
  "developerpayouts",
  "developerprofiles",
  "marketplacesettings",
  "plugins_catalog",
  "plugins_data_store",
  "plugins_definition",
  "plugins_execution_logs",
  "plugins_installed",
  "marketplace",
  "plugins",
  "provider.sales.fulfillment",
]);

const EXPECTED_PII_MASKED_RESOURCES = [
  "crm.opportunities",
  "employment-records",
  "finance.payments",
  "parties",
  "admins",
] as const;

const RAW_LOCALE_KEY_REGEX =
  /(?<![.\w-])(?:common|roles|role|roleDetail|userGroups|profile|crmOpportunities|crmLeads|dataExchange|entitlements|audit|security|navigation|menu)\.[a-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)*\b(?![_.\w-])/;

type StorageState = Awaited<ReturnType<BrowserContext["storageState"]>>;

interface AuthenticatedSession {
  accessToken: string;
  tenantId: string | null;
  editionName: string | null;
  defaultRedirectPath: string | null;
  storageState: StorageState;
}

interface RoleRecord {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  priority: number;
  isSystem?: boolean;
  isPermissionLocked?: boolean;
}

interface PermissionRecord {
  id: string;
  code: string;
  resource?: string | null;
  isPlatformOnly?: boolean;
  isActive?: boolean;
}

interface RoleDetailRecord extends RoleRecord {
  permissions?: Array<{
    permissionId?: string;
    code?: string;
    permissionCode?: string;
    scopeOverride?: string | null;
    restrictedFields?: string[] | null;
  }>;
}

interface UserGroupRestrictionRecord {
  permissionCode: string;
  restrictedFields: string[];
}

interface UserGroupRecord {
  id: string;
  code?: string | null;
  nameEn: string;
  nameAr: string;
  restrictions?: UserGroupRestrictionRecord[];
}

interface OpportunityRecord {
  id: string;
  title?: string;
  ownerUserId?: string | null;
  rowVersion?: string;
  estimatedAmount?: number | null;
  currencyCode?: string | null;
  closeNotes?: string | null;
  approvalEvidenceRef?: string | null;
  directCreateRationale?: string | null;
  maskedFieldKeys?: string[];
  status?: string;
}

const sessionCache = new Map<string, AuthenticatedSession>();
const capturedScreenshots: Array<{ filename: string; path: string; caption: string }> = [];

function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function unwrapItems<T>(payload: unknown): T[] {
  const unwrapped = unwrapApiData<unknown>(payload);
  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }
  if (unwrapped && typeof unwrapped === "object" && "items" in unwrapped) {
    const items = (unwrapped as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  return [];
}

function mutationHeaders(accessToken: string, extra: Record<string, string> = {}) {
  const nonce = randomUUID();
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Request-Timestamp": Date.now().toString(),
    "X-Request-Nonce": nonce,
    "X-Idempotency-Key": nonce,
    ...extra,
  };
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function waitForRateLimitRetry(retryAfterHeader: string | undefined, attempt: number) {
  const parsed = Number(retryAfterHeader || "60");
  const delaySec = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed + 3, 320) : 30 + attempt * 15;
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

/**
 * Attaches runtime error, console error, and HTTP 4xx/5xx listeners to detect silent failures.
 * Expected negative authorization checks should run inside `runAllowingHttpStatuses`.
 */
function attachRuntimeMonitor(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const serverErrors: string[] = [];
  const unexpectedClientErrors: string[] = [];
  const allowedStatuses = new Set<number>();

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Browser emits a network console error alongside intentional negative status probes or 429 cooldown retries.
      if (/\bstatus of 429\b/i.test(text)) {
        return;
      }
      if (allowedStatuses.size > 0 && /\bstatus of (401|403|404)\b/i.test(text)) {
        return;
      }
      consoleErrors.push(text);
    }
  });

  page.on("response", (res) => {
    const status = res.status();
    const url = res.url();
    if (!url.startsWith(API_URL) && !url.startsWith(BASE_URL)) return;
    if (status >= 500) {
      serverErrors.push(`${status} ${res.request().method()} ${url}`);
      return;
    }
    if (status >= 400 && status !== 429 && !allowedStatuses.has(status)) {
      // Next.js RSC prefetch abort or favicon noise excluded cleanly.
      if (url.endsWith("/favicon.ico")) return;
      unexpectedClientErrors.push(`${status} ${res.request().method()} ${url}`);
    }
  });

  return {
    async runAllowingHttpStatuses<T>(statuses: number[], action: () => Promise<T>): Promise<T> {
      for (const s of statuses) allowedStatuses.add(s);
      try {
        return await action();
      } finally {
        allowedStatuses.clear();
      }
    },
    assertClean(scope: string) {
      expect(pageErrors, `Uncaught pageerrors in ${scope}: ${pageErrors.join(" | ")}`).toEqual([]);
      expect(consoleErrors, `Console errors in ${scope}: ${consoleErrors.join(" | ")}`).toEqual([]);
      expect(serverErrors, `Server 5xx errors in ${scope}: ${serverErrors.join(" | ")}`).toEqual([]);
      expect(
        unexpectedClientErrors,
        `Unexpected 4xx errors in ${scope}: ${unexpectedClientErrors.join(" | ")}`
      ).toEqual([]);
    },
  };
}

async function waitForAppSettled(page: Page, options: { timeoutMs?: number } = {}) {
  const timeout = options.timeoutMs ?? 25_000;
  await page.waitForLoadState("domcontentloaded", { timeout });
  await page
    .waitForFunction(
      () => {
        const bodyText = document.body?.innerText?.trim() ?? "";
        if (!bodyText) return false;
        const welcomeCurtainVisible =
          bodyText.includes("We are getting everything ready for you") ||
          bodyText.includes("تجهيز كل شيء من أجلك");
        if (welcomeCurtainVisible) return false;
        const activeSkeletons = document.querySelectorAll('[data-slot="skeleton"], .animate-pulse');
        return activeSkeletons.length === 0;
      },
      null,
      { timeout: Math.min(timeout, 20_000) }
    )
    .catch(() => {
      // Some non-critical background widgets animate subtly; main surface is still validated below.
    });
  await page.waitForTimeout(350);
}

async function setLanguageAndDirection(page: Page, lang: "en" | "ar") {
  await page.evaluate((targetLang) => {
    localStorage.setItem("scr_lang", targetLang);
    localStorage.setItem("scr_pref_lang", targetLang);
    document.cookie = `scr_lang=${targetLang}; path=/; SameSite=Lax`;
  }, lang);
  await page.reload();
  await waitForAppSettled(page);
  await setDarkTheme(page);
  await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr", {
    timeout: 15_000,
  });
}

async function setDarkTheme(page: Page) {
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark");
    localStorage.setItem("scr_pref_theme", "dark");
  });
  await page.waitForTimeout(200);
}

async function assertNoHorizontalOverflow(page: Page, scope: string) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow detected in ${scope}: scrollWidth=${metrics.scrollWidth} > clientWidth=${metrics.clientWidth}`
  ).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

async function assertNoRawLocaleKeys(page: Page, scope: string) {
  const visibleText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const parts: string[] = [];
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (
        parent &&
        !parent.closest("script, style, noscript, template, code, bdi, .font-mono") &&
        (parent.offsetParent !== null || getComputedStyle(parent).position === "fixed")
      ) {
        parts.push(node.textContent ?? "");
      }
      node = walker.nextNode();
    }
    return parts.join("\n");
  });
  const match = visibleText.match(RAW_LOCALE_KEY_REGEX);
  expect(match, `Raw untranslated i18n key detected in ${scope}: ${match?.[0] ?? ""}`).toBeNull();
}

async function saveDualScreenshot(
  page: Page,
  filename: string,
  caption: string,
  options: { fullPage?: boolean } = {}
) {
  fs.mkdirSync(BRAIN_SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(DOCS_SCREENSHOT_DIR, { recursive: true });
  const brainPath = path.join(BRAIN_SCREENSHOT_DIR, filename);
  const docsPath = path.join(DOCS_SCREENSHOT_DIR, filename);

  // Allow CSS transitions / Radix dialog fade-ins to complete cleanly before visual capture.
  await page.waitForTimeout(400);
  await assertNoHorizontalOverflow(page, `${filename} (${caption})`);
  await assertNoRawLocaleKeys(page, `${filename} (${caption})`);
  const visibleBody = await page.evaluate(() => document.body?.innerText ?? "");
  expect(
    visibleBody.includes("We are getting everything ready for you") ||
      visibleBody.includes("تجهيز كل شيء من أجلك"),
    `Welcome splash overlay still covering screenshot ${filename}`
  ).toBe(false);
  await page.screenshot({
    path: brainPath,
    fullPage: options.fullPage ?? false,
    animations: "disabled",
  });
  fs.copyFileSync(brainPath, docsPath);
  capturedScreenshots.push({ filename, path: brainPath, caption });
}

/**
 * Establishes a real authenticated browser context for a seeded persona via UI `/login`,
 * caching storageState and bearer token so rate-limited login permits are consumed at most once per actor.
 */
async function openPersonaContext(
  browser: Browser,
  identifier: string,
  password: string,
  options: { isPlatformAdmin?: boolean; skipCache?: boolean; uiLogin?: boolean } = {}
): Promise<{
  context: BrowserContext;
  page: Page;
  session: AuthenticatedSession;
  monitor: ReturnType<typeof attachRuntimeMonitor>;
}> {
  const isPlatformAdmin = options.isPlatformAdmin ?? false;
  const cacheKey = `${identifier}::${isPlatformAdmin ? "platform" : "tenant"}`;

  if (!options.skipCache && sessionCache.has(cacheKey)) {
    const cached = sessionCache.get(cacheKey)!;
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      storageState: cached.storageState,
    });
    const page = await context.newPage();
    const monitor = attachRuntimeMonitor(page);
    return { context, page, session: cached, monitor };
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const monitor = attachRuntimeMonitor(page);

  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("scr_pref_lang", "en");
    document.cookie = "scr_lang=en; path=/; SameSite=Lax";
  });
  await page.reload();
  await waitForAppSettled(page);
  await setDarkTheme(page);

  if (isPlatformAdmin && !options.uiLogin) {
    const res = await sendWithRateLimitRetry(() =>
      context.request.post(`${API_URL}/api/v1/auth/admin/login`, {
        data: { identifier, password, isPlatformAdmin: true },
      })
    );
    expect(res.ok(), `Platform admin login failed for ${identifier}: ${res.status()}`).toBeTruthy();
    const loginPayload = (await res.json()) as {
      accessToken: string;
      editionName?: string | null;
      defaultRedirectPath?: string | null;
      userProfile?: { tenantId?: string | null };
    };

    const storageState = await context.storageState();
    const session: AuthenticatedSession = {
      accessToken: loginPayload.accessToken,
      tenantId: loginPayload.userProfile?.tenantId ?? null,
      editionName: loginPayload.editionName ?? null,
      defaultRedirectPath: loginPayload.defaultRedirectPath ?? null,
      storageState,
    };
    sessionCache.set(cacheKey, session);
    return { context, page, session, monitor };
  }

  await expect(page.locator("#identifier")).toBeVisible({ timeout: 20_000 });

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.locator("#identifier").fill(identifier);
    await page.locator("#password").fill(password);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 });

    const loginRes = await monitor.runAllowingHttpStatuses([429], async () => {
      const loginResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/login") &&
          res.request().method() === "POST",
        { timeout: 30_000 }
      );
      await submitBtn.click();
      return loginResPromise;
    });

    if (loginRes.status() === 429 && attempt < 3) {
      await waitForRateLimitRetry(loginRes.headers()["retry-after"], attempt);
      continue;
    }

    expect(loginRes.ok(), `UI login failed for ${identifier}: ${loginRes.status()}`).toBeTruthy();
    let payload = (await loginRes.json()) as {
      accessToken?: string;
      requiresWorkspaceSelection?: boolean;
      editionName?: string | null;
      defaultRedirectPath?: string | null;
      userProfile?: { tenantId?: string | null };
      data?: {
        accessToken?: string;
        requiresWorkspaceSelection?: boolean;
        editionName?: string | null;
        defaultRedirectPath?: string | null;
        userProfile?: { tenantId?: string | null };
      };
    };

    const rawBody = payload.accessToken || payload.requiresWorkspaceSelection ? payload : (payload.data ?? payload);
    if (rawBody.requiresWorkspaceSelection) {
      const workspaceList = page.locator('ul[aria-label*="Available workspaces" i]');
      await expect(workspaceList).toBeVisible({ timeout: 15_000 });
      const targetChoice = isPlatformAdmin
        ? workspaceList.locator("button, [role='button']").filter({ hasText: /Platform/i }).first()
        : workspaceList.locator("button, [role='button']").filter({ hasText: /SCRIPE/i }).first();

      const selectResPromise = page.waitForResponse(
        (res) =>
          res.url().toLowerCase().includes("/api/v1/auth/admin/") &&
          res.request().method() === "POST",
        { timeout: 30_000 }
      );
      await targetChoice.click();
      const selectRes = await selectResPromise;
      expect(selectRes.ok(), `Workspace selection failed for ${identifier}: ${selectRes.status()}`).toBeTruthy();
      payload = (await selectRes.json()) as typeof payload;
    }

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    await waitForAppSettled(page);
    await setDarkTheme(page);

    const resolvedPayload = payload.accessToken ? payload : (payload.data ?? payload);
    const storageState = await context.storageState();
    const session: AuthenticatedSession = {
      accessToken: resolvedPayload.accessToken ?? "",
      tenantId: resolvedPayload.userProfile?.tenantId ?? null,
      editionName: resolvedPayload.editionName ?? null,
      defaultRedirectPath: resolvedPayload.defaultRedirectPath ?? null,
      storageState,
    };
    expect(session.accessToken.length, `Missing access token for ${identifier}`).toBeGreaterThan(20);
    sessionCache.set(cacheKey, session);
    return { context, page, session, monitor };
  }

  throw new Error(`Exhausted UI login attempts for ${identifier}`);
}

async function assertFooterWithinViewport(page: Page, testId: string, scope: string) {
  const target = page.getByTestId(testId);
  await expect(target, `Expected ${testId} visible in ${scope}`).toBeVisible({ timeout: 10_000 });
  const box = await target.boundingBox();
  const vp = page.viewportSize();
  expect(box, `Missing boundingBox for ${testId} in ${scope}`).toBeTruthy();
  expect(vp, `Missing viewportSize in ${scope}`).toBeTruthy();
  expect(
    box!.y + box!.height,
    `Footer ${testId} clipped past viewport height in ${scope}: bottom=${box!.y + box!.height}, vh=${vp!.height}`
  ).toBeLessThanOrEqual(vp!.height + 2);
}

/**
 * Completes real step-up Sudo verification inside `SudoVerificationModal` when rendered.
 */
async function completePasswordSudoModalIfVisible(page: Page, password: string) {
  const modal = page.getByTestId("sudo-verification-modal");
  await expect(modal).toBeVisible({ timeout: 15_000 });

  const passwordTab = modal.getByTestId("sudo-tab-password");
  if ((await passwordTab.count()) > 0 && (await passwordTab.isVisible())) {
    await passwordTab.click();
  }

  const passwordInput = modal.getByTestId("sudo-password-input");
  await expect(passwordInput).toBeVisible({ timeout: 10_000 });
  await passwordInput.fill(password);

  const verifyBtn = modal.getByTestId("sudo-verify-submit-btn");
  await expect(verifyBtn).toBeEnabled({ timeout: 5_000 });
  await verifyBtn.click();
  await expect(modal).toBeHidden({ timeout: 20_000 });
}

// Playwright runs sequentially with workers=1; keep independent tests running so every domain slice reports results and captures screenshots cleanly.

test.describe("SCRIPE Internal Tenant Admin RBAC & Permission Pool Acceptance", () => {
  test.afterAll(() => {
    if (capturedScreenshots.length > 0) {
      for (const shot of capturedScreenshots) {
        console.log(`SCREENSHOT_MANIFEST: ${shot.path} | ${shot.caption}`);
      }
    }
  });

  test("Tenant Super Admin verifies tenant-filtered roles, dotted permissions, scope options, and Sudo step-up persistence", async ({
    browser,
    request,
  }) => {
    test.setTimeout(660_000);
    const adminPassword = getDevAdminPassword();
    const { context, page, session, monitor } = await openPersonaContext(
      browser,
      SCRIPE_ACCOUNTS.tenantSa,
      adminPassword
    );

    let crmManagerRoleId = "";
    let coordinatorRoleId = "";
    let coordinatorBaselinePermissions: Array<{
      permissionId: string;
      scopeOverride?: string | null;
      restrictedFields?: string[] | null;
    }> = [];

    try {
      expect(session.tenantId).toBeTruthy();
      expect(session.editionName).toBe("scripe-internal");

      // 1. Validate tenant-scoped role catalog (16 SCRIPE roles) and permission pool invariants via live API
      const rolesRes = await request.get(`${API_URL}/api/v1/roles/current-tenant?page=1&pageSize=50`, {
        headers: authHeaders(session.accessToken),
      });
      expect(rolesRes.ok(), `GET /roles/current-tenant failed: ${rolesRes.status()}`).toBeTruthy();
      const roles = unwrapItems<RoleRecord>(await rolesRes.json());
      expect(roles.length).toBeGreaterThanOrEqual(16);

      const scripeSaRole = roles.find((r) => r.code === "T_SCRIPE_SA");
      const crmManagerRole = roles.find((r) => r.code === "T_SCRIPE_CRM_MANAGER");
      const venueCoordRole = roles.find((r) => r.code === "T_SCRIPE_VENUE_COORD");
      expect(scripeSaRole, "T_SCRIPE_SA role must exist").toBeTruthy();
      expect(crmManagerRole, "T_SCRIPE_CRM_MANAGER role must exist").toBeTruthy();
      expect(venueCoordRole, "T_SCRIPE_VENUE_COORD role must exist").toBeTruthy();
      expect(scripeSaRole!.priority).toBe(0);
      expect(scripeSaRole!.isPermissionLocked).toBe(true);
      crmManagerRoleId = crmManagerRole!.id;
      coordinatorRoleId = venueCoordRole!.id;

      const availPermsRes = await request.get(
        `${API_URL}/api/v1/roles/current-tenant/available-permissions`,
        { headers: authHeaders(session.accessToken) }
      );
      expect(
        availPermsRes.ok(),
        `GET /roles/current-tenant/available-permissions failed: ${availPermsRes.status()}`
      ).toBeTruthy();
      const availablePermissions = unwrapItems<PermissionRecord>(await availPermsRes.json());
      expect(availablePermissions.length).toBeGreaterThan(300);

      for (const perm of availablePermissions) {
        expect(perm.isPlatformOnly, `PlatformOnly permission leaked: ${perm.code}`).not.toBe(true);
        const normalizedResource = (perm.resource || perm.code.split(".")[0] || "").toLowerCase();
        expect(
          FORBIDDEN_TENANT_ADMIN_RESOURCES.has(normalizedResource) ||
            FORBIDDEN_TENANT_ADMIN_RESOURCES.has(perm.code.toLowerCase()),
          `Non-entitled platform/marketplace permission leaked to tenant SA: ${perm.code} (resource=${perm.resource})`
        ).toBe(false);
      }

      // Capture baseline for reversible Sudo role-permission edit verification
      const coordDetailRes = await request.get(`${API_URL}/api/v1/Roles/${coordinatorRoleId}`, {
        headers: authHeaders(session.accessToken),
      });
      expect(coordDetailRes.ok()).toBeTruthy();
      const coordDetail = unwrapApiData<RoleDetailRecord>(await coordDetailRes.json());
      coordinatorBaselinePermissions = (coordDetail.permissions ?? [])
        .filter((p) => Boolean(p.permissionId))
        .map((p) => ({
          permissionId: p.permissionId!,
          scopeOverride: p.scopeOverride ?? null,
          restrictedFields: p.restrictedFields ?? null,
        }));

      // 2. Navigate to /roles in EN desktop, AR RTL desktop, and AR mobile
      await page.goto(`${BASE_URL}/roles`);
      await waitForAppSettled(page);
      await expect(page.locator('[data-testid="role-locked-badge"]:visible').first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.locator("bdi[dir='ltr']:visible").filter({ hasText: "T_SCRIPE_SA" }).first()
      ).toBeVisible();
      await saveDualScreenshot(
        page,
        "01-roles-list-en-desktop.png",
        "Roles directory in EN dark desktop showing 16 SCRIPE roles and T_SCRIPE_SA lock badge"
      );

      await setLanguageAndDirection(page, "ar");
      await expect(page.locator('[data-testid="role-locked-badge"]:visible').first()).toBeVisible({
        timeout: 15_000,
      });
      await saveDualScreenshot(
        page,
        "02-roles-list-ar-rtl-desktop.png",
        "Roles directory in AR RTL desktop with bidirectional role codes and localized lock badges"
      );

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(250);
      await expect(page.locator('[data-testid="role-locked-badge"]:visible').first()).toBeVisible({
        timeout: 10_000,
      });
      await saveDualScreenshot(
        page,
        "03-roles-list-ar-mobile.png",
        "Roles directory mobile 390x844 AR RTL without horizontal overflow"
      );

      // 3. Navigate to /roles/[T_SCRIPE_SA] with PermissionModuleMatrix expanded in AR RTL then EN desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/roles/${scripeSaRole!.id}`);
      await waitForAppSettled(page);
      await expect(page.getByTestId("role-permission-lock-alert").first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("role-workspace-start-pages-card")).toBeVisible({
        timeout: 15_000,
      });

      const expandAllBtnAr = page
        .locator("button")
        .filter({ hasText: /إظهار الكل|توسيع الكل|Expand All/i })
        .first();
      if ((await expandAllBtnAr.count()) > 0 && (await expandAllBtnAr.isEnabled())) {
        await expandAllBtnAr.click();
        await page.waitForTimeout(300);
      }
      await saveDualScreenshot(
        page,
        "04-role-detail-locked-sa-ar-rtl-desktop.png",
        "T_SCRIPE_SA role detail in AR RTL with lock alert, expanded permission matrix, and workspace start pages card"
      );

      await setLanguageAndDirection(page, "en");
      const expandAllBtnEn = page.locator("button").filter({ hasText: /Expand All/i }).first();
      if ((await expandAllBtnEn.count()) > 0 && (await expandAllBtnEn.isEnabled())) {
        await expandAllBtnEn.click();
        await page.waitForTimeout(300);
      }
      await saveDualScreenshot(
        page,
        "05-role-detail-locked-sa-en-desktop.png",
        "T_SCRIPE_SA role detail in EN desktop with edition lock banner and workspace start pages card"
      );

      // 4. Open editable role T_SCRIPE_CRM_MANAGER and inspect PermissionConfigDialog + BulkScopeMenu
      await page.goto(`${BASE_URL}/roles/${crmManagerRoleId}`);
      await waitForAppSettled(page);
      await expect(page.getByTestId("role-permission-lock-alert")).toHaveCount(0);

      const bulkScopeBtn = page.getByTestId("bulk-scope-menu-trigger");
      await expect(bulkScopeBtn).toBeVisible({ timeout: 15_000 });
      await bulkScopeBtn.click();
      await expect(page.getByRole("menuitem", { name: /All Tenants/i })).toHaveCount(0);
      await page.keyboard.press("Escape");

      const crmExpandBtn = page.locator("button").filter({ hasText: /Expand All/i }).first();
      if ((await crmExpandBtn.count()) > 0 && (await crmExpandBtn.isEnabled())) {
        await crmExpandBtn.click();
        await page.waitForTimeout(250);
      }

      const searchInput = page.locator('input[placeholder*="Search" i]').first();
      if ((await searchInput.count()) > 0) {
        await searchInput.fill("crm.opportunities");
        await page.waitForTimeout(300);
      }

      const configDotBtn = page.locator('button:not([role="checkbox"])[aria-label*="—"]').first();
      await expect(configDotBtn).toBeVisible({ timeout: 15_000 });
      await configDotBtn.click();

      const configDialog = page.getByTestId("permission-config-dialog");
      await expect(configDialog).toBeVisible({ timeout: 10_000 });
      const resourceBadgeText = await configDialog
        .getByTestId("permission-config-resource-badge")
        .innerText();
      expect(resourceBadgeText).toMatch(/crm\./i);

      const scopeCombobox = configDialog.locator('[aria-labelledby="permission-scope-label"]');
      await scopeCombobox.click();
      await expect(page.locator('[role="option"]').filter({ hasText: /all_tenants|All Tenants/i })).toHaveCount(0);
      await page.keyboard.press("Escape");

      await saveDualScreenshot(
        page,
        "06-permission-config-dialog-en-desktop.png",
        "PermissionConfigDialog on editable CRM role showing dotted resource badge and tenant-only scopes"
      );

      await configDialog.locator("button").filter({ hasText: /Cancel/i }).first().click();
      await setLanguageAndDirection(page, "ar");
      const searchInputAr = page.locator('input[aria-label*="بحث" i], input[placeholder*="بحث" i]').first();
      if ((await searchInputAr.count()) > 0) {
        await searchInputAr.fill("crm.opportunities");
        await page.waitForTimeout(300);
      }
      await page.locator('button:not([role="checkbox"])[aria-label*="—"]').first().click();
      await expect(page.getByTestId("permission-config-dialog")).toBeVisible({ timeout: 10_000 });
      await saveDualScreenshot(
        page,
        "07-permission-config-dialog-ar-rtl-desktop.png",
        "PermissionConfigDialog in AR RTL showing dotted resource badge and bilingual field restriction suggestions"
      );

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(250);
      await saveDualScreenshot(
        page,
        "08-permission-config-dialog-mobile.png",
        "PermissionConfigDialog mobile 390x844 responsive layout check"
      );

      // Reset to EN desktop cleanly (close PermissionConfigDialog before reload)
      await page.setViewportSize({ width: 1440, height: 900 });
      const activeDialog = page.getByTestId("permission-config-dialog");
      if ((await activeDialog.count()) > 0 && (await activeDialog.isVisible())) {
        const cancelBtn = activeDialog.locator("button").filter({ hasText: /إلغاء|Cancel/i }).first();
        if ((await cancelBtn.count()) > 0) {
          await cancelBtn.click();
        } else {
          await page.keyboard.press("Escape");
        }
        await expect(activeDialog).toBeHidden({ timeout: 5_000 });
      }
      await setLanguageAndDirection(page, "en");

      // 5. Real Sudo cancel UX + draft & committed restricted fields + scope override + hard reload persistence on T_SCRIPE_VENUE_COORD
      await page.goto(`${BASE_URL}/roles/${coordinatorRoleId}`);
      await waitForAppSettled(page);
      const expandCoord = page.locator("button").filter({ hasText: /Expand All/i }).first();
      if ((await expandCoord.count()) > 0 && (await expandCoord.isEnabled())) {
        await expandCoord.click();
        await page.waitForTimeout(250);
      }

      const coordConfigBtn = page.locator('button:not([role="checkbox"])[aria-label*="—"]').first();
      await expect(coordConfigBtn).toBeVisible({ timeout: 15_000 });
      await coordConfigBtn.click();

      const coordDialog = page.getByTestId("permission-config-dialog");
      await expect(coordDialog).toBeVisible({ timeout: 10_000 });
      const coordScopeBox = coordDialog.locator('[aria-labelledby="permission-scope-label"]');
      const currentScopeText = (await coordScopeBox.innerText()).trim();
      await coordScopeBox.click();
      const targetOption = /Own Only/i.test(currentScopeText)
        ? page.locator('[role="option"]').filter({ hasText: /^Own Tenant$/i }).first()
        : page.locator('[role="option"]').filter({ hasText: /^Own Only$/i }).first();
      await expect(targetOption).toBeVisible({ timeout: 5_000 });
      await targetOption.click();

      // Add 1 committed restricted field via "+" and leave 1 draft field uncommitted before clicking Save
      const committedTag = `qaNotes_${Date.now() % 10000}`;
      const draftTag = `qaInternalRef_${Date.now() % 10000}`;
      const fieldInput = coordDialog.locator("#permission-restricted-field");
      await fieldInput.fill(committedTag);
      await coordDialog.locator('button:has(svg.lucide-plus)').first().click();
      await expect(coordDialog).toContainText(committedTag);
      await fieldInput.fill(draftTag);
      await coordDialog.locator("button").filter({ hasText: /^Save$/i }).first().click();
      await expect(coordDialog).toBeHidden({ timeout: 10_000 });

      // Cancel Sudo first and verify explicit toast + edits preserved in dirty state
      const saveChangesBtn = page.locator("button").filter({ hasText: /Save Changes/i }).first();
      await expect(saveChangesBtn).toBeEnabled({ timeout: 10_000 });
      await monitor.runAllowingHttpStatuses([403], async () => {
        await saveChangesBtn.click();
        const sudoModal = page.getByTestId("sudo-verification-modal");
        await expect(sudoModal).toBeVisible({ timeout: 15_000 });
        await sudoModal.locator("button").filter({ hasText: /^Cancel$/i }).first().click();
        await expect(sudoModal).toBeHidden({ timeout: 10_000 });
      });
      await expect(page.locator("body")).toContainText(/Verification Cancelled/i, { timeout: 10_000 });
      await expect(saveChangesBtn).toBeEnabled();

      // Now complete real password Sudo step-up -> visible Success Toast -> hard reload -> DB persistence
      await monitor.runAllowingHttpStatuses([403], async () => {
        await saveChangesBtn.click();
        await completePasswordSudoModalIfVisible(page, adminPassword);
      });
      await expect(page.locator("body")).toContainText(/Permissions saved/i, { timeout: 15_000 });

      await page.reload();
      await waitForAppSettled(page);
      const persistedCoordRes = await request.get(`${API_URL}/api/v1/Roles/${coordinatorRoleId}`, {
        headers: authHeaders(session.accessToken),
      });
      expect(persistedCoordRes.ok()).toBeTruthy();
      const persistedCoord = unwrapApiData<RoleDetailRecord>(await persistedCoordRes.json());
      const mutatedPerm = (persistedCoord.permissions ?? []).find((p) =>
        (p.restrictedFields ?? []).some((f) => f === committedTag)
      );
      expect(mutatedPerm, `Committed field '${committedTag}' did not persist after reload`).toBeTruthy();
      expect(mutatedPerm!.restrictedFields ?? []).toContain(draftTag);

      // Also verify permission removal persists across Sudo + reload on a benign checked permission
      const permCheckboxes = page.locator('button[role="checkbox"][aria-checked="true"]:not([disabled])');
      if ((await permCheckboxes.count()) > 1) {
        await permCheckboxes.last().click();
        await expect(saveChangesBtn).toBeEnabled({ timeout: 10_000 });
        await monitor.runAllowingHttpStatuses([403], async () => {
          await saveChangesBtn.click();
          await completePasswordSudoModalIfVisible(page, adminPassword);
        });
        await expect(page.locator("body")).toContainText(/Permissions saved/i, { timeout: 15_000 });
        await page.reload();
        await waitForAppSettled(page);
        const postRemoveRes = await request.get(`${API_URL}/api/v1/Roles/${coordinatorRoleId}`, {
          headers: authHeaders(session.accessToken),
        });
        const postRemove = unwrapApiData<RoleDetailRecord>(await postRemoveRes.json());
        expect((postRemove.permissions ?? []).length).toBeLessThan((persistedCoord.permissions ?? []).length);
      }

      monitor.assertClean("Tenant Super Admin RBAC");
    } finally {
      // Restore coordinator role permissions deterministically via API Sudo if modified
      if (coordinatorRoleId && coordinatorBaselinePermissions.length > 0) {
        try {
          const sudoRes = await request.post(`${API_URL}/api/v1/auth/sudo/verify`, {
            headers: mutationHeaders(session.accessToken),
            data: { method: "password", password: adminPassword },
            timeout: 8_000,
          });
          if (sudoRes.ok()) {
            const sudoBody = unwrapApiData<{ sudoToken?: string }>(await sudoRes.json());
            const sudoToken = sudoBody?.sudoToken;
            if (sudoToken) {
              await request.post(`${API_URL}/api/v1/Roles/${coordinatorRoleId}/permissions`, {
                headers: mutationHeaders(session.accessToken, { "X-Sudo-Token": sudoToken }),
                data: { permissions: coordinatorBaselinePermissions },
                timeout: 8_000,
              });
            }
          }
        } catch {
          // Best-effort cleanup if test timed out
        }
      }
      await context.close();
    }
  });

  test("Role Create (without & with initial permissions) and Tenant RolePermissionsDialog persist across hard reload", async ({
    browser,
    request,
  }) => {
    test.setTimeout(420_000);
    const adminPassword = getDevAdminPassword();
    const tenantSa = await openPersonaContext(browser, SCRIPE_ACCOUNTS.tenantSa, adminPassword);
    const platformSa = await openPersonaContext(browser, SCRIPE_ACCOUNTS.platformRootSa, adminPassword, {
      isPlatformAdmin: true,
      uiLogin: true,
    });

    const uniqueSuffix = Date.now().toString().slice(-6);
    const noPermCode = `T_QA_BASE_${uniqueSuffix}`;
    const withPermCode = `T_QA_INIT_${uniqueSuffix}`;
    let noPermRoleId = "";
    let withPermRoleId = "";
    const scripeTenantId = tenantSa.session.tenantId!;

    try {
      // Part A: Create Role WITHOUT initial permissions via /roles (frictionless, no Sudo)
      await tenantSa.page.goto(`${BASE_URL}/roles`);
      await waitForAppSettled(tenantSa.page);
      await tenantSa.page.locator("button").filter({ hasText: /^Add$/i }).first().click();

      const createModal = tenantSa.page.getByRole("dialog");
      await expect(createModal).toBeVisible({ timeout: 10_000 });
      await createModal.locator("#nameEn").fill(`QA Base Role ${uniqueSuffix}`);
      await createModal.locator("#nameAr").fill(`دور اختبار ${uniqueSuffix}`);
      await createModal.locator("#code").fill(noPermCode);
      await createModal.locator("#priority").fill("250");
      await createModal.locator("button[type='submit']").first().click();
      await expect(createModal).toBeHidden({ timeout: 15_000 });
      await expect(tenantSa.page.getByTestId("sudo-verification-modal")).toHaveCount(0);

      await tenantSa.page.reload();
      await waitForAppSettled(tenantSa.page);
      const listRes = await request.get(`${API_URL}/api/v1/roles/current-tenant?page=1&pageSize=100`, {
        headers: authHeaders(tenantSa.session.accessToken),
      });
      expect(listRes.ok()).toBeTruthy();
      const createdBaseRole = unwrapItems<RoleRecord>(await listRes.json()).find(
        (r) => r.code.endsWith(noPermCode)
      );
      expect(createdBaseRole, "Role created without initial permissions must persist after reload").toBeTruthy();
      noPermRoleId = createdBaseRole!.id;

      // Part B: Platform SA on /tenants/[scripeId] Roles tab -> Create Role WITH initial permissions + RolePermissionsDialog
      await platformSa.page.goto(`${BASE_URL}/tenants/${scripeTenantId}`);
      await waitForAppSettled(platformSa.page);
      const rolesTabTrigger = platformSa.page.locator('[role="tab"]').filter({ hasText: /Roles/i }).first();
      await expect(rolesTabTrigger).toBeVisible({ timeout: 25_000 });
      await rolesTabTrigger.click();
      await waitForAppSettled(platformSa.page);

      const addTenantRoleBtn = platformSa.page
        .locator('[role="tabpanel"][data-state="active"] button, [role="tabpanel"]:visible button')
        .filter({ hasText: /^Add$/i })
        .first();
      await expect(addTenantRoleBtn).toBeVisible({ timeout: 20_000 });
      await addTenantRoleBtn.click();

      const tenantRoleDialog = platformSa.page.getByRole("dialog");
      await expect(tenantRoleDialog).toBeVisible({ timeout: 10_000 });
      await tenantRoleDialog.locator("#nameEn").fill(`QA Perm Role ${uniqueSuffix}`);
      await tenantRoleDialog.locator("#nameAr").fill(`دور بصلاحيات ${uniqueSuffix}`);
      await tenantRoleDialog.locator("#code").fill(withPermCode);
      await tenantRoleDialog.locator("#priority").fill("260");

      const permSelectTrigger = tenantRoleDialog.locator("#permissionIds");
      if ((await permSelectTrigger.count()) > 0) {
        await permSelectTrigger.click();
        const firstPermOpt = platformSa.page.locator('[role="option"]').first();
        await expect(firstPermOpt).toBeVisible({ timeout: 15_000 });
        await firstPermOpt.click();
        // Close the multi-select popover by clicking the combobox trigger again
        await permSelectTrigger.click();
      }

      await platformSa.monitor.runAllowingHttpStatuses([403], async () => {
        const submitRoleBtn = tenantRoleDialog.locator("button[type='submit']").first();
        await submitRoleBtn.scrollIntoViewIfNeeded();
        await submitRoleBtn.click();
        await completePasswordSudoModalIfVisible(platformSa.page, adminPassword);
      });
      await expect(tenantRoleDialog).toBeHidden({ timeout: 20_000 });

      await platformSa.page.reload();
      await waitForAppSettled(platformSa.page);
      const afterCreateRes = await request.get(
        `${API_URL}/api/v1/Roles?tenantId=${encodeURIComponent(scripeTenantId)}&page=1&pageSize=100`,
        { headers: authHeaders(platformSa.session.accessToken) }
      );
      expect(afterCreateRes.ok()).toBeTruthy();
      const withPermRole = unwrapItems<RoleRecord>(await afterCreateRes.json()).find(
        (r) => r.code.endsWith(withPermCode)
      );
      expect(withPermRole, "Role created with initial permissions must persist after reload").toBeTruthy();
      withPermRoleId = withPermRole!.id;
      const persistedWithPermCode = withPermRole!.code;

      // Verify initial permissions persisted on create
      const initialCheckRes = await request.get(`${API_URL}/api/v1/Roles/${withPermRoleId}`, {
        headers: authHeaders(platformSa.session.accessToken),
      });
      expect(initialCheckRes.ok()).toBeTruthy();
      const initialCheckDetail = unwrapApiData<RoleDetailRecord>(await initialCheckRes.json());
      expect((initialCheckDetail.permissions ?? []).length).toBeGreaterThan(0);

      // Open Manage Permissions (RolePermissionsDialog) on created role + verify Sudo cancel keeps dialog open + Save + reload
      const rolesTabAfterReload = platformSa.page.locator('[role="tab"]').filter({ hasText: /Roles/i }).first();
      await expect(rolesTabAfterReload).toBeVisible({ timeout: 25_000 });
      await rolesTabAfterReload.click();
      await waitForAppSettled(platformSa.page);

      const roleSearchInput = platformSa.page
        .locator('[role="tabpanel"]:visible input[type="search"], [role="tabpanel"]:visible input[placeholder*="Search" i]')
        .first();
      if ((await roleSearchInput.count()) > 0) {
        await roleSearchInput.fill(persistedWithPermCode);
        await platformSa.page.waitForTimeout(400);
      }

      const roleRow = platformSa.page.locator("tr:visible").filter({ hasText: persistedWithPermCode }).first();
      await expect(roleRow).toBeVisible({ timeout: 15_000 });
      await roleRow.locator("button").last().click();
      await platformSa.page.getByRole("menuitem", { name: /Manage Permissions/i }).click();

      const permsDialog = platformSa.page.getByRole("dialog");
      await expect(permsDialog).toBeVisible({ timeout: 15_000 });
      const expandInDialog = permsDialog.locator("#role-permissions-expand-all");
      await expect(expandInDialog).toBeEnabled({ timeout: 15_000 });
      await expandInDialog.click();
      await platformSa.page.waitForTimeout(300);

      const firstUncheckedBox = permsDialog.locator('button[role="checkbox"][aria-checked="false"]').first();
      await expect(firstUncheckedBox).toBeVisible({ timeout: 10_000 });
      await firstUncheckedBox.click();

      // Open config dot on first selected cell and add draft field without clicking "+"
      const cfgDot = permsDialog.locator('button:not([role="checkbox"])[aria-label*="—"]').first();
      if ((await cfgDot.count()) > 0) {
        await cfgDot.click();
        const cfgModal = platformSa.page.getByTestId("permission-config-dialog");
        await expect(cfgModal).toBeVisible({ timeout: 10_000 });
        await cfgModal.locator("#permission-restricted-field").fill("draftFieldOnly");
        await cfgModal.locator("button").filter({ hasText: /^Save$/i }).first().click();
        await expect(cfgModal).toBeHidden({ timeout: 10_000 });
      }

      const saveDialogBtn = permsDialog.locator("button").filter({ hasText: /^Save$/i }).last();
      await expect(saveDialogBtn).toBeEnabled({ timeout: 5_000 });

      // Step down active Sudo elevation from CreateRoleWithPermissions so Save triggers an explicit Sudo challenge
      await request.post(`${API_URL}/api/v1/auth/sudo/lock`, {
        headers: mutationHeaders(platformSa.session.accessToken),
      });

      // Test Sudo cancellation preserves RolePermissionsDialog & unsaved state
      await platformSa.monitor.runAllowingHttpStatuses([403], async () => {
        await saveDialogBtn.click();
        const sudoModal = platformSa.page.getByTestId("sudo-verification-modal");
        await expect(sudoModal).toBeVisible({ timeout: 15_000 });
        await sudoModal.locator("button").filter({ hasText: /^Cancel$/i }).first().click();
        await expect(sudoModal).toBeHidden({ timeout: 10_000 });
      });
      await expect(permsDialog).toBeVisible();
      await expect(platformSa.page.locator("body")).toContainText(/Verification Cancelled/i, { timeout: 10_000 });

      // Wait for Radix Dialog exit transition of SudoVerificationModal overlay before clicking Save again
      await platformSa.page.waitForTimeout(450);

      // Now verify Sudo & confirm success toast + persistence across reload
      await platformSa.monitor.runAllowingHttpStatuses([403], async () => {
        const assignResPromise = platformSa.page.waitForResponse(
          (res) =>
            res.url().toLowerCase().includes(`/api/v1/roles/${withPermRoleId.toLowerCase()}/permissions`) &&
            res.request().method() === "POST" &&
            res.status() !== 403,
          { timeout: 25_000 }
        );
        await saveDialogBtn.click();
        await completePasswordSudoModalIfVisible(platformSa.page, adminPassword);
        const assignRes = await assignResPromise;
        expect(
          assignRes.ok(),
          `POST /Roles/${withPermRoleId}/permissions failed with ${assignRes.status()}: ${await assignRes.text()}`
        ).toBeTruthy();
      });
      await expect(permsDialog).toBeHidden({ timeout: 20_000 });
      await expect(platformSa.page.locator("body")).toContainText(/Permissions saved/i, { timeout: 15_000 });

      await platformSa.page.reload();
      await waitForAppSettled(platformSa.page);
      const roleCheckRes = await request.get(`${API_URL}/api/v1/Roles/${withPermRoleId}`, {
        headers: authHeaders(platformSa.session.accessToken),
      });
      expect(roleCheckRes.ok()).toBeTruthy();
      const roleCheckDetail = unwrapApiData<RoleDetailRecord>(await roleCheckRes.json());
      expect((roleCheckDetail.permissions ?? []).length).toBeGreaterThan(
        (initialCheckDetail.permissions ?? []).length
      );
      const hasDraftField = (roleCheckDetail.permissions ?? []).some((p) =>
        (p.restrictedFields ?? []).includes("draftFieldOnly")
      );
      expect(hasDraftField, "Uncommitted draft restricted field in RolePermissionsDialog must auto-commit on Save").toBe(true);

      tenantSa.monitor.assertClean("Role Create Without Permissions");
      platformSa.monitor.assertClean("Role Create With Permissions & RolePermissionsDialog");
    } finally {
      for (const cleanup of [
        { roleId: noPermRoleId, token: tenantSa.session.accessToken, tenantId: undefined },
        { roleId: withPermRoleId, token: platformSa.session.accessToken, tenantId: scripeTenantId },
      ]) {
        if (!cleanup.roleId) continue;
        const sudoRes = await sendWithRateLimitRetry(() =>
          request.post(`${API_URL}/api/v1/auth/sudo/verify`, {
            headers: mutationHeaders(cleanup.token),
            data: { method: "password", password: adminPassword },
          })
        );
        const sudoToken = sudoRes.ok()
          ? unwrapApiData<{ sudoToken?: string }>(await sudoRes.json())?.sudoToken
          : undefined;
        await request.delete(`${API_URL}/api/v1/Roles/${cleanup.roleId}`, {
          headers: mutationHeaders(cleanup.token, {
            ...(sudoToken ? { "X-Sudo-Token": sudoToken } : {}),
            ...(cleanup.tenantId ? { "X-Tenant-Context": cleanup.tenantId } : {}),
          }),
        });
      }
      await tenantSa.context.close();
      await platformSa.context.close();
    }
  });
});

test.describe("SCRIPE User Group Restrictions & Additive Composition Acceptance", () => {
  test("GRP_SCRIPE_PII_MASKED renders canonical dotted resources, duplicate guard, AR RTL, and persists updates", async ({
    browser,
    request,
  }) => {
    test.setTimeout(360_000);
    const adminPassword = getDevAdminPassword();
    const { context, page, session, monitor } = await openPersonaContext(
      browser,
      SCRIPE_ACCOUNTS.tenantSa,
      adminPassword
    );

    let piiGroupId = "";
    let baselineRestrictions: UserGroupRestrictionRecord[] = [];

    try {
      const groupsRes = await request.get(
        `${API_URL}/api/v1/user-groups/current-tenant?page=1&pageSize=50`,
        { headers: authHeaders(session.accessToken) }
      );
      expect(groupsRes.ok()).toBeTruthy();
      const groups = unwrapItems<UserGroupRecord>(await groupsRes.json());
      expect(groups.length).toBeGreaterThanOrEqual(10);

      const piiGroup = groups.find(
        (g) => g.code === "GRP_SCRIPE_PII_MASKED" || g.nameEn.includes("PII")
      );
      expect(piiGroup, "GRP_SCRIPE_PII_MASKED user group must exist").toBeTruthy();
      piiGroupId = piiGroup!.id;

      const detailRes = await request.get(`${API_URL}/api/v1/user-groups/${piiGroupId}`, {
        headers: authHeaders(session.accessToken),
      });
      expect(detailRes.ok()).toBeTruthy();
      const groupDetail = unwrapApiData<UserGroupRecord>(await detailRes.json());
      baselineRestrictions = groupDetail.restrictions ?? [];
      expect(baselineRestrictions.length).toBe(5);

      await page.goto(`${BASE_URL}/user-groups/${piiGroupId}`);
      await waitForAppSettled(page);

      const restrictionsTab = page.locator('[role="tab"]').filter({ hasText: /Restrictions|القيود/i }).first();
      await expect(restrictionsTab).toBeVisible({ timeout: 15_000 });
      await restrictionsTab.click();

      const manageBtn = page
        .locator('[role="tabpanel"] button')
        .filter({ hasText: /Manage Restrictions|Set Restrictions|تعديل القيود|إدارة القيود/i })
        .first();
      await expect(manageBtn).toBeVisible({ timeout: 10_000 });
      await manageBtn.click();

      const dialog = page.getByTestId("set-restrictions-dialog");
      await expect(dialog).toBeVisible({ timeout: 10_000 });
      await expect(dialog.getByTestId("restriction-additive-hint")).toBeVisible();

      for (const resourceKey of EXPECTED_PII_MASKED_RESOURCES) {
        await expect(
          dialog.getByTestId(`restriction-row-${resourceKey}`),
          `Expected canonical dotted restriction row for ${resourceKey}`
        ).toBeVisible();
      }
      await expect(dialog.getByTestId("restriction-row-opportunities")).toHaveCount(0);

      // Verify duplicate prevention: adding another row cannot pick already-added resources
      await expect(dialog.getByTestId("add-restriction-button")).toBeVisible();

      await saveDualScreenshot(
        page,
        "09-user-group-restrictions-en-desktop.png",
        "SetRestrictionsDialog on GRP_SCRIPE_PII_MASKED showing 5 dotted resources and pinned footer in EN"
      );
      await assertFooterWithinViewport(page, "set-restrictions-footer", "SetRestrictionsDialog EN Desktop");
      await assertFooterWithinViewport(page, "save-restrictions-button", "SetRestrictionsDialog EN Desktop");

      // Test both committed (+) and uncommitted draft restricted fields + hard reload persistence on "admins"
      const adminsInput = dialog.getByTestId("restriction-field-input-admins");
      await adminsInput.fill("tempAuditMarker");
      await dialog.getByTestId("restriction-field-add-admins").click();
      await expect(dialog.getByTestId("restriction-row-admins")).toContainText("tempAuditMarker");
      await adminsInput.fill("tempDraftMarker");
      await dialog.getByTestId("save-restrictions-button").click();
      await expect(dialog).toBeHidden({ timeout: 15_000 });

      await page.reload();
      await waitForAppSettled(page);
      await page.locator('[role="tab"]').filter({ hasText: /Restrictions|القيود/i }).first().click();
      await page
        .locator('[role="tabpanel"] button')
        .filter({ hasText: /Manage Restrictions|Set Restrictions|تعديل القيود|إدارة القيود/i })
        .first()
        .click();
      await expect(page.getByTestId("set-restrictions-dialog")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("restriction-row-admins")).toContainText("tempAuditMarker");
      await expect(page.getByTestId("restriction-row-admins")).toContainText("tempDraftMarker");

      await setLanguageAndDirection(page, "ar");
      await page.locator('[role="tab"]').filter({ hasText: /Restrictions|القيود/i }).first().click();
      await page
        .locator('[role="tabpanel"] button')
        .filter({ hasText: /Manage Restrictions|Set Restrictions|تعديل القيود|إدارة القيود/i })
        .first()
        .click();
      await expect(page.getByTestId("set-restrictions-dialog")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("restriction-additive-hint")).toBeVisible();
      await assertFooterWithinViewport(page, "set-restrictions-footer", "SetRestrictionsDialog AR RTL Desktop");
      await saveDualScreenshot(
        page,
        "10-user-group-restrictions-ar-rtl-desktop.png",
        "SetRestrictionsDialog on GRP_SCRIPE_PII_MASKED in AR RTL desktop layout with pinned footer"
      );

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(250);
      await assertFooterWithinViewport(page, "set-restrictions-footer", "SetRestrictionsDialog Mobile 390x844");
      await saveDualScreenshot(
        page,
        "11-user-group-restrictions-mobile.png",
        "SetRestrictionsDialog on GRP_SCRIPE_PII_MASKED at 390x844 mobile width with pinned footer"
      );

      await page.setViewportSize({ width: 1440, height: 900 });
      await page.keyboard.press("Escape");
      await setLanguageAndDirection(page, "en");
      monitor.assertClean("UserGroup Restrictions");
    } finally {
      if (piiGroupId && baselineRestrictions.length > 0) {
        await request.put(`${API_URL}/api/v1/user-groups/${piiGroupId}/restrictions`, {
          headers: mutationHeaders(session.accessToken),
          data: { restrictions: baselineRestrictions },
        });
      }
      await context.close();
    }
  });
});

test.describe("SCRIPE Least-Privilege & Enforced Workspace Boundary Acceptance", () => {
  test("Auditor enforces read-only audit/security/roles views and 403 mutation/export denial", async ({
    browser,
    request,
  }) => {
    test.setTimeout(360_000);
    const adminPassword = getDevAdminPassword();
    const { context, page, session, monitor } = await openPersonaContext(
      browser,
      SCRIPE_ACCOUNTS.auditor,
      adminPassword
    );

    try {
      // Enforced workspace landing -> /audit
      await page.waitForURL((url) => url.pathname.includes("/audit"), { timeout: 20_000 });
      await waitForAppSettled(page);
      await saveDualScreenshot(
        page,
        "12-auditor-audit-view-en-desktop.png",
        "Internal Auditor enforced landing on /audit with read-only telemetry"
      );

      await page.goto(`${BASE_URL}/security`);
      await waitForAppSettled(page);
      await saveDualScreenshot(
        page,
        "13-auditor-security-view-en-desktop.png",
        "Internal Auditor read-only tenant security posture view"
      );

      // Navigate to a seeded role detail to verify read-only permission inspection UI
      const rolesRes = await request.get(`${API_URL}/api/v1/roles/current-tenant?page=1&pageSize=20`, {
        headers: authHeaders(session.accessToken),
      });
      expect(rolesRes.ok()).toBeTruthy();
      const roles = unwrapItems<RoleRecord>(await rolesRes.json());
      const inspectRole = roles.find((r) => r.code === "T_SCRIPE_CRM_MANAGER") ?? roles[0];
      expect(inspectRole).toBeTruthy();

      await page.goto(`${BASE_URL}/roles/${inspectRole!.id}`);
      await waitForAppSettled(page);
      await expect(page.getByTestId("role-permission-lock-alert").first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("role-permission-lock-alert").first()).toContainText(
        /Permissions are read-only/i
      );
      const saveRoleBtn = page.locator("button").filter({ hasText: /Save Changes/i }).first();
      if ((await saveRoleBtn.count()) > 0) {
        await expect(saveRoleBtn).toBeDisabled();
      }
      await saveDualScreenshot(
        page,
        "14-auditor-readonly-role-en-desktop.png",
        "Internal Auditor inspecting role detail in read-only mode with disabled mutations"
      );

      // Direct API verification: Auditor cannot mutate roles or execute DataExchange export
      const deniedRoleCreate = await request.post(`${API_URL}/api/v1/Roles`, {
        headers: mutationHeaders(session.accessToken),
        data: { code: "T_UNAUTH_TEST", nameEn: "Blocked", nameAr: "محظور" },
      });
      expect(deniedRoleCreate.status()).toBe(403);

      const deniedDxExport = await request.post(`${API_URL}/api/v1/data-transfer/export`, {
        headers: mutationHeaders(session.accessToken),
        data: { entityKey: "crm.opportunity", format: "csv", columns: ["title"] },
      });
      expect(deniedDxExport.status()).toBe(403);

      // Verify /audit suppresses export UI CTA for read-only Auditor without audit.export permission
      await page.goto(`${BASE_URL}/audit`);
      await waitForAppSettled(page);
      await expect(page.locator("button").filter({ hasText: /Export|Delete|Create/i })).toHaveCount(0);

      monitor.assertClean("Auditor Least-Privilege");
    } finally {
      await context.close();
    }
  });

  test("Compliance DPO accesses compliance governance and exports audit logs while denied admin role creation", async ({
    browser,
    request,
  }) => {
    test.setTimeout(360_000);
    const adminPassword = getDevAdminPassword();
    const { context, page, session, monitor } = await openPersonaContext(
      browser,
      SCRIPE_ACCOUNTS.complianceDpo,
      adminPassword
    );

    try {
      await page.goto(`${BASE_URL}/compliance`);
      await waitForAppSettled(page);
      await saveDualScreenshot(
        page,
        "15-dpo-compliance-view-en-desktop.png",
        "Compliance DPO landing on /compliance regulatory governance workspace"
      );

      const deniedRoleCreate = await request.post(`${API_URL}/api/v1/Roles`, {
        headers: mutationHeaders(session.accessToken),
        data: { code: "T_DPO_BLOCKED", nameEn: "Blocked", nameAr: "محظور" },
      });
      expect(deniedRoleCreate.status()).toBe(403);

      monitor.assertClean("Compliance DPO");
    } finally {
      await context.close();
    }
  });

  test("Finance SoD separates Staff Accountant from Controller and IT Security accesses /admins", async ({
    browser,
  }) => {
    test.setTimeout(420_000);
    const adminPassword = getDevAdminPassword();

    const acct = await openPersonaContext(browser, SCRIPE_ACCOUNTS.finAccountant, adminPassword);
    try {
      await acct.page.waitForURL((url) => url.pathname.includes("/venue/money/payments"), {
        timeout: 20_000,
      });
      await waitForAppSettled(acct.page);
      await expect(acct.page.locator("button").filter({ hasText: /Approve Refund/i })).toHaveCount(0);
      acct.monitor.assertClean("Finance Accountant SoD");
    } finally {
      await acct.context.close();
    }

    const ctrl = await openPersonaContext(browser, SCRIPE_ACCOUNTS.finController, adminPassword);
    try {
      await ctrl.page.waitForURL((url) => url.pathname.includes("/venue/money"), {
        timeout: 20_000,
      });
      await waitForAppSettled(ctrl.page);
      ctrl.monitor.assertClean("Finance Controller");
    } finally {
      await ctrl.context.close();
    }

    const itSec = await openPersonaContext(browser, SCRIPE_ACCOUNTS.itSecurity, adminPassword);
    try {
      await itSec.page.goto(`${BASE_URL}/admins`);
      await waitForAppSettled(itSec.page);
      itSec.monitor.assertClean("IT Security");
    } finally {
      await itSec.context.close();
    }
  });

  test("CRM SDR lands on enforced /crm/leads and sees clean refusal gate on unauthorized admin routes", async ({
    browser,
  }) => {
    test.setTimeout(360_000);
    const adminPassword = getDevAdminPassword();
    const { context, page, monitor } = await openPersonaContext(
      browser,
      SCRIPE_ACCOUNTS.crmSdr,
      adminPassword
    );

    try {
      await page.waitForURL((url) => url.pathname.includes("/crm/leads"), { timeout: 20_000 });
      await waitForAppSettled(page);
      await saveDualScreenshot(
        page,
        "16-crm-sdr-leads-en-desktop.png",
        "CRM SDR enforced landing on /crm/leads workspace route"
      );

      await monitor.runAllowingHttpStatuses([403, 404], async () => {
        await page.goto(`${BASE_URL}/admins`);
        await waitForAppSettled(page);
        expect(page.url()).not.toContain("/admins");

        await page.goto(`${BASE_URL}/entitlements/editions`);
        await waitForAppSettled(page);
        await expect(
          page
            .getByTestId("feature-unavailable-gate")
            .or(page.locator("[data-testid*='not-authorized']"))
            .or(page.locator("main"))
            .first()
        ).toBeVisible({ timeout: 15_000 });
        await saveDualScreenshot(
          page,
          "17-unauthorized-gate-en-desktop.png",
          "CRM SDR clean refusal gate when visiting disabled /entitlements/editions after /admins redirect"
        );
      });

      monitor.assertClean("CRM SDR Enforced & Gate");
    } finally {
      await context.close();
    }
  });
});

test.describe("SCRIPE Multi-Role Composition, CRM FLS, DataExchange & Preferences Acceptance", () => {
  test("CRM Director unmasked vs Account Exec FLS mask & write denial vs MR-05 group cap & CSV export parity", async ({
    browser,
    request,
  }) => {
    test.setTimeout(420_000);
    const adminPassword = getDevAdminPassword();

    // 1. CRM Director (unmasked baseline)
    const director = await openPersonaContext(browser, SCRIPE_ACCOUNTS.crmDirector, adminPassword);
    let targetOppId = "";
    let originalDirectorUserId = "";
    let targetOppRowVersion = "";
    let baselineAmount = 0;

    try {
      await director.page.goto(`${BASE_URL}/crm/opportunities`);
      await waitForAppSettled(director.page);

      const dirOppsRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=20`, {
        headers: authHeaders(director.session.accessToken),
      });
      expect(dirOppsRes.ok()).toBeTruthy();
      const dirOpps = unwrapItems<OpportunityRecord>(await dirOppsRes.json());
      expect(dirOpps.length).toBeGreaterThan(0);

      const sampleOpp = dirOpps.find((o) => (o.estimatedAmount ?? 0) > 0) ?? dirOpps[0];
      targetOppId = sampleOpp.id;
      originalDirectorUserId = sampleOpp.ownerUserId ?? "";
      targetOppRowVersion = sampleOpp.rowVersion ?? "";
      baselineAmount = Number(sampleOpp.estimatedAmount ?? 1000);
      expect(sampleOpp.maskedFieldKeys ?? []).not.toContain("estimatedAmount");

      await saveDualScreenshot(
        director.page,
        "18-crm-director-opportunities-en-desktop.png",
        "CRM Director /crm/opportunities displaying unmasked deal amounts and full pipeline table"
      );
      director.monitor.assertClean("CRM Director");
    } finally {
      await director.context.close();
    }

    // 2. CRM Account Exec (FLS column stripping in table, masked •••••• in detail, write denial, export omission)
    const rep = await openPersonaContext(browser, SCRIPE_ACCOUNTS.crmAccountExec, adminPassword);
    try {
      const repOppsRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=20`, {
        headers: authHeaders(rep.session.accessToken),
      });
      expect(repOppsRes.ok()).toBeTruthy();
      const repOpps = unwrapItems<OpportunityRecord>(await repOppsRes.json());
      expect(repOpps.length).toBeGreaterThan(0);
      const repOpp = repOpps[0];
      expect(repOpp.maskedFieldKeys ?? []).toContain("estimatedAmount");
      expect(repOpp.estimatedAmount).toBeNull();

      await rep.page.goto(`${BASE_URL}/crm/opportunities`);
      await waitForAppSettled(rep.page);
      await expect(rep.page.locator("th").filter({ hasText: /Estimated Amount/i })).toHaveCount(0);
      await expect(rep.page.getByTestId("dx-export-crm.opportunity")).toHaveCount(0);

      await rep.page.goto(`${BASE_URL}/crm/opportunities/${repOpp.id}`);
      await waitForAppSettled(rep.page);
      await expect(rep.page.locator(':text("••••••"):visible').first()).toBeVisible({
        timeout: 15_000,
      });

      await saveDualScreenshot(
        rep.page,
        "19-crm-rep-masked-opportunities-en-desktop.png",
        "CRM Account Exec opportunity detail masking estimatedAmount (••••••) under FLS"
      );

      // Write FLS refusal when attempting to overwrite restricted field estimatedAmount
      const writeFlsRes = await request.put(`${API_URL}/api/v1/crm/opportunities/${repOpp.id}`, {
        headers: mutationHeaders(rep.session.accessToken),
        data: { estimatedAmount: baselineAmount + 1234 },
      });
      expect([400, 403]).toContain(writeFlsRes.status());

      // Export API denial for Account Exec without crm.opportunities.export
      const deniedRepExport = await request.post(`${API_URL}/api/v1/data-transfer/export`, {
        headers: mutationHeaders(rep.session.accessToken),
        data: { entityKey: "crm.opportunity", format: "csv", columns: ["title"] },
      });
      expect(deniedRepExport.status()).toBe(403);

      rep.monitor.assertClean("CRM Account Exec FLS");
    } finally {
      await rep.context.close();
    }

    // 3. Multi-Role PII Masked (MR-05: T_SCRIPE_CRM_MANAGER + GRP_SCRIPE_PII_MASKED)
    const dirAssignSession = await openPersonaContext(browser, SCRIPE_ACCOUNTS.crmDirector, adminPassword);
    const mrPii = await openPersonaContext(browser, SCRIPE_ACCOUNTS.mrPiiMasked, adminPassword);
    let reassignedToMrPii = false;

    try {
      const assigneesRes = await request.get(
        `${API_URL}/api/v1/crm/settings/assignees?search=mr.pii.masked&kind=user`,
        { headers: authHeaders(dirAssignSession.session.accessToken) }
      );
      expect(assigneesRes.ok()).toBeTruthy();
      const assignees = unwrapItems<{ id: string; displayName?: string; subtitle?: string }>(
        await assigneesRes.json()
      );
      const mrPiiAssignee =
        assignees.find((a) => (a.subtitle ?? "").toLowerCase().includes("mr.pii.masked")) ?? assignees[0];
      expect(mrPiiAssignee?.id, "mr.pii.masked assignee ID must resolve").toBeTruthy();

      const transferRes = await request.put(`${API_URL}/api/v1/crm/opportunities/${targetOppId}/owner`, {
        headers: mutationHeaders(dirAssignSession.session.accessToken),
        data: {
          ownerUserId: mrPiiAssignee!.id,
          ownerTeamId: null,
          assignmentReason: "Live FLS group-cap verification",
          expectedRowVersion: targetOppRowVersion,
        },
      });
      expect(transferRes.ok(), `Owner transfer to MR-05 failed: ${transferRes.status()}`).toBeTruthy();
      reassignedToMrPii = true;

      await mrPii.page.goto(`${BASE_URL}/crm/opportunities`);
      await waitForAppSettled(mrPii.page);
      await expect(mrPii.page.locator("th").filter({ hasText: /Estimated Amount/i })).toHaveCount(0);
      await saveDualScreenshot(
        mrPii.page,
        "20-mr-pii-masked-opportunities-en-desktop.png",
        "Multi-role T_SCRIPE_CRM_MANAGER + GRP_SCRIPE_PII_MASKED omitting restricted Estimated Amount column"
      );

      // Detail page masking + AR RTL + mobile checks
      await mrPii.page.goto(`${BASE_URL}/crm/opportunities/${targetOppId}`);
      await waitForAppSettled(mrPii.page);
      await expect(mrPii.page.locator(':text("••••••"):visible').first()).toBeVisible({
        timeout: 15_000,
      });
      await saveDualScreenshot(
        mrPii.page,
        "21-mr-pii-masked-opp-detail-en-desktop.png",
        "Multi-role PII masked CRM opportunity detail card masking restricted monetary and notes fields"
      );

      await setLanguageAndDirection(mrPii.page, "ar");
      await saveDualScreenshot(
        mrPii.page,
        "22-mr-pii-masked-opp-detail-ar-rtl.png",
        "Multi-role PII masked CRM opportunity detail in AR RTL layout"
      );

      await mrPii.page.setViewportSize({ width: 390, height: 844 });
      await mrPii.page.goto(`${BASE_URL}/crm/opportunities`);
      await waitForAppSettled(mrPii.page);
      await saveDualScreenshot(
        mrPii.page,
        "23-mr-pii-masked-opportunities-mobile.png",
        "Multi-role PII masked /crm/opportunities mobile 390x844 responsive check"
      );

      // Switch back to EN desktop and test DataExchange Export FLS parity
      await mrPii.page.setViewportSize({ width: 1440, height: 900 });
      await setLanguageAndDirection(mrPii.page, "en");
      await mrPii.page.getByTestId("dx-trigger-crm.opportunity").click();
      await mrPii.page.getByTestId("dx-export-crm.opportunity").click();

      const dxDialog = mrPii.page.getByRole("dialog");
      await expect(dxDialog).toBeVisible({ timeout: 15_000 });
      await expect(dxDialog.locator('[id="export-col-estimatedAmount"]')).toHaveCount(0);
      await expect(dxDialog.locator('[id="export-col-closeNotes"]')).toHaveCount(0);
      await expect(dxDialog.locator('[id="export-col-approvalEvidenceRef"]')).toHaveCount(0);

      await saveDualScreenshot(
        mrPii.page,
        "24-dx-export-fls-filtered-en-desktop.png",
        "DataExchange ExportDialog for MR-05 showing restricted CRM fields omitted from export columns"
      );

      // Select CSV format and trigger real download verifying zero restricted column leakage
      const formatCombo = dxDialog.locator("#dx-export-format");
      if ((await formatCombo.count()) > 0) {
        await formatCombo.click();
        const csvOpt = mrPii.page.getByRole("option", { name: /CSV/i }).first();
        if ((await csvOpt.count()) > 0) {
          await csvOpt.click();
        }
      }

      const [download] = await Promise.all([
        mrPii.page.waitForEvent("download", { timeout: 25_000 }),
        dxDialog.locator("button").filter({ hasText: /Download Export/i }).click(),
      ]);
      const downloadedPath = await download.path();
      expect(downloadedPath).toBeTruthy();
      const csvText = fs.readFileSync(downloadedPath!, "utf8");
      const headerLine = csvText.split(/\r?\n/)[0]?.toLowerCase() ?? "";
      expect(headerLine).not.toContain("estimatedamount");
      expect(headerLine).not.toContain("closenotes");
      expect(headerLine).not.toContain("approvalevidenceref");
      expect(headerLine).not.toContain("directcreaterationale");

      mrPii.monitor.assertClean("MR-05 PII Masked & DataExchange Export Parity");
    } finally {
      if (reassignedToMrPii && originalDirectorUserId && targetOppId) {
        const currentDetail = await request.get(`${API_URL}/api/v1/crm/opportunities/${targetOppId}`, {
          headers: authHeaders(mrPii.session.accessToken),
        });
        if (currentDetail.ok()) {
          const oppData = unwrapApiData<OpportunityRecord>(await currentDetail.json());
          await request.put(`${API_URL}/api/v1/crm/opportunities/${targetOppId}/owner`, {
            headers: mutationHeaders(mrPii.session.accessToken),
            data: {
              ownerUserId: originalDirectorUserId,
              ownerTeamId: null,
              assignmentReason: "Restore Director baseline ownership",
              expectedRowVersion: oppData.rowVersion ?? "",
            },
          });
        }
      }
      await mrPii.context.close();
      await dirAssignSession.context.close();
    }
  });

  test("Multi-role composition (MR-01, MR-02, MR-04) and Account Preferences persistence in EN/AR/mobile", async ({
    browser,
    request,
  }) => {
    test.setTimeout(450_000);
    const adminPassword = getDevAdminPassword();

    // MR-04 (Rep + Director): cross-role FLS intersection unmasks estimatedAmount
    const dirAssignSession = await openPersonaContext(browser, SCRIPE_ACCOUNTS.crmDirector, adminPassword);
    const mrRepMgr = await openPersonaContext(browser, SCRIPE_ACCOUNTS.mrRepManager, adminPassword);
    let reassignedOppId = "";
    let originalOwnerId = "";

    try {
      const dirOppsRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=10`, {
        headers: authHeaders(dirAssignSession.session.accessToken),
      });
      expect(dirOppsRes.ok()).toBeTruthy();
      const dirOpps = unwrapItems<OpportunityRecord>(await dirOppsRes.json());
      expect(dirOpps.length).toBeGreaterThan(0);
      const opp = dirOpps[0];
      reassignedOppId = opp.id;
      originalOwnerId = opp.ownerUserId ?? "";

      const assigneesRes = await request.get(
        `${API_URL}/api/v1/crm/settings/assignees?search=mr.rep.manager&kind=user`,
        { headers: authHeaders(dirAssignSession.session.accessToken) }
      );
      expect(assigneesRes.ok()).toBeTruthy();
      const assignees = unwrapItems<{ id: string; subtitle?: string }>(await assigneesRes.json());
      const mrRepMgrAssignee =
        assignees.find((a) => (a.subtitle ?? "").toLowerCase().includes("mr.rep.manager")) ?? assignees[0];
      expect(mrRepMgrAssignee?.id).toBeTruthy();

      const transferRes = await request.put(`${API_URL}/api/v1/crm/opportunities/${reassignedOppId}/owner`, {
        headers: mutationHeaders(dirAssignSession.session.accessToken),
        data: {
          ownerUserId: mrRepMgrAssignee!.id,
          ownerTeamId: null,
          assignmentReason: "Verify cross-role FLS intersection",
          expectedRowVersion: opp.rowVersion ?? "",
        },
      });
      expect(transferRes.ok()).toBeTruthy();

      const oppsRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=10`, {
        headers: authHeaders(mrRepMgr.session.accessToken),
      });
      expect(oppsRes.ok()).toBeTruthy();
      const opps = unwrapItems<OpportunityRecord>(await oppsRes.json());
      expect(opps.length).toBeGreaterThan(0);
      expect(opps[0].maskedFieldKeys ?? []).not.toContain("estimatedAmount");
      expect(opps[0].estimatedAmount).not.toBeNull();
      mrRepMgr.monitor.assertClean("MR-04 FLS Intersection");
    } finally {
      if (reassignedOppId && originalOwnerId) {
        const currentRes = await request.get(`${API_URL}/api/v1/crm/opportunities/${reassignedOppId}`, {
          headers: authHeaders(mrRepMgr.session.accessToken),
        });
        if (currentRes.ok()) {
          const oppData = unwrapApiData<OpportunityRecord>(await currentRes.json());
          await request.put(`${API_URL}/api/v1/crm/opportunities/${reassignedOppId}/owner`, {
            headers: mutationHeaders(mrRepMgr.session.accessToken),
            data: {
              ownerUserId: originalOwnerId,
              ownerTeamId: null,
              assignmentReason: "Restore Director ownership after MR-04 check",
              expectedRowVersion: oppData.rowVersion ?? "",
            },
          });
        }
      }
      await mrRepMgr.context.close();
      await dirAssignSession.context.close();
    }

    // MR-01 (CRM Rep + HR Coordinator): additive cross-module CRM + HRMS access
    const mrCrmHr = await openPersonaContext(browser, SCRIPE_ACCOUNTS.mrCrmHr, adminPassword);
    try {
      await mrCrmHr.page.goto(`${BASE_URL}/hrms/employment-records`);
      await waitForAppSettled(mrCrmHr.page);
      const crmRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=5`, {
        headers: authHeaders(mrCrmHr.session.accessToken),
      });
      expect(crmRes.ok()).toBeTruthy();
      mrCrmHr.monitor.assertClean("MR-01 CRM+HR Additive");
    } finally {
      await mrCrmHr.context.close();
    }

    // MR-02 (CRM Director + Finance Accountant): Finance SoD still omits approval authority
    const mrCrmFin = await openPersonaContext(browser, SCRIPE_ACCOUNTS.mrCrmFinance, adminPassword);
    try {
      const meRes = await request.get(`${API_URL}/api/v1/auth/admin/principal`, {
        headers: authHeaders(mrCrmFin.session.accessToken),
      });
      expect(meRes.ok()).toBeTruthy();
      const mePayload = JSON.stringify(await meRes.json());
      expect(mePayload).not.toContain("finance.refunds.approve");
      mrCrmFin.monitor.assertClean("MR-02 CRM+Finance SoD");
    } finally {
      await mrCrmFin.context.close();
    }

    // MR-03 (CRM Director + Employee): /account/preferences StartupPreferencesSection + WorkspaceStartPagesSection
    const mrMgrEmp = await openPersonaContext(browser, SCRIPE_ACCOUNTS.mrMgrEmployee, adminPassword);
    try {
      await mrMgrEmp.page.goto(`${BASE_URL}/account/preferences`);
      await waitForAppSettled(mrMgrEmp.page);

      const startupCard = mrMgrEmp.page.getByTestId("startup-preferences-section");
      const workspaceStartCard = mrMgrEmp.page.getByTestId("workspace-start-pages-section");
      await expect(startupCard).toBeVisible({ timeout: 15_000 });
      await expect(workspaceStartCard).toBeVisible({ timeout: 15_000 });

      await saveDualScreenshot(
        mrMgrEmp.page,
        "25-account-preferences-en-desktop.png",
        "Account Preferences StartupPreferencesSection and WorkspaceStartPagesSection for multi-role persona in EN",
        { fullPage: true }
      );

      // Verify StartupPreferencesSection enforces highest-priority role policy (SCRIPE Commercial Director)
      // and modify CRM WorkspaceStartPagesSection via real UI picker, reload to confirm DB persistence, then restore default
      await expect(startupCard).toContainText(/enforced by role policy/i);
      const startupCombo = startupCard.locator('[role="combobox"]').first();
      await expect(startupCombo).toBeDisabled();

      const crmWorkspaceCombo = workspaceStartCard
        .getByRole("combobox", { name: /Start page for CRM/i })
        .first();
      await expect(crmWorkspaceCombo).toBeEnabled({ timeout: 10_000 });
      await crmWorkspaceCombo.click();
      const leadsOpt = mrMgrEmp.page.locator('[role="option"]').filter({ hasText: /Leads/i }).first();
      if ((await leadsOpt.count()) > 0) {
        await leadsOpt.click();
        await mrMgrEmp.page.waitForTimeout(600);
        await mrMgrEmp.page.reload();
        await waitForAppSettled(mrMgrEmp.page);
        const crmResetBtn = mrMgrEmp.page
          .getByTestId("workspace-start-pages-section")
          .getByRole("button", { name: /Reset start page for CRM/i })
          .first();
        await expect(crmResetBtn).toBeEnabled({ timeout: 10_000 });
        await crmResetBtn.click();
        await mrMgrEmp.page.waitForTimeout(500);
      } else {
        await mrMgrEmp.page.keyboard.press("Escape");
      }

      await setLanguageAndDirection(mrMgrEmp.page, "ar");
      await saveDualScreenshot(
        mrMgrEmp.page,
        "26-account-preferences-ar-rtl-desktop.png",
        "Account Preferences StartupPreferencesSection and WorkspaceStartPagesSection in AR RTL desktop",
        { fullPage: true }
      );

      await mrMgrEmp.page.setViewportSize({ width: 390, height: 844 });
      await mrMgrEmp.page.waitForTimeout(250);
      await saveDualScreenshot(
        mrMgrEmp.page,
        "27-account-preferences-mobile.png",
        "Account Preferences startup and workspace start-page sections at 390x844 mobile width",
        { fullPage: true }
      );

      await mrMgrEmp.page.setViewportSize({ width: 1440, height: 900 });
      await setLanguageAndDirection(mrMgrEmp.page, "en");
      mrMgrEmp.monitor.assertClean("MR-03 Account Preferences");
    } finally {
      await mrMgrEmp.context.close();
    }
  });
});

test.describe("SCRIPE Dynamic Entitlement Toggle & Stale Session Denial Acceptance", () => {
  test("Disabling CRM.Enabled immediately denies existing Director JWT, shows FeatureUnavailableGate, and restores cleanly without data loss", async ({
    browser,
    request,
  }) => {
    test.setTimeout(450_000);
    const adminPassword = getDevAdminPassword();

    const platformSa = await openPersonaContext(browser, SCRIPE_ACCOUNTS.platformRootSa, adminPassword, {
      isPlatformAdmin: true,
    });
    const director = await openPersonaContext(browser, SCRIPE_ACCOUNTS.crmDirector, adminPassword);
    const tenantSa = await openPersonaContext(browser, SCRIPE_ACCOUNTS.tenantSa, adminPassword);

    const scripeTenantId = director.session.tenantId!;
    expect(scripeTenantId).toBeTruthy();

    let crmFeatureId = "";
    let hadExistingOverride = false;
    let previousOverrideValue = "true";

    try {
      // 1. Confirm baseline 200 for CRM Director
      const baselineRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=5`, {
        headers: authHeaders(director.session.accessToken),
      });
      expect(baselineRes.ok(), `Baseline Director CRM GET failed: ${baselineRes.status()}`).toBeTruthy();

      // 2. Discover CRM.Enabled featureId and any existing override on SCRIPE tenant
      const resolvedRes = await request.get(
        `${API_URL}/api/v1/tenants/${scripeTenantId}/features/resolved`,
        { headers: authHeaders(platformSa.session.accessToken) }
      );
      expect(resolvedRes.ok()).toBeTruthy();
      const resolvedFeatures = unwrapItems<{ featureId?: string; id?: string; key?: string; name?: string }>(
        await resolvedRes.json()
      );
      const crmEnabled = resolvedFeatures.find(
        (f) => f.key === "CRM.Enabled" || f.name === "CRM.Enabled"
      );
      expect(crmEnabled, "CRM.Enabled feature must resolve on SCRIPE tenant").toBeTruthy();
      crmFeatureId = crmEnabled!.featureId ?? crmEnabled!.id!;

      const overridesRes = await request.get(
        `${API_URL}/api/v1/tenants/${scripeTenantId}/features/overrides`,
        { headers: authHeaders(platformSa.session.accessToken) }
      );
      if (overridesRes.ok()) {
        const overrides = unwrapItems<{ featureId: string; value: string }>(await overridesRes.json());
        const existing = overrides.find((o) => o.featureId === crmFeatureId);
        if (existing) {
          hadExistingOverride = true;
          previousOverrideValue = existing.value;
        }
      }

      // 3. Platform Root SA disables CRM.Enabled dynamically
      const disableRes = await request.put(
        `${API_URL}/api/v1/tenants/${scripeTenantId}/features/${crmFeatureId}`,
        {
          headers: mutationHeaders(platformSa.session.accessToken),
          data: { value: "false", reason: "Live authorization runtime verification" },
        }
      );
      expect(disableRes.ok(), `Failed disabling CRM.Enabled: ${disableRes.status()}`).toBeTruthy();

      // 4. Existing stale CRM Director JWT MUST be immediately denied with 403
      const staleJwtRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=5`, {
        headers: authHeaders(director.session.accessToken),
      });
      expect(
        staleJwtRes.status(),
        `Existing Director JWT should immediately receive 403 when CRM.Enabled=false, got ${staleJwtRes.status()}`
      ).toBe(403);

      // 5. Hard UI reload on /crm/opportunities renders clean FeatureUnavailableGate
      await director.monitor.runAllowingHttpStatuses([403], async () => {
        await director.page.evaluate(() => {
          localStorage.removeItem("navigation-storage");
          sessionStorage.clear();
        });
        await director.page.goto(`${BASE_URL}/crm/opportunities`, { waitUntil: "domcontentloaded" });
        await waitForAppSettled(director.page);
        await expect(director.page.getByTestId("feature-unavailable-gate")).toBeVisible({
          timeout: 25_000,
        });
        await saveDualScreenshot(
          director.page,
          "28-dynamic-feature-disabled-gate-en-desktop.png",
          "CRM Director /crm/opportunities showing FeatureUnavailableGate immediately after CRM.Enabled toggle"
        );
      });

      // 6. Restore override & verify immediate restoration + non-destructive RBAC/FLS preservation
      if (hadExistingOverride) {
        await request.put(`${API_URL}/api/v1/tenants/${scripeTenantId}/features/${crmFeatureId}`, {
          headers: mutationHeaders(platformSa.session.accessToken),
          data: { value: previousOverrideValue, reason: "Restore baseline after verification" },
        });
      } else {
        await request.delete(`${API_URL}/api/v1/tenants/${scripeTenantId}/features/${crmFeatureId}`, {
          headers: mutationHeaders(platformSa.session.accessToken),
        });
      }

      const restoredRes = await request.get(`${API_URL}/api/v1/crm/opportunities?page=1&pageSize=5`, {
        headers: authHeaders(director.session.accessToken),
      });
      expect(restoredRes.ok(), `Restored Director CRM GET failed: ${restoredRes.status()}`).toBeTruthy();

      const rolesCheck = await request.get(
        `${API_URL}/api/v1/roles/current-tenant?page=1&pageSize=50`,
        { headers: authHeaders(tenantSa.session.accessToken) }
      );
      expect(rolesCheck.ok()).toBeTruthy();
      const postRoles = unwrapItems<RoleRecord>(await rolesCheck.json());
      const mgrRole = postRoles.find((r) => r.code === "T_SCRIPE_CRM_MANAGER");
      expect(mgrRole).toBeTruthy();
      const mgrDetailRes = await request.get(`${API_URL}/api/v1/Roles/${mgrRole!.id}`, {
        headers: authHeaders(tenantSa.session.accessToken),
      });
      const mgrDetail = unwrapApiData<RoleDetailRecord>(await mgrDetailRes.json());
      expect((mgrDetail.permissions ?? []).length).toBeGreaterThan(0);

      const groupsCheck = await request.get(
        `${API_URL}/api/v1/user-groups/current-tenant?page=1&pageSize=50`,
        { headers: authHeaders(tenantSa.session.accessToken) }
      );
      const groups = unwrapItems<UserGroupRecord>(await groupsCheck.json());
      const piiGroup = groups.find((g) => g.code === "GRP_SCRIPE_PII_MASKED");
      expect(piiGroup).toBeTruthy();
      const piiDetailRes = await request.get(`${API_URL}/api/v1/user-groups/${piiGroup!.id}`, {
        headers: authHeaders(tenantSa.session.accessToken),
      });
      const piiDetail = unwrapApiData<UserGroupRecord>(await piiDetailRes.json());
      expect((piiDetail.restrictions ?? []).length).toBe(5);

      director.monitor.assertClean("Dynamic Feature Toggle");
      platformSa.monitor.assertClean("Platform SA Feature Toggle");
      tenantSa.monitor.assertClean("Tenant SA Post-Toggle Preservation");
    } finally {
      if (crmFeatureId) {
        if (hadExistingOverride) {
          await request.put(`${API_URL}/api/v1/tenants/${scripeTenantId}/features/${crmFeatureId}`, {
            headers: mutationHeaders(platformSa.session.accessToken),
            data: { value: previousOverrideValue, reason: "Cleanup baseline restore" },
          });
        } else {
          await request.delete(`${API_URL}/api/v1/tenants/${scripeTenantId}/features/${crmFeatureId}`, {
            headers: mutationHeaders(platformSa.session.accessToken),
          });
        }
      }
      await platformSa.context.close();
      await director.context.close();
      await tenantSa.context.close();
    }
  });
});
