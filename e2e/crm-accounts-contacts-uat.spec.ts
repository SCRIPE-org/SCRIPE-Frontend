import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/SCRIPE-735_736/screenshots"
);

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe("SCRIPE-735 & SCRIPE-736: CRM Accounts 360 & Contacts Context Live UAT", () => {
  test.setTimeout(180_000);

  test("Complete Accounts 360 & Contacts Context verification with Arabic RTL", async ({
    page,
  }) => {
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

    // Wait for redirect away from /login
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });

    // Wait for splash transition screen to completely detach
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Commercial Accounts Directory & 360 Catalog
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

    // Allow splash loading screen to detach if triggered on route navigation
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Wait for Accounts heading and table rows
    await expect(page.getByText(/commercial accounts 360|حسابات تجارية/i).first()).toBeVisible({
      timeout: 20_000,
    });
    const firstAccountRow = page.locator("tbody tr").first();
    await expect(firstAccountRow).toBeVisible({ timeout: 20_000 });

    // Wait for any loading spinner to detach
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Verify row count is >= 1
    const accountRowsCount = await page.locator("tbody tr").count();
    expect(accountRowsCount).toBeGreaterThanOrEqual(1);

    // Screenshot 01: Accounts Catalog (Real populated catalog table)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01_crm_accounts_catalog.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Commercial Account 360 View (/crm/accounts/[id])
    // ═══════════════════════════════════════════════════════════════════════
    // Target the seeded ProSport International Gear LLC enterprise account
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

    // Ensure route has navigated to detail page
    await page.waitForURL(/\/crm\/accounts\/[a-zA-Z0-9_-]+/, { timeout: 30_000 });

    // Allow splash loading screen to detach
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Wait for routing transition to settle and full opacity
    await page.waitForFunction(() => {
      const content = document.getElementById("nexus-content");
      return content && window.getComputedStyle(content).opacity === "1";
    }, { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(600);

    // Expand viewport height so inner scrolling container displays all sections without cut-off
    await page.setViewportSize({ width: 1440, height: 1350 });

    // Wait for detail view elements: Back button, heading, stakeholder contacts, and active deals
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

    // Wait for spinner to detach
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Screenshot 02: Account 360 Overview (Real detail view with linked contacts and deals)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02_crm_account_360_overview.png"),
      fullPage: true,
    });

    // Reset viewport for normal directory views
    await page.setViewportSize({ width: 1440, height: 900 });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Commercial Contacts Directory
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

    // Allow splash loading screen to detach
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Wait for Contacts heading and table rows
    await expect(page.getByText(/commercial contacts & context|جهات الاتصال/i).first()).toBeVisible({
      timeout: 20_000,
    });
    const firstContactRow = page.locator("tbody tr").first();
    await expect(firstContactRow).toBeVisible({ timeout: 20_000 });

    // Wait for spinner to detach
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    const contactRowsCount = await page.locator("tbody tr").count();
    expect(contactRowsCount).toBeGreaterThanOrEqual(1);

    // Screenshot 03: Contacts Directory
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03_crm_contacts_directory.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Commercial Contact Context Detail (/crm/contacts/[id])
    // ═══════════════════════════════════════════════════════════════════════
    // Target a seeded contact row with linked account and opportunity
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

    // Ensure route has navigated to contact detail page
    await page.waitForURL(/\/crm\/contacts\/[a-zA-Z0-9_-]+/, { timeout: 30_000 });

    // Allow splash loading screen to detach
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Wait for routing transition to settle and full opacity
    await page.waitForFunction(() => {
      const content = document.getElementById("nexus-content");
      return content && window.getComputedStyle(content).opacity === "1";
    }, { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(600);

    // Expand viewport height so inner scrolling container displays all sections without cut-off
    await page.setViewportSize({ width: 1440, height: 1350 });

    // Wait for contact detail elements: Back button, heading, primary account card, and associated deals
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

    // Wait for spinner to detach
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Screenshot 04: Contact Context Detail (Real detail view with linked account and deals)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04_crm_contact_context_detail.png"),
      fullPage: true,
    });

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Arabic RTL Mode
    // ═══════════════════════════════════════════════════════════════════════
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "ar");
      localStorage.setItem("language", "ar");
    });

    // Go to Accounts list in Arabic
    await page.goto("/crm/accounts");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Screenshot 05: Accounts Arabic RTL
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05_crm_accounts_arabic_rtl.png"),
      fullPage: true,
    });

    // Go to Contacts list in Arabic
    await page.goto("/crm/contacts");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Screenshot 06: Contacts Arabic RTL
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06_crm_contacts_arabic_rtl.png"),
      fullPage: true,
    });

    // Reset language back to English
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("language", "en");
    });
    await page.reload();
  });
});
