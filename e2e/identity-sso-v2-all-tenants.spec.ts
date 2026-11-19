import { test, expect, type Page, type APIRequestContext, type Response } from "@playwright/test";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { getDevAdminPassword } from "./helpers/auth-credentials";

/**
 * SCRIPE Identity & Multi-Tenant SSO Remediation V2 — All-Tenants Live Unmocked Verification Suite
 *
 * Strictly unmocked E2E + live API PBAC verification against:
 * - Backend API: http://localhost:5035
 * - Frontend Web: http://localhost:3000
 *
 * Asserts 0 uncaught pageerrors and 0 HTTP 500+ responses across every test,
 * and captures 21 numbered full-resolution PNG screenshots into BOTH evidence directories.
 */

const API_URL = process.env.E2E_API_URL || "http://localhost:5035";
const PRIMARY_SCREENSHOT_DIR =
  "d:/01_PROJECTS/SCRIPE/SCRIPE-CRM/EXECUTION_REPORTS/IDENTITY_SSO_REMEDIATION_V2/screenshots";
const MIRROR_SCREENSHOT_DIR =
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/3bbd5292-7bc2-4f8e-9528-5ebfb39de33e/screenshots_v2";

for (const dir of [PRIMARY_SCREENSHOT_DIR, MIRROR_SCREENSHOT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const AHLY_ADMIN_EMAIL = "ahly.admin@scripe-dev.local";
const PLATFORM_ADMIN_ID = "superadmin";

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
    if (res.status() >= 500) {
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
          // ignore transient lock
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

async function gotoLoginWithDiscovery(page: Page, url: string) {
  let brandingPayload: Record<string, unknown> | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const brandingPromise = page
      .waitForResponse(
        (res) =>
          (res.url().includes("/customization/resolve") ||
            res.url().includes("/branding") ||
            res.url().includes("/tenants/resolve")) &&
          res.request().method() === "GET",
        { timeout: 10_000 }
      )
      .catch(() => null);

    const ssoResPromise = page
      .waitForResponse((res) => res.url().includes("/api/v1/auth/oidc/providers/"), {
        timeout: 10_000,
      })
      .catch(() => null);

    await page.goto(url);
    const [brandingRes, ssoRes] = await Promise.all([brandingPromise, ssoResPromise]);
    await waitForAppSettled(page);

    if (ssoRes && ssoRes.status() === 429 && attempt < 2) {
      const retrySec = Number(ssoRes.headers()["retry-after"] || "62");
      await page.waitForTimeout(Math.min(Math.max(retrySec + 2, 15), 310) * 1000);
      continue;
    }

    if (brandingRes && brandingRes.ok()) {
      try {
        const json = (await brandingRes.json()) as Record<string, unknown>;
        brandingPayload = (json.data as Record<string, unknown>) ?? json;
      } catch {
        // non-JSON ignored
      }
    }
    return { brandingPayload, ssoStatus: ssoRes?.status() ?? null };
  }
  return { brandingPayload, ssoStatus: null };
}

/**
 * Verifies NO colored circle dots exist inside any SSO button in the grid,
 * and asserts the exact adaptive button geometry.
 */
async function assertSsoGridLayout(
  page: Page,
  options: {
    mode: "2-global" | "1-org-hero+2-global" | "1-org-fullwidth";
    orgLabelRegex?: RegExp;
    maxViewportWidth?: number;
  }
) {
  const grid = page.getByTestId("sso-provider-buttons-grid");
  await expect(grid).toBeVisible({ timeout: 20_000 });

  const buttons = grid.locator("button");
  const expectedCount =
    options.mode === "2-global" ? 2 : options.mode === "1-org-fullwidth" ? 1 : 3;
  await expect(buttons).toHaveCount(expectedCount, { timeout: 15_000 });

  // Assert ZERO colored circle dots inside every SSO button and real SVG/IMG icon present
  const dotViolations = await grid.evaluate((gridEl) => {
    const violations: string[] = [];
    const btns = Array.from(gridEl.querySelectorAll("button"));
    for (const btn of btns) {
      const hasIcon = Boolean(btn.querySelector("svg, img"));
      if (!hasIcon) {
        violations.push(`Missing svg/img icon in button "${btn.textContent?.trim()}"`);
      }
      const spansAndDivs = Array.from(btn.querySelectorAll("span, div"));
      for (const el of spansAndDivs) {
        const cls = el.className?.toString() || "";
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const isCircleDotClass = /\brounded-full\b/.test(cls) && rect.width <= 16 && rect.height <= 16;
        const isSmallColoredCircle =
          rect.width > 0 &&
          rect.width <= 14 &&
          rect.height > 0 &&
          rect.height <= 14 &&
          (style.borderRadius === "50%" || parseFloat(style.borderRadius) >= 999) &&
          style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
          style.backgroundColor !== "transparent";
        if (isCircleDotClass || isSmallColoredCircle) {
          violations.push(
            `Found colored circle dot in button "${btn.textContent?.trim()}": class="${cls}", bg="${style.backgroundColor}"`
          );
        }
      }
    }
    return violations;
  });
  expect(dotViolations, "SSO buttons must NOT contain colored circle dots").toEqual([]);

  // Assert ZERO label clipping (scrollWidth <= clientWidth) on ALL SSO button text spans
  const clippingViolations = await grid.evaluate((gridEl) => {
    const violations: string[] = [];
    const btns = Array.from(gridEl.querySelectorAll("button"));
    for (const btn of btns) {
      const labelSpan = btn.querySelector("span.truncate");
      if (labelSpan && labelSpan.scrollWidth > labelSpan.clientWidth + 2) {
        violations.push(
          `Clipped SSO button label "${labelSpan.textContent?.trim()}": scrollWidth=${labelSpan.scrollWidth} > clientWidth=${labelSpan.clientWidth}`
        );
      }
    }
    return violations;
  });
  expect(clippingViolations, "SSO button labels must NEVER clip/ellipsis").toEqual([]);

  const gridBox = await grid.boundingBox();
  expect(gridBox).toBeTruthy();

  const maxWidth = options.maxViewportWidth ?? 1440;
  const boxes = [];
  for (let i = 0; i < expectedCount; i++) {
    const box = await buttons.nth(i).boundingBox();
    expect(box, `Button #${i} missing bounding box`).toBeTruthy();
    expect(box!.x + box!.width).toBeLessThanOrEqual(maxWidth + 2);
    boxes.push(box!);
  }

  if (options.mode === "2-global") {
    const googleBtn = grid.getByRole("button", { name: /^Google$/i });
    const msBtn = grid.getByRole("button", { name: /^Microsoft$/i });
    await expect(googleBtn).toBeVisible();
    await expect(msBtn).toBeVisible();
    await expect(grid).not.toContainText(/Sign in with/i);
    // Side-by-side on the same row
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(4);
    expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(8);
  } else if (options.mode === "1-org-fullwidth") {
    if (options.orgLabelRegex) {
      await expect(grid.getByRole("button", { name: options.orgLabelRegex })).toBeVisible();
    }
    await expect(grid.getByRole("button", { name: /Google/i })).toHaveCount(0);
    await expect(grid.getByRole("button", { name: /Microsoft/i })).toHaveCount(0);
    // Full width matching grid container
    expect(Math.abs(boxes[0].width - gridBox!.width)).toBeLessThanOrEqual(8);
  } else if (options.mode === "1-org-hero+2-global") {
    const orgBtn = buttons.nth(0);
    if (options.orgLabelRegex) {
      await expect(orgBtn).toContainText(options.orgLabelRegex);
    }
    // Hero col-span-2 badge [Org] / المنظمة
    await expect(orgBtn).toContainText(/Org|المنظمة/i);
    // Hero width spans both columns (> 1.5x of global button width and ~ grid width)
    expect(Math.abs(boxes[0].width - gridBox!.width)).toBeLessThanOrEqual(8);
    expect(boxes[0].width).toBeGreaterThan(boxes[1].width * 1.5);
    // Two concise global providers side-by-side underneath the hero
    await expect(grid.getByRole("button", { name: /^Google$/i })).toBeVisible();
    await expect(grid.getByRole("button", { name: /^Microsoft$/i })).toBeVisible();
    expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 2);
    expect(Math.abs(boxes[1].y - boxes[2].y)).toBeLessThanOrEqual(4);
    expect(Math.abs(boxes[1].width - boxes[2].width)).toBeLessThanOrEqual(8);
  }

  // Zero horizontal page overflow
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 2);
}

async function assertBrandingColorApplied(
  page: Page,
  expectedHex: string,
  brandingPayload: Record<string, unknown> | null
) {
  const normalizedExpected = expectedHex.toLowerCase();
  const payloadHex = String(brandingPayload?.primaryColor ?? "").toLowerCase();

  // Check either live branding API payload or injected <style> / DOM styles
  const domContainsColor = await page.evaluate((hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const rgbSpace = `${r} ${g} ${b}`;
    const stylesText = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent || "")
      .join("\n")
      .toLowerCase();
    const htmlAttrText = document.documentElement.outerHTML.slice(0, 6000).toLowerCase();
    return (
      stylesText.includes(hex) ||
      stylesText.includes(rgb) ||
      stylesText.includes(rgbSpace) ||
      htmlAttrText.includes(hex) ||
      htmlAttrText.includes(rgb)
    );
  }, normalizedExpected);

  expect(
    payloadHex === normalizedExpected || domContainsColor,
    `Expected tenant branding primaryColor ${expectedHex} (payload="${payloadHex}", domMatch=${domContainsColor})`
  ).toBeTruthy();
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
      const retrySec = Number(res.headers()["retry-after"] || "62");
      await new Promise((r) => setTimeout(r, Math.min(Math.max(retrySec + 2, 15), 310) * 1000));
      continue;
    }
    return res;
  }
  return fn();
}

async function verifyPasswordInputToggle(page: Page, inputId: string) {
  const input = page.locator(`#${inputId}`);
  await expect(input).toBeVisible({ timeout: 15_000 });
  await expect(input).toHaveAttribute("type", "password");
  await input.fill("toggle-verification-sample");

  const wrapper = input.locator("xpath=..");
  const toggleBtn = wrapper.locator("button[type='button']").first();
  await expect(toggleBtn).toBeVisible();
  await expect(toggleBtn).toHaveAttribute("aria-pressed", "false");

  await toggleBtn.click();
  await expect(input).toHaveAttribute("type", "text");
  await expect(toggleBtn).toHaveAttribute("aria-pressed", "true");

  await toggleBtn.click();
  await expect(input).toHaveAttribute("type", "password");
  await expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
}

test.describe("SCRIPE Identity & Multi-Tenant SSO V2 — All-Tenants Live Verification", () => {
  test.describe.configure({ mode: "serial", timeout: 480_000 });

  let password = "";
  let platformAccessToken = "";
  let ahlyAccessToken = "";

  const superadminStoragePath = path.resolve(
    process.cwd(),
    "test-results",
    ".v2-superadmin-state.json"
  );
  const ahlyStoragePath = path.resolve(process.cwd(), "test-results", ".v2-ahly-state.json");

  test.beforeAll(() => {
    password = getDevAdminPassword();
    fs.mkdirSync(path.resolve(process.cwd(), "test-results"), { recursive: true });
  });

  // =========================================================================
  // GROUP A: All 6 Tenants + Platform Root + Fail-Closed (1440x900 Dark)
  // =========================================================================
  test("Group A — All 6 Tenants + Platform Root + Subdomain + Fail-Closed (Screenshots 01..08)", async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    try {
      // 01. Platform Root (Dark, 2 global IdPs side-by-side, NO colored circle dots)
      await gotoLoginWithDiscovery(page, "http://localhost:3000/login");
      await resetLanguageCookie(page, "en");
      await setTheme(page, "dark");
      await assertSsoGridLayout(page, { mode: "2-global" });
      await safeScreenshot(page, "01-login-platform-root-dark.png", true);

      // 02. AHLY (?tenant=AHLY, ahly-okta [Org] hero col-span-2 + 2-col Global underneath, #C4122F)
      const ahlyDiscovery = await gotoLoginWithDiscovery(
        page,
        "http://localhost:3000/login?_tenant=AHLY"
      );
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/Al[-\s]Ahly/i, { timeout: 20_000 });
      await assertBrandingColorApplied(page, "#C4122F", ahlyDiscovery.brandingPayload);
      await assertSsoGridLayout(page, {
        mode: "1-org-hero+2-global",
        orgLabelRegex: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i,
      });
      await safeScreenshot(page, "02-login-ahly-dark.png", true);

      // Subdomain resolution verification: http://ahly.localhost:3000/login
      const ahlySubDiscovery = await gotoLoginWithDiscovery(page, "http://ahly.localhost:3000/login");
      await expect(page.locator("body")).toContainText(/Al[-\s]Ahly/i, { timeout: 20_000 });
      await assertBrandingColorApplied(page, "#C4122F", ahlySubDiscovery.brandingPayload);
      await assertSsoGridLayout(page, {
        mode: "1-org-hero+2-global",
        orgLabelRegex: /Ahly Corporate ID|Al Ahly SC Enterprise SSO/i,
      });

      // 03. CITY (2 global side-by-side, #6CABDD)
      const cityDiscovery = await gotoLoginWithDiscovery(
        page,
        "http://localhost:3000/login?_tenant=CITY"
      );
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/City Football/i, { timeout: 20_000 });
      await assertBrandingColorApplied(page, "#6CABDD", cityDiscovery.brandingPayload);
      await assertSsoGridLayout(page, { mode: "2-global" });
      await safeScreenshot(page, "03-login-city-dark.png", true);

      // 04. FALCON (custom mode, 1 org OIDC provider falcon-entra full-width, #E5A93C)
      const falconDiscovery = await gotoLoginWithDiscovery(
        page,
        "http://localhost:3000/login?_tenant=FALCON"
      );
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/Desert Falcons/i, { timeout: 20_000 });
      await assertBrandingColorApplied(page, "#E5A93C", falconDiscovery.brandingPayload);
      await assertSsoGridLayout(page, {
        mode: "1-org-fullwidth",
        orgLabelRegex: /Falcons SSO|Desert Falcons Entra ID/i,
      });
      await safeScreenshot(page, "04-login-falcon-dark.png", true);

      // 05. APEX (2 global side-by-side, #0D9488)
      const apexDiscovery = await gotoLoginWithDiscovery(
        page,
        "http://localhost:3000/login?_tenant=APEX"
      );
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/Apex Aquatics/i, { timeout: 20_000 });
      await assertBrandingColorApplied(page, "#0D9488", apexDiscovery.brandingPayload);
      await assertSsoGridLayout(page, { mode: "2-global" });
      await safeScreenshot(page, "05-login-apex-dark.png", true);

      // 06. COMMUNITY (2 global side-by-side, #16A34A)
      const communityDiscovery = await gotoLoginWithDiscovery(
        page,
        "http://localhost:3000/login?_tenant=COMMUNITY"
      );
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/Community Youth|Alexandria Youth/i, {
        timeout: 20_000,
      });
      await assertBrandingColorApplied(page, "#16A34A", communityDiscovery.brandingPayload);
      await assertSsoGridLayout(page, { mode: "2-global" });
      await safeScreenshot(page, "06-login-community-dark.png", true);

      // 07. ACFC (acfc-saml [Org] SAML 2.0 hero col-span-2 + 2-col Global underneath, #FACC15)
      const acfcDiscovery = await gotoLoginWithDiscovery(
        page,
        "http://localhost:3000/login?_tenant=ACFC"
      );
      await setTheme(page, "dark");
      await expect(page.locator("body")).toContainText(/Arab Contractors|المقاولون/i, {
        timeout: 20_000,
      });
      await assertBrandingColorApplied(page, "#FACC15", acfcDiscovery.brandingPayload);
      await assertSsoGridLayout(page, {
        mode: "1-org-hero+2-global",
        orgLabelRegex: /ACFC SAML ID|Arab Contractors SAML/i,
      });
      await safeScreenshot(page, "07-login-acfc-dark.png", true);

      // 08. UNKNOWN_999 (Not Found / fail-closed, 0 SSO provider buttons)
      await page.goto("http://localhost:3000/login?_tenant=UNKNOWN_999");
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await expect(page.getByRole("heading", { name: /Not Found/i })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("sso-provider-buttons-grid")).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Google/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Microsoft/i })).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: /Ahly|Falcons|ACFC/i })
      ).toHaveCount(0);
      await safeScreenshot(page, "08-login-unknown-failclosed.png", true);

      monitor.assertClean("Group A (All 6 Tenants + Platform Root + Fail-Closed)");
    } finally {
      monitor.detach();
      await context.close();
    }
  });

  // =========================================================================
  // GROUP B: Theme (Light), Arabic RTL & Mobile 375px Responsiveness
  // =========================================================================
  test("Group B — Light Theme, Arabic RTL & Mobile 375px Responsiveness (Screenshots 09..12)", async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    try {
      // 09. ACFC Login in Light theme
      await gotoLoginWithDiscovery(page, "http://localhost:3000/login?_tenant=ACFC");
      await resetLanguageCookie(page, "en");
      await setTheme(page, "light");
      await expect(page.locator("html")).toHaveClass(/light/);
      await assertSsoGridLayout(page, {
        mode: "1-org-hero+2-global",
        orgLabelRegex: /ACFC SAML ID|Arab Contractors SAML/i,
      });
      await safeScreenshot(page, "09-login-acfc-light.png", true);

      // 10. FALCON Login in Light theme
      await gotoLoginWithDiscovery(page, "http://localhost:3000/login?_tenant=FALCON");
      await setTheme(page, "light");
      await expect(page.locator("html")).toHaveClass(/light/);
      await assertSsoGridLayout(page, {
        mode: "1-org-fullwidth",
        orgLabelRegex: /Falcons SSO|Desert Falcons Entra ID/i,
      });
      await safeScreenshot(page, "10-login-falcon-light.png", true);

      // 11. AHLY Login in Arabic (ar, RTL, localized Arabic hero + concise global + RTL password input)
      await gotoLoginWithDiscovery(page, "http://localhost:3000/login?_tenant=AHLY");
      await setTheme(page, "dark");
      await setLanguageAndReload(page, "ar");
      await setTheme(page, "dark");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("body")).toContainText(/[\u0600-\u06FF]/);
      await assertSsoGridLayout(page, {
        mode: "1-org-hero+2-global",
        orgLabelRegex: /تسجيل الدخول عبر.*Ahly Corporate ID/i,
      });

      const arSsoGrid = page.getByTestId("sso-provider-buttons-grid");
      await expect(arSsoGrid).not.toContainText(/Sign in with/i);

      // Verify password input reveal toggle sits on logical end (left half) in RTL
      const pwdBox = await page.locator("#password").boundingBox();
      const pwdToggleBox = await page
        .locator("#password")
        .locator("xpath=..")
        .locator("button[type='button']")
        .first()
        .boundingBox();
      expect(pwdBox && pwdToggleBox).toBeTruthy();
      expect(pwdToggleBox!.x).toBeLessThan(pwdBox!.x + pwdBox!.width / 2);

      await safeScreenshot(page, "11-login-ahly-ar-rtl.png", true);

      // 12. ACFC Login on Mobile 375x812 (EN, Dark, scrollWidth <= innerWidth + 2)
      const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const mobilePage = await mobileContext.newPage();
      const mobileMonitor = attachZeroErrorMonitor(mobilePage);
      try {
        await gotoLoginWithDiscovery(mobilePage, "http://localhost:3000/login?_tenant=ACFC");
        await resetLanguageCookie(mobilePage, "en");
        await setTheme(mobilePage, "dark");
        await assertSsoGridLayout(mobilePage, {
          mode: "1-org-hero+2-global",
          orgLabelRegex: /ACFC SAML ID|Arab Contractors SAML/i,
          maxViewportWidth: 375,
        });
        const mobileOverflow = await mobilePage.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(mobileOverflow.scrollWidth).toBeLessThanOrEqual(mobileOverflow.innerWidth + 2);
        await safeScreenshot(mobilePage, "12-login-acfc-mobile-375.png", true);
        mobileMonitor.assertClean("Group B Mobile 375px");
      } finally {
        mobileMonitor.detach();
        await mobileContext.close();
      }

      monitor.assertClean("Group B (Theme, Arabic RTL & Mobile)");
    } finally {
      monitor.detach();
      await context.close();
    }
  });

  // =========================================================================
  // GROUP C1: Platform Admin (superadmin) — /account/security, /settings/identity-providers, /tenants/[id]
  // =========================================================================
  test("Group C1 — Platform Admin Account Security, IdP Settings & Tenant Governance (Screenshots 13..15)", async ({
    browser,
    request,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    try {
      await clearBrowserSession(page);
      platformAccessToken = await loginViaUi(page, PLATFORM_ADMIN_ID, password);
      expect(platformAccessToken).toBeTruthy();

      // 13. Platform Admin /account/security (real DB IdPs, 0 hardcoded catalog entries)
      await page.goto("/account/security");
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      const ssoCard = page.getByTestId("connected-enterprise-sso-card");
      await expect(ssoCard).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("enterprise-sso-tile-google")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId("enterprise-sso-tile-microsoft")).toBeVisible({
        timeout: 15_000,
      });

      const ssoCardText = await ssoCard.innerText();
      expect(ssoCardText).toContain("Google Workspace SSO");
      expect(ssoCardText).toContain("Microsoft Entra ID");
      expect(ssoCardText).not.toContain("Okta Workforce Identity SAML 2.0");
      expect(ssoCardText).not.toContain("GitHub Enterprise");

      await ssoCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await safeScreenshot(page, "13-platform-admin-account-security.png", true);

      // 14. Platform Admin /settings/identity-providers (search, filter chips, empty state reset, <PasswordInput> toggle)
      await page.goto("/settings/identity-providers");
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      const googleCard = page.getByTestId("identity-provider-card-google");
      const microsoftCard = page.getByTestId("identity-provider-card-microsoft");
      await expect(googleCard).toBeVisible({ timeout: 20_000 });
      await expect(microsoftCard).toBeVisible({ timeout: 20_000 });

      await safeScreenshot(page, "14-platform-admin-idp-settings.png", true);

      // Search input test
      const searchInput = page.getByPlaceholder(/Search identity providers/i);
      await expect(searchInput).toBeVisible();
      await searchInput.fill("Google");
      await expect(googleCard).toBeVisible({ timeout: 10_000 });
      await expect(microsoftCard).toHaveCount(0, { timeout: 10_000 });

      // Empty search state + reset
      await searchInput.fill("zzz-nonexistent-provider-999");
      await expect(page.getByText(/No matching providers/i)).toBeVisible({ timeout: 10_000 });
      const clearFiltersBtn = page.getByRole("button", { name: /Clear filters/i });
      await expect(clearFiltersBtn).toBeVisible();
      await clearFiltersBtn.click();
      await expect(googleCard).toBeVisible({ timeout: 15_000 });
      await expect(microsoftCard).toBeVisible({ timeout: 15_000 });

      // Filter chips test (OIDC -> SAML 2.0 -> All)
      const oidcChip = page.getByRole("button", { name: /^OIDC$/i });
      const samlChip = page.getByRole("button", { name: /^SAML 2\.0$/i });
      const allChip = page.getByRole("button", { name: /^All$/i });
      await oidcChip.click();
      await expect(oidcChip).toHaveAttribute("aria-pressed", "true");
      await expect(googleCard).toBeVisible();

      await samlChip.click();
      await expect(samlChip).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByText(/No matching providers/i)).toBeVisible({ timeout: 5_000 });

      await allChip.click();
      await expect(allChip).toHaveAttribute("aria-pressed", "true");
      await expect(googleCard).toBeVisible();

      // Open Edit view on Google provider and verify <PasswordInput> visibility toggle
      await googleCard.getByRole("button", { name: /Actions/i }).click();
      await page.getByRole("menuitem", { name: /^Edit$/i }).click();
      await waitForAppSettled(page);
      await verifyPasswordInputToggle(page, "idp-clientSecret");

      // 15. Platform Admin /tenants/[id] Governance / Identity Providers tab
      const tenantsRes = await sendSkippingRateLimit(() =>
        request.get(`${API_URL}/api/v1/tenants?pageSize=50`, {
          headers: { Authorization: `Bearer ${platformAccessToken}` },
        })
      );
      expect(tenantsRes.ok(), `Listing tenants failed: ${tenantsRes.status()}`).toBeTruthy();
      const tenantsJson = await tenantsRes.json();
      const tenantsList: Array<{ id: string; code?: string; name?: string }> = Array.isArray(
        tenantsJson
      )
        ? tenantsJson
        : (tenantsJson?.items ?? tenantsJson?.data ?? []);
      const ahlyTenant = tenantsList.find(
        (t) => t.code?.toUpperCase() === "AHLY" || /ahly/i.test(t.name ?? "")
      );
      expect(ahlyTenant?.id, "Al-Ahly tenant not found").toBeTruthy();

      await page.goto(`/tenants/${ahlyTenant!.id}`);
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      const idpTab = page.getByRole("tab", { name: /Identity Providers/i });
      await expect(idpTab).toBeVisible({ timeout: 20_000 });
      await idpTab.click();
      await waitForAppSettled(page);

      await expect(page.locator("body")).toContainText("Al Ahly SC Enterprise SSO", {
        timeout: 15_000,
      });
      await safeScreenshot(page, "15-platform-admin-tenant-governance-tab.png", true);

      // Open Create Identity Provider dialog on Governance tab and verify <PasswordInput> toggle
      const addProviderBtn = page.getByRole("button", { name: /Add (Identity )?Provider/i });
      await expect(addProviderBtn).toBeVisible();
      await addProviderBtn.click();
      const idpDialog = page.getByRole("dialog");
      await expect(idpDialog).toBeVisible({ timeout: 10_000 });
      await verifyPasswordInputToggle(page, "tenant-idp-client-secret");
      await idpDialog.getByRole("button", { name: /Cancel/i }).click();
      await expect(idpDialog).toBeHidden({ timeout: 10_000 });

      // Verify Settings tab -> Edit Security -> Identity Provider Mode selector is accessible
      const settingsTab = page.getByRole("tab", { name: /Settings/i });
      await settingsTab.click();
      await waitForAppSettled(page);
      const editSecurityBtn = page
        .getByRole("tabpanel", { name: /Settings/i })
        .locator("xpath=//div[contains(., 'Security')]/following-sibling::button[@aria-label='Edit']");
      await expect(editSecurityBtn).toBeVisible({ timeout: 15_000 });
      await editSecurityBtn.click();
      await expect(page.locator("#dialog-idp-mode")).toBeVisible({ timeout: 10_000 });
      await page.keyboard.press("Escape");

      await context.storageState({ path: superadminStoragePath });
      monitor.assertClean("Group C1 (Platform Admin Flows)");
    } finally {
      monitor.detach();
      await context.close();
    }
  });

  // =========================================================================
  // GROUP C2: Tenant Admin (ahly.admin) Account Security (Dark/Light/AR) & IdP Settings
  // =========================================================================
  test("Group C2 — Tenant Admin Account Security (Dark/Light/AR) & IdP Settings (Screenshots 16..19)", async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    try {
      await clearBrowserSession(page);
      ahlyAccessToken = await loginViaUi(page, AHLY_ADMIN_EMAIL, password);
      expect(ahlyAccessToken).toBeTruthy();

      // 16. ahly.admin /account/security Dark mode
      await page.goto("/account/security");
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      const ssoCard = page.getByTestId("connected-enterprise-sso-card");
      await expect(ssoCard).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("enterprise-sso-tile-ahly-okta")).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("enterprise-sso-tile-google")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId("enterprise-sso-tile-microsoft")).toBeVisible({
        timeout: 15_000,
      });

      const cardText = await ssoCard.innerText();
      expect(cardText).toContain("Al Ahly SC Enterprise SSO");
      expect(cardText).toContain("Google Workspace SSO");
      expect(cardText).toContain("Microsoft Entra ID");
      expect(cardText).not.toContain("Okta Workforce Identity SAML 2.0");
      expect(cardText).not.toContain("GitHub Enterprise");

      await ssoCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await safeScreenshot(page, "16-ahly-admin-account-security-dark.png", true);

      // 17. ahly.admin /account/security Light mode
      await setTheme(page, "light");
      await expect(page.locator("html")).toHaveClass(/light/);
      await safeScreenshot(page, "17-ahly-admin-account-security-light.png", true);

      // 18. ahly.admin /account/security Arabic RTL mode
      await setTheme(page, "dark");
      await setLanguageAndReload(page, "ar");
      await setTheme(page, "dark");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.getByTestId("connected-enterprise-sso-card")).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.getByTestId("connected-enterprise-sso-card")).toContainText(
        /[\u0600-\u06FF]/
      );
      await safeScreenshot(page, "18-ahly-admin-account-security-ar-rtl.png", true);

      // Restore EN before visiting IdP Settings
      await setLanguageAndReload(page, "en");
      await setTheme(page, "dark");

      // 19. Tenant Admin /settings/identity-providers (search filter + live provider cards)
      await page.goto("/settings/identity-providers");
      await waitForAppSettled(page);
      await setTheme(page, "dark");

      const ahlyCard = page.getByTestId("identity-provider-card-ahly-okta");
      await expect(ahlyCard).toBeVisible({ timeout: 20_000 });
      await expect(ahlyCard).toContainText("Al Ahly SC Enterprise SSO");
      await safeScreenshot(page, "19-ahly-admin-idp-settings.png", true);

      const searchInput = page.getByPlaceholder(/Search identity providers/i);
      await searchInput.fill("Al Ahly");
      await expect(ahlyCard).toBeVisible({ timeout: 10_000 });

      await searchInput.fill("zzz-no-tenant-idp-999");
      await expect(page.getByText(/No matching providers/i)).toBeVisible({ timeout: 10_000 });
      await page.getByRole("button", { name: /Clear filters/i }).click();
      await expect(ahlyCard).toBeVisible({ timeout: 15_000 });

      await context.storageState({ path: ahlyStoragePath });
      monitor.assertClean("Group C2 (Tenant Admin Security + IdP Settings)");
    } finally {
      monitor.detach();
      await context.close();
    }
  });

  // =========================================================================
  // GROUP C3: Passkey Enrollment -> Reload -> Real Backend Sign Out -> Passkey Login
  // =========================================================================
  test("Group C3 — Passkey Enrollment, Reload Persistence, Real Backend Logout & Passkey Login (Screenshots 20..21)", async ({
    browser,
  }) => {
    const context = fs.existsSync(ahlyStoragePath)
      ? await browser.newContext({
          viewport: { width: 1440, height: 900 },
          storageState: ahlyStoragePath,
        })
      : await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const monitor = attachZeroErrorMonitor(page);

    const cdp = await context.newCDPSession(page);
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

    const passkeyLabel = `QA V2 Passkey ${Date.now().toString().slice(-6)}`;

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
      for (let attempt = 0; attempt < 3; attempt++) {
        await expect(verifyBtn.first()).toBeEnabled({ timeout: 5_000 });
        const sudoResPromise = page
          .waitForResponse(
            (res) =>
              (res.url().includes("/sudo/verify") || res.url().includes("/sudo-verify")) &&
              res.request().method() === "POST",
            { timeout: 15_000 }
          )
          .catch(() => null);
        await verifyBtn.first().click();
        const sudoRes = await sudoResPromise;
        if (sudoRes && sudoRes.status() === 429 && attempt < 2) {
          const retrySec = Number(sudoRes.headers()["retry-after"] || "62");
          await page.waitForTimeout(Math.min(Math.max(retrySec + 2, 15), 310) * 1000);
          continue;
        }
        break;
      }
      await expect(sudoDialog.first()).toBeHidden({ timeout: 20_000 });
    }

    try {
      await page.goto("/account/security");
      await waitForAppSettled(page);
      if (page.url().includes("/login")) {
        ahlyAccessToken = await loginViaUi(page, AHLY_ADMIN_EMAIL, password);
        await page.goto("/account/security");
        await waitForAppSettled(page);
      }
      await setTheme(page, "dark");

      // Enroll Passkey via CDP WebAuthn virtual authenticator
      await page.getByTestId("open-enroll-passkey-btn").click();
      await expect(page.getByTestId("passkey-option-platform")).toBeVisible({ timeout: 10_000 });
      await page.getByTestId("passkey-option-platform").click();
      await page.getByTestId("passkey-name-input").fill(passkeyLabel);
      await page.getByTestId("passkey-activate-btn").click();

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
      const enrolledPasskeyId = rowAttr.replace("passkey-row-", "");
      expect(enrolledPasskeyId.length).toBeGreaterThan(0);

      // Reload page to verify DB persistence of the newly enrolled passkey
      await page.reload();
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await expect(page.getByTestId(`passkey-row-${enrolledPasskeyId}`)).toContainText(
        passkeyLabel,
        { timeout: 15_000 }
      );

      // Click Sign Out in Account Console ((account)/layout.tsx) & assert real POST .../logout succeeds
      const userMenuBtn = page.locator('header button[aria-haspopup="menu"]').last();
      await expect(userMenuBtn).toBeVisible({ timeout: 10_000 });
      await userMenuBtn.click();

      const signOutItem = page.getByRole("menuitem", { name: /sign out|log out|تسجيل الخروج/i });
      await expect(signOutItem).toBeVisible({ timeout: 5_000 });

      const logoutResponsePromise = page.waitForResponse(
        (res) => res.url().includes("/logout") && res.request().method() === "POST",
        { timeout: 15_000 }
      );
      await signOutItem.click();
      const logoutRes = await logoutResponsePromise;
      expect(
        logoutRes.ok(),
        `Real backend POST .../logout failed: ${logoutRes.status()}`
      ).toBeTruthy();

      // Step 4.4: Verify POST /api/v1/auth/admin/logout expires/clears scripe_sudo_token cookie
      const logoutAllHeaders = await logoutRes.headersArray();
      const sudoSetCookieHeaders = logoutAllHeaders
        .filter((h) => h.name.toLowerCase() === "set-cookie" && h.value.includes("scripe_sudo_token"))
        .map((h) => h.value);
      const cookiesAfterLogout = await context.cookies();
      const activeSudoCookie = cookiesAfterLogout.find(
        (c) => c.name === "scripe_sudo_token" && c.value.length > 0
      );
      expect(
        activeSudoCookie,
        `scripe_sudo_token cookie must be cleared after logout (Set-Cookie: ${JSON.stringify(sudoSetCookieHeaders)})`
      ).toBeUndefined();
      if (sudoSetCookieHeaders.length > 0) {
        expect(sudoSetCookieHeaders.join("; ")).toMatch(/expires=Thu, 01 Jan 1970|max-age=0|scripe_sudo_token=;/i);
      }

      await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 20_000 });
      await waitForAppSettled(page);

      // Assert auth storage cleared
      const authStateAfterLogout = await page.evaluate(() => {
        const rawStore =
          localStorage.getItem("scripe-app-storage") || localStorage.getItem("app-storage") || "";
        const accessTok =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("accessToken") ||
          "";
        return { rawStore, accessTok };
      });
      expect(authStateAfterLogout.accessTok).toBe("");
      expect(authStateAfterLogout.rawStore).not.toContain('"isAuthenticated":true');

      // 20. Capture post-logout /login screen
      await setTheme(page, "dark");
      await safeScreenshot(page, "20-post-logout-login.png", true);

      // Verify unauthenticated visit to /account/security redirects back to /login
      await page.goto("/account/security");
      await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 15_000 });
      await waitForAppSettled(page);

      // 21. Authenticate back in via the enrolled WebAuthn Passkey
      await page.locator("#identifier").fill(AHLY_ADMIN_EMAIL);
      await page.getByTestId("login-passkey-chip").click();
      await expect(page.getByTestId("passkey-authenticate-btn")).toBeVisible({ timeout: 10_000 });
      await page.getByTestId("passkey-authenticate-btn").click();

      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 25_000 });
      await waitForAppSettled(page);

      // Verify session is active and passkey still persists on /account/security
      await page.goto("/account/security");
      await waitForAppSettled(page);
      await setTheme(page, "dark");
      await expect(page.getByTestId(`passkey-row-${enrolledPasskeyId}`)).toContainText(
        passkeyLabel,
        { timeout: 15_000 }
      );
      await safeScreenshot(page, "21-post-passkey-login.png", true);

      // Step 4.4: Verify Sudo-protected passkey revocation after Passkey re-login completes cleanly
      // via Biometric Sudo with ZERO Identity.SudoSessionMismatch 403 responses
      const sudoMismatch403s: string[] = [];
      const onSudoCheckResponse = async (res: Response) => {
        if (res.status() === 403 && res.url().includes("/passkeys")) {
          const txt = await res.text().catch(() => "");
          if (txt.includes("SudoSessionMismatch") || txt.includes("different administrator")) {
            sudoMismatch403s.push(`${res.status()} ${res.url()} -> ${txt}`);
          }
        }
      };
      page.on("response", onSudoCheckResponse);
      try {
        const deleteBtn = page.getByTestId(`delete-passkey-btn-${enrolledPasskeyId}`);
        await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
        await deleteBtn.click();

        const confirmDeleteBtn = page.getByTestId("confirm-delete-passkey-btn");
        await expect(confirmDeleteBtn).toBeVisible({ timeout: 5_000 });
        await confirmDeleteBtn.click();

        await satisfySudoModalIfPrompted();

        await expect(page.getByTestId(`passkey-row-${enrolledPasskeyId}`)).toHaveCount(0, {
          timeout: 15_000,
        });
      } finally {
        page.off("response", onSudoCheckResponse);
      }
      expect(
        sudoMismatch403s,
        "Passkey revocation after logout+re-login must have 0 Identity.SudoSessionMismatch 403s"
      ).toEqual([]);

      monitor.assertClean("Group C3 (Passkey + Real Backend Logout + Passkey Login + Sudo Revoke)");
    } finally {
      monitor.detach();
      await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId }).catch(() => {});
      await cdp.detach().catch(() => {});
      await context.close();
    }
  });

  // =========================================================================
  // GROUP C4: Live PBAC 403/404 Cross-Tenant & Platform Global IdP Enforcement
  // =========================================================================
  test("Group C4 — PBAC 403/404 Enforcement for Tenant Admin Against Foreign & Platform Global IdPs", async ({
    request,
  }) => {
    // Obtain fresh tokens if not already cached (e.g. if test run solo)
    async function ensureApiToken(identifier: string, isPlatformAdmin: boolean): Promise<string> {
      const res = await sendSkippingRateLimit(() =>
        request.post(`${API_URL}/api/v1/auth/admin/login`, {
          data: { identifier, password, isPlatformAdmin },
        })
      );
      expect(res.ok(), `API login failed for ${identifier}: ${res.status()}`).toBeTruthy();
      const body = (await res.json()) as { accessToken?: string; data?: { accessToken?: string } };
      return body.accessToken ?? body.data?.accessToken ?? "";
    }

    const platTok = platformAccessToken || (await ensureApiToken(PLATFORM_ADMIN_ID, true));
    // Re-login ahly.admin because Group C3 performed a real backend logout that revoked the earlier session!
    const tenantTok = await ensureApiToken(AHLY_ADMIN_EMAIL, false);
    expect(platTok).toBeTruthy();
    expect(tenantTok).toBeTruthy();

    // 1) Resolve foreign tenant (FALCON) and its IdP (falcon-entra) + Platform Global IdP (google)
    const tenantsRes = await request.get(`${API_URL}/api/v1/tenants?pageSize=50`, {
      headers: { Authorization: `Bearer ${platTok}` },
    });
    expect(tenantsRes.ok()).toBeTruthy();
    const tenantsBody = await tenantsRes.json();
    const tenants: Array<{ id: string; code?: string }> = Array.isArray(tenantsBody)
      ? tenantsBody
      : (tenantsBody?.items ?? tenantsBody?.data ?? []);

    const falconTenant = tenants.find((t) => t.code?.toUpperCase() === "FALCON");
    expect(falconTenant?.id, "FALCON tenant must exist").toBeTruthy();

    const falconIdpsRes = await request.get(
      `${API_URL}/api/v1/tenants/${falconTenant!.id}/identity-providers`,
      { headers: { Authorization: `Bearer ${platTok}` } }
    );
    expect(falconIdpsRes.ok()).toBeTruthy();
    const falconIdpsBody = await falconIdpsRes.json();
    const falconIdps: Array<{ id: string; slug?: string }> = Array.isArray(falconIdpsBody)
      ? falconIdpsBody
      : (falconIdpsBody?.items ?? falconIdpsBody?.data ?? []);
    const falconIdp = falconIdps.find((p) => p.slug === "falcon-entra") ?? falconIdps[0];
    expect(falconIdp?.id, "FALCON IdP must exist").toBeTruthy();

    const globalIdpsRes = await request.get(`${API_URL}/api/v1/identity-providers?pageSize=50`, {
      headers: { Authorization: `Bearer ${platTok}` },
    });
    expect(globalIdpsRes.ok()).toBeTruthy();
    const globalIdpsBody = await globalIdpsRes.json();
    const globalIdps: Array<{ id: string; slug?: string }> = Array.isArray(globalIdpsBody)
      ? globalIdpsBody
      : (globalIdpsBody?.items ?? globalIdpsBody?.data ?? []);
    const googleGlobalIdp = globalIdps.find((p) => p.slug === "google");
    expect(googleGlobalIdp?.id, "Platform Global Google IdP must exist").toBeTruthy();

    // 2) Assert Tenant Admin CANNOT query foreign tenant IdPs on governance surface (403/404)
    const foreignGovGet = await request.get(
      `${API_URL}/api/v1/tenants/${falconTenant!.id}/identity-providers`,
      { headers: { Authorization: `Bearer ${tenantTok}` } }
    );
    expect([403, 404]).toContain(foreignGovGet.status());

    // 3) Assert Tenant Admin CANNOT create an IdP under a foreign tenant (403/404)
    const foreignGovPost = await request.post(
      `${API_URL}/api/v1/tenants/${falconTenant!.id}/identity-providers`,
      {
        headers: mutationHeaders(tenantTok),
        data: {
          name: "PBAC Forged Provider",
          slug: `pbac-forged-${Date.now()}`,
          protocol: "oidc",
          authority: "https://evil.example.com",
          clientId: "evil-client",
        },
      }
    );
    expect([403, 404]).toContain(foreignGovPost.status());

    // 4) Assert Tenant Admin CANNOT read/mutate/delete a foreign tenant's IdP via /api/v1/identity-providers/{id}
    const foreignIdpGet = await request.get(`${API_URL}/api/v1/identity-providers/${falconIdp!.id}`, {
      headers: { Authorization: `Bearer ${tenantTok}` },
    });
    expect([403, 404]).toContain(foreignIdpGet.status());

    const foreignIdpPut = await request.put(`${API_URL}/api/v1/identity-providers/${falconIdp!.id}`, {
      headers: mutationHeaders(tenantTok),
      data: { name: "PBAC Tampered Falcon" },
    });
    expect([403, 404]).toContain(foreignIdpPut.status());

    const foreignIdpDel = await request.delete(
      `${API_URL}/api/v1/identity-providers/${falconIdp!.id}`,
      { headers: mutationHeaders(tenantTok) }
    );
    expect([403, 404]).toContain(foreignIdpDel.status());

    // 5) Assert Tenant Admin CANNOT mutate or delete a Platform Global IdP (google)
    const globalIdpPut = await request.put(
      `${API_URL}/api/v1/identity-providers/${googleGlobalIdp!.id}`,
      {
        headers: mutationHeaders(tenantTok),
        data: { name: "PBAC Tampered Global Google", isActive: false },
      }
    );
    expect([403, 404]).toContain(globalIdpPut.status());

    const globalIdpDel = await request.delete(
      `${API_URL}/api/v1/identity-providers/${googleGlobalIdp!.id}`,
      { headers: mutationHeaders(tenantTok) }
    );
    expect([403, 404]).toContain(globalIdpDel.status());

    // 6) Verify zero 5xx responses across all PBAC probes
    for (const res of [
      foreignGovGet,
      foreignGovPost,
      foreignIdpGet,
      foreignIdpPut,
      foreignIdpDel,
      globalIdpPut,
      globalIdpDel,
    ]) {
      expect(res.status()).toBeLessThan(500);
    }
  });
});
