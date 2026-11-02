import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/SCRIPE-735_736/screenshots"
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function setThemeAndCapture(page: Page, baseName: string) {
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${baseName}_light.png`),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${baseName}.png`),
    fullPage: true,
  });

  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${baseName}_dark.png`),
    fullPage: true,
  });

  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(150);
}

test.describe("SCRIPE-735 & SCRIPE-736: CRM Accounts 360 & Contacts Context Live UAT (Dark + Light Themes)", () => {
  test.setTimeout(240_000);

  test("Complete Accounts 360 & Contacts Context verification with Arabic RTL in Dark & Light modes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Authenticate as Ahly CRM Manager / Super Admin
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill(getDevAdminPassword());

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Commercial Accounts Directory & 360 Catalog (GenericCrudView)
    // ═══════════════════════════════════════════════════════════════════════
    const accountsPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/accounts") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/accounts");
    await accountsPromise;

    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/commercial accounts 360|حسابات تجارية/i).first()).toBeVisible({
      timeout: 20_000,
    });
    const firstAccountRow = page.locator("tbody tr").first();
    await expect(firstAccountRow).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Verify single search bar on /crm/accounts
    const accSearchCount = await page.locator("main input[placeholder*='Search' i]").count();
    expect(accSearchCount).toBe(1);

    // Capture 01: Accounts Catalog (Light & Dark)
    await setThemeAndCapture(page, "01_crm_accounts_catalog");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Commercial Account 360 View (/crm/accounts/[id])
    // ═══════════════════════════════════════════════════════════════════════
    const prosportRow = page.locator("tr", { hasText: "ProSport" }).first();
    const targetAccountRow = (await prosportRow.isVisible()) ? prosportRow : firstAccountRow;

    const accountDetailPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/accounts/") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );

    const view360Btn = targetAccountRow.getByRole("button", { name: /view 360/i }).first();
    await expect(view360Btn).toBeVisible({ timeout: 10_000 });
    await view360Btn.click();
    await accountDetailPromise;

    await page.waitForURL(/\/crm\/accounts\/[a-zA-Z0-9_-]+/, { timeout: 30_000 });
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    await page.setViewportSize({ width: 1440, height: 1350 });

    await expect(page.getByText(/back to accounts|العودة إلى الحسابات/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/key stakeholders & contacts|contacts/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText(/active opportunities|associated deals|deals/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Capture 02: Account 360 Overview (Light & Dark)
    await setThemeAndCapture(page, "02_crm_account_360_overview");

    await page.setViewportSize({ width: 1440, height: 900 });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Commercial Contacts Directory (GenericCrudView)
    // ═══════════════════════════════════════════════════════════════════════
    const contactsPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/contacts") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/contacts");
    await contactsPromise;

    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/commercial contacts & context|جهات الاتصال/i).first()).toBeVisible({
      timeout: 20_000,
    });
    const firstContactRow = page.locator("tbody tr").first();
    await expect(firstContactRow).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Verify single search bar on /crm/contacts
    const contactSearchCount = await page.locator("main input[placeholder*='Search' i]").count();
    expect(contactSearchCount).toBe(1);

    // Capture 03: Contacts Directory (Light & Dark)
    await setThemeAndCapture(page, "03_crm_contacts_directory");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Commercial Contact Context Detail (/crm/contacts/[id])
    // ═══════════════════════════════════════════════════════════════════════
    const faroukRow = page.locator("tr", { hasText: "Farouk" }).first();
    const targetContactRow = (await faroukRow.isVisible()) ? faroukRow : firstContactRow;

    const contactDetailPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/contacts/") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );

    const viewContextBtn = targetContactRow.getByRole("button", { name: /view context/i }).first();
    await expect(viewContextBtn).toBeVisible({ timeout: 10_000 });
    await viewContextBtn.click();
    await contactDetailPromise;

    await page.waitForURL(/\/crm\/contacts\/[a-zA-Z0-9_-]+/, { timeout: 30_000 });
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);

    await page.setViewportSize({ width: 1440, height: 1350 });

    await expect(page.getByText(/back to contacts|العودة إلى جهات الاتصال/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/primary account organization|primary account|organization/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText(/associated deals|opportunities|deals/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Capture 04: Contact Context Detail (Light & Dark)
    await setThemeAndCapture(page, "04_crm_contact_context_detail");

    await page.setViewportSize({ width: 1440, height: 900 });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Arabic RTL Mode (Light & Dark)
    // ═══════════════════════════════════════════════════════════════════════
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "ar");
      localStorage.setItem("language", "ar");
    });

    await page.goto("/crm/accounts");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Capture 05: Accounts Arabic RTL (Light & Dark)
    await setThemeAndCapture(page, "05_crm_accounts_arabic_rtl");

    await page.goto("/crm/contacts");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Capture 06: Contacts Arabic RTL (Light & Dark)
    await setThemeAndCapture(page, "06_crm_contacts_arabic_rtl");

    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("language", "en");
    });
    await page.reload();
  });
});
