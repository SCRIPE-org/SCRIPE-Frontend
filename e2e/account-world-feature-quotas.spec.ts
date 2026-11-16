import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const API_URL = process.env.E2E_API_URL || "http://localhost:5035";
const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "..",
  "e2e-evidence",
  "account-world-uat",
  "screenshots"
);

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function safeScreenshot(page: Page, filename: string, fullPage = true) {
  const targetPath = path.join(SCREENSHOT_DIR, filename);
  for (let attempt = 1; attempt <= 3; attempt++) {
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

async function waitForAppSettled(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
    .waitFor({ state: "detached", timeout: 30_000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(250);
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
  await page.waitForTimeout(250);
}

async function setLanguageAndReload(page: Page, lang: "en" | "ar") {
  await page.evaluate((targetLang) => {
    localStorage.setItem("scr_lang", targetLang);
    localStorage.setItem("scr_pref_lang", targetLang);
    document.cookie = `scr_lang=${targetLang}; path=/; SameSite=Lax`;
  }, lang);
  await page.reload();
  await waitForAppSettled(page);
  await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}

async function captureThemePair(
  page: Page,
  baseName: string,
  options: { fullPage?: boolean; includeArabic?: boolean; label?: string } = {}
) {
  const fullPage = options.fullPage ?? true;
  const label = options.label || baseName;

  await setTheme(page, "light");
  await assertNoHorizontalOverflow(page, `${label} (EN Light)`);
  await safeScreenshot(page, `${baseName}_en_light.png`, fullPage);

  await setTheme(page, "dark");
  await assertNoHorizontalOverflow(page, `${label} (EN Dark)`);
  await safeScreenshot(page, `${baseName}_en_dark.png`, fullPage);

  if (options.includeArabic) {
    await setLanguageAndReload(page, "ar");
    await setTheme(page, "dark");
    await assertNoHorizontalOverflow(page, `${label} (AR Dark)`);
    await safeScreenshot(page, `${baseName}_ar_dark.png`, fullPage);
    await setLanguageAndReload(page, "en");
  }

  await setTheme(page, "dark");
}

async function clearBrowserSessionPreservingPage(page: Page) {
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

async function loginViaUi(page: Page, identifier: string, password: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto("/login");
    await waitForAppSettled(page);
    await expect(page.locator("#identifier")).toBeVisible({ timeout: 15_000 });
    await page.locator("#identifier").fill(identifier);
    await page.locator("#password").fill(password);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });

    const loginResPromise = page
      .waitForResponse(
        (res) =>
          res.url().includes("/api/v1/auth/admin/login") && res.request().method() === "POST",
        { timeout: 15_000 }
      )
      .catch(() => null);

    await submitBtn.click();
    const loginRes = await loginResPromise;
    if (loginRes && loginRes.status() === 429 && attempt < 2) {
      const retryAfterSec = Number(loginRes.headers()["retry-after"] || "30");
      await page.waitForTimeout(Math.min(Math.max(retryAfterSec, 5), 65) * 1000);
      continue;
    }

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    await waitForAppSettled(page);
    return;
  }
  throw new Error(`UI login exhausted 429 retries for ${identifier}`);
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

async function loginViaApi(
  request: APIRequestContext,
  identifier: string,
  password: string,
  isPlatformAdmin = false
): Promise<{ accessToken: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await request.post(`${API_URL}/api/v1/auth/admin/login`, {
      data: { identifier, password, isPlatformAdmin },
    });
    if (res.status() === 429 && attempt < 2) {
      const retryAfterSec = Number(res.headers()["retry-after"] || "30");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retryAfterSec, 5), 65) * 1000));
      continue;
    }
    expect(res.ok(), `API login failed for ${identifier}: ${res.status()}`).toBeTruthy();
    return (await res.json()) as { accessToken: string };
  }
  throw new Error(`API login exhausted retries for ${identifier}`);
}

async function verifyPasswordSudoViaApi(
  request: APIRequestContext,
  accessToken: string,
  password: string
): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await request.post(`${API_URL}/api/v1/auth/sudo/verify`, {
      headers: mutationHeaders(accessToken),
      data: { method: "password", password },
    });
    if (res.status() === 429 && attempt < 2) {
      const retryAfterSec = Number(res.headers()["retry-after"] || "30");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retryAfterSec, 10), 65) * 1000));
      continue;
    }
    expect(res.ok(), `Password Sudo failed: ${res.status()} ${await res.text()}`).toBeTruthy();
    const body = (await res.json()) as { sudoToken: string };
    expect(body.sudoToken).toBeTruthy();
    return body.sudoToken;
  }
  throw new Error("Password Sudo exhausted 429 retries");
}

interface PlanQuotaDto {
  quotaCode: string;
  displayName?: string;
  currentUsage?: number;
  limit: number;
  isUnlimited: boolean;
  source?: string | null;
}

interface PlanCapabilityDto {
  capabilityCode: string;
  moduleName?: string;
  displayName?: string;
  category?: string;
  accessState?: string;
}

interface AccountPlanApiDto {
  editionId: string;
  editionDisplayName: string;
  capabilities: PlanCapabilityDto[];
  quotas: PlanQuotaDto[];
}

interface AccountIntegrationsApiDto {
  integrationsFeatureEnabled?: boolean;
  rateLimitTelemetry?: {
    rateLimitingEnabled: boolean;
    requestsPerMinuteLimit: number | null;
    configuredRequestsPerMinuteLimit: number | null;
    hourlyLimit: number | null;
    hourlyRequestsUsed: number;
    hourlyRemaining: number | null;
    dailyRequestsUsed: number;
    remainingQuotaPercentage: number | null;
  } | null;
  patQuota?: {
    activeCount: number;
    maxLimit: number;
    isUnlimited: boolean;
    remaining: number | null;
    isEnabled: boolean;
  } | null;
  personalAccessTokens: Array<{ id: string; name: string }>;
}

test.describe("SCRIPE Milestone 9 — Multi-Tier Feature Gates, Real Quotas & Override Integrity", () => {
  test.describe.configure({ mode: "serial", timeout: 240_000 });

  const standardPassword = getDevAdminPassword();
  const ahlyEmail = "ahly.admin@scripe-dev.local";
  const cityEmail = "city.admin@scripe-dev.local";
  const communityEmail = "community.admin@scripe-dev.local";
  const platformAdminEmail = "admin-seif@scripe.org";

  const apiErrors: Array<{ url: string; status: number }> = [];

  function trackServerErrors(page: Page) {
    page.on("response", (res) => {
      if (res.status() >= 500 && !res.url().includes("favicon")) {
        apiErrors.push({ url: res.url(), status: res.status() });
      }
    });
  }

  test("Case A — Enterprise (ahly.admin): hidden disabled Rate Limit card, seeded overrides (PAT=10, Venue=50), zero Academy phantom capability", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    const ahlySession = await loginViaApi(request, ahlyEmail, standardPassword);
    const intRes = await request.get(`${API_URL}/api/v1/account/integrations`, {
      headers: { Authorization: `Bearer ${ahlySession.accessToken}` },
    });
    expect(intRes.ok()).toBeTruthy();
    const intDto = (await intRes.json()) as AccountIntegrationsApiDto;

    const rateLimitingEnabled = intDto.rateLimitTelemetry?.rateLimitingEnabled;
    expect(typeof rateLimitingEnabled).toBe("boolean");
    expect(intDto.integrationsFeatureEnabled).toBe(true);
    expect(intDto.patQuota?.isEnabled).toBe(true);
    expect(intDto.patQuota?.isUnlimited).toBe(false);
    expect(intDto.patQuota?.maxLimit).toBe(10);

    const planRes = await request.get(`${API_URL}/api/v1/account/plan`, {
      headers: { Authorization: `Bearer ${ahlySession.accessToken}` },
    });
    expect(planRes.ok()).toBeTruthy();
    const planDto = (await planRes.json()) as AccountPlanApiDto;

    const quotaMap = new Map(planDto.quotas.map((q) => [q.quotaCode, q]));
    for (const requiredCode of [
      "Identity.Admins.MaxPerTenant",
      "Identity.Users.MaxPerTenant",
      "Identity.Roles.MaxPerTenant",
      "OrganizationCore.Branches.MaxPerTenant",
      "Integrations.ApiKeys.MaxPerTenant",
      "Venue.MaxBookableResources",
    ]) {
      expect(quotaMap.has(requiredCode), `Missing quota row ${requiredCode}`).toBe(true);
    }
    expect(quotaMap.get("Integrations.ApiKeys.MaxPerTenant")?.limit).toBe(10);
    expect(quotaMap.get("Venue.MaxBookableResources")?.limit).toBe(50);
    expect(
      planDto.capabilities.some((c) => c.capabilityCode.includes("Academy.EnrollmentEngine")),
      "Unshipped Academy.EnrollmentEngine capability must not appear"
    ).toBe(false);

    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, ahlyEmail, standardPassword);

    await page.goto("/account/integrations");
    await waitForAppSettled(page);
    if (rateLimitingEnabled) {
      await expect(page.getByTestId("integrations-rate-limit-card")).toBeVisible({ timeout: 10_000 });
      const hrRem = (intDto.rateLimitTelemetry?.hourlyRemaining ?? 0).toLocaleString();
      const hrLim = (intDto.rateLimitTelemetry?.hourlyLimit ?? 0).toLocaleString();
      await expect(page.getByTestId("integrations-rate-limit-value")).toContainText(
        `${hrRem} / ${hrLim}`
      );
    } else {
      await expect(page.getByTestId("integrations-rate-limit-card")).toHaveCount(0);
    }
    await expect(page.getByTestId("integrations-active-pats-value")).toContainText(
      `${intDto.patQuota?.activeCount ?? 1} / 10`
    );
    const intBody = await page.locator("body").innerText();
    expect(intBody).not.toContain("99.6%");
    expect(intBody).not.toContain("4,980");
    await captureThemePair(page, "23_enterprise_integrations_ahly", {
      includeArabic: true,
      label: "Enterprise Integrations",
    });

    await page.goto("/account/plan");
    await waitForAppSettled(page);
    const planBody = await page.locator("body").innerText();
    expect(planBody).toContain("Integrations.ApiKeys.MaxPerTenant");
    expect(planBody).toContain("Venue.MaxBookableResources");
    expect(planBody).not.toContain("Academy.EnrollmentEngine");
    await captureThemePair(page, "22_enterprise_plan_ahly", {
      includeArabic: true,
      label: "Enterprise Plan & Quotas",
    });
  });

  test("Case B — Pro (city.admin): real finite quotas, hidden VacationDelegation UI, and 403 Entitlements.FeatureDisabled on Delegation API", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    const citySession = await loginViaApi(request, cityEmail, standardPassword);
    const planRes = await request.get(`${API_URL}/api/v1/account/plan`, {
      headers: { Authorization: `Bearer ${citySession.accessToken}` },
    });
    expect(planRes.ok()).toBeTruthy();
    const planDto = (await planRes.json()) as AccountPlanApiDto;

    const quotaMap = new Map(planDto.quotas.map((q) => [q.quotaCode, q]));
    const adminsQuota = quotaMap.get("Identity.Admins.MaxPerTenant");
    const rolesQuota = quotaMap.get("Identity.Roles.MaxPerTenant");
    const branchesQuota = quotaMap.get("OrganizationCore.Branches.MaxPerTenant");
    const patQuotaRow = quotaMap.get("Integrations.ApiKeys.MaxPerTenant");

    expect(adminsQuota?.isUnlimited).toBe(false);
    expect(adminsQuota?.limit).toBe(25);
    expect(rolesQuota?.isUnlimited).toBe(false);
    expect(rolesQuota?.limit).toBe(10);
    expect(branchesQuota?.isUnlimited).toBe(false);
    expect(branchesQuota?.limit).toBe(3);
    expect(patQuotaRow?.isUnlimited).toBe(false);
    expect([5, 10]).toContain(patQuotaRow?.limit);
    expect(planDto.capabilities.some((c) => c.capabilityCode.includes("Academy.EnrollmentEngine"))).toBe(
      false
    );

    const govRes = await request.get(`${API_URL}/api/v1/account/governance`, {
      headers: { Authorization: `Bearer ${citySession.accessToken}` },
    });
    expect(govRes.ok()).toBeTruthy();
    const govDto = (await govRes.json()) as { isVacationDelegationEnabled?: boolean };
    expect(govDto.isVacationDelegationEnabled).toBe(false);

    // Fail-closed API enforcement check WITH valid Sudo
    const citySudo = await verifyPasswordSudoViaApi(request, citySession.accessToken, standardPassword);
    const blockedDelegationRes = await request.post(`${API_URL}/api/v1/account/governance/actions`, {
      headers: mutationHeaders(citySession.accessToken, { "X-Sudo-Token": citySudo }),
      data: {
        actionType: "DelegateAuthority",
        targetDelegateEmailOrId: "city.assistant@scripe-dev.local",
        permissions: ["users.view"],
        justification: "QA Milestone 9 disabled feature check",
      },
    });
    expect(blockedDelegationRes.status()).toBe(403);
    expect(await blockedDelegationRes.text()).toContain("Entitlements.FeatureDisabled");

    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, cityEmail, standardPassword);

    await page.goto("/account/plan");
    await waitForAppSettled(page);
    const planText = await page.locator("body").innerText();
    expect(planText).toContain("/ 25");
    expect(planText).toContain("/ 10");
    expect(planText).toContain("/ 3");
    expect(planText).not.toContain("Academy.EnrollmentEngine");
    await captureThemePair(page, "24_pro_plan_city", {
      includeArabic: false,
      label: "Pro Plan Quotas",
    });

    await page.goto("/account/governance");
    await waitForAppSettled(page);
    await expect(page.getByTestId("permission-provenance-graph")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("governance-delegations-card")).toHaveCount(0);
    await expect(page.getByTestId("open-grant-delegation-modal-btn")).toHaveCount(0);
    await captureThemePair(page, "25_pro_governance_no_delegation", {
      includeArabic: false,
      label: "Pro Governance Disabled Delegation Hidden",
    });
  });

  test("Case C — Starter/Free (community.admin): nav hides Integrations, FeatureUnavailableGate + hidden 2FA/SSO + 403 fail-closed APIs", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    const commSession = await loginViaApi(request, communityEmail, standardPassword);
    const ctxRes = await request.get(`${API_URL}/api/v1/account/context`, {
      headers: { Authorization: `Bearer ${commSession.accessToken}` },
    });
    expect(ctxRes.ok()).toBeTruthy();
    const ctxDto = (await ctxRes.json()) as {
      featureFlags?: {
        integrationsEnabled: boolean;
        twoFactorEnabled: boolean;
        externalSsoEnabled: boolean;
        vacationDelegationEnabled: boolean;
      };
    };
    expect(ctxDto.featureFlags?.integrationsEnabled).toBe(false);
    expect(ctxDto.featureFlags?.twoFactorEnabled).toBe(false);
    expect(ctxDto.featureFlags?.externalSsoEnabled).toBe(false);
    expect(ctxDto.featureFlags?.vacationDelegationEnabled).toBe(false);

    // Fail-closed PAT creation check WITH valid Sudo
    const commSudo = await verifyPasswordSudoViaApi(request, commSession.accessToken, standardPassword);
    const blockedPatRes = await request.post(`${API_URL}/api/v1/account/integrations`, {
      headers: mutationHeaders(commSession.accessToken, { "X-Sudo-Token": commSudo }),
      data: {
        itemType: "PAT",
        name: "QA Free Tier Denied PAT",
        scopes: ["profile.read"],
        expiresInDays: 30,
      },
    });
    expect(blockedPatRes.status()).toBe(403);
    expect(await blockedPatRes.text()).toContain("Entitlements.FeatureDisabled");

    // Fail-closed 2FA enable check
    const blocked2faRes = await request.post(`${API_URL}/api/v1/auth/admin/2fa/enable`, {
      headers: mutationHeaders(commSession.accessToken),
    });
    expect(blocked2faRes.status()).toBe(403);
    expect(await blocked2faRes.text()).toMatch(
      /Entitlements\.FeatureDisabled|Error\.Forbidden|not available/i
    );

    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, communityEmail, standardPassword);

    await page.goto("/account/security");
    await waitForAppSettled(page);
    await expect(page.locator('a[href="/account/integrations"]')).toHaveCount(0);
    await expect(page.getByTestId("connected-enterprise-sso-card")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Two-Factor Authentication|المصادقة الثنائية/i })).toHaveCount(0);
    await expect(page.locator("text=/^Two-Factor Authentication$/")).toHaveCount(0);
    await captureThemePair(page, "26_free_security_and_nav_community", {
      includeArabic: true,
      label: "Free Security & Nav Gating",
    });

    await page.goto("/account/integrations");
    await waitForAppSettled(page);
    await expect(page.getByTestId("feature-unavailable-gate")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("open-create-pat-modal-btn")).toHaveCount(0);
    await expect(page.getByTestId("integrations-pat-console-card")).toHaveCount(0);
    await captureThemePair(page, "27_free_integrations_gate_community", {
      includeArabic: false,
      label: "Free Integrations Unavailable Gate",
    });
  });

  test("Case D — Live Override Management -> Quota Enforcement (UI + API QuotaExceeded) -> Clean Restore", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    const platformSession = await loginViaApi(request, platformAdminEmail, standardPassword, true);
    const citySession = await loginViaApi(request, cityEmail, standardPassword, false);

    const cityCtxRes = await request.get(`${API_URL}/api/v1/account/context`, {
      headers: { Authorization: `Bearer ${citySession.accessToken}` },
    });
    expect(cityCtxRes.ok()).toBeTruthy();
    const cityCtx = (await cityCtxRes.json()) as {
      principalContext?: { activeTenantId?: string };
    };
    const cityTenantId = cityCtx.principalContext?.activeTenantId;
    expect(cityTenantId).toBeTruthy();

    const featRes = await request.get(
      `${API_URL}/api/v1/features?search=Integrations.ApiKeys.MaxPerTenant&pageSize=20`,
      { headers: { Authorization: `Bearer ${platformSession.accessToken}` } }
    );
    expect(featRes.ok()).toBeTruthy();
    const featBody = (await featRes.json()) as {
      items?: Array<{ id: string; name: string }>;
    };
    const maxPatFeature = featBody.items?.find((f) => f.name === "Integrations.ApiKeys.MaxPerTenant");
    expect(maxPatFeature?.id).toBeTruthy();
    const featureId = maxPatFeature!.id;

    // Check pre-existing override & PAT count
    const preOverridesRes = await request.get(
      `${API_URL}/api/v1/tenants/${cityTenantId}/features/overrides`,
      { headers: { Authorization: `Bearer ${platformSession.accessToken}` } }
    );
    expect(preOverridesRes.ok()).toBeTruthy();
    const preOverrides = (await preOverridesRes.json()) as Array<{
      featureId?: string;
      featureName?: string;
      value?: string;
      reason?: string;
    }>;
    const prevOverride = preOverrides.find(
      (o) => o.featureName === "Integrations.ApiKeys.MaxPerTenant" || o.featureId === featureId
    );

    const preIntRes = await request.get(`${API_URL}/api/v1/account/integrations`, {
      headers: { Authorization: `Bearer ${citySession.accessToken}` },
    });
    expect(preIntRes.ok()).toBeTruthy();
    const preIntDto = (await preIntRes.json()) as AccountIntegrationsApiDto;
    const preActiveCount = preIntDto.patQuota?.activeCount ?? preIntDto.personalAccessTokens.length;
    const preMaxLimit = preIntDto.patQuota?.maxLimit;
    const tempLimit = Math.max(1, preActiveCount + 1);

    let createdPatId: string | null = null;
    let restoreResStatus = 0;
    let restoreResBody = "";
    const patName = `QA Override Quota PAT ${Date.now().toString().slice(-6)}`;

    try {
      // Apply temporary tight override = preActiveCount + 1
      const setOverrideRes = await request.put(
        `${API_URL}/api/v1/tenants/${cityTenantId}/features/${featureId}`,
        {
          headers: mutationHeaders(platformSession.accessToken),
          data: {
            value: String(tempLimit),
            reason: "QA Milestone 9 temporary PAT quota enforcement verification",
          },
        }
      );
      expect(
        setOverrideRes.ok(),
        `SetOverride failed: ${setOverrideRes.status()} ${await setOverrideRes.text()}`
      ).toBeTruthy();

      await clearBrowserSessionPreservingPage(page);
      await loginViaUi(page, cityEmail, standardPassword);

      await page.goto("/account/integrations");
      await waitForAppSettled(page);
      await expect(page.getByTestId("integrations-active-pats-value")).toContainText(
        `${preActiveCount} / ${tempLimit}`,
        { timeout: 15_000 }
      );

      // Mint 1 PAT via Dedicated Studio UI -> exhausts temporary quota
      await page.getByTestId("open-create-pat-modal-btn").click();
      await page.waitForURL("**/account/integrations/new", { timeout: 10_000 });
      await expect(page.getByTestId("create-pat-name-input")).toBeVisible({ timeout: 10_000 });
      await page.getByTestId("create-pat-name-input").fill(patName);
      await page.getByTestId("review-create-pat-btn").click();
      await expect(page.getByTestId("confirm-create-pat-btn")).toBeVisible({ timeout: 5_000 });
      await page.getByTestId("confirm-create-pat-btn").click();

      const sudoModal = page.getByTestId("sudo-verification-modal");
      if (await sudoModal.waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false)) {
        const pwdTab = page.getByTestId("sudo-tab-password");
        if (await pwdTab.isVisible().catch(() => false)) {
          await pwdTab.click();
        }
        await expect(page.getByTestId("sudo-password-input")).toBeVisible({ timeout: 10_000 });
        await page.getByTestId("sudo-password-input").fill(standardPassword);
        await page.getByTestId("sudo-verify-submit-btn").click();
        await expect(sudoModal).toBeHidden({ timeout: 15_000 });
      }

      await page.waitForURL("**/account/integrations", { timeout: 15_000 });
      await expect(page.getByTestId("one-time-pat-secret-value")).toBeVisible({ timeout: 15_000 });
      await page.getByTestId("dismiss-pat-secret-btn").click();
      await expect(page.getByTestId("one-time-pat-secret-value")).toHaveCount(0);

      const mintedRow = page.locator('[data-testid^="pat-row-"]').filter({ hasText: patName }).first();
      await expect(mintedRow).toBeVisible({ timeout: 15_000 });
      const mintedTestId = (await mintedRow.getAttribute("data-testid")) || "";
      createdPatId = mintedTestId.replace("pat-row-", "");

      // UI MUST now enforce exhausted quota state cleanly
      await expect(page.getByTestId("integrations-active-pats-value")).toContainText(
        `${tempLimit} / ${tempLimit}`,
        { timeout: 15_000 }
      );
      await expect(page.getByTestId("pat-quota-reached-badge")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("pat-quota-reached-hint")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("open-create-pat-modal-btn")).toBeDisabled();

      await captureThemePair(page, "28_pro_pat_quota_exhausted_city", {
        includeArabic: false,
        label: "Pro PAT Quota Exhausted via Live Override",
      });

      // Verify /account/plan reflects temp override & exhausted usage immediately
      await page.goto("/account/plan");
      await waitForAppSettled(page);
      const planBody = await page.locator("body").innerText();
      expect(planBody).toContain("Integrations.ApiKeys.MaxPerTenant");
      expect(planBody).toContain(`${tempLimit} / ${tempLimit}`);

      // Verify direct API PAT creation FAILS with 400/422 QuotaExceeded
      const citySudo = await verifyPasswordSudoViaApi(
        request,
        citySession.accessToken,
        standardPassword
      );
      const overQuotaRes = await request.post(`${API_URL}/api/v1/account/integrations`, {
        headers: mutationHeaders(citySession.accessToken, { "X-Sudo-Token": citySudo }),
        data: {
          itemType: "PAT",
          name: "QA Over Quota Blocked PAT",
          scopes: ["profile.read"],
          expiresInDays: 30,
        },
      });
      expect([400, 422]).toContain(overQuotaRes.status());
      const overQuotaBody = await overQuotaRes.text();
      expect(overQuotaBody).toMatch(/QuotaExceeded|quota/i);
    } finally {
      if (createdPatId) {
        const cleanupSudo = await verifyPasswordSudoViaApi(
          request,
          citySession.accessToken,
          standardPassword
        ).catch(() => "");
        if (cleanupSudo) {
          const patDelRes = await request.delete(
            `${API_URL}/api/v1/account/integrations/pat/${createdPatId}`,
            { headers: mutationHeaders(citySession.accessToken, { "X-Sudo-Token": cleanupSudo }) }
          );
          if (!patDelRes.ok()) {
            restoreResStatus = patDelRes.status();
            restoreResBody = await patDelRes.text().catch(() => "");
          }
        }
      }

      const ovrRestoreRes = prevOverride?.value
        ? await request.put(`${API_URL}/api/v1/tenants/${cityTenantId}/features/${featureId}`, {
            headers: mutationHeaders(platformSession.accessToken),
            data: {
              value: prevOverride.value,
              reason: prevOverride.reason || "Restore pre-test override",
            },
          })
        : await request.delete(
            `${API_URL}/api/v1/tenants/${cityTenantId}/features/${featureId}`,
            { headers: mutationHeaders(platformSession.accessToken) }
          );
      if (!ovrRestoreRes.ok()) {
        restoreResStatus = ovrRestoreRes.status();
        restoreResBody = await ovrRestoreRes.text().catch(() => "");
      }
    }

    expect(
      restoreResStatus,
      `Override/PAT restore failed: ${restoreResStatus} ${restoreResBody}`
    ).toBe(0);

    // Confirm full clean restoration
    const restoredIntRes = await request.get(`${API_URL}/api/v1/account/integrations`, {
      headers: { Authorization: `Bearer ${citySession.accessToken}` },
    });
    expect(restoredIntRes.ok()).toBeTruthy();
    const restoredIntDto = (await restoredIntRes.json()) as AccountIntegrationsApiDto;
    expect(restoredIntDto.patQuota?.activeCount).toBe(preActiveCount);
    expect(restoredIntDto.patQuota?.maxLimit).toBe(preMaxLimit);

    expect(
      apiErrors,
      `Observed HTTP >= 500 server error(s): ${JSON.stringify(apiErrors)}`
    ).toHaveLength(0);
  });
});
