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
 * Task 12 — SCRIPE Admin Post-Login Routing, Personal Operational Hub (/hub),
 * Role Landing Policy, Context Switching Isolation, Impersonation Guards &
 * WorkManagement Security Live Unmocked Playwright E2E Suite.
 *
 * Strictly executes against live ASP.NET Core (:5035) and Next.js (:3000) with
 * zero mocked functional APIs (Playwright route interception is used ONLY in the
 * dedicated <NavigationErrorRecovery> 500/429 resilience test).
 */

const API_URL = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5035";
const SCREENSHOT_DIR = path.resolve(
  "d:/01_PROJECTS/SCRIPE/SCRIPE-CRM/EXECUTION_REPORTS/ADMIN-ROUTING-HUB/screenshots"
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PLATFORM_SUPER_ADMIN_EMAIL = "admin-seif@scripe.org";
const AHLY_SUPER_ADMIN_EMAIL = "ahly.admin@scripe-dev.local";
const AHLY_MULTI_WORKSPACE_EMAIL = "ahly.front_desk@scripe-dev.local";
const AHLY_CRM_SALES_REP_EMAIL = "ahly.crm_sales_rep@scripe-dev.local";
const COMMUNITY_ADMIN_EMAIL = "community.admin@scripe-dev.local";

interface RuntimeErrorMonitor {
  consoleErrors: string[];
  pageErrors: string[];
  serverErrors: string[];
  clientHttpErrors: string[];
  allowNextHttpStatus: (predicate: (url: string, status: number) => boolean) => void;
  clearAllowedHttpStatus: () => void;
  allowNextConsoleError: (pattern: RegExp | null) => void;
  reset: () => void;
  assertClean: (contextLabel: string) => void;
  detach: () => void;
}

function attachRuntimeMonitor(page: Page): RuntimeErrorMonitor {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];
  const clientHttpErrors: string[] = [];
  let allowedHttpPredicate: ((url: string, status: number) => boolean) | null = null;
  let allowedConsolePattern: RegExp | null = null;

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (allowedConsolePattern && allowedConsolePattern.test(text)) return;
    consoleErrors.push(text);
  };
  const onPageError = (err: Error) => {
    pageErrors.push(`${err.name}: ${err.message}`);
  };
  const onResponse = (res: Response) => {
    const status = res.status();
    const url = res.url();
    if (status >= 500 && !url.includes("favicon")) {
      if (allowedHttpPredicate && allowedHttpPredicate(url, status)) return;
      serverErrors.push(`${status} ${res.request().method()} ${url}`);
    } else if (status >= 400 && status < 500 && url.includes("/api/")) {
      if (allowedHttpPredicate && allowedHttpPredicate(url, status)) return;
      clientHttpErrors.push(`${status} ${res.request().method()} ${url}`);
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  return {
    consoleErrors,
    pageErrors,
    serverErrors,
    clientHttpErrors,
    allowNextHttpStatus(predicate) {
      allowedHttpPredicate = predicate;
    },
    clearAllowedHttpStatus() {
      allowedHttpPredicate = null;
    },
    allowNextConsoleError(pattern) {
      allowedConsolePattern = pattern;
    },
    reset() {
      consoleErrors.length = 0;
      pageErrors.length = 0;
      serverErrors.length = 0;
      clientHttpErrors.length = 0;
    },
    assertClean(contextLabel: string) {
      if (clientHttpErrors.length > 0) {
        console.warn(`[RuntimeMonitor:${contextLabel}] 4xx API responses:`, JSON.stringify(clientHttpErrors));
      }
      expect(consoleErrors, `Console errors in ${contextLabel}`).toEqual([]);
      expect(pageErrors, `Uncaught pageerrors in ${contextLabel}`).toEqual([]);
      expect(serverErrors, `Unexpected HTTP 5xx in ${contextLabel}`).toEqual([]);
    },
    detach() {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
      page.off("response", onResponse);
    },
  };
}

async function safeScreenshot(page: Page, filename: string, fullPage = true) {
  const targetPath = path.join(SCREENSHOT_DIR, filename);
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
      return;
    } catch (err) {
      if (attempt === 3) throw err;
      await page.waitForTimeout(300);
    }
  }
}

async function waitForAppSettled(page: Page, options: { allowRoot?: boolean } = {}) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/i")
    .waitFor({ state: "detached", timeout: 30_000 })
    .catch(() => {});
  await page
    .locator("text=/^LAUNCHING$/i")
    .waitFor({ state: "detached", timeout: 15_000 })
    .catch(() => {});
  await page
    .locator("text=/^Loading\\.\\.\\.$/i")
    .waitFor({ state: "detached", timeout: 10_000 })
    .catch(() => {});
  if (!options.allowRoot) {
    await page
      .waitForURL((url) => url.pathname !== "/" && !url.pathname.includes("/login"), {
        timeout: 25_000,
      })
      .catch(() => {});
  }
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
    localStorage.setItem("scr_pref_theme", mode);
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
  });
  await page.evaluate(() => {
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("scr_pref_lang", "en");
    document.cookie = "scr_lang=en; path=/; SameSite=Lax";
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

async function sendWithRateLimitRetry<
  T extends { status(): number; headers(): Record<string, string> },
>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fn();
    if (res.status() === 429 && attempt < 3) {
      const retrySec = Number(res.headers()["retry-after"] || "15");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retrySec + 2, 5), 65) * 1000));
      continue;
    }
    return res;
  }
  return fn();
}

interface ApiLoginResult {
  accessToken: string;
  refreshToken?: string;
  tenantId?: string | null;
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
  return (await res.json()) as ApiLoginResult;
}

async function loginViaUi(
  page: Page,
  identifier: string,
  password: string,
  loginUrl = "/login"
): Promise<{ accessToken: string }> {
  await page.goto(loginUrl);
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
      const retrySec = Number(loginRes.headers()["retry-after"] || "15");
      await page.waitForTimeout(Math.min(Math.max(retrySec + 2, 5), 65) * 1000);
      continue;
    }

    expect(loginRes.ok(), `UI login failed for ${identifier}: ${loginRes.status()}`).toBeTruthy();
    const payload = (await loginRes.json()) as {
      accessToken?: string;
      data?: { accessToken?: string };
    };
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    await waitForAppSettled(page);
    return {
      accessToken: payload.accessToken ?? payload.data?.accessToken ?? "",
    };
  }
  throw new Error(`UI login exhausted retries for ${identifier}`);
}

async function assertSingleMainLandmark(page: Page, label: string) {
  const mains = page.locator("main");
  await expect(mains, `Expected single <main> landmark on ${label}`).toHaveCount(1);
  await expect(mains.first(), `Expected <main id="nexus-content"> on ${label}`).toHaveAttribute(
    "id",
    "nexus-content"
  );
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

async function openRowActionInCrudTable(page: Page, rowMatcher: string | RegExp, actionLabel: string | RegExp) {
  const row = page.locator("tbody tr", { hasText: rowMatcher }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  const actionsBtn = row.getByRole("button", { name: /Actions|إجراءات/i }).first();
  await actionsBtn.click();
  const menuItem = page.getByRole("menuitem", { name: actionLabel }).first();
  await expect(menuItem).toBeVisible({ timeout: 5_000 });
  await menuItem.click();
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

test.describe("Task 12 — Admin Routing, Personal Hub (/hub), Landing Policy & Guards Live UAT", () => {
  // Run sequentially via --workers=1 without mode:"serial" so real app bug failures do not skip remaining UAT scenarios.
  test.setTimeout(180_000);

  let adminPwd = "";
  let platformToken = "";
  let ahlyToken = "";
  let ahlyTenantId = "";
  let ahlyTenantName = "";
  let ahlyContextKey = "";
  let communityTenantId = "";

  // Ephemeral test entities created under AHLY and snapshots of borrowed roles restored in afterAll
  const roleRestoreSnapshots: RoleSnapshot[] = [];
  const ephemeralAdminIds: string[] = [];
  const ephemeralWorkItemIds: string[] = [];
  const runSuffix = Date.now().toString(36).slice(-6);

  test.beforeAll(async ({ request }) => {
    adminPwd = getDevAdminPassword();

    const platformAuth = await loginViaApi(request, PLATFORM_SUPER_ADMIN_EMAIL, adminPwd, {
      isPlatformAdmin: true,
    });
    platformToken = platformAuth.accessToken;

    const ahlyAuth = await loginViaApi(request, AHLY_SUPER_ADMIN_EMAIL, adminPwd);
    ahlyToken = ahlyAuth.accessToken;

    const tenantsRes = await request.get(`${API_URL}/api/v1/tenants?page=1&pageSize=100`, {
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    expect(tenantsRes.ok()).toBeTruthy();
    const tenants = extractPagedItems<{ id: string; code: string; name: string }>(
      await tenantsRes.json()
    );
    const ahlyTenant = tenants.find((t) => t.code === "AHLY");
    ahlyTenantId = ahlyTenant?.id ?? "";
    ahlyTenantName = ahlyTenant?.name ?? "";
    communityTenantId = tenants.find((t) => t.code === "COMMUNITY")?.id ?? "";
    expect(ahlyTenantId, "AHLY tenant ID must resolve").toBeTruthy();
    expect(ahlyTenantName, "AHLY tenant name must resolve").toBeTruthy();
    expect(communityTenantId, "COMMUNITY tenant ID must resolve").toBeTruthy();

    const ahlyPrefRes = await request.get(`${API_URL}/api/v1/account/preferences`, {
      headers: { Authorization: `Bearer ${ahlyToken}` },
    });
    expect(ahlyPrefRes.ok()).toBeTruthy();
    ahlyContextKey =
      unwrapApiData<{ activeContextKey?: string | null }>(await ahlyPrefRes.json()).activeContextKey ?? "";
    expect(ahlyContextKey, "AHLY activeContextKey GUID must resolve").toBeTruthy();
  });

  test.afterAll(async ({ request }) => {
    if (!ahlyToken) return;

    // Clean up any WorkItems created during the test
    for (const workItemId of ephemeralWorkItemIds) {
      await sendWithRateLimitRetry(() =>
        request.delete(`${API_URL}/api/v1/work-items/${workItemId}`, {
          headers: mutationHeaders(ahlyToken),
        })
      ).catch(() => {});
    }

    // Clean up ephemeral admins first
    for (const adminId of ephemeralAdminIds) {
      await sendWithRateLimitRetry(() =>
        request.delete(`${API_URL}/api/v1/admins/${adminId}`, {
          headers: mutationHeaders(ahlyToken),
        })
      ).catch(() => {});
    }

    // Restore any snapshotted seeded roles
    for (const snap of roleRestoreSnapshots) {
      await restoreRole(request, snap);
    }

    // Ensure platform SA and AHLY SA startup preferences are reset cleanly
    if (platformToken) {
      const prefRes = await request.get(`${API_URL}/api/v1/account/preferences`, {
        headers: { Authorization: `Bearer ${platformToken}` },
      });
      if (prefRes.ok()) {
        const pref = unwrapApiData<{ rowVersion?: string | null }>(await prefRes.json());
        await sendWithRateLimitRetry(() =>
          request.put(`${API_URL}/api/v1/account/preferences`, {
            headers: mutationHeaders(platformToken),
            data: { clearStartupTarget: true, startupTarget: null, rowVersion: pref.rowVersion ?? null },
          })
        ).catch(() => {});
        await sendWithRateLimitRetry(() =>
          request.put(`${API_URL}/api/v1/account/preferences`, {
            headers: mutationHeaders(platformToken, { "X-Tenant-Context": ahlyTenantId }),
            data: { clearStartupTarget: true, startupTarget: null, rowVersion: pref.rowVersion ?? null },
          })
        ).catch(() => {});
      }
    }
  });

  interface RoleSnapshot {
    roleId: string;
    code: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string | null;
    descriptionAr: string | null;
    priority: number;
    defaultLandingTarget: string | null;
    isLandingEnforced: boolean;
    permissions: Array<{
      permissionId: string;
      scopeOverride: string;
      restrictedFields: string[];
    }>;
  }

  async function findRoleIdByCode(request: APIRequestContext, roleCode: string): Promise<string> {
    const rolesRes = await request.get(`${API_URL}/api/v1/roles?page=1&pageSize=100`, {
      headers: { Authorization: `Bearer ${ahlyToken}` },
    });
    expect(rolesRes.ok(), `GET /roles failed: ${rolesRes.status()}`).toBeTruthy();
    const roles = extractPagedItems<{ id: string; code: string }>(await rolesRes.json());
    const found = roles.find((r) => r.code === roleCode);
    expect(found, `Seeded role ${roleCode} not found in AHLY`).toBeTruthy();
    return found!.id;
  }

  async function snapshotRole(request: APIRequestContext, roleId: string): Promise<RoleSnapshot> {
    const [detailRes, permsRes] = await Promise.all([
      request.get(`${API_URL}/api/v1/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${ahlyToken}` },
      }),
      request.get(`${API_URL}/api/v1/roles/${roleId}/permissions`, {
        headers: { Authorization: `Bearer ${ahlyToken}` },
      }),
    ]);
    expect(detailRes.ok(), `GET /roles/${roleId} failed: ${detailRes.status()}`).toBeTruthy();
    expect(permsRes.ok(), `GET /roles/${roleId}/permissions failed: ${permsRes.status()}`).toBeTruthy();

    const detail = unwrapApiData<{
      id: string;
      code: string;
      nameEn: string;
      nameAr: string;
      descriptionEn?: string | null;
      descriptionAr?: string | null;
      priority: number;
      defaultLandingTarget?: string | null;
      isLandingEnforced?: boolean;
    }>(await detailRes.json());

    const perms = unwrapApiData<
      Array<{ permissionId: string; scope?: string | null; restrictedFields?: string[] }>
    >(await permsRes.json());

    return {
      roleId,
      code: detail.code,
      nameEn: detail.nameEn,
      nameAr: detail.nameAr,
      descriptionEn: detail.descriptionEn ?? null,
      descriptionAr: detail.descriptionAr ?? null,
      priority: detail.priority,
      defaultLandingTarget: detail.defaultLandingTarget ?? null,
      isLandingEnforced: Boolean(detail.isLandingEnforced),
      permissions: (Array.isArray(perms) ? perms : []).map((p) => ({
        permissionId: p.permissionId,
        scopeOverride: p.scope || "own_tenant",
        restrictedFields: p.restrictedFields ?? [],
      })),
    };
  }

  async function restoreRole(request: APIRequestContext, snap: RoleSnapshot): Promise<void> {
    const freshRes = await request
      .get(`${API_URL}/api/v1/roles/${snap.roleId}`, {
        headers: { Authorization: `Bearer ${ahlyToken}` },
      })
      .catch(() => null);
    const fresh =
      freshRes && freshRes.ok()
        ? unwrapApiData<{ rowVersion?: string | null }>(await freshRes.json())
        : null;

    await sendWithRateLimitRetry(() =>
      request.put(`${API_URL}/api/v1/roles/${snap.roleId}`, {
        headers: mutationHeaders(ahlyToken),
        data: {
          nameEn: snap.nameEn,
          nameAr: snap.nameAr,
          descriptionEn: snap.descriptionEn,
          descriptionAr: snap.descriptionAr,
          priority: snap.priority,
          defaultLandingTarget: snap.defaultLandingTarget,
          isLandingEnforced: snap.isLandingEnforced,
          rowVersion: fresh?.rowVersion ?? null,
        },
      })
    ).catch(() => {});

    await sendWithRateLimitRetry(() =>
      request.post(`${API_URL}/api/v1/roles/${snap.roleId}/permissions`, {
        headers: mutationHeaders(ahlyToken),
        data: { permissions: snap.permissions },
      })
    ).catch(() => {});
  }

  async function setRolePermissionsBySelector(
    request: APIRequestContext,
    roleId: string,
    permissionSelector: (p: { id: string; resource: string; action: string }) => {
      match: boolean;
      scopeOverride?: string | null;
    }
  ): Promise<void> {
    const permsRes = await request.get(`${API_URL}/api/v1/permissions`, {
      headers: { Authorization: `Bearer ${ahlyToken}` },
    });
    expect(permsRes.ok()).toBeTruthy();
    const allPerms = extractPagedItems<{ id: string; resource: string; action: string }>(
      await permsRes.json()
    );

    const selected = allPerms
      .map((p) => {
        const decision = permissionSelector(p);
        return decision.match
          ? {
              permissionId: p.id,
              scopeOverride: decision.scopeOverride ?? "own_tenant",
              restrictedFields: [] as string[],
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    expect(selected.length, `No permissions matched selector for role ${roleId}`).toBeGreaterThan(0);

    const assignRes = await sendWithRateLimitRetry(() =>
      request.post(`${API_URL}/api/v1/roles/${roleId}/permissions`, {
        headers: mutationHeaders(ahlyToken),
        data: { permissions: selected },
      })
    );
    expect(assignRes.ok(), `AssignPermissions failed: ${assignRes.status()}`).toBeTruthy();
  }

  async function createTestAdmin(
    request: APIRequestContext,
    opts: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      roleIds: string[];
    }
  ): Promise<string> {
    const createRes = await sendWithRateLimitRetry(() =>
      request.post(`${API_URL}/api/v1/admins/current-tenant`, {
        headers: mutationHeaders(ahlyToken),
        data: {
          username: opts.username,
          password: adminPwd,
          firstName: opts.firstName,
          lastName: opts.lastName,
          phoneNumber: `+2010${Math.floor(10000000 + Math.random() * 89999999)}`,
          email: opts.email,
          notes: "Ephemeral Task 12 UAT admin",
          roleIds: opts.roleIds,
          userGroupIds: [],
          sendSetupEmail: false,
          mustChangePassword: false,
        },
      })
    );
    expect(createRes.ok(), `CreateAdmin failed for ${opts.email}: ${createRes.status()}`).toBeTruthy();
    const created = unwrapApiData<{ id: string }>(await createRes.json());
    ephemeralAdminIds.push(created.id);
    return created.id;
  }

  // ── Scenario 1 & 2: Platform Super Admin & Tenant Super Admin ──────────────────────
  test("01 & 02: Platform Super Admin and Tenant Super Admin land on /overview, logo navigates to /hub, single <main id='nexus-content'>", async ({
    page,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    try {
      // 1. Platform Super Admin
      await resetBrowserSession(page);
      await loginViaUi(page, PLATFORM_SUPER_ADMIN_EMAIL, adminPwd);

      await expect(page).toHaveURL(/\/overview(?:\?.*)?$/);
      await assertSingleMainLandmark(page, "Platform SA /overview");
      await setTheme(page, "dark");
      await assertNoHorizontalOverflow(page, "Platform SA /overview");
      await safeScreenshot(page, "01-platform-super-admin-overview.png");

      // Logo click navigates to /hub
      const logoBtn = page.getByRole("button", { name: "Go to Home" }).first();
      await expect(logoBtn).toBeVisible({ timeout: 10_000 });
      await logoBtn.click();
      await page.waitForURL(/\/hub(?:\?.*)?$/, { timeout: 15_000 });
      await waitForAppSettled(page);
      await assertSingleMainLandmark(page, "Platform SA /hub");
      monitor.assertClean("Scenario 1 Platform Super Admin");

      // 2. Tenant Super Admin
      monitor.reset();
      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);

      await expect(page).toHaveURL(/\/overview(?:\?.*)?$/);
      await assertSingleMainLandmark(page, "Tenant SA /overview");

      // Navigate to /hub via logo click and verify single <main id="nexus-content">
      const tenantLogoBtn = page.getByRole("button", { name: "Go to Home" }).first();
      await expect(tenantLogoBtn).toBeVisible({ timeout: 10_000 });
      await tenantLogoBtn.click();
      await page.waitForURL(/\/hub(?:\?.*)?$/, { timeout: 15_000 });
      await waitForAppSettled(page);
      await assertSingleMainLandmark(page, "Tenant SA /hub");
      monitor.assertClean("Scenario 2 Tenant Super Admin");
    } finally {
      monitor.detach();
    }
  });

  // ── Scenario 3: Single-Workspace Admin auto-launches straight to sole unlocked workspace ──
  test("03: Single-workspace Admin auto-launches directly to sole unlocked workspace without intermediate /hub", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const visitedUrls: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        visitedUrls.push(new URL(frame.url()).pathname);
      }
    });

    try {
      // Check seeded AHLY CRM Sales Rep navigation payload first
      const repAuth = await loginViaApi(request, AHLY_CRM_SALES_REP_EMAIL, adminPwd);
      const navRes = await request.get(`${API_URL}/api/v1/menus/navigation`, {
        headers: { Authorization: `Bearer ${repAuth.accessToken}` },
      });
      expect(navRes.ok()).toBeTruthy();
      const navData = unwrapApiData<{
        workspaceGroups: Array<{ workspaceKey: string; isLocked: boolean }>;
        landing?: { route: string; targetKind: string; sourceReason: string };
      }>(await navRes.json());
      const unlockedWorkspaces = navData.workspaceGroups.filter((w) => !w.isLocked);
      expect(unlockedWorkspaces.length).toBe(1);
      expect(unlockedWorkspaces[0].workspaceKey).toBe("crm");

      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_CRM_SALES_REP_EMAIL, adminPwd);

      await expect(page).toHaveURL(/\/crm(?:\/.*)?$/);
      expect(visitedUrls.some((p) => p === "/hub")).toBe(false);
      await expect(page.locator("main#nexus-content")).toHaveCount(1);
      monitor.assertClean("Scenario 3 Single-Workspace Admin");
    } finally {
      monitor.detach();
    }
  });

  // ── Scenario 4 & 12: Multi-workspace Admin Hub, Single-Pass Bootstrap, Pins, Recents, Feeds, Search <bdi>, Themes, RTL & Mobile ──
  test("04 & 12: Multi-workspace Admin lands on /hub, single bootstrap call, 0 audit/hub-summary, pin persistence, recents, feeds, Search <bdi>, Light/Dark/AR-RTL/Mobile-390", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const navBootstrapCalls: string[] = [];
    const routesEndpointCalls: string[] = [];
    const hubSummaryCalls: string[] = [];

    page.on("request", (req) => {
      const url = req.url().toLowerCase();
      if (url.includes("/api/v1/audit/hub-summary")) {
        hubSummaryCalls.push(url);
      }
      if (url.includes("/api/v1/menus/navigation/routes")) {
        routesEndpointCalls.push(url);
      } else if (url.includes("/api/v1/menus/navigation") && !url.includes("workspace=") && !url.includes("/workspaces")) {
        navBootstrapCalls.push(url);
      }
    });

    try {
      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_MULTI_WORKSPACE_EMAIL, adminPwd);

      // Should land on /hub (2+ unlocked workspaces: venue + party-kernel, non-SA)
      await expect(page).toHaveURL(/\/hub(?:\?.*)?$/);
      await assertSingleMainLandmark(page, "Multi-workspace /hub");

      // Single bootstrap call & ZERO /audit/hub-summary & ZERO /menus/navigation/routes on startup
      expect(hubSummaryCalls, "Zero /api/v1/audit/hub-summary calls must be fired").toEqual([]);
      expect(routesEndpointCalls, "Zero duplicate /menus/navigation/routes calls on startup").toEqual([]);
      expect(navBootstrapCalls.length).toBe(1);

      // Only authorized unlocked workspaces shown (no Upgrade section since front-desk lacks billing perms)
      await expect(page.getByText("Available to Upgrade")).toHaveCount(0);
      const venueTileBtn = page.getByRole("button", { name: /Venue/i }).first();
      await expect(venueTileBtn).toBeVisible({ timeout: 10_000 });

      // Side panel: Notifications empty state for front-desk + Sign-In Activity populated (from real login)
      const sidePanel = page.getByTestId("hub-side-panel");
      await expect(sidePanel).toBeVisible({ timeout: 10_000 });
      await expect(sidePanel.getByText(/Actionable Notifications/i)).toBeVisible();
      await expect(sidePanel.getByText(/Account & Sign-In Activity/i)).toBeVisible();
      await expect(sidePanel.getByText(/no unread notifications/i)).toBeVisible({ timeout: 10_000 });

      // Desktop Light Theme capture
      await setTheme(page, "light");
      await assertNoHorizontalOverflow(page, "Hub Desktop Light EN");
      await safeScreenshot(page, "02-hub-desktop-light-en.png");

      // Desktop Dark Theme capture
      await setTheme(page, "dark");
      await assertNoHorizontalOverflow(page, "Hub Desktop Dark EN");
      await safeScreenshot(page, "03-hub-desktop-dark-en.png");

      // Pin a workspace ("Venue"), reload, assert persisted in DB, then unpin to restore
      const pinVenueBtn = page.getByRole("button", { name: /^Pin\s+Venue/i }).first();
      const unpinAlreadyBtn = page.getByRole("button", { name: /^Unpin\s+Venue/i }).first();
      const wasInitiallyPinned = (await unpinAlreadyBtn.count()) > 0;

      if (!wasInitiallyPinned) {
        await expect(pinVenueBtn).toBeVisible({ timeout: 5_000 });
        const pinReq = page.waitForResponse(
          (r) => r.url().includes("/api/v1/menus/navigation/workspaces/") && r.url().includes("/pin"),
          { timeout: 15_000 }
        );
        await pinVenueBtn.click();
        const pinRes = await pinReq;
        expect(pinRes.ok()).toBeTruthy();

        await expect(page.getByRole("button", { name: /^Unpin\s+Venue/i }).first()).toBeVisible({
          timeout: 10_000,
        });
        await page.reload();
        await waitForAppSettled(page);
        await expect(page.getByRole("button", { name: /^Unpin\s+Venue/i }).first()).toBeVisible({
          timeout: 10_000,
        });

        // Unpin to restore clean state
        const unpinReq = page.waitForResponse(
          (r) => r.url().includes("/api/v1/menus/navigation/workspaces/") && r.url().includes("/pin"),
          { timeout: 15_000 }
        );
        await page.getByRole("button", { name: /^Unpin\s+Venue/i }).first().click();
        expect((await unpinReq).ok()).toBeTruthy();
      }

      // Open Contacts workspace (/party-kernel) -> return to /hub -> verify Recent Workspaces strip updates
      await page.getByRole("button", { name: /^Contacts/i }).first().click();
      await page.waitForURL(/\/party-kernel(?:\/.*)?$/, { timeout: 20_000 });
      await waitForAppSettled(page);

      await page.getByRole("button", { name: "Go to Home" }).first().click();
      await page.waitForURL(/\/hub(?:\?.*)?$/, { timeout: 15_000 });
      await waitForAppSettled(page);
      const recentStrip = page.getByTestId("hub-recent-workspaces-strip");
      await expect(recentStrip).toBeVisible({ timeout: 10_000 });
      await expect(recentStrip).toContainText(/Contacts/i);

      // NexusSearchPalette EN filter + <bdi>
      await page.keyboard.press("Control+k");
      const searchDialog = page.getByRole("dialog");
      await expect(searchDialog).toBeVisible({ timeout: 5_000 });
      const searchInput = searchDialog.locator("input").first();
      await searchInput.fill("Facilities");
      await expect(searchDialog.locator("bdi:visible").first()).toBeVisible({ timeout: 5_000 });
      await expect(searchDialog.getByRole("option", { name: /Facilities/i }).first()).toBeVisible({ timeout: 5_000 });
      await page.keyboard.press("Escape");
      await expect(searchDialog).toBeHidden({ timeout: 5_000 });

      // Arabic RTL + SearchPalette <bdi> capture
      await setLanguageAndReload(page, "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await assertNoHorizontalOverflow(page, "Hub Desktop Arabic RTL");
      await safeScreenshot(page, "04-hub-arabic-rtl.png");

      await page.keyboard.press("Control+k");
      const arDialog = page.getByRole("dialog");
      await expect(arDialog).toBeVisible({ timeout: 5_000 });
      await arDialog.locator("input").first().fill("venue");
      await expect(arDialog.locator("bdi:visible").first()).toBeVisible({ timeout: 5_000 });
      await safeScreenshot(page, "05-hub-search-palette-bdi.png");
      await page.keyboard.press("Escape");

      // Switch back to EN & Light for Mobile 390x844 check
      await setLanguageAndReload(page, "en");
      await setTheme(page, "light");

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await assertNoHorizontalOverflow(page, "Hub Mobile 390px Light EN");

      // Verify pin control visibility on mobile (<640px has opacity-100)
      const mobilePinOpacity = await page
        .getByRole("button", { name: /^(Pin|Unpin)\s+/i })
        .first()
        .evaluate((el) => Number(window.getComputedStyle(el).opacity));
      expect(mobilePinOpacity, "Pin button must be visible on 390px mobile").toBeGreaterThan(0.9);
      await safeScreenshot(page, "09-hub-mobile-390px-light.png");

      // Reset viewport and verify non-empty notifications on Tenant SA (/hub)
      await page.setViewportSize({ width: 1440, height: 900 });
      const saTokenRes = await loginViaApi(request, AHLY_SUPER_ADMIN_EMAIL, adminPwd);
      const notifRes = await request.get(`${API_URL}/api/v1/account/notifications`, {
        headers: { Authorization: `Bearer ${saTokenRes.accessToken}` },
      });
      expect(notifRes.ok()).toBeTruthy();

      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);
      await page.getByRole("button", { name: "Go to Home" }).first().click();
      await page.waitForURL(/\/hub(?:\?.*)?$/, { timeout: 15_000 });
      await waitForAppSettled(page);
      await expect(page.getByTestId("hub-side-panel")).toContainText(/Security|Enterprise|Profile/i, {
        timeout: 10_000,
      });

      // Verify Topbar pill shape on mobile 390px for switchable admin (Platform SA)
      await resetBrowserSession(page);
      await loginViaUi(page, PLATFORM_SUPER_ADMIN_EMAIL, adminPwd);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await assertNoHorizontalOverflow(page, "Platform SA Topbar Mobile 390px");
      const pillTrigger = page.getByTestId("topbar-tenant-switcher-trigger");
      await expect(pillTrigger).toBeVisible({ timeout: 5_000 });
      const pillBox = await pillTrigger.evaluate((el) => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          borderRadius: s.borderRadius,
          borderTopLeftRadius: s.borderTopLeftRadius,
          width: r.width,
          height: r.height,
          className: el.getAttribute("class"),
        };
      });
      console.info("[04&12] Topbar pillBox @390px:", JSON.stringify(pillBox), "clientHttpErrors:", JSON.stringify(monitor.clientHttpErrors));
      expect(parseFloat(pillBox.borderRadius)).toBeGreaterThanOrEqual(20);
      expect(pillBox.height).toBeGreaterThanOrEqual(28);
      await page.setViewportSize({ width: 1440, height: 900 });

      monitor.assertClean("Scenario 4 & 12 Hub + Themes + RTL + Mobile");
    } finally {
      monitor.detach();
    }
  });

  // ── Scenario 5 & 6: Roles Landing Policy, Super Admin Immunity & Tier 1 ?redirect= Precedence ──
  test("05 & 06: Roles UI DefaultLandingTarget & IsLandingEnforced, SA immunity, and Tier 1 ?redirect= precedence + safe fallback", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const roleCode = "T_AHLY_RECEPTION_PM";
    const enforcedUserEmail = `uat.enforced.${runSuffix}@scripe-dev.local`;
    const enforcedUsername = `uat_enf_${runSuffix}`;

    let borrowedRoleId = "";
    let roleSnap: RoleSnapshot | null = null;
    let assignedToSa = false;

    try {
      // Snapshot seeded non-system multi-workspace role T_AHLY_RECEPTION_PM (AHLY quota is at 64/20)
      borrowedRoleId = await findRoleIdByCode(request, roleCode);
      roleSnap = await snapshotRole(request, borrowedRoleId);
      roleRestoreSnapshots.push(roleSnap);

      await setRolePermissionsBySelector(request, borrowedRoleId, (p) => ({
        match:
          ((p.resource === "venue-dashboard" || p.resource === "facilities" || p.resource === "parties") &&
            p.action === "view") ||
          p.resource === "workspaces.venue.access",
      }));

      await createTestAdmin(request, {
        username: enforcedUsername,
        email: enforcedUserEmail,
        firstName: "Enforced",
        lastName: "Tester",
        roleIds: [borrowedRoleId],
      });

      // Configure Role Landing Policy via Roles UI as AHLY Super Admin
      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);
      await page.goto("/roles");
      await waitForAppSettled(page);

      // Verify mixed-case search on /roles works cleanly (BUG-04 fix) and locates the target role
      const roleSearchInput = page
        .locator('input[placeholder*="Search" i], input[type="search"]')
        .first();
      await expect(roleSearchInput).toBeVisible({ timeout: 10_000 });
      const mixedCaseSearchPromise = page.waitForResponse(
        (r) =>
          r.url().toLowerCase().includes("/api/v1/roles") &&
          r.url().toLowerCase().includes("search=") &&
          r.status() === 200,
        { timeout: 15_000 }
      );
      await roleSearchInput.fill("T_AhLy_ReCePtIoN_pM");
      await mixedCaseSearchPromise;
      await expect(page.locator("tbody tr", { hasText: roleCode }).first()).toBeVisible({
        timeout: 15_000,
      });

      await openRowActionInCrudTable(page, roleCode, /^Edit$/i);
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible({ timeout: 10_000 });
      await expect(modal.getByRole("heading", { name: /^Edit Role$/i })).toBeVisible({ timeout: 5_000 });

      const targetCombo = modal.getByRole("combobox", { name: /Default Landing Page/i });
      const enforceSwitch = modal.locator("#isLandingEnforced");
      await expect(targetCombo).toBeVisible({ timeout: 5_000 });
      await expect(enforceSwitch).toBeDisabled();

      await targetCombo.click();
      await page.getByRole("option", { name: /Workspace:\s*Contacts/i }).first().click();
      await expect(enforceSwitch).toBeEnabled({ timeout: 5_000 });
      await enforceSwitch.click();
      await expect(enforceSwitch).toBeChecked();

      await safeScreenshot(page, "06-roles-landing-config.png");

      const updateRolePromise = page.waitForResponse(
        (r) => r.url().toLowerCase().includes(`/api/v1/roles/${borrowedRoleId.toLowerCase()}`) && r.request().method() === "PUT",
        { timeout: 15_000 }
      );
      await modal.getByRole("button", { name: /^Save$/i }).click();
      const updateRoleRes = await updateRolePromise;
      expect(updateRoleRes.ok(), `Role PUT failed: ${updateRoleRes.status()}`).toBeTruthy();
      await expect(modal).toBeHidden({ timeout: 10_000 });

      // Enforced non-SA admin lands on configured target (/party-kernel)
      await resetBrowserSession(page);
      await loginViaUi(page, enforcedUserEmail, adminPwd);
      await expect(page).toHaveURL(/\/party-kernel(?:\?.*)?$/, { timeout: 20_000 });

      // Tier 1 ?redirect= beats Role IsLandingEnforced
      await resetBrowserSession(page);
      await loginViaUi(page, enforcedUserEmail, adminPwd, "/login?redirect=%2Fvenue%2Ffacilities");
      await expect(page).toHaveURL(/\/venue\/facilities(?:\?.*)?$/, { timeout: 20_000 });

      // Unauthorized / external ?redirect= falls back safely without loop
      await resetBrowserSession(page);
      await loginViaUi(page, enforcedUserEmail, adminPwd, "/login?redirect=https%3A%2F%2Fevil.com");
      await expect(page).toHaveURL(/\/party-kernel(?:\?.*)?$/, { timeout: 20_000 });
      expect(page.url()).toContain("localhost:3000");

      await resetBrowserSession(page);
      await loginViaUi(page, enforcedUserEmail, adminPwd, "/login?redirect=%2Ftenants");
      await expect(page).toHaveURL(/\/party-kernel(?:\?.*)?$/, { timeout: 20_000 });

      // Super Admin immunity: assign enforced role as secondary role via POST /admins/{id}/roles (BUG-05) -> still lands on /overview.
      const ahlySaRes = await request.get(`${API_URL}/api/v1/admins/current-tenant?page=1&pageSize=50&search=ahly.admin`, {
        headers: { Authorization: `Bearer ${ahlyToken}` },
      });
      expect(ahlySaRes.ok()).toBeTruthy();
      const ahlySaItem = extractPagedItems<{ id: string; email: string }>(await ahlySaRes.json()).find(
        (a) => a.email.toLowerCase() === AHLY_SUPER_ADMIN_EMAIL
      );
      expect(ahlySaItem).toBeTruthy();

      const assignRoleRes = await sendWithRateLimitRetry(() =>
        request.post(`${API_URL}/api/v1/admins/${ahlySaItem!.id}/roles`, {
          headers: mutationHeaders(platformToken, { "X-Tenant-Context": ahlyTenantId }),
          data: {
            roleId: borrowedRoleId,
            tenantId: ahlyTenantId,
            inheritToChildren: false,
          },
        })
      );
      expect(
        assignRoleRes.ok(),
        `POST /admins/{id}/roles failed: ${assignRoleRes.status()} ${await assignRoleRes.text().catch(() => "")}`
      ).toBeTruthy();
      assignedToSa = true;

      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);
      await expect(page).toHaveURL(/\/overview(?:\?.*)?$/, { timeout: 20_000 });

      monitor.assertClean("Scenario 5 & 6 Role Policy + Redirect Precedence");
    } finally {
      if (assignedToSa && borrowedRoleId) {
        const ahlySaRes = await request
          .get(`${API_URL}/api/v1/admins/current-tenant?page=1&pageSize=50&search=ahly.admin`, {
            headers: { Authorization: `Bearer ${ahlyToken}` },
          })
          .catch(() => null);
        if (ahlySaRes && ahlySaRes.ok()) {
          const ahlySaItem = extractPagedItems<{ id: string; email: string }>(await ahlySaRes.json()).find(
            (a) => a.email.toLowerCase() === AHLY_SUPER_ADMIN_EMAIL
          );
          if (ahlySaItem) {
            const curRes = await request
              .get(`${API_URL}/api/v1/admins/${ahlySaItem.id}/roles`, {
                headers: { Authorization: `Bearer ${ahlyToken}` },
              })
              .catch(() => null);
            if (curRes && curRes.ok()) {
              const curRoles = unwrapApiData<
                Array<{ roleId: string; tenantId?: string | null; inheritToChildren?: boolean }>
              >(await curRes.json());
              const restored = curRoles
                .filter((r) => r.roleId !== borrowedRoleId)
                .map((r) => ({
                  roleId: r.roleId,
                  tenantId: r.tenantId ?? ahlyTenantId,
                  inheritToChildren: Boolean(r.inheritToChildren),
                }));
              await sendWithRateLimitRetry(() =>
                request.post(`${API_URL}/api/v1/admins/${ahlySaItem.id}/roles/sync`, {
                  headers: mutationHeaders(platformToken, { "X-Tenant-Context": ahlyTenantId }),
                  data: { scopeTenantId: ahlyTenantId, assignments: restored },
                })
              ).catch(() => {});
            }
          }
        }
      }
      if (roleSnap) {
        await restoreRole(request, roleSnap);
      }
      monitor.detach();
    }
  });

  // ── Scenario 7 & 8: Personal Startup Preference & Multi-Tenant Context Switching Isolation ──
  test("07 & 08: Personal startup preference persistence + multi-tenant context switching isolation & fetchWorkspaceMenu('admin')", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const prefUserEmail = `uat.pref.${runSuffix}@scripe-dev.local`;
    const prefUsername = `uat_pref_${runSuffix}`;
    let prefRoleSnap: RoleSnapshot | null = null;

    try {
      const prefRoleId = await findRoleIdByCode(request, "T_AHLY_RECEPTION_PM");
      prefRoleSnap = await snapshotRole(request, prefRoleId);
      roleRestoreSnapshots.push(prefRoleSnap);

      await setRolePermissionsBySelector(request, prefRoleId, (p) => ({
        match:
          ((p.resource === "venue-dashboard" || p.resource === "facilities" || p.resource === "parties") &&
            p.action === "view") ||
          p.resource === "workspaces.venue.access",
      }));

      await createTestAdmin(request, {
        username: prefUsername,
        email: prefUserEmail,
        firstName: "Pref",
        lastName: "Operator",
        roleIds: [prefRoleId],
      });

      // Scenario 7: Personal Startup Preference
      await resetBrowserSession(page);
      await loginViaUi(page, prefUserEmail, adminPwd);
      await expect(page).toHaveURL(/\/hub(?:\?.*)?$/, { timeout: 20_000 });

      await page.goto("/account/preferences");
      await waitForAppSettled(page);
      const section = page.getByTestId("startup-preferences-section");
      await expect(section).toBeVisible({ timeout: 10_000 });
      const activeCtxBadge = page.getByTestId("startup-active-context-badge");
      await expect(activeCtxBadge).toContainText(ahlyTenantName);
      await expect(activeCtxBadge).not.toContainText(ahlyContextKey);

      const selectTrigger = page.getByTestId("startup-target-select");
      await expect(selectTrigger).toBeEnabled();

      const putPrefPromise = page.waitForResponse(
        (r) => r.url().includes("/api/v1/account/preferences") && r.request().method() === "PUT",
        { timeout: 15_000 }
      );
      await selectTrigger.click();
      await page.getByRole("option", { name: /Workspace:\s*Contacts/i }).first().click();
      const putPrefRes = await putPrefPromise;
      expect(putPrefRes.ok(), `PUT preferences failed: ${putPrefRes.status()}`).toBeTruthy();

      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll<HTMLElement>("*").forEach((el) => {
          if (el.scrollTop > 0) el.scrollTop = 0;
        });
      });
      await page.waitForTimeout(150);
      await safeScreenshot(page, "07-account-startup-preferences.png");

      // Reload & confirm persisted
      await page.reload();
      await waitForAppSettled(page);
      await expect(page.getByTestId("startup-target-select")).toContainText(/Contacts/i, { timeout: 10_000 });

      // Re-login & confirm lands on personal preference (/party-kernel)
      await resetBrowserSession(page);
      await loginViaUi(page, prefUserEmail, adminPwd);
      await expect(page).toHaveURL(/\/party-kernel(?:\?.*)?$/, { timeout: 20_000 });

      // Scenario 8: Multi-tenant context switching isolation (Platform SA -> AHLY -> Platform)
      await resetBrowserSession(page);
      await loginViaUi(page, PLATFORM_SUPER_ADMIN_EMAIL, adminPwd);
      await expect(page).toHaveURL(/\/overview(?:\?.*)?$/);

      // Save a personal preference in Platform context ("hub")
      await page.goto("/account/preferences");
      await waitForAppSettled(page);
      await expect(page.getByTestId("startup-active-context-badge")).toContainText(/platform/i);
      const platPut = page.waitForResponse(
        (r) => r.url().includes("/api/v1/account/preferences") && r.request().method() === "PUT",
        { timeout: 15_000 }
      );
      await page.getByTestId("startup-target-select").click();
      await page.getByRole("option", { name: /Workspace Hub/i }).first().click();
      expect((await platPut).ok()).toBeTruthy();

      // Switch context via Topbar Switcher UI (mounted in NexusLayout on /overview) to AHLY
      await page.goto("/overview");
      await waitForAppSettled(page);
      await page.getByTestId("topbar-tenant-switcher-trigger").click();
      const switcherDialog = page.getByTestId("tenant-switcher-dialog");
      await expect(switcherDialog).toBeVisible({ timeout: 10_000 });
      const ahlyOptionBtn = switcherDialog.getByTestId(`tenant-switch-option-${ahlyTenantId}`);
      await expect(ahlyOptionBtn).toBeVisible({ timeout: 10_000 });
      await ahlyOptionBtn.click();
      await waitForAppSettled(page);

      // Visit /account/preferences in switched AHLY context -> check human-readable context & isolated preference
      await page.goto("/account/preferences");
      await waitForAppSettled(page);
      const switchedCtxBadge = page.getByTestId("startup-active-context-badge");
      await expect(switchedCtxBadge).toContainText(ahlyTenantName, {
        timeout: 15_000,
      });
      await expect(switchedCtxBadge).not.toContainText(ahlyContextKey);
      await expect(page.getByTestId("startup-target-select")).toContainText(/Default/i);

      // Visit /hub in AHLY context -> open Venue -> verify admin sidebar loads when switching back to admin
      await page.goto("/hub");
      await waitForAppSettled(page);
      await page.getByRole("button", { name: /^Venue/i }).first().click();
      await page.waitForURL(/\/venue(?:\?.*)?$/, { timeout: 20_000 });
      await waitForAppSettled(page);

      // Switch back to "admin" workspace via Back to Admin button -> verify admin menu loads (NOT Venue items!)
      const adminNavPromise = page
        .waitForResponse(
          (r) => r.url().includes("/api/v1/menus/navigation?workspace=admin") && r.status() === 200,
          { timeout: 10_000 }
        )
        .catch(() => null);
      const backToAdminBtn = page.getByRole("button", { name: "Back to Admin" }).first();
      await expect(backToAdminBtn).toBeVisible({ timeout: 10_000 });
      await backToAdminBtn.click();
      await adminNavPromise;
      await waitForAppSettled(page);
      await expect(page.locator("nav[aria-label='Primary navigation']")).toBeVisible();
      await expect(page).toHaveURL(/\/overview(?:\?.*)?$/);

      // Verify recentWorkspaceKeysByContext isolated per contextKey in scr_nav_v2
      const recentsIsolation = await page.evaluate(
        ({ tid, ctxKey }) => {
          const raw = localStorage.getItem("scr_nav_v2");
          if (!raw) return null;
          const parsed = JSON.parse(raw) as { state?: { recentWorkspaceKeysByContext?: Record<string, string[]> } };
          const map = parsed.state?.recentWorkspaceKeysByContext ?? {};
          const ahlyKeys = Object.keys(map).filter((k) => k.startsWith(`${tid}:`) || k.startsWith(`${ctxKey}:`));
          const platformKeys = Object.keys(map).filter((k) => k.startsWith("platform:"));
          return { ahlyKeys, platformKeys, map };
        },
        { tid: ahlyTenantId, ctxKey: ahlyContextKey }
      );
      expect(recentsIsolation?.ahlyKeys.length, `Unexpected recents map: ${JSON.stringify(recentsIsolation?.map)}`).toBeGreaterThan(0);

      // Exit tenant context and reset platform startup target back to default
      await page.getByRole("button", { name: /Exit Tenant Context/i }).first().click();
      await waitForAppSettled(page);
      await page.goto("/account/preferences");
      await waitForAppSettled(page);
      const resetBtn = page.getByTestId("startup-reset-btn");
      if (await resetBtn.isEnabled()) {
        const resetPut = page.waitForResponse(
          (r) => r.url().includes("/api/v1/account/preferences") && r.request().method() === "PUT",
          { timeout: 15_000 }
        );
        await resetBtn.click();
        expect((await resetPut).ok()).toBeTruthy();
      }

      monitor.assertClean("Scenario 7 & 8 Startup Preferences + Context Isolation");
    } finally {
      if (prefRoleSnap) {
        await restoreRole(request, prefRoleSnap);
      }
      monitor.detach();
    }
  });

  // ── Scenario 9: Impersonation Bootstrap Reset, Read-Only Guards & Stop Impersonation ──
  test("09: Impersonation resets bootstrap cleanly, enforces Hub pin & Startup Prefs read-only guards + server 403 rejections, and stop restores original session", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const personalFeedCallsDuringImpersonation: string[] = [];

    page.on("request", (req) => {
      const url = req.url().toLowerCase();
      if (url.includes("/api/v1/account/notifications") || url.includes("/api/v1/account/activity")) {
        // Track only while scr_impersonating is active in browser
        personalFeedCallsDuringImpersonation.push(url);
      }
    });

    try {
      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_SUPER_ADMIN_EMAIL, adminPwd);
      await page.goto("/admins");
      await waitForAppSettled(page);

      const searchInput = page.locator("input[placeholder*='Search']").first();
      if ((await searchInput.count()) > 0) {
        await searchInput.fill("ahly.front_desk");
        await page.waitForTimeout(700);
      }

      const targetRes = await request.get(
        `${API_URL}/api/v1/admins/current-tenant?page=1&pageSize=20&search=ahly.front_desk`,
        { headers: { Authorization: `Bearer ${ahlyToken}` } }
      );
      expect(targetRes.ok()).toBeTruthy();
      const targetAdmin = extractPagedItems<{ id: string; email: string }>(await targetRes.json()).find(
        (a) => a.email.toLowerCase() === AHLY_MULTI_WORKSPACE_EMAIL
      );
      expect(targetAdmin, "ahly.front_desk target admin must exist").toBeTruthy();

      const impResPromise = page.waitForResponse(
        (r) => r.url().includes("/api/v1/auth/admin/impersonate/") && r.request().method() === "POST",
        { timeout: 20_000 }
      );
      await openRowActionInCrudTable(page, "ahly.front_desk", /^Impersonate$/i);
      const impRes = await impResPromise;
      expect(impRes.ok(), `Impersonate failed: ${impRes.status()}`).toBeTruthy();

      await waitForAppSettled(page);
      await expect(page.getByRole("button", { name: /Stop impersonating/i })).toBeVisible({
        timeout: 15_000,
      });

      // Clear counter right after entering impersonation and inspect /hub
      personalFeedCallsDuringImpersonation.length = 0;
      await page.goto("/hub");
      await waitForAppSettled(page);

      await expect(page.getByTestId("hub-impersonation-alert")).toBeVisible({ timeout: 10_000 });
      expect(
        personalFeedCallsDuringImpersonation,
        "Zero personal notification/activity fetches allowed during impersonation"
      ).toEqual([]);

      // Verify pin buttons cannot mutate during impersonation
      const pinBtns = page.getByRole("button", { name: /^(Pin|Unpin)\s+/i });
      if ((await pinBtns.count()) > 0) {
        await expect(pinBtns.first()).toBeDisabled();
      }

      // Check /account/preferences read-only guard AND TenantContextBanner ("Stop impersonating") directly on /account/*
      await page.goto("/account/preferences");
      await waitForAppSettled(page);
      await expect(page.getByRole("button", { name: /Stop impersonating/i })).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByTestId("startup-impersonation-alert")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("startup-target-select")).toBeDisabled();
      await expect(page.getByTestId("startup-reset-btn")).toBeDisabled();
      await safeScreenshot(page, "08-impersonation-readonly-guard.png");

      // Stop impersonation directly from /account/preferences restores original admin session cleanly
      const stopPromise = page.waitForResponse(
        (r) => r.url().includes("/api/v1/auth/admin/stop-impersonation") && r.request().method() === "POST",
        { timeout: 20_000 }
      );
      await page.getByRole("button", { name: /Stop impersonating/i }).click();
      expect((await stopPromise).ok()).toBeTruthy();
      await waitForAppSettled(page);
      await expect(page.getByRole("button", { name: /Stop impersonating/i })).toHaveCount(0);
      await expect(page).toHaveURL(/\/overview(?:\?.*)?$/, { timeout: 20_000 });

      // Server-side 403 verification for impersonated writes (isolated via APIRequestContext)
      const apiImpRes = await sendWithRateLimitRetry(() =>
        request.post(`${API_URL}/api/v1/auth/admin/impersonate/${targetAdmin!.id}`, {
          headers: mutationHeaders(ahlyToken),
        })
      );
      expect(apiImpRes.ok()).toBeTruthy();
      const apiImpBody = unwrapApiData<{ accessToken?: string }>(await apiImpRes.json());
      const impersonatedToken = apiImpBody.accessToken ?? "";
      expect(impersonatedToken).toBeTruthy();

      try {
        const pinWriteRes = await sendWithRateLimitRetry(() =>
          request.post(`${API_URL}/api/v1/menus/navigation/workspaces/venue/pin`, {
            headers: mutationHeaders(impersonatedToken),
          })
        );
        expect(pinWriteRes.status(), "Server must reject impersonated pin write with 403").toBe(403);

        const prefGetRes = await request.get(`${API_URL}/api/v1/account/preferences`, {
          headers: { Authorization: `Bearer ${impersonatedToken}` },
        });
        const prefJson = prefGetRes.ok()
          ? unwrapApiData<{ rowVersion?: string | null }>(await prefGetRes.json())
          : {};
        const prefWriteRes = await sendWithRateLimitRetry(() =>
          request.put(`${API_URL}/api/v1/account/preferences`, {
            headers: mutationHeaders(impersonatedToken),
            data: { startupTarget: "hub", rowVersion: prefJson.rowVersion ?? null },
          })
        );
        expect(prefWriteRes.status(), "Server must reject impersonated preferences write with 403").toBe(403);
      } finally {
        await sendWithRateLimitRetry(() =>
          request.post(`${API_URL}/api/v1/auth/admin/stop-impersonation`, {
            headers: mutationHeaders(impersonatedToken),
          })
        ).catch(() => {});
      }

      monitor.assertClean("Scenario 9 Impersonation Read-Only Guard");
    } finally {
      monitor.detach();
    }
  });

  // ── Scenario 10: Revoked Permission Fallback, Entitlement Gate, WorkManagement "own" Scope & Effective Landing API ──
  test("10: Revoked permission fallback, WorkManagement feature/tenant/'own' guards & GET /admins/{id}/effective-landing", async ({
    page,
    request,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    const wmEmail = `uat.wm.${runSuffix}@scripe-dev.local`;
    const wmUsername = `uat_wm_${runSuffix}`;

    const revEmail = `uat.rev.${runSuffix}@scripe-dev.local`;
    const revUsername = `uat_rev_${runSuffix}`;

    let revSnap: RoleSnapshot | null = null;
    let wmSnap: RoleSnapshot | null = null;

    try {
      // 10a. Revoked permission graceful fallback + effective-landing diagnostic (snapshot T_AHLY_LOCKER_STEWARD)
      const revRoleId = await findRoleIdByCode(request, "T_AHLY_LOCKER_STEWARD");
      revSnap = await snapshotRole(request, revRoleId);
      roleRestoreSnapshots.push(revSnap);

      await setRolePermissionsBySelector(request, revRoleId, (p) => ({
        match:
          ((p.resource === "venue-dashboard" || p.resource === "facilities" || p.resource === "parties") &&
            p.action === "view") ||
          ((p.resource === "crm.overview" || p.resource === "crm.leads") &&
            (p.action === "read" || p.action === "view")) ||
          p.resource === "workspaces.venue.access" ||
          p.resource === "workspaces.crm.access",
      }));

      const revAdminId = await createTestAdmin(request, {
        username: revUsername,
        email: revEmail,
        firstName: "Revoke",
        lastName: "Tester",
        roleIds: [revRoleId],
      });

      // Save personal startup preference to workspace:crm while authorized
      const revAuthBefore = await loginViaApi(request, revEmail, adminPwd);
      const revPrefGet = await request.get(`${API_URL}/api/v1/account/preferences`, {
        headers: { Authorization: `Bearer ${revAuthBefore.accessToken}` },
      });
      expect(revPrefGet.ok()).toBeTruthy();
      const revPrefDto = unwrapApiData<{ rowVersion?: string | null }>(await revPrefGet.json());
      const setCrmPref = await sendWithRateLimitRetry(() =>
        request.put(`${API_URL}/api/v1/account/preferences`, {
          headers: mutationHeaders(revAuthBefore.accessToken),
          data: { startupTarget: "workspace:crm", rowVersion: revPrefDto.rowVersion ?? null },
        })
      );
      expect(
        setCrmPref.ok(),
        `setCrmPref failed: ${setCrmPref.status()} ${await setCrmPref.text().catch(() => "")}`
      ).toBeTruthy();

      // Now revoke CRM permissions from the role (keep Venue + Parties only)
      await setRolePermissionsBySelector(request, revRoleId, (p) => ({
        match:
          ((p.resource === "venue-dashboard" || p.resource === "facilities" || p.resource === "parties") &&
            p.action === "view") ||
          p.resource === "workspaces.venue.access",
      }));

      // Verify GET /api/v1/admins/{id}/effective-landing reflects graceful fallback cleanly
      const effRes = await request.get(`${API_URL}/api/v1/admins/${revAdminId}/effective-landing`, {
        headers: { Authorization: `Bearer ${ahlyToken}` },
      });
      expect(effRes.ok(), `effective-landing failed: ${effRes.status()}`).toBeTruthy();
      const effBody = unwrapApiData<{
        adminId: string;
        activeContextKey: string;
        landing: { route: string; wasFallbackApplied: boolean; fallbackReason?: string | null };
      }>(await effRes.json());
      expect(effBody.activeContextKey).toBe(ahlyContextKey);
      expect(effBody.landing.wasFallbackApplied).toBe(true);
      expect(effBody.landing.route).toBe("/hub");

      // UI login after revocation falls back gracefully to /hub without loop, and StartupPreferences shows fallback notice
      await resetBrowserSession(page);
      await loginViaUi(page, revEmail, adminPwd);
      await expect(page).toHaveURL(/\/hub(?:\?.*)?$/, { timeout: 20_000 });
      await page.goto("/account/preferences");
      await waitForAppSettled(page);
      await expect(page.getByTestId("startup-fallback-alert")).toBeVisible({ timeout: 10_000 });

      // 10b. WorkManagement "own" scope live check (snapshot T_AHLY_PARKING_MGR)
      const wmRoleId = await findRoleIdByCode(request, "T_AHLY_PARKING_MGR");
      wmSnap = await snapshotRole(request, wmRoleId);
      roleRestoreSnapshots.push(wmSnap);

      await setRolePermissionsBySelector(request, wmRoleId, (p) => {
        if (p.resource === "work-items" && p.action === "view") {
          return { match: true, scopeOverride: "own" };
        }
        if (p.resource === "work-items" && (p.action === "create" || p.action === "update")) {
          return { match: true, scopeOverride: "own_tenant" };
        }
        return {
          match: p.resource === "staff-members" && p.action === "view",
        };
      });

      await createTestAdmin(request, {
        username: wmUsername,
        email: wmEmail,
        firstName: "OwnScope",
        lastName: "Worker",
        roleIds: [wmRoleId],
      });

      // AHLY Super Admin sees seeded AHLY work items (not owned by wmAdmin)
      const saWmRes = await request.get(`${API_URL}/api/v1/work-items?page=1&pageSize=20`, {
        headers: { Authorization: `Bearer ${ahlyToken}` },
      });
      expect(saWmRes.ok()).toBeTruthy();
      const saWorkItems = extractPagedItems<{ id: string; title: string }>(await saWmRes.json());
      expect(saWorkItems.length).toBeGreaterThan(0);
      const otherAdminWorkItem = saWorkItems[0];

      // Own-scope admin initially sees 0 items and gets 403/404 fetching AHLY Super Admin's item
      const wmAuth = await loginViaApi(request, wmEmail, adminPwd);
      const wmInitialList = await request.get(`${API_URL}/api/v1/work-items?page=1&pageSize=20`, {
        headers: { Authorization: `Bearer ${wmAuth.accessToken}` },
      });
      expect(wmInitialList.ok()).toBeTruthy();
      expect(extractPagedItems(await wmInitialList.json())).toHaveLength(0);

      const wmCrossActorRead = await request.get(
        `${API_URL}/api/v1/work-items/${otherAdminWorkItem.id}`,
        { headers: { Authorization: `Bearer ${wmAuth.accessToken}` } }
      );
      expect([403, 404]).toContain(wmCrossActorRead.status());

      // Create an own WorkItem via API -> visible ONLY to wmAdmin in /work-items UI
      const ownTitle = `Own-Scope UAT Task ${runSuffix}`;
      const createOwnRes = await sendWithRateLimitRetry(() =>
        request.post(`${API_URL}/api/v1/work-items`, {
          headers: mutationHeaders(wmAuth.accessToken),
          data: {
            title: ownTitle,
            description: "Created by own-scope admin for Task 12 UAT",
            status: 0,
            priority: 1,
          },
        })
      );
      expect(createOwnRes.ok(), `Create WorkItem failed: ${createOwnRes.status()}`).toBeTruthy();
      const createdOwnId = unwrapApiData<{ id: string }>(await createOwnRes.json()).id;
      ephemeralWorkItemIds.push(createdOwnId);

      // Platform admin without tenant context sees zero AHLY tenant-owned items and fails closed on tenant item read
      const platWmRes = await request.get(`${API_URL}/api/v1/work-items?page=1&pageSize=20`, {
        headers: { Authorization: `Bearer ${platformToken}` },
      });
      if (platWmRes.ok()) {
        const platItems = extractPagedItems<{ id: string }>(await platWmRes.json());
        expect(platItems.some((item) => item.id === createdOwnId || item.id === otherAdminWorkItem.id)).toBe(false);
        const platCrossRead = await request.get(`${API_URL}/api/v1/work-items/${createdOwnId}`, {
          headers: { Authorization: `Bearer ${platformToken}` },
        });
        expect([403, 404]).toContain(platCrossRead.status());
      } else {
        expect([401, 403]).toContain(platWmRes.status());
      }

      await resetBrowserSession(page);
      await loginViaUi(page, wmEmail, adminPwd);
      await page.goto("/work-items");
      await waitForAppSettled(page);
      await expect(page.locator("tbody")).toContainText(ownTitle, { timeout: 10_000 });
      await expect(page.locator("tbody")).not.toContainText(otherAdminWorkItem.title);
      await safeScreenshot(page, "11-work-items-own-scope.png");

      // 10c. Feature-disabled tenant gate check (COMMUNITY Free edition lacks WorkManagement.Access)
      await resetBrowserSession(page);
      await loginViaUi(page, COMMUNITY_ADMIN_EMAIL, adminPwd);
      await page.goto("/work-items");
      await waitForAppSettled(page);
      await expect(page.getByTestId("feature-unavailable-gate")).toBeVisible({ timeout: 15_000 });
      await safeScreenshot(page, "12-feature-unavailable-gate.png");

      monitor.assertClean("Scenario 10 Revoked Fallback + WorkManagement + Feature Gate");
    } finally {
      if (revSnap) {
        await restoreRole(request, revSnap);
      }
      if (wmSnap) {
        await restoreRole(request, wmSnap);
      }
      monitor.detach();
    }
  });

  // ── Scenario 11: 500 / 429 <NavigationErrorRecovery> Resilience Test ───────────────
  test("11: 500 / 429 on /menus/navigation releases welcome curtain, prevents redirect loop, shows <NavigationErrorRecovery>, and Retry recovers", async ({
    page,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    try {
      await resetBrowserSession(page);
      await loginViaUi(page, PLATFORM_SUPER_ADMIN_EMAIL, adminPwd);
      await expect(page).toHaveURL(/\/overview(?:\?.*)?$/);

      // Simulate HTTP 429 on navigation bootstrap (immediate fail-closed recovery without retry wait)
      monitor.allowNextHttpStatus((url, status) => url.includes("/menus/navigation") && status >= 429);
      monitor.allowNextConsoleError(/429|500|Failed to load navigation|status code/i);

      await page.route("**/api/v1/menus/navigation*", async (route) => {
        await route.fulfill({
          status: 429,
          contentType: "application/json",
          headers: { "Retry-After": "1" },
          body: JSON.stringify({ message: "Too Many Requests (UAT simulated 429)" }),
        });
      });

      // Clear localStorage nav-storage so fresh boot calls /menus/navigation
      await page.evaluate(() => {
        localStorage.removeItem("nav-storage");
        sessionStorage.setItem("scr_just_logged_in", "1");
      });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Curtain must release and <NavigationErrorRecovery> must render without redirect loop
      const recovery = page.getByTestId("navigation-error-recovery");
      await expect(recovery).toBeVisible({ timeout: 15_000 });
      await expect(
        page.locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/i")
      ).toHaveCount(0);
      expect(new URL(page.url()).pathname).toBe("/");
      await safeScreenshot(page, "10-nav-error-recovery.png");

      // Also verify HTTP 500 behavior briefly, then restore live route and test Retry button
      await page.unroute("**/api/v1/menus/navigation*");
      await page.route("**/api/v1/menus/navigation*", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Simulated 500 bootstrap error" }),
        });
      });
      await page.getByTestId("navigation-error-retry").click();
      await expect(recovery).toBeVisible({ timeout: 15_000 });

      // Remove route mock and click Retry -> recovers cleanly to /overview!
      await page.unroute("**/api/v1/menus/navigation*");
      monitor.clearAllowedHttpStatus();
      monitor.allowNextConsoleError(null);

      await page.getByTestId("navigation-error-retry").click();
      await page.waitForURL(/\/overview(?:\?.*)?$/, { timeout: 20_000 });
      await waitForAppSettled(page);
      await assertSingleMainLandmark(page, "Post-retry /overview");
      expect(monitor.pageErrors).toEqual([]);
      expect(monitor.serverErrors).toEqual([]);
    } finally {
      await page.unroute("**/api/v1/menus/navigation*").catch(() => {});
      monitor.detach();
    }
  });

  // ── BUG-01 Regression Check: Hub Venue tile navigation for front-desk role holding venue-dashboard.view ──
  test("BUG-01: Front-desk admin clicking authorized Venue workspace tile on /hub navigates to /venue", async ({
    page,
  }) => {
    const monitor = attachRuntimeMonitor(page);
    try {
      await resetBrowserSession(page);
      await loginViaUi(page, AHLY_MULTI_WORKSPACE_EMAIL, adminPwd);
      await expect(page).toHaveURL(/\/hub(?:\?.*)?$/);

      await page.getByRole("button", { name: /^Venue/i }).first().click();
      await page.waitForURL(/\/venue(?:\/.*)?$/, { timeout: 10_000 });
      await waitForAppSettled(page);
      await assertSingleMainLandmark(page, "Front-desk /venue navigation");
      await safeScreenshot(page, "13-front-desk-venue-navigation.png");
      monitor.assertClean("BUG-01 Venue tile navigation");
    } finally {
      monitor.detach();
    }
  });
});
