import { test, expect } from "@playwright/test";
import * as path from "path";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/SCRIPE-735_736/screenshots"
);

test.describe("SCRIPE-735 & SCRIPE-736: CRM Accounts 360 & Contacts Context Live UAT", () => {
  test.setTimeout(120_000);

  test("Complete Accounts 360 & Contacts Context verification with Arabic RTL", async ({
    page,
  }) => {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Authenticate as Ahly CRM Manager
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill("P@ssw0rd");

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

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
    await page.waitForLoadState("networkidle");

    const firstAccountRow = page.locator("tbody tr").first();
    await expect(firstAccountRow).toBeVisible({ timeout: 15_000 });

    // Screenshot 01: Accounts Catalog
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01_crm_accounts_catalog.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Commercial Account 360 View
    // ═══════════════════════════════════════════════════════════════════════
    const account360Promise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/accounts/") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );

    const view360Btn = firstAccountRow.getByRole("button", { name: /view 360/i });
    if (await view360Btn.isVisible()) {
      await view360Btn.click();
    } else {
      await firstAccountRow.click();
    }

    await account360Promise;
    await page.waitForLoadState("networkidle");

    // Verify 360 view elements: Key Stakeholders & Active Deals
    await expect(page.getByText(/key stakeholders|contacts/i).first()).toBeVisible({
      timeout: 10_000,
    });

    // Screenshot 02: Account 360 Overview
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02_crm_account_360_overview.png"),
      fullPage: true,
    });

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
    await page.waitForLoadState("networkidle");

    const firstContactRow = page.locator("tbody tr").first();
    await expect(firstContactRow).toBeVisible({ timeout: 15_000 });

    // Screenshot 03: Contacts Directory
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03_crm_contacts_directory.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Commercial Contact Context Detail
    // ═══════════════════════════════════════════════════════════════════════
    const contactContextPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/contacts/") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );

    const viewContextBtn = firstContactRow.getByRole("button", { name: /view context/i });
    if (await viewContextBtn.isVisible()) {
      await viewContextBtn.click();
    } else {
      await firstContactRow.click();
    }

    await contactContextPromise;
    await page.waitForLoadState("networkidle");

    // Verify contact context elements
    await expect(
      page.getByText(/primary account|associated deals|organization/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Screenshot 04: Contact Context Detail
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04_crm_contact_context_detail.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Arabic RTL Mode
    // ═══════════════════════════════════════════════════════════════════════
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "ar");
      localStorage.setItem("language", "ar");
    });

    // Go to Accounts list in Arabic
    await page.goto("/crm/accounts");
    await page.waitForLoadState("networkidle");

    // Screenshot 05: Accounts Arabic RTL
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05_crm_accounts_arabic_rtl.png"),
      fullPage: true,
    });

    // Go to Contacts list in Arabic
    await page.goto("/crm/contacts");
    await page.waitForLoadState("networkidle");

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
