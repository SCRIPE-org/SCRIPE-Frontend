import { test, expect, type Page, type BrowserContext, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

/**
 * SCRIPE Sovereign Account World, FIDO2 WebAuthn Passkeys, Sudo & UX Redemption
 * Real Runtime Unmocked E2E & Visual Audit Suite
 *
 * Strictly unmocked against live ASP.NET Core (:5035) + Next.js (:3000):
 * - Zero page.route() API mocks.
 * - Real Chromium CDP Virtual Authenticator (WebAuthn.enable + addVirtualAuthenticator).
 * - Full Light Theme, Dark Theme, English LTR, Arabic RTL & Modal screenshot captures.
 * - Security guardrails: MustChangePassword 403, Sudo replay/anti-downgrade/forged-token rejection,
 *   PAT escalated-scope rejection, Break-Glass non-escalation, zero mock data leakage,
 *   Preferences FIFO 0x HTTP 409 conflicts, Emergency Lockdown token revocation.
 */

const API_URL = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5035";
const SCREENSHOT_DIR = path.resolve(
  process.cwd(),
  "e2e-evidence",
  "account-world-uat",
  "screenshots"
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const FORBIDDEN_MOCK_STRINGS = [
  "al-ahly.org",
  // "EMP-AHLY-1042" omitted: legitimately seeded DB custom-field value in CustomFieldsDevDataSeeder.cs:668
  "4,980",
  "197.38.14.88",
  "842-910",
];

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

async function waitForAppSettled(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
    .waitFor({ state: "detached", timeout: 30_000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(250);
}

async function assertNoForbiddenMockText(page: Page, contextLabel: string) {
  const bodyText = await page.locator("body").innerText();
  for (const mock of FORBIDDEN_MOCK_STRINGS) {
    expect(
      bodyText,
      `Forbidden mock string '${mock}' leaked on ${contextLabel}`
    ).not.toContain(mock);
  }
}

async function assertNoHorizontalOverflow(page: Page, contextLabel: string) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow detected on ${contextLabel}: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
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
    await assertNoForbiddenMockText(page, `${label} (AR)`);

    await setTheme(page, "light");
    await assertNoHorizontalOverflow(page, `${label} (AR Light)`);
    await safeScreenshot(page, `${baseName}_ar_light.png`, fullPage);

    await setTheme(page, "dark");
    await assertNoHorizontalOverflow(page, `${label} (AR Dark)`);
    await safeScreenshot(page, `${baseName}_ar_dark.png`, fullPage);

    await setLanguageAndReload(page, "en");
  }

  await setTheme(page, "dark");
}

async function loginViaUi(page: Page, identifier: string, password: string) {
  await page.goto("/login");
  await waitForAppSettled(page);

  await expect(page.locator("#identifier")).toBeVisible({ timeout: 15_000 });
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);

  const submitBtn = page.locator("form button[type='submit']").first();
  await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
  await submitBtn.click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
  await waitForAppSettled(page);
}

async function clearBrowserSessionPreservingPage(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore if blank
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

const apiLoginCache = new Map<
  string,
  {
    accessToken: string;
    refreshToken?: string;
    mustChangePassword?: boolean;
  }
>();

async function loginViaApi(
  request: APIRequestContext,
  identifier: string,
  password: string,
  isPlatformAdmin = false
) {
  const cacheKey = `${identifier}::${password}::${isPlatformAdmin ? "1" : "0"}`;
  const cached = apiLoginCache.get(cacheKey);
  if (cached && !cached.mustChangePassword) {
    const probe = await request.get(`${API_URL}/api/v1/account/security`, {
      headers: { Authorization: `Bearer ${cached.accessToken}` },
    });
    if (probe.ok()) {
      return cached;
    }
    apiLoginCache.delete(cacheKey);
  }

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
    const payload = (await res.json()) as {
      accessToken: string;
      refreshToken?: string;
      mustChangePassword?: boolean;
    };
    if (!payload.mustChangePassword) {
      apiLoginCache.set(cacheKey, payload);
    }
    return payload;
  }
  throw new Error(`API login exhausted retries for ${identifier}`);
}

async function createEphemeralTenantAdmin(
  request: APIRequestContext,
  ahlyToken: string,
  opts: { username: string; email: string; password: string; mustChangePassword: boolean }
): Promise<string> {
  let roleIds: string[] = [];
  const rolesRes = await request.get(`${API_URL}/api/v1/roles/current-tenant`, {
    headers: { Authorization: `Bearer ${ahlyToken}` },
  });
  if (rolesRes.ok()) {
    const rolesBody = await rolesRes.json();
    const list: Array<{ id?: string; name?: string; priority?: number }> = Array.isArray(rolesBody)
      ? rolesBody
      : Array.isArray(rolesBody?.items)
      ? rolesBody.items
      : Array.isArray(rolesBody?.data)
      ? rolesBody.data
      : [];
    const assignableRoles = list.filter((r) => (typeof r.priority === "number" ? r.priority > 0 : !/super|owner/i.test(r.name || "")));
    const bookingRole =
      assignableRoles.find((r) => /booking|coordinator|front|coach/i.test(r.name || "")) ??
      assignableRoles[0];
    if (bookingRole?.id) {
      roleIds = [bookingRole.id];
    }
  }

  const createRes = await request.post(`${API_URL}/api/v1/admins/current-tenant`, {
    headers: mutationHeaders(ahlyToken),
    data: {
      username: opts.username,
      password: opts.password,
      firstName: "QA",
      lastName: "Ephemeral",
      phoneNumber: "+201055501999",
      email: opts.email,
      notes: "Created by account-world-uat.spec.ts",
      roleIds,
      userGroupIds: [],
      sendSetupEmail: false,
      mustChangePassword: opts.mustChangePassword,
    },
  });
  expect(
    createRes.ok(),
    `Failed creating ephemeral admin ${opts.username}: ${createRes.status()} ${await createRes.text()}`
  ).toBeTruthy();
  const body = (await createRes.json()) as { id: string };
  expect(body.id).toBeTruthy();
  return body.id;
}

test.describe("SCRIPE Sovereign Account World, Passkeys, Sudo & UX Redemption (Live Unmocked UAT)", () => {
  test.describe.configure({ mode: "serial", timeout: 360_000 });

  const runTag = Date.now().toString().slice(-6);
  const standardPassword = getDevAdminPassword();
  const ahlyAdminEmail = "ahly.admin@scripe-dev.local";
  const platformAdminEmail = "admin-seif@scripe.org";

  const createdAdminIds: string[] = [];
  const apiErrors: Array<{ url: string; status: number }> = [];

  function trackServerErrors(page: Page) {
    page.on("response", (res) => {
      if (res.status() >= 500 && !res.url().includes("favicon")) {
        apiErrors.push({ url: res.url(), status: res.status() });
      }
    });
  }

  test.afterAll(async ({ request }) => {
    if (createdAdminIds.length === 0) return;
    try {
      const login = await loginViaApi(request, ahlyAdminEmail, standardPassword);
      for (const id of createdAdminIds) {
        await request.delete(`${API_URL}/api/v1/admins/${id}`, {
          headers: mutationHeaders(login.accessToken),
        });
      }
    } catch {
      // best effort cleanup
    }
  });

  test("1. First-Login MustChangePassword Gate: 403 MUST_CHANGE_PASSWORD enforcement + /change-password live 5-rule rotation", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    const ahlySession = await loginViaApi(request, ahlyAdminEmail, standardPassword);
    const mcpUsername = `uat_mcp_${runTag}`;
    const mcpEmail = `uat.mcp.${runTag}@scripe-dev.local`;
    const mcpId = await createEphemeralTenantAdmin(request, ahlySession.accessToken, {
      username: mcpUsername,
      email: mcpEmail,
      password: standardPassword,
      mustChangePassword: true,
    });
    createdAdminIds.push(mcpId);

    // API gate check BEFORE password rotation
    const preChangeLogin = await loginViaApi(request, mcpEmail, standardPassword);
    expect(preChangeLogin.mustChangePassword).toBe(true);

    const blockedSecRes = await request.get(`${API_URL}/api/v1/account/security`, {
      headers: { Authorization: `Bearer ${preChangeLogin.accessToken}` },
    });
    expect(blockedSecRes.status()).toBe(403);
    const blockedText = await blockedSecRes.text();
    expect(blockedText).toContain("MUST_CHANGE_PASSWORD");

    // Browser first-login redirect to /change-password
    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, mcpEmail, standardPassword);
    await page.waitForURL((url) => url.pathname.includes("/change-password"), { timeout: 20_000 });

    const newInput = page.getByTestId("force-new-password");
    const confirmInput = page.getByTestId("force-confirm-password");
    const submitBtn = page.getByTestId("force-change-submit");
    await expect(newInput).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Weak input must keep submit disabled
    await newInput.fill("weak");
    await confirmInput.fill("weak");
    await expect(submitBtn).toBeDisabled();

    // Capture Light / Dark / AR RTL on /change-password
    const strongRotatedPassword = `${standardPassword}!Uat${runTag}`;
    await newInput.fill(strongRotatedPassword);
    await confirmInput.fill(strongRotatedPassword);

    for (const rule of ["minLength", "uppercase", "lowercase", "number", "special"]) {
      await expect(page.getByTestId(`pwd-rule-${rule}`)).toBeVisible();
    }
    await expect(submitBtn).toBeEnabled();

    await captureThemePair(page, "01_force_change_password", {
      includeArabic: true,
      label: "/change-password",
    });

    // Re-fill after AR reload and submit password rotation
    await page.getByTestId("force-new-password").fill(strongRotatedPassword);
    await page.getByTestId("force-confirm-password").fill(strongRotatedPassword);
    await expect(page.getByTestId("force-change-submit")).toBeEnabled();
    await page.getByTestId("force-change-submit").click();

    await page.waitForURL((url) => !url.pathname.includes("/change-password"), { timeout: 25_000 });
    await waitForAppSettled(page);

    // Post-rotation API login must clear mustChangePassword and allow /account/security
    const postChangeLogin = await loginViaApi(request, mcpEmail, strongRotatedPassword);
    expect(postChangeLogin.mustChangePassword ?? false).toBe(false);
    const unlockedSecRes = await request.get(`${API_URL}/api/v1/account/security`, {
      headers: { Authorization: `Bearer ${postChangeLogin.accessToken}` },
    });
    expect(unlockedSecRes.status()).toBe(200);
  });

  test("2. Real Browser FIDO2 Passkey Enrollment -> Passkey Login -> Unified Sudo Step-Up -> Rename -> Delete -> Security Replay/Forged Checks", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    const passkeyLabel = `QA Platform Key ${runTag}`;
    const renamedLabel = `QA Renamed Key ${runTag}`;

    // Real Chromium CDP WebAuthn Virtual Authenticator attached to the active page
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

    try {
      await clearBrowserSessionPreservingPage(page);
      await loginViaUi(page, ahlyAdminEmail, standardPassword);
      await page.goto("/account/security");
      await waitForAppSettled(page);
      await assertNoForbiddenMockText(page, "/account/security");

      // Open 3-mode Passkey Enrollment Wizard & capture modal screenshots
      await page.getByTestId("open-enroll-passkey-btn").click();
      await expect(page.getByTestId("passkey-option-platform")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("passkey-option-hybrid")).toBeVisible();
      await expect(page.getByTestId("passkey-option-security-key")).toBeVisible();

      await captureThemePair(page, "02_enroll_passkey_3mode_modal", {
        fullPage: false,
        label: "Enroll Passkey 3-Mode Modal",
      });

      await page.getByTestId("passkey-option-platform").click();
      await page.getByTestId("passkey-name-input").fill(passkeyLabel);
      await page.getByTestId("passkey-activate-btn").click();

      await expect(page.getByTestId("passkey-done-btn")).toBeVisible({ timeout: 20_000 });
      await page.getByTestId("passkey-done-btn").click();

      // Verify real credential saved inside Chromium virtual authenticator AND rendered in UI
      const { credentials } = await cdp.send("WebAuthn.getCredentials", { authenticatorId });
      expect(credentials.length).toBeGreaterThanOrEqual(1);

      const enrolledRow = page.locator('[data-testid^="passkey-row-"]').filter({ hasText: passkeyLabel }).first();
      await expect(enrolledRow).toBeVisible({ timeout: 15_000 });
      const enrolledTestId = (await enrolledRow.getAttribute("data-testid")) || "";
      const passkeyId = enrolledTestId.replace("passkey-row-", "");
      expect(passkeyId.length).toBeGreaterThan(0);

      // Open (i) Info Popover & capture Security page + Popover screenshots
      await captureThemePair(page, "03_account_security_with_passkey", {
        includeArabic: true,
        label: "/account/security",
      });

      const infoTrigger = page.locator("button:has(svg.lucide-info)").first();
      if (await infoTrigger.isVisible()) {
        await infoTrigger.click();
        await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5_000 }).catch(() => {});
        await captureThemePair(page, "04_info_popover_security", {
          fullPage: false,
          label: "Security (i) Info Popover",
        });
        await page.keyboard.press("Escape");
      }

      // Negative API security checks: forged X-Sudo-Token + invalid Sudo challenge replay
      const apiSession = await loginViaApi(request, ahlyAdminEmail, standardPassword);
      const forgedSudoDelete = await request.delete(
        `${API_URL}/api/v1/auth/passkeys/${passkeyId}`,
        {
          headers: mutationHeaders(apiSession.accessToken, {
            "X-Sudo-Token": "forged.sudo.token.payload",
          }),
        }
      );
      expect([401, 403]).toContain(forgedSudoDelete.status());

      const badSudoChallenge = await request.post(`${API_URL}/api/v1/auth/sudo/verify`, {
        headers: mutationHeaders(apiSession.accessToken),
        data: {
          method: "passkey",
          passkeyAssertion: {
            credentialIdBase64: "AAAA",
            authenticatorDataBase64: "AAAA",
            clientDataJsonBase64: "AAAA",
            signatureBase64: "AAAA",
            challengeToken: "tampered.challenge.token",
          },
        },
      });
      expect(badSudoChallenge.ok()).toBeFalsy();
      expect(badSudoChallenge.status()).toBeLessThan(500);

      // Sign out WITHOUT closing page -> Sign back in via REAL WebAuthn Passkey on /login
      await clearBrowserSessionPreservingPage(page);
      await page.goto("/login");
      await waitForAppSettled(page);

      await page.locator("#identifier").fill(ahlyAdminEmail);
      await page.getByTestId("login-passkey-chip").click();
      await expect(page.getByTestId("passkey-authenticate-btn")).toBeVisible({ timeout: 10_000 });
      await captureThemePair(page, "05_login_passkey_prompt", {
        fullPage: false,
        label: "/login Passkey Prompt",
      });

      await page.getByTestId("passkey-authenticate-btn").click();
      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 25_000 });
      await waitForAppSettled(page);

      // Navigate back to /account/security & verify Passkey Sudo Step-Up Modal
      await page.goto("/account/security");
      await waitForAppSettled(page);

      // Ensure Sudo is locked before testing step-up
      const lockBtn = page.getByTestId("lock-sudo-security-btn");
      if (await lockBtn.isVisible().catch(() => false)) {
        await lockBtn.click();
        await page.waitForTimeout(400);
      }

      await page.getByTestId("step-up-sudo-btn").click();
      const sudoModal = page.getByTestId("sudo-verification-modal");
      await expect(sudoModal).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("sudo-panel-passkey")).toBeVisible({ timeout: 10_000 });

      await captureThemePair(page, "06_unified_sudo_modal", {
        fullPage: false,
        label: "Unified Sudo Verification Modal",
      });

      await page.getByTestId("sudo-verify-submit-btn").click();
      await expect(sudoModal).toBeHidden({ timeout: 20_000 });
      await expect(page.getByTestId("sudo-mode-badge")).toBeVisible({ timeout: 10_000 });

      // Rename Passkey & verify persistence across reload
      await page.getByTestId(`rename-passkey-btn-${passkeyId}`).click();
      await expect(page.locator("#rename-passkey-input")).toBeVisible({ timeout: 10_000 });
      await captureThemePair(page, "07_rename_passkey_modal", {
        fullPage: false,
        label: "Rename Passkey Modal",
      });
      await page.locator("#rename-passkey-input").fill(renamedLabel);
      await page.locator('[role="dialog"] button[type="submit"]').click();
      await expect(page.getByTestId(`passkey-row-${passkeyId}`)).toContainText(renamedLabel, {
        timeout: 15_000,
      });

      await page.reload();
      await waitForAppSettled(page);
      await expect(page.getByTestId(`passkey-row-${passkeyId}`)).toContainText(renamedLabel);

      // Delete Passkey (with Last-Credential confirmation warning) & verify deletion persists
      await page.getByTestId(`delete-passkey-btn-${passkeyId}`).click();
      await expect(page.getByTestId("confirm-delete-passkey-btn")).toBeVisible({ timeout: 10_000 });
      await captureThemePair(page, "08_delete_passkey_modal", {
        fullPage: false,
        label: "Delete Passkey Confirmation Modal",
      });
      await page.getByTestId("confirm-delete-passkey-btn").click();
      await expect(page.getByTestId(`passkey-row-${passkeyId}`)).toHaveCount(0, {
        timeout: 15_000,
      });

      await page.reload();
      await waitForAppSettled(page);
      await expect(page.getByTestId(`passkey-row-${passkeyId}`)).toHaveCount(0);

      // Lock active Sudo cleanly
      const hudLock = page.getByTestId("hud-lock-sudo-btn");
      if (await hudLock.isVisible().catch(() => false)) {
        await hudLock.click();
        await page.waitForTimeout(300);
      }
    } finally {
      await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId }).catch(() => {});
      await cdp.detach().catch(() => {});
    }
  });

  test("3. Strict Platform vs Tenant Separation (/account/dossier, /account/plan, /account/governance)", async ({
    page,
    browser,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    // 3A. Tenant Admin (ahly.admin) Dossier + Plan
    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, ahlyAdminEmail, standardPassword);

    await page.goto("/account/dossier");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "Tenant /account/dossier");
    await expect(page.getByTestId("dossier-club-memberships-card")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("dossier-platform-authority-card")).toHaveCount(0);
    await captureThemePair(page, "09_account_dossier_tenant", {
      includeArabic: true,
      label: "Tenant /account/dossier",
    });

    await page.goto("/account/plan");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "Tenant /account/plan");
    await expect(page.getByTestId("account-plan-edition-banner")).toBeVisible({ timeout: 15_000 });
    await captureThemePair(page, "10_account_plan", {
      includeArabic: true,
      label: "/account/plan",
    });

    // 3B. Platform SuperAdmin (admin-seif@scripe.org) strictly separated from Tenant Club/Plan
    const platContext: BrowserContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const platPage = await platContext.newPage();
    trackServerErrors(platPage);

    try {
      await loginViaUi(platPage, platformAdminEmail, standardPassword);
      await platPage.goto("/account/dossier");
      await waitForAppSettled(platPage);
      await assertNoForbiddenMockText(platPage, "Platform /account/dossier");

      await expect(platPage.getByTestId("dossier-platform-authority-card")).toBeVisible({
        timeout: 15_000,
      });
      await expect(platPage.getByTestId("dossier-club-memberships-card")).toHaveCount(0);
      await expect(platPage.locator('a[href="/account/plan"]')).toHaveCount(0);

      await captureThemePair(platPage, "11_platform_superadmin_dossier", {
        label: "Platform SuperAdmin /account/dossier",
      });

      // Platform admin visiting /account/plan must NOT render tenant billing UI
      await platPage.goto("/account/plan");
      await waitForAppSettled(platPage);
      await expect(platPage.getByTestId("account-plan-edition-banner")).toHaveCount(0);
    } finally {
      await platContext.close();
    }
  });

  test("4. Governance: Colleague Search, Grant Delegation, Sudo-Gated Revoke & Break-Glass Non-Escalation", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, ahlyAdminEmail, standardPassword);
    await page.goto("/account/governance");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "/account/governance");

    await expect(page.getByTestId("permission-provenance-graph")).toBeVisible({ timeout: 15_000 });
    await captureThemePair(page, "12_account_governance", {
      includeArabic: true,
      label: "/account/governance",
    });

    // Grant Delegation Modal -> Colleague search -> Exclude self -> Select colleague & scope -> Submit
    await page.getByTestId("open-grant-delegation-modal-btn").click();
    await expect(page.getByTestId("colleague-search-input")).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("colleague-search-input").fill("booking");
    await page.waitForTimeout(500);

    const colleagueOptions = page.locator('[data-testid^="colleague-option-"]');
    await expect(colleagueOptions.first()).toBeVisible({ timeout: 10_000 });
    const allColleagueText = await colleagueOptions.allInnerTexts();
    for (const txt of allColleagueText) {
      expect(txt.toLowerCase()).not.toContain(ahlyAdminEmail);
    }

    await captureThemePair(page, "13_grant_delegation_modal", {
      fullPage: false,
      label: "Grant Delegation Modal",
    });

    await colleagueOptions.first().click();

    const firstScopeCheckbox = page.locator('[role="dialog"] button[role="checkbox"]').first();
    await expect(firstScopeCheckbox).toBeVisible({ timeout: 5_000 });
    await firstScopeCheckbox.click();

    const justification = `UAT Delegation Coverage ${runTag}`;
    await page.getByTestId("delegation-justification-input").fill(justification);
    await page.getByTestId("confirm-grant-delegation-btn").click();

    // Complete Sudo prompt if triggered
    const sudoModal = page.getByTestId("sudo-verification-modal");
    if (await sudoModal.waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false)) {
      const pwdTab = page.getByTestId("sudo-tab-password");
      if (await pwdTab.isVisible().catch(() => false)) {
        await pwdTab.click();
      }
      await page.getByTestId("sudo-password-input").fill(standardPassword);
      await page.getByTestId("sudo-verify-submit-btn").click();
      await expect(sudoModal).toBeHidden({ timeout: 15_000 });
    }

    const grantedRow = page
      .locator('[data-testid^="delegation-row-"]')
      .filter({ hasText: justification })
      .first();
    await expect(grantedRow).toBeVisible({ timeout: 15_000 });
    const rowTestId = (await grantedRow.getAttribute("data-testid")) || "";
    const delegationId = rowTestId.replace("delegation-row-", "");

    // Verify persistence across reload, then Sudo-gated Revoke
    await page.reload();
    await waitForAppSettled(page);
    await expect(page.getByTestId(`delegation-row-${delegationId}`)).toBeVisible({ timeout: 15_000 });

    await page.getByTestId(`revoke-delegation-btn-${delegationId}`).click();
    await page.getByTestId("confirm-revoke-delegation-btn").click();

    if (await sudoModal.waitFor({ state: "visible", timeout: 3_000 }).then(() => true).catch(() => false)) {
      const pwdTab = page.getByTestId("sudo-tab-password");
      if (await pwdTab.isVisible().catch(() => false)) {
        await pwdTab.click();
      }
      await page.getByTestId("sudo-password-input").fill(standardPassword);
      await page.getByTestId("sudo-verify-submit-btn").click();
      await expect(sudoModal).toBeHidden({ timeout: 15_000 });
    }

    await expect(page.getByTestId(`revoke-delegation-btn-${delegationId}`)).toHaveCount(0, {
      timeout: 15_000,
    });
    const revokedRow = page.getByTestId(`delegation-row-${delegationId}`);
    if ((await revokedRow.count()) > 0) {
      await expect(revokedRow).toContainText(/revoked|ملغى/i, { timeout: 10_000 });
    }

    // Break-Glass Non-Escalation Check: tenant non-root admin CANNOT mint privileges via incident string (test past Sudo!)
    const bookingSession = await loginViaApi(request, "ahly.booking@scripe-dev.local", standardPassword);
    const bookingSudoRes = await request.post(`${API_URL}/api/v1/auth/sudo/verify`, {
      headers: mutationHeaders(bookingSession.accessToken),
      data: { method: "password", password: standardPassword },
    });
    expect(bookingSudoRes.ok()).toBeTruthy();
    const { sudoToken: bookingSudoToken } = (await bookingSudoRes.json()) as { sudoToken: string };

    const govBeforeRes = await request.get(`${API_URL}/api/v1/account/governance`, {
      headers: { Authorization: `Bearer ${bookingSession.accessToken}` },
    });
    expect(govBeforeRes.ok()).toBeTruthy();
    const govBefore = (await govBeforeRes.json()) as { effectivePermissions?: unknown[] };

    const bgAttempt = await request.post(`${API_URL}/api/v1/account/governance/actions`, {
      headers: mutationHeaders(bookingSession.accessToken, {
        "X-Sudo-Token": bookingSudoToken,
      }),
      data: {
        actionType: "BreakGlass",
        incidentTicketId: `INC-${runTag}`,
        justification: "Attempt unauthorized privilege escalation via ticket string",
        permissions: ["identity.roles.manage"],
      },
    });
    expect(bgAttempt.status()).toBe(403);

    const govAfterRes = await request.get(`${API_URL}/api/v1/account/governance`, {
      headers: { Authorization: `Bearer ${bookingSession.accessToken}` },
    });
    const govAfter = (await govAfterRes.json()) as { effectivePermissions?: unknown[] };
    expect(govAfter.effectivePermissions?.length).toBe(govBefore.effectivePermissions?.length);
  });

  test("5. Integrations: Backend-Derived PAT Scopes, Least-Privilege Guard, One-Time Secret Copy, Roll & Revoke", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, ahlyAdminEmail, standardPassword);
    await page.goto("/account/integrations");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "/account/integrations");

    await captureThemePair(page, "14_account_integrations", {
      includeArabic: true,
      label: "/account/integrations",
    });

    // Security check: direct API call (past Sudo) requesting forbidden escalated scope must return 403
    const apiSession = await loginViaApi(request, ahlyAdminEmail, standardPassword);
    const sudoRes = await request.post(`${API_URL}/api/v1/auth/sudo/verify`, {
      headers: mutationHeaders(apiSession.accessToken),
      data: { method: "password", password: standardPassword },
    });
    expect(sudoRes.ok()).toBeTruthy();
    const { sudoToken } = (await sudoRes.json()) as { sudoToken: string };

    const escalatedPatRes = await request.post(`${API_URL}/api/v1/account/integrations`, {
      headers: mutationHeaders(apiSession.accessToken, {
        "X-Sudo-Token": sudoToken,
      }),
      data: {
        itemType: "PAT",
        name: `Escalated-${runTag}`,
        scopes: ["platform.tenants.delete.everything"],
        expiresInDays: 30,
      },
    });
    expect(escalatedPatRes.status()).toBe(403);

    // Navigate to Dedicated GitHub+ Create PAT Studio (/account/integrations/new)
    const patName = `QA Service Key ${runTag}`;
    await page.getByTestId("open-create-pat-modal-btn").click();
    await page.waitForURL("**/account/integrations/new", { timeout: 10_000 });
    await waitForAppSettled(page);
    await expect(page.getByTestId("create-pat-name-input")).toBeVisible({ timeout: 10_000 });

    // Capture full Studio in EN & AR before entering transient form values (setLanguageAndReload reloads page)
    await captureThemePair(page, "15_create_pat_studio", {
      includeArabic: true,
      fullPage: true,
      label: "GitHub+ PAT Create Studio (/account/integrations/new)",
    });

    // Focused element screenshot of ONLY the Permission Studio in Arabic & English (unstick top header only during element crop)
    await page.evaluate(() => window.scrollTo(0, 0));
    await setLanguageAndReload(page, "ar");
    await setTheme(page, "dark");
    const firstScopeRowAr = page.locator('[data-testid^="pat-scope-row-"]').first();
    await expect(firstScopeRowAr).toBeVisible({ timeout: 5_000 });
    await expect(firstScopeRowAr).toContainText(/[\u0600-\u06FF]/);
    await page.evaluate(() => {
      const h = document.querySelector("header");
      if (h) h.setAttribute("data-e2e-prev-pos", h.style.position || "");
      if (h) h.style.position = "static";
    });
    try {
      await firstScopeRowAr
        .locator("xpath=ancestor::div[contains(@class,'bg-nx-surface')][1]")
        .screenshot({ path: path.join(SCREENSHOT_DIR, "pat_part_only_studio_ar_dark.png") });
    } finally {
      await page.evaluate(() => {
        const h = document.querySelector("header");
        if (h) {
          h.style.position = h.getAttribute("data-e2e-prev-pos") || "";
          h.removeAttribute("data-e2e-prev-pos");
        }
      });
    }

    await setLanguageAndReload(page, "en");
    await setTheme(page, "dark");
    const studioCardEn = page
      .locator('[data-testid="pat-scope-search-input"]')
      .locator("xpath=ancestor::div[contains(@class,'bg-nx-surface')][1]");
    await expect(studioCardEn).toBeVisible({ timeout: 5_000 });
    await page.evaluate(() => {
      const h = document.querySelector("header");
      if (h) h.setAttribute("data-e2e-prev-pos", h.style.position || "");
      if (h) h.style.position = "static";
    });
    try {
      await studioCardEn.screenshot({
        path: path.join(SCREENSHOT_DIR, "pat_part_only_studio_en_dark.png"),
      });
    } finally {
      await page.evaluate(() => {
        const h = document.querySelector("header");
        if (h) {
          h.style.position = h.getAttribute("data-e2e-prev-pos") || "";
          h.removeAttribute("data-e2e-prev-pos");
        }
      });
    }

    await page.getByTestId("create-pat-name-input").fill(patName);
    await page
      .getByTestId("create-pat-description-input")
      .fill("Automated analytics telemetry & CI runner credential");
    await page.getByTestId("create-pat-cidr-input").fill("127.0.0.1/32");

    const patScopeCheckbox = page.locator('[data-testid^="pat-scope-checkbox-"]').first();
    await expect(patScopeCheckbox).toBeVisible({ timeout: 5_000 });
    const scopeAriaChecked = await patScopeCheckbox.getAttribute("aria-checked");
    const scopeDataState = await patScopeCheckbox.getAttribute("data-state");
    if (scopeAriaChecked !== "true" && scopeDataState !== "checked") {
      await patScopeCheckbox.click();
    }
    await expect(patScopeCheckbox).toHaveAttribute("aria-checked", "true");

    await page.getByTestId("review-create-pat-btn").click();
    await expect(page.getByTestId("pat-review-generate-modal")).toBeVisible({ timeout: 5_000 });
    await page
      .getByTestId("pat-review-generate-modal")
      .screenshot({ path: path.join(SCREENSHOT_DIR, "pat_part_only_review_modal_en_dark.png") });
    await page.getByTestId("confirm-create-pat-btn").click();

    const sudoModal = page.getByTestId("sudo-verification-modal");
    if (await sudoModal.waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false)) {
      const pwdTab = page.getByTestId("sudo-tab-password");
      if (await pwdTab.isVisible().catch(() => false)) {
        await pwdTab.click();
      }
      await page.getByTestId("sudo-password-input").fill(standardPassword);
      await page.getByTestId("sudo-verify-submit-btn").click();
      await expect(sudoModal).toBeHidden({ timeout: 15_000 });
    }

    // Inline GitHub-style One-Time Secret Banner on /account/integrations
    await page.waitForURL("**/account/integrations", { timeout: 15_000 });
    await expect(page.getByTestId("one-time-pat-secret-value")).toBeVisible({ timeout: 15_000 });
    const mintedSecret = (await page.getByTestId("one-time-pat-secret-value").innerText()).trim();
    expect(mintedSecret.length).toBeGreaterThan(16);

    await page
      .getByTestId("one-time-pat-secret-banner")
      .screenshot({ path: path.join(SCREENSHOT_DIR, "pat_part_only_secret_banner_en_dark.png") });
    await captureThemePair(page, "16_one_time_pat_secret_banner", {
      fullPage: false,
      label: "GitHub+ One-Time PAT Secret Banner",
    });

    await page.getByTestId("copy-one-time-pat-secret-btn").click();
    await page.getByTestId("dismiss-pat-secret-btn").click();
    await expect(page.getByTestId("one-time-pat-secret-value")).toHaveCount(0);

    // Verify PAT row renders with localized scope badges & navigate to dedicated /account/integrations/[id] Detail Page
    const patRow = page.locator('[data-testid^="pat-row-"]').filter({ hasText: patName }).first();
    await expect(patRow).toBeVisible({ timeout: 15_000 });
    await patRow.screenshot({
      path: path.join(SCREENSHOT_DIR, "pat_part_only_list_row_en_dark.png"),
    });
    const patId = ((await patRow.getAttribute("data-testid")) || "").replace("pat-row-", "");

    await page.getByTestId(`configure-pat-btn-${patId}`).click();
    await page.waitForURL("**/account/integrations/*", { timeout: 10_000 });
    await waitForAppSettled(page);
    await expect(page.getByTestId("pat-detail-permissions-card")).toBeVisible({ timeout: 10_000 });

    // Test Edit Token Policy (PUT /api/v1/account/integrations/pats/{id} with RowVersion)
    await page.getByTestId("edit-pat-policy-btn").click();
    await expect(page.getByTestId("create-pat-description-input")).toBeVisible({ timeout: 5_000 });
    await page
      .getByTestId("create-pat-description-input")
      .fill("Updated CI telemetry & audit integration policy");
    await page.getByTestId("save-pat-policy-btn").click();
    await expect(page.getByTestId("pat-detail-permissions-card")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("body")).toContainText(
      "Updated CI telemetry & audit integration policy"
    );

    await page.evaluate(() => window.scrollTo(0, 0));
    await captureThemePair(page, "16b_pat_detail_page", {
      includeArabic: true,
      fullPage: true,
      label: "PAT Detail & Quick-Start Page",
    });

    await page.getByTestId(`roll-pat-btn-${patId}`).click();
    await expect(page.getByTestId("confirm-roll-pat-btn")).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("confirm-roll-pat-btn").click();

    if (await sudoModal.waitFor({ state: "visible", timeout: 3_000 }).then(() => true).catch(() => false)) {
      const pwdTab = page.getByTestId("sudo-tab-password");
      if (await pwdTab.isVisible().catch(() => false)) {
        await pwdTab.click();
      }
      await page.getByTestId("sudo-password-input").fill(standardPassword);
      await page.getByTestId("sudo-verify-submit-btn").click();
      await expect(sudoModal).toBeHidden({ timeout: 15_000 });
    }

    await expect(page.getByTestId("one-time-pat-secret-value")).toBeVisible({ timeout: 15_000 });
    const rolledSecret = (await page.getByTestId("one-time-pat-secret-value").innerText()).trim();
    expect(rolledSecret).not.toBe(mintedSecret);
    await page.getByTestId("dismiss-pat-secret-btn").click();

    // Revoke PAT from Detail page -> redirects cleanly to /account/integrations
    await page.getByTestId(`revoke-pat-btn-${patId}`).click();
    await expect(page.getByTestId("confirm-revoke-pat-btn")).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("confirm-revoke-pat-btn").click();

    if (await sudoModal.waitFor({ state: "visible", timeout: 3_000 }).then(() => true).catch(() => false)) {
      const pwdTab = page.getByTestId("sudo-tab-password");
      if (await pwdTab.isVisible().catch(() => false)) {
        await pwdTab.click();
      }
      await page.getByTestId("sudo-password-input").fill(standardPassword);
      await page.getByTestId("sudo-verify-submit-btn").click();
      await expect(sudoModal).toBeHidden({ timeout: 15_000 });
    }

    await page.waitForURL("**/account/integrations", { timeout: 15_000 });
    await expect(page.getByTestId(`pat-row-${patId}`)).toHaveCount(0, { timeout: 15_000 });
  });

  test("6. Preferences FIFO RowVersion Queue (5+ Rapid Burst Toggles = Zero HTTP 409) & Visual Audit", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    const conflictResponses: Array<{ url: string; status: number }> = [];
    page.on("response", (res) => {
      if (res.url().includes("/account/preferences") && res.status() === 409) {
        conflictResponses.push({ url: res.url(), status: res.status() });
      }
    });

    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, ahlyAdminEmail, standardPassword);
    await page.goto("/account/preferences");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "/account/preferences");

    // Rapid burst toggles verifying sequential FIFO RowVersion queue (zero 409)
    await page.getByTestId("density-compact").click();
    await page.locator('[data-testid^="accent-hue-"]').nth(1).click();
    await page.getByTestId("toast-position-top-end").click();
    await page.getByTestId("density-comfortable").click();
    await page.getByTestId("accent-hue-signal-lime").click();
    await page.getByTestId("theme-mode-dark").click();

    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("preferences-save-error-alert")).toHaveCount(0);
    expect(
      conflictResponses,
      `Detected HTTP 409 conflict(s) during rapid preferences toggles: ${JSON.stringify(conflictResponses)}`
    ).toHaveLength(0);

    await page.getByTestId("trigger-smart-test-toast-btn").click();
    await captureThemePair(page, "17_account_preferences", {
      includeArabic: true,
      label: "/account/preferences",
    });

    // Ensure English + clean baseline persisted
    await page.getByTestId("language-en").click();
    await page.waitForLoadState("networkidle");
  });

  test("7. Notifications Quiet Hours, Activity Filters/CorrelationId/Pagination, Sessions Fleet & Emergency Lockdown Revocation", async ({
    page,
    request,
    browser,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    trackServerErrors(page);

    await clearBrowserSessionPreservingPage(page);
    await loginViaUi(page, ahlyAdminEmail, standardPassword);

    // 7A. Notifications
    await page.goto("/account/notifications");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "/account/notifications");
    await expect(page.getByTestId("quiet-hours-local-preview")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("send-test-notification-btn").click();
    await page.getByTestId("save-notifications-btn").click();
    await page.waitForLoadState("networkidle");
    await captureThemePair(page, "18_account_notifications", {
      includeArabic: true,
      label: "/account/notifications",
    });

    // 7B. Activity
    await page.goto("/account/activity");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "/account/activity");
    await page.getByTestId("activity-range-24h").click();
    await page.waitForLoadState("networkidle");
    await page.getByTestId("activity-range-all").click();
    await page.waitForLoadState("networkidle");

    const corrBadge = page.locator('[data-testid^="activity-correlation-"]').first();
    if (await corrBadge.isVisible().catch(() => false)) {
      const corrText = (await corrBadge.innerText()).trim();
      await page.getByTestId("activity-search-input").fill(corrText);
      await page.waitForTimeout(500);
      await page.getByTestId("activity-search-input").fill("");
      await page.waitForTimeout(400);
    }

    await captureThemePair(page, "19_account_activity", {
      includeArabic: true,
      label: "/account/activity",
    });

    // 7C. Sessions
    await page.goto("/account/sessions");
    await waitForAppSettled(page);
    await assertNoForbiddenMockText(page, "/account/sessions");
    await captureThemePair(page, "20_account_sessions", {
      includeArabic: true,
      label: "/account/sessions",
    });

    // 7D. Emergency Lockdown using dedicated ephemeral admin -> captures modal + confirms immediate 401 & /login redirect
    const ahlySession = await loginViaApi(request, ahlyAdminEmail, standardPassword);
    const lockUsername = `uat_lock_${runTag}`;
    const lockEmail = `uat.lock.${runTag}@scripe-dev.local`;
    const lockId = await createEphemeralTenantAdmin(request, ahlySession.accessToken, {
      username: lockUsername,
      email: lockEmail,
      password: standardPassword,
      mustChangePassword: false,
    });
    createdAdminIds.push(lockId);

    const preLockSession = await loginViaApi(request, lockEmail, standardPassword);
    const lockCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const lockPage = await lockCtx.newPage();
    trackServerErrors(lockPage);

    try {
      await loginViaUi(lockPage, lockEmail, standardPassword);
      await lockPage.goto("/account/security");
      await waitForAppSettled(lockPage);

      await lockPage.getByTestId("trigger-lockdown-btn").click();
      await expect(lockPage.locator("#lockdown-confirm")).toBeVisible({ timeout: 10_000 });
      await captureThemePair(lockPage, "21_emergency_lockdown_modal", {
        fullPage: false,
        label: "Emergency Lockdown Modal",
      });

      await lockPage.locator("#lockdown-confirm").fill("LOCKDOWN");
      const lockdownConfirmBtn = lockPage
        .locator('[role="dialog"] button')
        .filter({ hasNotText: /cancel|إلغاء|close|إغلاق/i })
        .last();
      await expect(lockdownConfirmBtn).toBeEnabled({ timeout: 5_000 });
      await lockdownConfirmBtn.click();

      // UpdateAccountSecurityCommand enforces ISovereignSudoProtectedCommand -> auto-opens Sudo modal if not yet elevated
      const lockSudoModal = lockPage.getByTestId("sudo-verification-modal");
      if (await lockSudoModal.waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false)) {
        const pwdTab = lockPage.getByTestId("sudo-tab-password");
        if (await pwdTab.isVisible().catch(() => false)) {
          await pwdTab.click();
        }
        await lockPage.getByTestId("sudo-password-input").fill(standardPassword);
        await lockPage.getByTestId("sudo-verify-submit-btn").click();
      }

      // Must revoke all sessions, wipe local auth state, and redirect cleanly to /login
      await lockPage.waitForURL((url) => url.pathname.includes("/login"), { timeout: 25_000 });

      // Old JWT access token must immediately fail with 401 on subsequent API call
      const postLockRes = await request.get(`${API_URL}/api/v1/account/security`, {
        headers: { Authorization: `Bearer ${preLockSession.accessToken}` },
      });
      expect([401, 403]).toContain(postLockRes.status());
    } finally {
      await lockCtx.close();
    }

    // Assert zero HTTP >= 500 responses occurred across any page/action in this entire UAT suite
    expect(
      apiErrors,
      `Observed HTTP >= 500 server error(s): ${JSON.stringify(apiErrors)}`
    ).toHaveLength(0);
  });
});
