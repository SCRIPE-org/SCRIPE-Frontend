import { test, expect, type Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

/**
 * Expanded QA States, Modals, Error/Empty Paths, Server Activity Outcome Filters,
 * and Responsive Breakpoint (1440x900 / 768x1024 / 390x844) Matrix across Light/Dark & EN/AR-RTL.
 * Strictly unmocked against live ASP.NET Core (:5035) + Next.js (:3000).
 */

const SCREENSHOT_DIR =
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/83885ce2-e6e3-4cd4-a4db-ee83c9776085/scratch/qa-screenshots/e2e-states";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TENANT_ACCOUNT_ROUTES = [
  "/account/dossier",
  "/account/security",
  "/account/sessions",
  "/account/governance",
  "/account/activity",
  "/account/preferences",
  "/account/notifications",
  "/account/plan",
  "/account/integrations",
] as const;

async function safeScreenshot(page: Page, filename: string, fullPage = true) {
  const targetPath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: targetPath, fullPage });
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
  await page.waitForTimeout(200);
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

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow on ${label}: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth + 4);
}

async function assertNoWhiteOnLime(page: Page, label: string) {
  const offenders = await page.evaluate(() => {
    const hits: string[] = [];
    const nodes = document.querySelectorAll<HTMLElement>(
      '[class*="bg-nx-accent"]'
    );
    for (const el of nodes) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (style.color === "rgb(255, 255, 255)") {
        hits.push(`${el.tagName}.${el.className.toString().slice(0, 80)}`);
      }
    }
    return hits;
  });
  expect(
    offenders,
    `White text detected on Signal Lime accent surface at ${label}: ${offenders.join(", ")}`
  ).toEqual([]);
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

async function clearSessionPreservingOrigin(page: Page) {
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

test.describe("SCRIPE Account World — States, Modals, Errors, Server Filters & Responsive Audit", () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  const password = getDevAdminPassword();
  const ahlyAdminEmail = "ahly.admin@scripe-dev.local";
  const serverErrors: Array<{ url: string; status: number }> = [];
  const pageErrors: string[] = [];

  function attachListeners(page: Page) {
    page.on("response", (res) => {
      if (res.status() >= 500 && !res.url().includes("favicon")) {
        serverErrors.push({ url: res.url(), status: res.status() });
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });
  }

  test("1. Activity Console: Server Outcome Filter (SUCCESS/FAILURE), Table vs CardGrid Toggle, Forensic Drawer & Empty State", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    attachListeners(page);

    await loginViaUi(page, ahlyAdminEmail, password);
    await page.goto("/account/activity");
    await waitForAppSettled(page);
    await setTheme(page, "light");

    // 1A. Trigger server-side outcome=SUCCESS filter and confirm live backend query param
    // combobox(0) = sidebar org switcher, combobox(1) = activity category, combobox(2) = activity outcome
    const outcomeCombo = page.getByRole("combobox").nth(2);
    await expect(outcomeCombo).toBeVisible({ timeout: 10_000 });
    await outcomeCombo.click();

    const successReqPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/account/activity") &&
        res.url().includes("outcome=SUCCESS") &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByRole("option").nth(1).click();
    await successReqPromise;
    await waitForAppSettled(page);

    // 1B. Trigger server-side outcome=FAILURE filter and confirm live backend query param
    await outcomeCombo.click();
    const failureReqPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/account/activity") &&
        res.url().includes("outcome=FAILURE") &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByRole("option").nth(2).click();
    await failureReqPromise;
    await waitForAppSettled(page);
    await safeScreenshot(page, "01_activity_outcome_failure_light.png", false);

    // Reset back to ALL
    await outcomeCombo.click();
    await page.getByRole("option").nth(0).click();
    await waitForAppSettled(page);

    // 1C. Switch GenericCrudView from CardGrid -> Table and inspect Forensic Payload Drawer
    const tableToggle = page.getByTestId("toggle-table-view");
    await expect(tableToggle).toBeVisible({ timeout: 10_000 });
    await tableToggle.click();
    await expect(page.locator("table")).toBeVisible({ timeout: 10_000 });
    await setTheme(page, "dark");
    await safeScreenshot(page, "02_activity_table_view_dark.png", false);

    const inspectBtn = page
      .locator("table tbody tr button")
      .first();
    if (await inspectBtn.isVisible().catch(() => false)) {
      await inspectBtn.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 8_000 });
      await safeScreenshot(page, "03_activity_forensic_drawer_dark.png", false);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    await page.getByTestId("toggle-cardgrid-view").click();

    // 1D. Real server empty state on non-matching search
    const searchInput = page.getByTestId("activity-search-input");
    const emptyReqPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/account/activity") &&
        res.url().includes("__NO_MATCH_ACTIVITY_9999__") &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await searchInput.fill("__NO_MATCH_ACTIVITY_9999__");
    await emptyReqPromise;
    await waitForAppSettled(page);
    await expect(page.locator("table")).toHaveCount(0);
    await safeScreenshot(page, "04_activity_empty_state_dark.png", false);
    await searchInput.fill("");
    await waitForAppSettled(page);

    expect(serverErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("2. HUD Posture Checklist, Command Bar (Ctrl+K), Info Popovers, Validation/Error Banners & Modals", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    attachListeners(page);

    await loginViaUi(page, ahlyAdminEmail, password);
    await page.goto("/account/dossier");
    await waitForAppSettled(page);
    await setTheme(page, "dark");

    // 2A. Security Posture Ring Checklist modal
    await page.getByTestId("security-posture-ring-trigger").click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 8_000 });
    await safeScreenshot(page, "05_hud_posture_checklist_dark.png", false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // 2B. Sovereign Command Bar (Ctrl+K)
    await page.keyboard.press("Control+k");
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 8_000 });
    await safeScreenshot(page, "06_sovereign_command_bar_dark.png", false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // 2C. Dossier Edit mode + Identity Change modal
    await page.getByTestId("edit-profile-btn").click();
    await expect(page.getByTestId("personal-info-edit-form")).toBeVisible({ timeout: 5_000 });
    await safeScreenshot(page, "07_dossier_edit_form_dark.png", false);
    await page.getByTestId("cancel-edit-profile-btn").click();

    await page.getByTestId("open-change-email-btn").click();
    await expect(page.getByTestId("identity-change-modal")).toBeVisible({ timeout: 5_000 });
    await safeScreenshot(page, "08_identity_change_modal_dark.png", false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // 2D. Security page: (i) SectionInfoPopover, Enroll Passkey Modal, CIDR Error, Sudo Error, Lockdown Modal
    await page.goto("/account/security");
    await waitForAppSettled(page);
    await setTheme(page, "light");

    const infoTrigger = page.locator('button[aria-label^="About "]').first();
    await expect(infoTrigger).toBeVisible({ timeout: 8_000 });
    await infoTrigger.click();
    await safeScreenshot(page, "09_section_info_popover_light.png", false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    await page.getByTestId("open-enroll-passkey-btn").click();
    await page.getByTestId("passkey-option-platform").click();
    await expect(page.getByTestId("passkey-name-input")).toBeVisible({ timeout: 5_000 });
    await safeScreenshot(page, "10_enroll_passkey_modal_light.png", false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // CIDR Validation Error Banner
    await page.getByTestId("subnet-cidr-input").fill("invalid-cidr-entry");
    await page.getByTestId("append-subnet-btn").click();
    await expect(page.getByTestId("cidr-validation-error-banner")).toBeVisible({ timeout: 5_000 });
    await safeScreenshot(page, "11_cidr_validation_error_light.png", false);

    // Sudo Wrong Password Error Alert
    const hudLockBtn = page.getByTestId("hud-lock-sudo-btn");
    if (await hudLockBtn.isVisible().catch(() => false)) {
      await hudLockBtn.click();
      await page.waitForTimeout(400);
    }
    const stepUpBtn = page.getByTestId("step-up-sudo-btn");
    if (await stepUpBtn.isVisible().catch(() => false)) {
      await stepUpBtn.click();
      const pwdInput = page.getByTestId("sudo-password-input");
      await expect(pwdInput).toBeVisible({ timeout: 8_000 });
      await pwdInput.fill("WrongSudoPassword!999");
      await page.getByTestId("sudo-verify-submit-btn").click();
      await expect(page.getByTestId("sudo-error-alert")).toBeVisible({ timeout: 8_000 });
      await safeScreenshot(page, "12_sudo_wrong_password_error_light.png", false);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    // Emergency Lockdown modal check (close cleanly without executing!)
    await page.getByTestId("trigger-lockdown-btn").click();
    await expect(page.locator("#lockdown-confirm")).toBeVisible({ timeout: 5_000 });
    await safeScreenshot(page, "13_emergency_lockdown_dialog_light.png", false);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // 2E. Governance Grant Delegation modal
    await page.goto("/account/governance");
    await waitForAppSettled(page);
    const openGrantBtn = page.getByTestId("open-grant-delegation-modal-btn");
    if (await openGrantBtn.isVisible().catch(() => false)) {
      await openGrantBtn.click();
      await expect(page.getByTestId("colleague-search-input")).toBeVisible({ timeout: 5_000 });
      await page.getByTestId("colleague-search-input").fill("admin");
      await page.waitForTimeout(500);
      await safeScreenshot(page, "14_grant_delegation_modal_light.png", false);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    // 2F. Integrations Create PAT Studio (/account/integrations/new)
    await page.goto("/account/integrations");
    await waitForAppSettled(page);
    await page.getByTestId("open-create-pat-modal-btn").click();
    await page.waitForURL("**/account/integrations/new", { timeout: 10_000 });
    await expect(page.getByTestId("create-pat-name-input")).toBeVisible({ timeout: 5_000 });
    await safeScreenshot(page, "15_create_pat_studio_light.png", false);
    await page.goto("/account/integrations");
    await waitForAppSettled(page);

    // 2G. Preferences Live Stage & Smart Test Toast
    await page.goto("/account/preferences");
    await waitForAppSettled(page);
    await setTheme(page, "light");
    await page.getByTestId("trigger-smart-test-toast-btn").click();
    await page.waitForTimeout(350);
    await safeScreenshot(page, "16_preferences_smart_toast_light.png", false);

    expect(serverErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("3. Responsive Matrix (Desktop 1440x900, Tablet 768x1024, Mobile 390x844) across Light/Dark & EN LTR/AR RTL", async ({
    page,
  }) => {
    attachListeners(page);

    // Capture /login on Mobile EN Light & Mobile AR Dark
    await clearSessionPreservingOrigin(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await waitForAppSettled(page);
    await setTheme(page, "light");
    await assertNoHorizontalOverflow(page, "/login mobile 390 EN Light");
    await assertNoWhiteOnLime(page, "/login mobile 390 EN Light");
    await safeScreenshot(page, "17_login_mobile390_en_light.png", true);

    await loginViaUi(page, ahlyAdminEmail, password);

    const viewports = [
      { name: "tablet768", width: 768, height: 1024 },
      { name: "mobile390", width: 390, height: 844 },
    ] as const;

    // Key representative routes on Tablet 768x1024 and Mobile 390x844 across Light/Dark + EN/AR
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of TENANT_ACCOUNT_ROUTES) {
        await page.goto(route);
        await waitForAppSettled(page);

        await setTheme(page, "light");
        await assertNoHorizontalOverflow(page, `${route} ${vp.name} EN Light`);
        await assertNoWhiteOnLime(page, `${route} ${vp.name} EN Light`);

        await setTheme(page, "dark");
        await assertNoHorizontalOverflow(page, `${route} ${vp.name} EN Dark`);
        await assertNoWhiteOnLime(page, `${route} ${vp.name} EN Dark`);

        if (
          route === "/account/dossier" ||
          route === "/account/security" ||
          route === "/account/activity" ||
          route === "/account/sessions" ||
          route === "/account/plan"
        ) {
          const slug = route.replace("/account/", "");
          await setTheme(page, vp.name === "tablet768" ? "light" : "dark");
          await safeScreenshot(
            page,
            `18_${slug}_${vp.name}_en_${vp.name === "tablet768" ? "light" : "dark"}.png`,
            true
          );
        }
      }
    }

    // Switch to Arabic RTL and inspect Mobile 390x844 + Desktop 1440x900
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/account/dossier");
    await waitForAppSettled(page);
    await setLanguageAndReload(page, "ar");
    await setTheme(page, "light");
    await assertNoHorizontalOverflow(page, "/account/dossier mobile390 AR Light");
    await safeScreenshot(page, "19_dossier_mobile390_ar_light.png", true);

    await page.goto("/account/security");
    await waitForAppSettled(page);
    await setTheme(page, "dark");
    await assertNoHorizontalOverflow(page, "/account/security mobile390 AR Dark");
    await safeScreenshot(page, "20_security_mobile390_ar_dark.png", true);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/account/activity");
    await waitForAppSettled(page);
    await setTheme(page, "dark");
    await assertNoHorizontalOverflow(page, "/account/activity desktop1440 AR Dark");
    await safeScreenshot(page, "21_activity_desktop1440_ar_dark.png", true);

    // Restore English cleanly for downstream suites
    await setLanguageAndReload(page, "en");
    await setTheme(page, "dark");

    expect(serverErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
