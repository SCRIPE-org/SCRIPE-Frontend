import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const SCREENSHOT_DIR = "D:\\01_PROJECTS\\SCRIPE\\SCRIPE-CRM\\EXECUTION_REPORTS\\UAT_ENABLEMENT\\screenshots";

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe("SCRIPE CRM Founder UAT & Live Capability Verification", () => {
  test("Complete Founder UAT: Admin lifecycle, Lead intake/qualify/convert, Kanban transitions, Pipeline Admin, RTL, and Sales Rep FLS masking", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Super Admin Login & CRM Overview
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/login?redirect=%2Fcrm%2Foverview");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill("P@ssw0rd");

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // Wait for navigation past login
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    // Navigate to /crm/overview and wait for response
    await page.goto("/crm/overview");
    await page.waitForLoadState("networkidle");

    // Screenshot 01: CRM Overview / Executive Dashboard
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01_crm_overview_admin.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Leads Intake & Qualification Lifecycle
    // ═══════════════════════════════════════════════════════════════════════
    const leadsInitialResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/leads") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/leads");
    await leadsInitialResponse;
    await page.waitForLoadState("networkidle");

    // Screenshot 02: Leads Directory
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02_crm_leads_list.png"),
      fullPage: true,
    });

    // Create New Lead
    const createLeadBtn = page
      .locator("main")
      .getByRole("button", { name: /new lead/i })
      .first();
    await expect(createLeadBtn).toBeVisible({ timeout: 10_000 });
    await createLeadBtn.click();

    const leadDialog = page.getByRole("dialog").first();
    await expect(leadDialog).toBeVisible({ timeout: 10_000 });

    const uniqueId = Date.now().toString().slice(-6);
    const leadTitle = `Emaar Digital Arena Sponsorship ${uniqueId}`;
    const companyName = `Emaar Misr Commercial ${uniqueId}`;
    const email = `sponsorship.${uniqueId}@emaar.example`;

    await leadDialog.locator("#lead-title").fill(leadTitle);
    await leadDialog.locator("#lead-company").fill(companyName);
    await leadDialog.locator("#lead-first-name").fill("Karim");
    await leadDialog.locator("#lead-last-name").fill("Zaki");
    await leadDialog.locator("#lead-email").fill(email);
    await leadDialog.locator("#lead-value").fill("450000");

    const createPostPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/leads") &&
        res.request().method() === "POST" &&
        (res.status() === 201 || res.status() === 200),
      { timeout: 15_000 }
    );
    const submitLeadDialogBtn = leadDialog.getByRole("button", { name: /create lead/i });
    await submitLeadDialogBtn.click();
    const createLeadRes = await createPostPromise;
    expect([200, 201]).toContain(createLeadRes.status());
    await expect(leadDialog).not.toBeVisible({ timeout: 10_000 });

    // Verify lead row appears
    const leadRow = page.locator("tr", { hasText: leadTitle }).first();
    await expect(leadRow).toBeVisible({ timeout: 15_000 });

    // Screenshot 03: Lead Created
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03_crm_lead_created.png"),
      fullPage: true,
    });

    // Switch to CardGrid view to perform Qualification
    const cardGridBtn = page.getByRole("button", { name: "CardGrid" }).first();
    if (await cardGridBtn.isVisible()) {
      await cardGridBtn.click();
    }
    const leadCard = page
      .locator("main")
      .locator(".rounded-nx-lg", { hasText: leadTitle })
      .first();
    await expect(leadCard).toBeVisible({ timeout: 10_000 });

    // Qualify Lead
    const qualifyBtn = leadCard.getByRole("button", { name: "Qualify" });
    await expect(qualifyBtn).toBeVisible({ timeout: 5_000 });
    await qualifyBtn.click();

    const qualifyDialog = page.getByRole("dialog").first();
    await expect(qualifyDialog).toBeVisible({ timeout: 5_000 });
    await qualifyDialog
      .locator("#qualify-notes")
      .fill("Approved by commercial sponsorship committee for flagship tier.");

    const qualifyResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/qualify") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    const saveDecisionBtn = qualifyDialog.getByRole("button", { name: /save decision/i });
    await saveDecisionBtn.click();
    await qualifyResponsePromise;
    await expect(qualifyDialog).not.toBeVisible({ timeout: 10_000 });

    // Screenshot 04: Lead Qualified
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04_crm_lead_qualified.png"),
      fullPage: true,
    });

    // Link Party
    const linkPartyBtn = leadCard.getByRole("button", { name: "Link Party" });
    await expect(linkPartyBtn).toBeVisible({ timeout: 5_000 });
    await linkPartyBtn.click();

    const linkDialog = page.getByRole("dialog").first();
    await expect(linkDialog).toBeVisible({ timeout: 5_000 });

    const linkResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/link-party") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    const saveLinkBtn = linkDialog.getByRole("button", { name: /link parties/i });
    await saveLinkBtn.click();
    await linkResponsePromise;
    await expect(linkDialog).not.toBeVisible({ timeout: 10_000 });

    // Convert to Opportunity
    const convertBtn = leadCard.getByRole("button", { name: /convert/i });
    await expect(convertBtn).toBeVisible({ timeout: 5_000 });
    await convertBtn.click();

    const convertDialog = page.getByRole("dialog").first();
    await expect(convertDialog).toBeVisible({ timeout: 5_000 });

    const convertResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/convert") &&
        res.request().method() === "POST" &&
        res.status() === 201,
      { timeout: 15_000 }
    );
    const submitConvertBtn = convertDialog.getByRole("button", {
      name: /convert to deal/i,
    });
    await submitConvertBtn.click();
    await convertResponsePromise;
    await expect(convertDialog).not.toBeVisible({ timeout: 10_000 });

    // Screenshot 05: Lead Converted
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05_crm_lead_converted.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Opportunities Table & Kanban Board
    // ═══════════════════════════════════════════════════════════════════════
    const oppsResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/opportunities") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/opportunities");
    await oppsResponse;
    await page.waitForLoadState("networkidle");

    // Screenshot 06: Opportunities Table (Admin View)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06_crm_opportunities_table_admin.png"),
      fullPage: true,
    });

    // Switch to Kanban View
    const kanbanToggle = page.getByTestId("toggle-kanban-view");
    if (await kanbanToggle.isVisible()) {
      await kanbanToggle.click();
    } else {
      const kanbanBtnAlt = page.getByRole("button", { name: /kanban/i }).first();
      if (await kanbanBtnAlt.isVisible()) {
        await kanbanBtnAlt.click();
      }
    }
    await page.waitForTimeout(1000);

    // Screenshot 07: Opportunities Kanban Board
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "07_crm_opportunities_kanban.png"),
      fullPage: true,
    });

    // Advance Stage on an Opportunity
    // Switch back to table view to easily advance stage
    const tableToggle = page.getByTestId("toggle-table-view");
    if (await tableToggle.isVisible()) {
      await tableToggle.click();
    } else {
      const tableBtnAlt = page.getByRole("button", { name: /table|list/i }).first();
      if (await tableBtnAlt.isVisible()) {
        await tableBtnAlt.click();
      }
    }

    const firstOppRow = page.locator("tbody tr").first();
    await expect(firstOppRow).toBeVisible({ timeout: 10_000 });
    const moveStageBtn = firstOppRow.getByRole("button", { name: /stage|move/i }).first();
    if (await moveStageBtn.isVisible()) {
      await moveStageBtn.click();
      const stageDialog = page.getByRole("dialog").first();
      await expect(stageDialog).toBeVisible({ timeout: 5_000 });

      const moveStagePromise = page.waitForResponse(
        (res) =>
          res.url().includes("/stage") &&
          res.request().method() === "POST" &&
          res.status() === 200,
        { timeout: 15_000 }
      );
      const submitStageBtn = stageDialog
        .getByRole("button", { name: /advance|move|update/i })
        .last();
      await submitStageBtn.click();
      await moveStagePromise;
      await expect(stageDialog).not.toBeVisible({ timeout: 10_000 });
    }

    // Screenshot 08: Stage Advanced
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08_crm_opportunity_stage_advanced.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Pipeline Admin Settings
    // ═══════════════════════════════════════════════════════════════════════
    const pipelineSettingsBtn = page.getByTestId("pipeline-settings-button");
    if (await pipelineSettingsBtn.isVisible()) {
      await pipelineSettingsBtn.click();
      const pipelineDialog = page.getByTestId("pipeline-admin-dialog");
      await expect(pipelineDialog).toBeVisible({ timeout: 10_000 });

      // Screenshot 09: Pipeline Settings
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "09_crm_pipeline_settings_admin.png"),
      });

      // Close dialog
      const closeDialogBtn = pipelineDialog.getByRole("button", { name: /close|cancel/i }).last();
      if (await closeDialogBtn.isVisible()) {
        await closeDialogBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Arabic RTL Mode
    // ═══════════════════════════════════════════════════════════════════════
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "ar");
      localStorage.setItem("language", "ar");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Screenshot 10: Arabic RTL View
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "10_crm_arabic_rtl_view.png"),
      fullPage: true,
    });

    // Reset language back to English
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("language", "en");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Sales Representative Persona & FLS Masking Verification
    // ═══════════════════════════════════════════════════════════════════════
    // Clear cookies / localStorage to perform clean login as Sales Rep
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto("/login?redirect=%2Fcrm%2Fopportunities");
    await page.waitForLoadState("domcontentloaded");

    const salesRepInput = page.locator("#identifier");
    const salesRepPass = page.locator("#password");
    await expect(salesRepInput).toBeVisible({ timeout: 15_000 });
    await salesRepInput.fill("ahly.crm_sales_rep@scripe-dev.local");
    await salesRepPass.fill("P@ssw0rd");

    const salesRepSubmitBtn = page.locator("form button[type='submit']").first();
    await expect(salesRepSubmitBtn).toBeEnabled({ timeout: 5_000 });
    await salesRepSubmitBtn.click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    const salesRepOppsPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/opportunities") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/opportunities");
    await salesRepOppsPromise;
    await page.waitForLoadState("networkidle");

    // Deals are deterministically seeded with opp2 owned by Sales Rep (D4/B visible)
    const oppRowsCount = await page.locator("tbody tr").count();
    expect(oppRowsCount).toBeGreaterThanOrEqual(1);

    // Verify FLS masking: Financial amounts must display masked symbol ••••••
    const maskedAmounts = page.getByText("••••••");
    await expect(maskedAmounts.first()).toBeVisible({ timeout: 15_000 });
    const maskedCount = await maskedAmounts.count();
    expect(maskedCount).toBeGreaterThanOrEqual(1);

    // Screenshot 11: Sales Rep FLS Masking
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "11_crm_sales_rep_fls_masked.png"),
      fullPage: true,
    });

    // Verify Pipeline settings button is NOT visible for Sales Rep
    const repPipelineSettings = page.getByTestId("pipeline-settings-button");
    await expect(repPipelineSettings).not.toBeVisible();

    // Screenshot 12: Sales Rep Restricted Access
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "12_crm_sales_rep_restricted_access.png"),
      fullPage: true,
    });
  });
});
