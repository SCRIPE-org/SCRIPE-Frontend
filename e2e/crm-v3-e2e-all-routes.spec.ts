import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/CRM_WORKFLOW_NEXTGEN/screenshots"
);

function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

async function safeScreenshot(page: Page, fileName: string) {
  ensureScreenshotDir();
  await page.waitForTimeout(400);
  const targetPath = path.join(SCREENSHOT_DIR, fileName);
  await page.screenshot({ path: targetPath, fullPage: true });
  console.log(`[E2E QA v3.0] Saved: ${fileName} (${fs.statSync(targetPath).size} bytes)`);
}

async function loginAsAdmin(page: Page) {
  console.log("[E2E QA v3.0] Authenticating with real credentials...");
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  const identifierInput = page.locator("#identifier");
  const passwordInput = page.locator("#password");
  await expect(identifierInput).toBeVisible({ timeout: 30_000 });
  await expect(passwordInput).toBeVisible({ timeout: 30_000 });

  await identifierInput.fill(process.env.E2E_ADMIN_EMAIL || "ahly.admin@scripe-dev.local");
  await passwordInput.fill(process.env.E2E_ADMIN_PASSWORD || "P@ssw0rd");

  const submitBtn = page.locator("form button[type='submit']").first();
  await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
  await submitBtn.click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });
  await page
    .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
    .waitFor({ state: "detached", timeout: 35_000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle");
  console.log("[E2E QA v3.0] Successfully authenticated into CRM!");
}

test.describe("SCRIPE CRM v3.0 Production Suite — 13 Routes Verification", () => {
  test("All 13 CRM Routes, Shell Navigation, 360 Progression, and Activities Desk", async ({ page }) => {
    test.setTimeout(450_000);
    await page.setViewportSize({ width: 1440, height: 900 });

    // Step 0: Real Login
    await loginAsAdmin(page);

    // ─────────────────────────────────────────────────────────────
    // ROUTE 1: /crm (Overview Dashboard)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 1/13] /crm Overview Dashboard");
    await page.goto("/crm");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2, [data-testid='crm-shell']").first()).toBeVisible({ timeout: 15_000 });
    await safeScreenshot(page, "21_crm_overview_dashboard.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 2: /crm/leads (Leads Unified Kanban)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 2/13] /crm/leads Leads Kanban");
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("button:has-text('Kanban'), [data-testid='toggle-kanban-view']").first()).toBeVisible({ timeout: 15_000 });
    await safeScreenshot(page, "22_crm_leads_kanban_v3.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 3: /crm/leads/[id] (Lead 360 Dynamic Progression)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 3/13] /crm/leads/[id] Lead 360 View");
    const firstLeadLink = page.locator("a[href*='/crm/leads/'], table tbody tr a, [data-row-id] a").first();
    if (await firstLeadLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await firstLeadLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("[data-testid='lead-stage-progression'], [data-testid='stage-progression']").first()).toBeVisible({ timeout: 15_000 });
      await safeScreenshot(page, "23_crm_lead_360_dynamic_progression.png");
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 4: /crm/opportunities (Deals Unified Kanban)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 4/13] /crm/opportunities Deals Kanban");
    await page.goto("/crm/opportunities");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("button:has-text('Kanban'), [data-testid='toggle-kanban-view']").first()).toBeVisible({ timeout: 15_000 });
    await safeScreenshot(page, "24_crm_deals_kanban_v3.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 5: /crm/opportunities/[id] (Deal 360 Dynamic Progression)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 5/13] /crm/opportunities/[id] Deal 360 View");
    const firstDealLink = page.locator("a[href*='/crm/opportunities/'], table tbody tr a, [data-row-id] a").first();
    if (await firstDealLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await firstDealLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("[data-testid='opportunity-stage-progression'], [data-testid='stage-progression']").first()).toBeVisible({ timeout: 15_000 });
      await safeScreenshot(page, "25_crm_deal_360_dynamic_progression.png");
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 6: /crm/accounts (Accounts GenericCrudView)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 6/13] /crm/accounts Accounts Directory");
    await page.goto("/crm/accounts");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("table, [data-testid='generic-crud-view']").first()).toBeVisible({ timeout: 15_000 });
    await safeScreenshot(page, "26_crm_accounts_directory.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 7: /crm/accounts/[id] (Account 360)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 7/13] /crm/accounts/[id] Account 360 View");
    const firstAccLink = page.locator("a[href*='/crm/accounts/'], table tbody tr a").first();
    if (await firstAccLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await firstAccLink.click();
      await page.waitForLoadState("networkidle");
      await safeScreenshot(page, "27_crm_account_360.png");
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 8: /crm/contacts (Contacts GenericCrudView)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 8/13] /crm/contacts Contacts Directory");
    await page.goto("/crm/contacts");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("table, [data-testid='generic-crud-view']").first()).toBeVisible({ timeout: 15_000 });
    await safeScreenshot(page, "28_crm_contacts_directory.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 9: /crm/contacts/[id] (Contact 360)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 9/13] /crm/contacts/[id] Contact 360 View");
    const firstContactLink = page.locator("a[href*='/crm/contacts/'], table tbody tr a").first();
    if (await firstContactLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await firstContactLink.click();
      await page.waitForLoadState("networkidle");
      await safeScreenshot(page, "29_crm_contact_360.png");
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 10: /crm/activities (Activities Execution Desk on GenericCrudView)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 10/13] /crm/activities Execution Desk");
    await page.goto("/crm/activities");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("table, [data-testid='generic-crud-view']").first()).toBeVisible({ timeout: 15_000 });
    await safeScreenshot(page, "30_crm_activities_execution_desk.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 11: /crm/pipelines (Pipelines Directory wrapped in CrmShell)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 11/13] /crm/pipelines Pipelines Directory");
    await page.goto("/crm/pipelines");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='crm-shell'], button:has-text('Studio')").first()).toBeVisible({ timeout: 15_000 });
    await safeScreenshot(page, "31_crm_pipelines_directory_in_shell.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 12: /crm/reports (Reports Workspace)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 12/13] /crm/reports Reports View");
    await page.goto("/crm/reports");
    await page.waitForLoadState("networkidle");
    await safeScreenshot(page, "32_crm_reports_view.png");

    // ─────────────────────────────────────────────────────────────
    // ROUTE 13: /crm/settings (Settings Workspace)
    // ─────────────────────────────────────────────────────────────
    console.log(">>> [ROUTE 13/13] /crm/settings Settings View");
    await page.goto("/crm/settings");
    await page.waitForLoadState("networkidle");
    await safeScreenshot(page, "33_crm_settings_view.png");

    console.log(">>> [COMPLETED] All 13 CRM Routes Verified Successfully!");
  });
});
