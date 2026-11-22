import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { expect, test, type APIRequestContext, type Page, type Response } from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const API_URL = (process.env.PLAYWRIGHT_API_URL || "http://localhost:5035").replace(/\/$/, "");
const SCREENSHOT_DIR =
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/d98cfa0d-f912-4103-8985-da2d1fc72ab9/screenshots-workspace-routing";

const PLATFORM_SUPER_ADMIN_EMAIL = "admin-seif@scripe.org";
const AHLY_SUPER_ADMIN_EMAIL = "ahly.admin@scripe-dev.local";
const AHLY_CRM_SALES_REP_EMAIL = "ahly.crm_sales_rep@scripe-dev.local";

// Distinct unused AHLY seeded roles — never collide with admin-routing-hub-uat.spec.ts
const ROLE_CODE_RESTRICTED_CRM = "T_AHLY_CALL_CENTER";
const ROLE_CODE_RESTRICTED_HRMS = "T_AHLY_REHAB_SPEC";
const ROLE_CODE_PERSONAL_PREF = "T_AHLY_VIP_RELATIONS";
const ROLE_CODE_ENFORCED_POLICY = "T_AHLY_HEAD_LIFEGUARD";
const ROLE_CODE_SUPER_ADMIN = "T_AHLY_SA";

interface ApiLoginResult {
  accessToken: string;
  refreshToken?: string;
  tenantId?: string | null;
}

interface RoleSummaryDto {
  id: string;
  code: string;
  nameEn: string;
  nameAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  priority?: number;
  isActive?: boolean;
  defaultLandingTarget?: string | null;
  isLandingEnforced?: boolean;
}

interface RoleWorkspaceEntryPolicyDto {
  workspaceKey: string;
  target: string;
  isEnforced: boolean;
}

interface RoleSnapshot {
  id: string;
  code: string;
  roleDetail: Record<string, unknown>;
  permissionIds: string[];
  workspaceEntries: RoleWorkspaceEntryPolicyDto[];
  workspaceEntriesRowVersion: string | null;
}

interface AvailablePermissionDto {
  id: string;
  code: string;
  resource?: string;
  action?: string;
}

interface TenantListDto {
  id: string;
  code: string;
  name: string;
  parentTenantId?: string | null;
}

interface EditionListDto {
  id: string;
  name: string;
  code?: string;
}

function unwrapApiData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in (json as Record<string, unknown>)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

function extractPagedItems<T>(json: unknown): T[] {
  const unwrapped = unwrapApiData<unknown>(json);
  if (Array.isArray(unwrapped)) return unwrapped as T[];
  if (unwrapped && typeof unwrapped === "object" && "items" in (unwrapped as Record<string, unknown>)) {
    const items = (unwrapped as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  return [];
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

async function sendWithRateLimitRetry<
  T extends { status(): number; headers(): Record<string, string> },
>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fn();
    if (res.status() === 429 && attempt < 3) {
      const retrySec = Number(res.headers()["retry-after"] || "10");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retrySec + 1, 3), 30) * 1000));
      continue;
    }
    return res;
  }
  return fn();
}

async function loginViaApi(
  request: APIRequestContext,
  identifier: string,
  password: string,
  options: { isPlatformAdmin?: boolean; tenantId?: string } = {}
): Promise<ApiLoginResult> {
  const res = await sendWithRateLimitRetry(() =>
    request.post(`${API_URL}/api/v1/auth/admin/login`, {
      data: {
        identifier,
        password,
        isPlatformAdmin: options.isPlatformAdmin ?? false,
        ...(options.tenantId ? { tenantId: options.tenantId } : {}),
      },
    })
  );
  expect(res.ok(), `API login failed for ${identifier}: ${res.status()}`).toBeTruthy();
  return unwrapApiData<ApiLoginResult>(await res.json());
}

async function waitForAppSettled(page: Page, options: { allowRoot?: boolean } = {}) {
  const { allowRoot = false } = options;
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
        document.querySelector("main, #hub-content, #nexus-content, aside, #identifier")
      );
    },
    allowRoot,
    { timeout: 30_000 }
  );
}

async function resetBrowserSession(page: Page) {
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("scr_pref_lang", "en");
    document.cookie = "scr_lang=en; path=/; SameSite=Lax";
  });
}

async function loginViaUi(
  page: Page,
  identifier: string,
  password: string,
  loginUrl = "/login"
): Promise<{ accessToken: string }> {
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
  await waitForAppSettled(page, { allowRoot: true });
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
      const retrySec = Number(loginRes.headers()["retry-after"] || "10");
      await page.waitForTimeout(Math.min(Math.max(retrySec + 1, 3), 30) * 1000);
      continue;
    }

    expect(loginRes.ok(), `UI login failed for ${identifier}: ${loginRes.status()}`).toBeTruthy();
    const payload = unwrapApiData<{ accessToken?: string }>(await loginRes.json());
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    await waitForAppSettled(page);
    return { accessToken: payload?.accessToken ?? "" };
  }
  throw new Error(`UI login exhausted retries for ${identifier}`);
}

function attachRuntimeMonitor(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];
  const clientHttpErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (!txt.includes("403")) consoleErrors.push(txt);
    }
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("response", async (res: Response) => {
    const status = res.status();
    if (status >= 500 && res.url().includes("/api/")) {
      serverErrors.push(`${status} ${res.request().method()} ${res.url()} @ ${page.url()}`);
    } else if (status >= 400 && status !== 403) {
      const hdrs = res.request().headers();
      const authInfo = hdrs["authorization"] ? `Bearer(${hdrs["authorization"].length})` : "NO_AUTH";
      const tctx = hdrs["x-tenant-context"] ?? "none";
      const body = await res.text().catch(() => "");
      clientHttpErrors.push(
        `${new Date().toISOString()} ${status} ${res.request().method()} ${res.url()} @ ${page.url()} [${authInfo}, x-tenant=${tctx}] body=${body.slice(0, 180)}`
      );
    }
  });

  return {
    assertClean(label: string) {
      expect(pageErrors, `Uncaught pageerrors in ${label}`).toEqual([]);
      expect(serverErrors, `5xx API errors in ${label}`).toEqual([]);
      expect(clientHttpErrors, `Unexpected 4xx HTTP responses in ${label}`).toEqual([]);
      expect(consoleErrors, `Console errors in ${label}`).toEqual([]);
    },
  };
}

async function setTheme(page: Page, theme: "dark" | "light") {
  await page.evaluate((mode) => {
    localStorage.setItem("theme", mode);
    localStorage.setItem("scr-theme", mode);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, theme);
  await page.waitForTimeout(450);
}

async function setLanguageAndReload(page: Page, lang: "en" | "ar") {
  await page.evaluate((lng) => {
    localStorage.setItem("scr_lang", lng);
    localStorage.setItem("scr_pref_lang", lng);
    document.cookie = `scr_lang=${lng}; path=/; SameSite=Lax`;
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  }, lang);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForAppSettled(page);
  await page.waitForTimeout(450);
}

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow in ${label}: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth + 4);
}

async function fetchAhlyRoles(request: APIRequestContext, ahlyToken: string): Promise<RoleSummaryDto[]> {
  const res = await request.get(`${API_URL}/api/v1/roles?pageSize=200`, {
    headers: { Authorization: `Bearer ${ahlyToken}` },
  });
  expect(res.ok(), `Failed GET /roles: ${res.status()}`).toBeTruthy();
  return extractPagedItems<RoleSummaryDto>(await res.json());
}

async function fetchAhlyPermissions(
  request: APIRequestContext,
  ahlyToken: string
): Promise<Map<string, string>> {
  const res = await request.get(`${API_URL}/api/v1/roles/current-tenant/available-permissions`, {
    headers: { Authorization: `Bearer ${ahlyToken}` },
  });
  expect(res.ok(), `Failed GET available-permissions: ${res.status()}`).toBeTruthy();
  const list = extractPagedItems<AvailablePermissionDto>(await res.json());
  const map = new Map<string, string>();
  for (const item of list) {
    if (item.code && item.id) map.set(item.code, item.id);
  }
  return map;
}

async function snapshotRole(
  request: APIRequestContext,
  ahlyToken: string,
  roleSummary: RoleSummaryDto
): Promise<RoleSnapshot> {
  const [roleRes, permsRes, wsRes] = await Promise.all([
    request.get(`${API_URL}/api/v1/roles/${roleSummary.id}`, {
      headers: { Authorization: `Bearer ${ahlyToken}` },
    }),
    request.get(`${API_URL}/api/v1/roles/${roleSummary.id}/permissions`, {
      headers: { Authorization: `Bearer ${ahlyToken}` },
    }),
    request.get(`${API_URL}/api/v1/roles/${roleSummary.id}/workspace-entries`, {
      headers: { Authorization: `Bearer ${ahlyToken}` },
    }),
  ]);
  expect(roleRes.ok()).toBeTruthy();
  expect(permsRes.ok()).toBeTruthy();
  expect(wsRes.ok()).toBeTruthy();

  const roleDetail = unwrapApiData<Record<string, unknown>>(await roleRes.json());
  const permsList = extractPagedItems<{ id: string }>(await permsRes.json());
  const wsBody = unwrapApiData<{ policies?: RoleWorkspaceEntryPolicyDto[]; rowVersion?: string | null }>(
    await wsRes.json()
  );

  return {
    id: roleSummary.id,
    code: roleSummary.code,
    roleDetail,
    permissionIds: permsList.map((p) => p.id).filter(Boolean),
    workspaceEntries: (wsBody.policies || []).map((p) => ({
      workspaceKey: p.workspaceKey,
      target: p.target,
      isEnforced: p.isEnforced,
    })),
    workspaceEntriesRowVersion: wsBody.rowVersion ?? null,
  };
}

async function restoreRole(
  request: APIRequestContext,
  ahlyToken: string,
  snap: RoleSnapshot
): Promise<void> {
  const rd = snap.roleDetail;
  const updateBody = {
    nameEn: rd.nameEn,
    nameAr: rd.nameAr ?? null,
    descriptionEn: rd.descriptionEn ?? null,
    descriptionAr: rd.descriptionAr ?? null,
    priority: rd.priority ?? 100,
    isActive: rd.isActive ?? true,
    defaultLandingTarget: null,
    isLandingEnforced: false,
  };
  await sendWithRateLimitRetry(() =>
    request.put(`${API_URL}/api/v1/roles/${snap.id}`, {
      headers: mutationHeaders(ahlyToken),
      data: updateBody,
    })
  );

  await sendWithRateLimitRetry(() =>
    request.post(`${API_URL}/api/v1/roles/${snap.id}/permissions`, {
      headers: mutationHeaders(ahlyToken),
      data: {
        permissions: snap.permissionIds.map((permissionId) => ({
          permissionId,
          scopeOverride: null,
          restrictedFields: null,
        })),
      },
    })
  );

  // Read fresh rowVersion before resetting workspace entries
  const wsGet = await request.get(`${API_URL}/api/v1/roles/${snap.id}/workspace-entries`, {
    headers: { Authorization: `Bearer ${ahlyToken}` },
  });
  const wsData = wsGet.ok()
    ? unwrapApiData<{ rowVersion?: string | null }>(await wsGet.json())
    : { rowVersion: null };

  await sendWithRateLimitRetry(() =>
    request.put(`${API_URL}/api/v1/roles/${snap.id}/workspace-entries`, {
      headers: mutationHeaders(ahlyToken),
      data: {
        policies: snap.workspaceEntries,
        rowVersion: wsData.rowVersion ?? null,
      },
    })
  );
}

async function configureBorrowedRole(
  request: APIRequestContext,
  ahlyToken: string,
  roleSnap: RoleSnapshot,
  permissionIds: string[],
  policies: RoleWorkspaceEntryPolicyDto[] = []
) {
  const permRes = await sendWithRateLimitRetry(() =>
    request.post(`${API_URL}/api/v1/roles/${roleSnap.id}/permissions`, {
      headers: mutationHeaders(ahlyToken),
      data: {
        permissions: permissionIds.map((permissionId) => ({
          permissionId,
          scopeOverride: null,
          restrictedFields: null,
        })),
      },
    })
  );
  expect(
    permRes.ok(),
    `Failed setting perms on ${roleSnap.code}: ${permRes.status()} ${await permRes.text()}`
  ).toBeTruthy();

  const wsGet = await request.get(`${API_URL}/api/v1/roles/${roleSnap.id}/workspace-entries`, {
    headers: { Authorization: `Bearer ${ahlyToken}` },
  });
  const wsData = wsGet.ok()
    ? unwrapApiData<{ rowVersion?: string | null }>(await wsGet.json())
    : { rowVersion: null };

  const wsPut = await sendWithRateLimitRetry(() =>
    request.put(`${API_URL}/api/v1/roles/${roleSnap.id}/workspace-entries`, {
      headers: mutationHeaders(ahlyToken),
      data: { policies, rowVersion: wsData.rowVersion ?? null },
    })
  );
  expect(wsPut.ok(), `Failed resetting workspace-entries on ${roleSnap.code}: ${wsPut.status()}`).toBeTruthy();
}

async function createEphemeralAdmin(
  request: APIRequestContext,
  token: string,
  ahlyTenantId: string,
  password: string,
  tag: string,
  roleIds: string[],
  cleanupAdminIds: string[],
  extraHeaders: Record<string, string> = {}
): Promise<{ id: string; username: string; email: string }> {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const username = `uat.wsp.${tag}.${suffix}`.slice(0, 48);
  const email = `${username}@scripe-dev.local`;

  const res = await sendWithRateLimitRetry(() =>
    request.post(`${API_URL}/api/v1/admins`, {
      headers: mutationHeaders(token, extraHeaders),
      data: {
        username,
        password,
        firstName: "UAT",
        lastName: tag.toUpperCase(),
        email,
        tenantId: ahlyTenantId,
        roleIds,
        sendSetupEmail: false,
        mustChangePassword: false,
      },
    })
  );
  expect(res.ok(), `Failed creating admin ${username}: ${res.status()} ${await res.text()}`).toBeTruthy();
  const created = unwrapApiData<string | { id?: string; adminId?: string }>(await res.json());
  const id = typeof created === "string" ? created : (created?.id ?? created?.adminId ?? "");
  expect(id).toBeTruthy();
  cleanupAdminIds.push(id);
  return { id, username, email };
}

test.describe("Per-Workspace Start Pages, Sparse Role Policies, Lazy Picker & Impersonation Guards", () => {
  test.setTimeout(180_000);

  let adminPwd = "";
  let platformToken = "";
  let ahlyToken = "";
  let ahlyTenantId = "";
  let sportsEnterpriseEditionId = "";
  let permMap = new Map<string, string>();
  const rolesByCode = new Map<string, RoleSummaryDto>();
  const roleSnapshots = new Map<string, RoleSnapshot>();
  const createdAdminIds: string[] = [];
  const createdChildTenantIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    adminPwd = getDevAdminPassword();

    const platformAuth = await loginViaApi(request, PLATFORM_SUPER_ADMIN_EMAIL, adminPwd, {
      isPlatformAdmin: true,
    });
    platformToken = platformAuth.accessToken;

    const ahlyAuth = await loginViaApi(request, AHLY_SUPER_ADMIN_EMAIL, adminPwd, {
      isPlatformAdmin: false,
    });
    ahlyToken = ahlyAuth.accessToken;

    const tenantsRes = await request.get(`${API_URL}/api/v1/tenants?pageSize=50`, {
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    expect(tenantsRes.ok()).toBeTruthy();
    const ahlyTenant = extractPagedItems<TenantListDto>(await tenantsRes.json()).find(
      (t) => t.code === "AHLY"
    );
    expect(ahlyTenant, "AHLY tenant not found").toBeTruthy();
    ahlyTenantId = ahlyTenant!.id;

    const editionsRes = await request.get(`${API_URL}/api/v1/editions?pageSize=50`, {
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    expect(editionsRes.ok()).toBeTruthy();
    const entEdition = extractPagedItems<EditionListDto>(await editionsRes.json()).find(
      (e) => e.name === "sports-enterprise" || e.code === "sports-enterprise"
    );
    expect(entEdition, "sports-enterprise edition not found").toBeTruthy();
    sportsEnterpriseEditionId = entEdition!.id;

    permMap = await fetchAhlyPermissions(request, ahlyToken);
    for (const code of [
      "parties.view",
      "crm.overview.read",
      "crm.leads.read",
      "crm.accounts.read",
      "employment-records.view",
      "staff-members.view",
    ]) {
      expect(permMap.has(code), `Missing seeded AHLY permission: ${code}`).toBeTruthy();
    }

    const roles = await fetchAhlyRoles(request, ahlyToken);
    for (const r of roles) {
      rolesByCode.set(r.code, r);
    }

    for (const code of [
      ROLE_CODE_RESTRICTED_CRM,
      ROLE_CODE_RESTRICTED_HRMS,
      ROLE_CODE_PERSONAL_PREF,
      ROLE_CODE_ENFORCED_POLICY,
    ]) {
      const found = rolesByCode.get(code);
      expect(found, `Missing borrowed AHLY role: ${code}`).toBeTruthy();
      roleSnapshots.set(code, await snapshotRole(request, ahlyToken, found!));
    }
  });

  test.afterAll(async ({ request }) => {
    for (const snap of roleSnapshots.values()) {
      await restoreRole(request, ahlyToken, snap).catch(() => undefined);
    }
    for (const adminId of createdAdminIds.splice(0)) {
      await sendWithRateLimitRetry(() =>
        request.delete(`${API_URL}/api/v1/admins/${adminId}`, {
          headers: mutationHeaders(ahlyToken),
        })
      ).catch(() => undefined);
    }
    for (const tenantId of createdChildTenantIds.splice(0)) {
      await sendWithRateLimitRetry(() =>
        request.delete(`${API_URL}/api/v1/tenants/${tenantId}?cascadeChildren=true`, {
          headers: mutationHeaders(platformToken),
        })
      ).catch(() => undefined);
    }
  });

  test("Step B + Scenario 1: Single-pass navigation bootstrap, zero eager /landing-targets, and Single-Workspace auto-launch + Logo to /hub", async ({
    page,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    await resetBrowserSession(page);

    const bootstrapSizes: number[] = [];
    const landingTargetCalls: string[] = [];

    page.on("response", async (res) => {
      const url = res.url();
      if (url.includes("/api/v1/menus/navigation/landing-targets")) {
        landingTargetCalls.push(`${res.status()} ${url}`);
      } else if (url.endsWith("/api/v1/menus/navigation") || url.includes("/api/v1/menus/navigation?")) {
        if (res.status() === 200) {
          const text = await res.text().catch(() => "");
          bootstrapSizes.push(Buffer.byteLength(text, "utf8"));
        }
      }
    });

    await loginViaUi(page, AHLY_CRM_SALES_REP_EMAIL, adminPwd);

    // Scenario 1: Single-workspace admin (CRM only) skips /hub on login and lands directly on first authorized page
    await page.waitForURL((url) => url.pathname === "/crm" || url.pathname.startsWith("/crm/"), {
      timeout: 20_000,
    });
    expect(page.url()).not.toContain("/hub");
    expect(page.url()).not.toContain("/not-authorized");

    // Step B: Verify single-pass bootstrap executed without calling lazy /landing-targets
    expect(bootstrapSizes.length).toBeGreaterThanOrEqual(1);
    expect(landingTargetCalls).toEqual([]);
    console.log(
      `[Step B Metric] Single-workspace navigation bootstrap calls=${bootstrapSizes.length}, payloadBytes=${bootstrapSizes.join(",")}, eagerLandingTargetCalls=${landingTargetCalls.length}`
    );

    // Logo in Primary Rail still navigates to /hub Launchpad
    const logoBtn = page.getByRole("button", { name: /^Go to Home$/i }).first();
    await expect(logoBtn).toBeVisible({ timeout: 10_000 });
    await logoBtn.click();
    await page.waitForURL((url) => url.pathname === "/hub", { timeout: 15_000 });
    await expect(page.getByRole("region", { name: /Authorized workspaces/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^CRM/i })).toBeVisible();
    // Single-workspace admin /account/preferences hides Workspace Start Pages card
    await page.goto("/account/preferences", { waitUntil: "domcontentloaded" });
    await waitForAppSettled(page);
    await expect(page.getByTestId("account-preferences-scope-banner")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("workspace-start-pages-section")).toHaveCount(0);
    await page
      .getByText(/Startup & Post-Login Destination/i)
      .first()
      .evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.waitForTimeout(450);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "18-account-preferences-single-workspace-hidden.png"),
      fullPage: false,
    });

    monitor.assertClean("Scenario 1");
  });

  test("Scenario 2: Restricted CRM admin (crm.leads.read, NO crm.overview.read) enters CRM immediately on /crm/leads without 3s delay or /not-authorized", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const snap = roleSnapshots.get(ROLE_CODE_RESTRICTED_CRM)!;

    await configureBorrowedRole(
      request,
      ahlyToken,
      snap,
      [permMap.get("parties.view")!, permMap.get("crm.leads.read")!, permMap.get("crm.accounts.read")!],
      []
    );
    const admin = await createEphemeralAdmin(
      request,
      ahlyToken,
      ahlyTenantId,
      adminPwd,
      "sc2_crm",
      [snap.id],
      createdAdminIds
    );

    try {
      await resetBrowserSession(page);
      await loginViaUi(page, admin.email, adminPwd);

      // Multi-workspace (party-kernel + crm) -> lands on /hub
      await page.waitForURL((url) => url.pathname === "/hub", { timeout: 20_000 });
      const crmTile = page.getByRole("button", { name: /^CRM/i }).first();
      await expect(crmTile).toBeVisible({ timeout: 15_000 });

      const t0 = Date.now();
      await crmTile.click();
      await page.waitForURL((url) => url.pathname === "/crm/leads", { timeout: 10_000 });
      const clickToLeadsMs = Date.now() - t0;
      await waitForAppSettled(page);

      console.log(`[Scenario 2 Metric] Hub CRM click -> /crm/leads latency=${clickToLeadsMs}ms`);
      expect(page.url()).not.toContain("/not-authorized");
      expect(new URL(page.url()).pathname).toBe("/crm/leads");
      // Guard must NOT stall behind a 3-second full-page permission probe
      expect(clickToLeadsMs).toBeLessThan(3_000);

      // Navigate to /crm/accounts so Topbar Home appears, then verify Topbar Home returns/stays on /crm/leads
      await page.getByRole("link", { name: /^Accounts$/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/crm/accounts", { timeout: 15_000 });
      await waitForAppSettled(page);
      const homeBtn = page.getByRole("button", { name: /^CRM start page:\s*Leads/i }).first();
      await expect(homeBtn).toBeVisible({ timeout: 10_000 });
      await homeBtn.click();
      await page.waitForURL((url) => url.pathname === "/crm/leads", { timeout: 15_000 });
      expect(new URL(page.url()).pathname).toBe("/crm/leads");

      await setTheme(page, "dark");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "01-restricted-crm-leads-landing-dark.png"),
        fullPage: false,
      });

      monitor.assertClean("Scenario 2");
    } finally {
      await restoreRole(request, ahlyToken, snap).catch(() => undefined);
    }
  });

  test("Scenario 3: Restricted HRMS admin (employment-records.view, NO staff-members.view) enters /hrms/employment-records cleanly from /hub AND direct /hrms", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const snap = roleSnapshots.get(ROLE_CODE_RESTRICTED_HRMS)!;

    await configureBorrowedRole(
      request,
      ahlyToken,
      snap,
      [permMap.get("parties.view")!, permMap.get("employment-records.view")!],
      []
    );
    const admin = await createEphemeralAdmin(
      request,
      ahlyToken,
      ahlyTenantId,
      adminPwd,
      "sc3_hrms",
      [snap.id],
      createdAdminIds
    );

    try {
      await resetBrowserSession(page);
      await loginViaUi(page, admin.email, adminPwd);

      await page.waitForURL((url) => url.pathname === "/hub", { timeout: 20_000 });
      const hrmsTile = page.getByRole("button", { name: /^Staff Management/i }).first();
      await expect(hrmsTile).toBeVisible({ timeout: 15_000 });
      await hrmsTile.click();

      await page.waitForURL((url) => url.pathname === "/hrms/employment-records", { timeout: 15_000 });
      await waitForAppSettled(page);
      expect(page.url()).not.toContain("/not-authorized");

      // Direct /hrms root URL must resolve seamlessly to /hrms/employment-records with zero PBAC block
      await page.goto("/hrms", { waitUntil: "domcontentloaded" });
      await page.waitForURL((url) => url.pathname === "/hrms/employment-records", { timeout: 15_000 });
      await waitForAppSettled(page);
      expect(page.url()).not.toContain("/not-authorized");

      await setTheme(page, "dark");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "02-restricted-hrms-employment-records-dark.png"),
        fullPage: false,
      });

      monitor.assertClean("Scenario 3");
    } finally {
      await restoreRole(request, ahlyToken, snap).catch(() => undefined);
    }
  });

  test("Scenario 4: Personal per-workspace start page via RailHeader toggle, Hub persistence, Topbar Home tooltip & Reset to default", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const snap = roleSnapshots.get(ROLE_CODE_PERSONAL_PREF)!;

    await configureBorrowedRole(
      request,
      ahlyToken,
      snap,
      [
        permMap.get("parties.view")!,
        permMap.get("crm.overview.read")!,
        permMap.get("crm.leads.read")!,
        permMap.get("crm.accounts.read")!,
      ],
      []
    );
    const admin = await createEphemeralAdmin(
      request,
      ahlyToken,
      ahlyTenantId,
      adminPwd,
      "sc4_pers",
      [snap.id],
      createdAdminIds
    );

    try {
      await resetBrowserSession(page);
      await setTheme(page, "dark");
      await loginViaUi(page, admin.email, adminPwd);

      // Hub -> CRM defaults to Overview (/crm)
      await page.waitForURL((url) => url.pathname === "/hub", { timeout: 20_000 });
      await page.getByRole("button", { name: /^CRM/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/crm", { timeout: 15_000 });
      await waitForAppSettled(page);

      // Navigate via sidebar to /crm/leads
      await page.getByRole("link", { name: /^Leads$/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/crm/leads", { timeout: 15_000 });
      await waitForAppSettled(page);

      const setStartBtn = page.getByRole("button", { name: /^Set as CRM start page$/i }).first();
      await expect(setStartBtn).toBeVisible({ timeout: 10_000 });
      await setTheme(page, "dark");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "03-rail-header-set-start-page-dark.png"),
        fullPage: false,
      });

      // Set personal CRM start page to Leads
      const putPromise = page.waitForResponse(
        (res) =>
          res.url().includes("/api/v1/account/preferences/workspace-entries/crm") &&
          res.request().method() === "PUT",
        { timeout: 15_000 }
      );
      await setStartBtn.click();
      const putRes = await putPromise;
      expect(putRes.status()).toBe(200);

      await expect(page.getByText(/^Current start page$/i).first()).toBeVisible({ timeout: 10_000 });
      const resetBtn = page.getByRole("button", { name: /^Reset to default$/i }).first();
      await expect(resetBtn).toBeVisible({ timeout: 10_000 });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "04-rail-header-current-start-page-dark.png"),
        fullPage: false,
      });

      // Refresh & return to /hub -> CRM opens /crm/leads
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await page.getByRole("button", { name: /^Go to Home$/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/hub", { timeout: 15_000 });
      await page.getByRole("button", { name: /^CRM/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/crm/leads", { timeout: 15_000 });

      // Open Overview from sidebar (/crm still works), then click Topbar Home tooltip -> /crm/leads
      await page.getByRole("link", { name: /^Overview$/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/crm", { timeout: 15_000 });

      const topbarHome = page.getByRole("button", { name: /CRM start page:\s*Leads/i }).first();
      await expect(topbarHome).toBeVisible({ timeout: 10_000 });
      await topbarHome.click();
      await page.waitForURL((url) => url.pathname === "/crm/leads", { timeout: 15_000 });

      // Reset to default -> CRM restores /crm Overview
      await setTheme(page, "light");
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "22-rail-header-start-page-light.png"),
        fullPage: false,
      });
      await setTheme(page, "dark");

      const delPromise = page.waitForResponse(
        (res) =>
          res.url().includes("/api/v1/account/preferences/workspace-entries/crm") &&
          res.request().method() === "DELETE",
        { timeout: 15_000 }
      );
      await page.getByRole("button", { name: /^Reset to default$/i }).first().click();
      const delRes = await delPromise;
      expect([200, 204]).toContain(delRes.status());

      await expect(page.getByRole("button", { name: /^Set as CRM start page$/i }).first()).toBeVisible({
        timeout: 10_000,
      });
      await page.getByRole("button", { name: /^Go to Home$/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/hub", { timeout: 15_000 });
      await page.getByRole("button", { name: /^CRM/i }).first().click();
      await page.waitForURL((url) => url.pathname === "/crm", { timeout: 15_000 });

      monitor.assertClean("Scenario 4");
    } finally {
      await restoreRole(request, ahlyToken, snap).catch(() => undefined);
    }
  });

  test("Scenario 5: Role sparse policy editor (/roles/[id]), live mismatch warning, enforcement locks (403), Super Admin + child-tenant immunity & ?redirect=/crm precedence", async ({
    browser,
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const snap = roleSnapshots.get(ROLE_CODE_ENFORCED_POLICY)!;
    const saRole = rolesByCode.get(ROLE_CODE_SUPER_ADMIN)!;

    await configureBorrowedRole(
      request,
      ahlyToken,
      snap,
      [
        permMap.get("parties.view")!,
        permMap.get("crm.overview.read")!,
        permMap.get("crm.leads.read")!,
        permMap.get("crm.accounts.read")!,
      ],
      []
    );
    const nonSaAdmin = await createEphemeralAdmin(
      request,
      ahlyToken,
      ahlyTenantId,
      adminPwd,
      "sc5_user",
      [snap.id],
      createdAdminIds
    );
    const immuneSaAdmin = await createEphemeralAdmin(
      request,
      platformToken,
      ahlyTenantId,
      adminPwd,
      "sc5_sa",
      [saRole.id, snap.id],
      createdAdminIds,
      { "X-Tenant-Context": ahlyTenantId }
    );

    try {
      // 1. Login as AHLY Super Admin and open /roles/[id]
      await resetBrowserSession(page);
      await setTheme(page, "dark");
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);

      await page.goto(`/roles/${snap.id}`, { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      const card = page.getByTestId("role-workspace-start-pages-card");
      await expect(card).toBeVisible({ timeout: 20_000 });

      // Sparse rule creation: single "+ Add rule" (not "+ + Add rule")
      const addRuleBtn = page.getByTestId("role-workspace-add-rule-btn");
      await expect(addRuleBtn).toBeVisible();
      expect((await addRuleBtn.innerText()).trim()).not.toContain("+ +");
      await addRuleBtn.click();

      // Select workspace = crm (handle either native select or Radix combobox)
      const wsSelect = page.getByTestId("role-workspace-select-0");
      await expect(wsSelect).toBeVisible();
      const wsTag = await wsSelect.evaluate((el) => el.tagName);
      if (wsTag === "SELECT") {
        await wsSelect.selectOption("crm");
      } else {
        await wsSelect.click();
        await page.getByRole("option", { name: /^CRM$/i }).first().click();
      }

      // Select target = /crm/leads via GroupedCombobox
      const targetBtn = page.getByTestId("role-workspace-target-crm");
      await expect(targetBtn).toBeVisible({ timeout: 10_000 });
      await targetBtn.click();
      const searchInput = page.locator("[cmdk-input]").last();
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
      await searchInput.fill("Leads");
      const leadsOption = page.locator("[cmdk-item][data-value='menu:crm-leads']").first();
      await expect(leadsOption).toBeVisible({ timeout: 5_000 });
      await leadsOption.click();

      // Enable Enforcement switch
      const enforceToggle = page.getByTestId("role-workspace-enforce-crm");
      await expect(enforceToggle).toBeVisible();
      const isChecked = await enforceToggle.evaluate((el) => {
        if (el instanceof HTMLInputElement) return el.checked;
        return el.getAttribute("aria-checked") === "true" || el.getAttribute("data-state") === "checked";
      });
      if (!isChecked) {
        await enforceToggle.click();
      }

      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "05-role-sparse-policy-editor-dark.png"),
        fullPage: false,
      });

      // Live permission-mismatch warning when unchecking crm.leads.read
      const readLeadsCheckbox = page.getByRole("checkbox", { name: /Read Leads/i }).first();
      await readLeadsCheckbox.scrollIntoViewIfNeeded();
      await readLeadsCheckbox.click();
      const mismatchWarning = page.getByTestId("role-workspace-warning-crm");
      await expect(mismatchWarning).toBeVisible({ timeout: 5_000 });
      await card.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "06-role-live-permission-mismatch-warning-dark.png"),
        fullPage: false,
      });

      // Re-check crm.leads.read -> warning clears -> Save Changes
      await readLeadsCheckbox.scrollIntoViewIfNeeded();
      await readLeadsCheckbox.click();
      await expect(mismatchWarning).toBeHidden({ timeout: 5_000 });

      const saveBtn = page.getByRole("button", { name: /Save Changes/i }).first();
      const saveRoleResPromise = page.waitForResponse(
        (res) => res.url().includes(`/api/v1/roles/${snap.id}`) && res.request().method() === "PUT",
        { timeout: 15_000 }
      );
      const savePolicyResPromise = page.waitForResponse(
        (res) =>
          res.url().includes(`/api/v1/roles/${snap.id}/workspace-entries`) &&
          res.request().method() === "PUT",
        { timeout: 15_000 }
      );
      await saveBtn.click();
      expect((await saveRoleResPromise).ok()).toBeTruthy();
      expect((await savePolicyResPromise).ok()).toBeTruthy();

      // 2. Non-SuperAdmin enforced lock + API 403 + ?redirect=/crm override
      const userCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      try {
        const userPage = await userCtx.newPage();
        await resetBrowserSession(userPage);

        // Authorized deep link ?redirect=/crm takes Tier 1 precedence over enforced /crm/leads
        await loginViaUi(userPage, nonSaAdmin.email, adminPwd, "/login?redirect=%2Fcrm");
        await userPage.waitForURL((url) => url.pathname === "/crm", { timeout: 20_000 });

        // Normal CRM launch from /hub opens enforced /crm/leads with RailHeader locked
        await userPage.getByRole("button", { name: /^Go to Home$/i }).first().click();
        await userPage.waitForURL((url) => url.pathname === "/hub", { timeout: 15_000 });
        await userPage.getByRole("button", { name: /^CRM/i }).first().click();
        await userPage.waitForURL((url) => url.pathname === "/crm/leads", { timeout: 15_000 });

        const lockedRailBadge = userPage.getByLabel(/Start page locked — Enforced by/i).first();
        await expect(lockedRailBadge).toBeVisible({
          timeout: 10_000,
        });
        await expect(userPage.getByRole("button", { name: /^Set as CRM start page$/i })).toHaveCount(0);
        await setTheme(userPage, "dark");
        await lockedRailBadge.hover();
        await userPage.waitForTimeout(450);
        await userPage.screenshot({
          path: path.join(SCREENSHOT_DIR, "15-rail-header-locked-enforced-dark.png"),
          fullPage: false,
        });
        await setTheme(userPage, "light");
        await lockedRailBadge.hover();
        await userPage.waitForTimeout(450);
        await userPage.screenshot({
          path: path.join(SCREENSHOT_DIR, "16-rail-header-locked-enforced-light.png"),
          fullPage: false,
        });

        // Check /account/preferences lock for non-SA
        await userPage.goto("/account/preferences", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(userPage);
        await setTheme(userPage, "dark");
        await expect(userPage.getByTestId("workspace-start-pages-section")).toBeVisible({ timeout: 15_000 });
        await expect(userPage.getByTestId("workspace-origin-badge-crm")).toContainText(/Enforced by/i);
        await expect(userPage.getByTestId("workspace-start-picker-crm")).toBeDisabled();
        await userPage
          .getByTestId("workspace-start-pages-section")
          .evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
        await userPage.waitForTimeout(450);
        await userPage.screenshot({
          path: path.join(SCREENSHOT_DIR, "17-account-preferences-non-sa-enforced-dark.png"),
          fullPage: false,
        });

        // Direct API personal mutation returns HTTP 403
        const userApiAuth = await loginViaApi(request, nonSaAdmin.email, adminPwd, {
          isPlatformAdmin: false,
        });
        const lockedPut = await request.put(`${API_URL}/api/v1/account/preferences/workspace-entries/crm`, {
          headers: mutationHeaders(userApiAuth.accessToken),
          data: { target: "menu:crm-overview", rowVersion: null },
        });
        expect(lockedPut.status()).toBe(403);
      } finally {
        await userCtx.close();
      }

      // 3. Super Admin immunity (Tenant SA also assigned enforced role overrides policy freely)
      const saCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      try {
        const saPage = await saCtx.newPage();
        await resetBrowserSession(saPage);
        await loginViaUi(saPage, immuneSaAdmin.email, adminPwd);
        await saPage.goto("/crm/accounts", { waitUntil: "domcontentloaded" });
        await waitForAppSettled(saPage);

        // Not locked for SuperAdmin despite holding T_AHLY_HEAD_LIFEGUARD
        await expect(saPage.getByLabel(/Start page locked/i)).toHaveCount(0);
        const saSetBtn = saPage.getByRole("button", { name: /^Set as CRM start page$/i }).first();
        await expect(saSetBtn).toBeVisible({ timeout: 10_000 });
        const saPutPromise = saPage.waitForResponse(
          (res) =>
            res.url().includes("/api/v1/account/preferences/workspace-entries/crm") &&
            res.request().method() === "PUT"
        );
        await saSetBtn.click();
        expect((await saPutPromise).status()).toBe(200);
      } finally {
        await saCtx.close();
      }

      // 4. Child-tenant drill-down Super Admin immunity (create ephemeral child under AHLY & switch into it)
      const childSuffix = Date.now().toString(36).slice(-5);
      const childCode = `UATCH${childSuffix}`.toUpperCase();
      const createChildRes = await sendWithRateLimitRetry(() =>
        request.post(`${API_URL}/api/v1/tenants`, {
          headers: mutationHeaders(platformToken),
          data: {
            name: `UAT Child Club ${childSuffix}`,
            code: childCode,
            parentTenantId: ahlyTenantId,
            adminEmail: `uat.child.${childSuffix}@scripe-dev.local`,
            editionId: sportsEnterpriseEditionId,
            subscriptionType: "Monthly",
            currency: "USD",
            skipPayment: true,
          },
        })
      );
      expect(
        createChildRes.ok(),
        `Failed creating child tenant: ${createChildRes.status()} ${await createChildRes.text()}`
      ).toBeTruthy();
      const childData = unwrapApiData<{ tenantId: string }>(await createChildRes.json());
      createdChildTenantIds.push(childData.tenantId);

      // Re-login ahly.admin cleanly and drill down into child tenant via Topbar switcher
      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);
      const switcherTrigger = page.getByTestId("topbar-tenant-switcher-trigger");
      await expect(switcherTrigger).toBeVisible({ timeout: 15_000 });
      await switcherTrigger.click();
      await expect(page.getByTestId("tenant-switcher-dialog")).toBeVisible({ timeout: 10_000 });
      const childOption = page.getByTestId(`tenant-switch-option-${childData.tenantId}`);
      await expect(childOption).toBeVisible({ timeout: 10_000 });
      await childOption.click();
      await waitForAppSettled(page, { allowRoot: true });

      await page.goto("/account/preferences", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await expect(page.getByTestId("account-preferences-scope-banner")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId("account-scope-banner-context")).toContainText(
        new RegExp(`UAT Child Club ${childSuffix}`, "i")
      );
      await expect(page.getByTestId("scope-banner-superadmin-note")).toBeVisible();

      monitor.assertClean("Scenario 5");
    } finally {
      await restoreRole(request, ahlyToken, snap).catch(() => undefined);
    }
  });

  test("Scenario 6: Brand-new browser context lazy /landing-targets picker, searchable GroupedCombobox, Scope Banner & <bdi> isolation", async ({
    browser,
    request,
  }) => {
    const snap = roleSnapshots.get(ROLE_CODE_PERSONAL_PREF)!;
    const roleId = snap.id;

    // Brand-new browser context (no workspace visited beforehand)
    const freshCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    try {
      const page = await freshCtx.newPage();
      const monitor = attachRuntimeMonitor(page);

      const landingTargetCalls: Array<{ url: string; status: number; workspaces: string[] }> = [];
      page.on("response", async (res) => {
        if (res.url().includes("/api/v1/menus/navigation/landing-targets")) {
          const body = await res.json().catch(() => ({}));
          const payload = unwrapApiData<{ workspaces?: Array<{ workspaceKey?: string }> }>(body);
          landingTargetCalls.push({
            url: res.url(),
            status: res.status(),
            workspaces: (payload.workspaces || []).map((w) => w.workspaceKey || "").filter(Boolean),
          });
        }
      });

      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);

      // Navigate straight to /account/preferences without opening CRM or Venue first
      await page.goto("/account/preferences", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);

      await expect(page.getByTestId("account-preferences-scope-banner")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId("scope-banner-superadmin-note")).toBeVisible();

      // Verify <bdi> inside Scope Banner & Workspace Start Pages
      const bannerBdiCount = await page.getByTestId("account-scope-banner-context").locator("bdi").count();
      expect(bannerBdiCount).toBeGreaterThanOrEqual(1);

      await expect
        .poll(() => landingTargetCalls.length, { timeout: 15_000 })
        .toBeGreaterThanOrEqual(1);
      expect(landingTargetCalls[0].status).toBe(200);
      expect(landingTargetCalls[0].workspaces).toEqual(expect.arrayContaining(["crm", "venue", "hrms"]));

      // Light mode screenshot of Account Preferences Scope Banner + Workspace Start Pages
      await setTheme(page, "light");
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "07a-account-scope-banner-light.png"),
        fullPage: false,
      });
      await page
        .getByTestId("workspace-start-pages-section")
        .evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "07-account-preferences-scope-banner-light.png"),
        fullPage: false,
      });

      // Verify Administration resolves its real Overview page (no "Unavailable page" fallback)
      const adminRow = page.getByTestId("workspace-start-row-admin");
      await expect(adminRow).toBeVisible();
      await expect(adminRow).not.toContainText(/Unavailable page/i);
      await expect(page.getByTestId("workspace-start-picker-admin")).not.toContainText(/Unavailable page/i);

      // Open searchable GroupedCombobox for unhydrated CRM & search "Leads"
      await setTheme(page, "dark");
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "23-account-preferences-scope-and-pages-dark.png"),
        fullPage: false,
      });
      const crmPicker = page.getByTestId("workspace-start-picker-crm");
      await expect(crmPicker).toBeVisible({ timeout: 10_000 });
      await crmPicker.click();

      const searchInput = page.locator("[cmdk-input]").last();
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
      await searchInput.fill("Leads");
      const leadsOpt = page.getByRole("option", { name: /Leads/i }).first();
      await expect(leadsOpt).toBeVisible();
      expect(await leadsOpt.locator("bdi").count()).toBeGreaterThanOrEqual(1);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "08-grouped-combobox-search-dark.png"),
        fullPage: false,
      });
      await page.keyboard.press("Escape");

      // Also verify unhydrated Venue options exist
      const venuePicker = page.getByTestId("workspace-start-picker-venue");
      await expect(venuePicker).toBeVisible();
      await venuePicker.click();
      await expect(page.getByRole("option", { name: /Calendar/i }).first()).toBeVisible({
        timeout: 5_000,
      });
      await page.keyboard.press("Escape");

      // Also verify lazy /landing-targets on fresh /roles/[id]
      const countBeforeRole = landingTargetCalls.length;
      await page.goto(`/roles/${roleId}`, { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await expect(page.getByTestId("role-workspace-start-pages-card")).toBeVisible({ timeout: 15_000 });
      await expect
        .poll(() => landingTargetCalls.length, { timeout: 15_000 })
        .toBeGreaterThan(countBeforeRole);

      monitor.assertClean("Scenario 6");
    } finally {
      await freshCtx.close();
    }
  });

  test("Scenario 7: Impersonation read-only guard hides RailHeader toggle, locks /account/preferences & returns 403 on direct API PUT/DELETE", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const snap = roleSnapshots.get(ROLE_CODE_PERSONAL_PREF)!;

    await configureBorrowedRole(
      request,
      ahlyToken,
      snap,
      [
        permMap.get("parties.view")!,
        permMap.get("crm.overview.read")!,
        permMap.get("crm.leads.read")!,
        permMap.get("crm.accounts.read")!,
      ],
      []
    );
    const multiWsTarget = await createEphemeralAdmin(
      request,
      ahlyToken,
      ahlyTenantId,
      adminPwd,
      "sc7_imp",
      [snap.id],
      createdAdminIds
    );

    try {
      await resetBrowserSession(page);
      await setTheme(page, "dark");
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);

      await page.goto("/admins", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);

      const searchBox = page.locator("input[type='search'], input[placeholder*='Search']").first();
      if (await searchBox.isVisible().catch(() => false)) {
        await searchBox.fill(multiWsTarget.username);
        await page.waitForTimeout(450);
      }

      const row = page.locator("tbody tr", { hasText: multiWsTarget.username }).first();
      await expect(row).toBeVisible({ timeout: 15_000 });

      const impResPromise = page.waitForResponse(
        (res) =>
          res.url().includes("/api/v1/auth/admin/impersonate/") && res.request().method() === "POST",
        { timeout: 15_000 }
      );
      await row.getByRole("button", { name: /Actions|إجراءات/i }).first().click();
      await page.getByRole("menuitem", { name: /^Impersonate$/i }).first().click();

      const impRes = await impResPromise;
      expect(impRes.ok()).toBeTruthy();

      await page.waitForURL((url) => url.pathname.includes("/hub") || url.pathname.startsWith("/crm"), {
        timeout: 25_000,
      });
      await waitForAppSettled(page);

      // RailHeader start page toggle MUST be hidden while impersonating
      await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await expect(page.getByRole("button", { name: /^Set as CRM start page$/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Reset to default$/i })).toHaveCount(0);

      // /account/preferences mutations locked with alert visible (both StartupPreferences & WorkspaceStartPages)
      await page.goto("/account/preferences", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await expect(page.getByTestId("workspace-start-impersonation-alert")).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("workspace-start-picker-crm")).toBeDisabled();
      await page
        .getByTestId("workspace-start-pages-section")
        .evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(500);
      await expect(page.getByTestId("workspace-start-impersonation-alert")).toBeInViewport();

      // Verify TenantContextBanner + Account topbar stay pinned flush at viewport top with zero scroll gap
      const stickyGeometry = await page.evaluate(() => {
        const stickyChrome = document.querySelector('[data-account-sticky-chrome="true"]');
        const banner = stickyChrome?.querySelector('[role="status"]');
        const header = document.querySelector('header[data-account-topbar="true"]');
        return {
          scrollY: window.scrollY,
          hasChrome: Boolean(stickyChrome),
          hasBanner: Boolean(banner),
          hasHeader: Boolean(header),
          chromeTop: stickyChrome?.getBoundingClientRect().top ?? Number.NaN,
          bannerTop: banner?.getBoundingClientRect().top ?? Number.NaN,
          bannerBottom: banner?.getBoundingClientRect().bottom ?? Number.NaN,
          headerTop: header?.getBoundingClientRect().top ?? Number.NaN,
        };
      });
      expect(stickyGeometry.scrollY).toBeGreaterThan(0);
      expect(stickyGeometry.hasChrome).toBe(true);
      expect(stickyGeometry.hasBanner).toBe(true);
      expect(stickyGeometry.hasHeader).toBe(true);
      expect(Math.abs(stickyGeometry.chromeTop)).toBeLessThanOrEqual(1);
      expect(Math.abs(stickyGeometry.bannerTop)).toBeLessThanOrEqual(1);
      expect(Math.abs(stickyGeometry.headerTop - stickyGeometry.bannerBottom)).toBeLessThanOrEqual(2);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "09-impersonation-readonly-preferences-dark.png"),
        fullPage: false,
      });

      // Obtain impersonated token directly via API context to test 403 server-side guards cleanly
      const directImpRes = await sendWithRateLimitRetry(() =>
        request.post(`${API_URL}/api/v1/auth/admin/impersonate/${multiWsTarget.id}`, {
          headers: mutationHeaders(ahlyToken),
        })
      );
      expect(
        directImpRes.ok(),
        `Direct impersonate failed: ${directImpRes.status()} ${await directImpRes.text()}`
      ).toBeTruthy();
      const impTokenPayload = unwrapApiData<{ accessToken?: string }>(await directImpRes.json());
      const impAccessToken = impTokenPayload?.accessToken || "";
      expect(impAccessToken).toBeTruthy();

      // Direct API PUT & DELETE return HTTP 403 during impersonation
      const putForbidden = await request.put(
        `${API_URL}/api/v1/account/preferences/workspace-entries/crm`,
        {
          headers: mutationHeaders(impAccessToken),
          data: { target: "menu:crm-leads", rowVersion: null },
        }
      );
      expect(putForbidden.status()).toBe(403);

      const delForbidden = await request.delete(
        `${API_URL}/api/v1/account/preferences/workspace-entries/crm`,
        {
          headers: mutationHeaders(impAccessToken),
        }
      );
      expect(delForbidden.status()).toBe(403);

      monitor.assertClean("Scenario 7");
    } finally {
      await restoreRole(request, ahlyToken, snap).catch(() => undefined);
    }
  });

  test("Scenario 8: Themes (Dark/Light), EN LTR / AR RTL (240px sidebar width) & Mobile 390px drawer All Workspaces parity", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const snap = roleSnapshots.get(ROLE_CODE_PERSONAL_PREF)!;

    await configureBorrowedRole(
      request,
      ahlyToken,
      snap,
      [
        permMap.get("parties.view")!,
        permMap.get("crm.overview.read")!,
        permMap.get("crm.leads.read")!,
        permMap.get("crm.accounts.read")!,
      ],
      []
    );

    try {
      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);

      // Desktop 1440px AR RTL on /crm/leads -> verify 240px sidebar width without Arabic clipping
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await setLanguageAndReload(page, "ar");

      const sidebarWidth = await page.evaluate(() => {
        const asides = Array.from(document.querySelectorAll("aside, [data-secondary-rail]"));
        const widths = asides.map((el) => Math.round(el.getBoundingClientRect().width));
        return widths.length ? Math.max(...widths) : 0;
      });
      expect(sidebarWidth).toBeGreaterThanOrEqual(235);
      await assertNoHorizontalOverflow(page, "AR RTL /crm/leads 1440px");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "10-ar-rtl-sidebar-240px-railheader-dark.png"),
        fullPage: false,
      });

      // AR RTL Light on /account/preferences Scope Banner + Start Pages
      await page.goto("/account/preferences", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await setTheme(page, "light");
      await assertNoHorizontalOverflow(page, "AR RTL /account/preferences Light 1440px");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "11-ar-rtl-preferences-scope-banner-light.png"),
        fullPage: true,
      });

      // AR RTL Dark on /roles/[id] sparse rule editor
      await page.goto(`/roles/${snap.id}`, { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await expect(page.getByTestId("role-workspace-start-pages-card")).toBeVisible({ timeout: 15_000 });
      const addRuleBtn = page.getByTestId("role-workspace-add-rule-btn");
      await expect(addRuleBtn).toBeEnabled({ timeout: 15_000 });
      await addRuleBtn.click();
      await page.getByTestId("role-workspace-start-pages-card").scrollIntoViewIfNeeded();
      await assertNoHorizontalOverflow(page, "AR RTL /roles/[id] Dark 1440px");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "12-ar-rtl-roles-sparse-editor-dark.png"),
        fullPage: false,
      });

      // Mobile 390px EN -> drawer button reads "All Workspaces"
      await setLanguageAndReload(page, "en");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      const enDrawerBtn = page.getByRole("button", { name: /^Toggle panel$/i }).first();
      await expect(enDrawerBtn).toBeVisible({ timeout: 10_000 });
      await enDrawerBtn.click();
      const allWorkspacesEn = page.getByRole("button", { name: /^All Workspaces$/i }).first();
      await expect(allWorkspacesEn).toBeVisible({ timeout: 10_000 });
      await page.waitForTimeout(450);
      await assertNoHorizontalOverflow(page, "Mobile 390px EN drawer");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "13-mobile-390-drawer-all-workspaces-en.png"),
        fullPage: false,
      });

      // Mobile 390px AR RTL -> drawer button reads "جميع مساحات العمل"
      await page.keyboard.press("Escape");
      await setLanguageAndReload(page, "ar");
      const arDrawerBtn = page.getByRole("button", { name: /طيّ اللوحة|تبديل اللوحة/i }).first();
      await expect(arDrawerBtn).toBeVisible({ timeout: 10_000 });
      await arDrawerBtn.click();
      const allWorkspacesAr = page.getByRole("button", { name: /^جميع مساحات العمل$/i }).first();
      await expect(allWorkspacesAr).toBeVisible({ timeout: 10_000 });
      await page.waitForTimeout(450);
      await assertNoHorizontalOverflow(page, "Mobile 390px AR RTL drawer");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "14-mobile-390-drawer-all-workspaces-ar-rtl.png"),
        fullPage: false,
      });

      // /hub Launchpad Dark EN, Light EN & Light AR RTL — verify zero "Page Shortcuts" clutter
      await page.setViewportSize({ width: 1440, height: 900 });
      await setLanguageAndReload(page, "en");
      await page.goto("/hub", { waitUntil: "domcontentloaded" });
      await waitForAppSettled(page);
      await expect(page).toHaveURL(/\/hub/, { timeout: 10_000 });
      await expect(page.getByRole("region", { name: /Authorized workspaces|مساحات العمل المصرّ?ح بها/i })).toBeVisible({
        timeout: 10_000,
      });
      await setTheme(page, "dark");
      await page.waitForTimeout(450);
      expect(await page.locator("body").innerText()).not.toMatch(/Page Shortcuts/i);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "19-hub-launchpad-dark-en.png"),
        fullPage: false,
      });
      await setTheme(page, "light");
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "21-hub-launchpad-light-en.png"),
        fullPage: false,
      });
      await setLanguageAndReload(page, "ar");
      await expect(page).toHaveURL(/\/hub/, { timeout: 10_000 });
      await expect(page.getByRole("region", { name: /Authorized workspaces|مساحات العمل المصرّ?ح بها/i })).toBeVisible({
        timeout: 10_000,
      });
      await setTheme(page, "light");
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "20-hub-launchpad-light-ar-rtl.png"),
        fullPage: false,
      });

      monitor.assertClean("Scenario 8");
    } finally {
      await restoreRole(request, ahlyToken, snap).catch(() => undefined);
    }
  });
});
