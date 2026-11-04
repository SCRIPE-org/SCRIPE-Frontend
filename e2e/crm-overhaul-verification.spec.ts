import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/CRM-OVERHAUL/screenshots"
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function safeScreenshot(page: Page, targetPath: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      if (fs.existsSync(targetPath)) {
        try {
          fs.unlinkSync(targetPath);
        } catch {}
      }
      await page.screenshot({ path: targetPath, fullPage: true });
      return;
    } catch (err) {
      if (attempt === 4) throw err;
      await page.waitForTimeout(400);
    }
  }
}

async function setThemeAndCapture(page: Page, baseName: string) {
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(350);
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}_light.png`));
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}.png`));

  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  });
  await page.waitForTimeout(350);
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}_dark.png`));

  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(200);
}

async function scrollAllToTop(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll("*").forEach((el) => {
      if (el instanceof HTMLElement && el.scrollTop > 0 && !el.closest("[role='dialog']")) {
        el.scrollTop = 0;
      }
    });
  });
  await page.waitForTimeout(250);
}

test.describe("CRM Overhaul Complete Button-by-Button E2E Verification", () => {
  test.setTimeout(300_000);

  test("End-to-end verification of Overview, Dedicated Pipelines Page, Accounts Single Modal + Inline Party, Contacts Searchable Select, Leads Bidirectional Kanban + Conversion Modal, and Opportunities 5-Col Kanban + Stage Gates", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // ═══════════════════════════════════════════════════════════════════════
    // 0. Login as Tenant Admin
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
    // 1. /crm (Overview): Verify zero horizontal table scrollbars & all 7 tabs unclipped
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/Active Deals|Pipeline Value|Win Rate/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

    // Verify no ugly horizontal scrollbar on the recent deals table container
    const hasHorizontalOverflow = await page.evaluate(() => {
      const tableWrapper = document.querySelector("table")?.parentElement;
      if (!tableWrapper) return false;
      return tableWrapper.scrollWidth > tableWrapper.clientWidth + 4;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify all 7 CRM navigation tabs are visible AND within the 1440px viewport (not clipped)
    const crmNav = page.locator("main nav").first();
    for (const tabPattern of [
      /overview/i,
      /leads/i,
      /deals/i,
      /accounts/i,
      /contacts/i,
      /activities/i,
      /pipelines/i,
    ]) {
      const btn = crmNav.getByRole("button", { name: tabPattern }).first();
      await expect(btn).toBeVisible({ timeout: 10_000 });
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
    }

    const pipelinesTabBtn = crmNav.getByRole("button", { name: /pipelines|مسارات/i }).first();

    await scrollAllToTop(page);
    await setThemeAndCapture(page, "01_crm_overview_overhaul");

    // ═══════════════════════════════════════════════════════════════════════
    // 2. /crm/pipelines: Dedicated Jira-style Pipeline & Stage Gate Page
    // ═══════════════════════════════════════════════════════════════════════
    await pipelinesTabBtn.click();
    await page.waitForURL(/\/crm\/pipelines/, { timeout: 20_000 });
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(/Live 5-Stage Commercial Workflow Sequence/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Verify all 5 stage cards are rendered on the dedicated page
    await expect(page.getByTestId("pipeline-page-stage-default.discovery")).toBeVisible();
    await expect(page.getByTestId("pipeline-page-stage-default.qualification")).toBeVisible();
    await expect(page.getByTestId("pipeline-page-stage-default.solution_fit")).toBeVisible();
    await expect(page.getByTestId("pipeline-page-stage-default.proposal")).toBeVisible();
    await expect(page.getByTestId("pipeline-page-stage-default.negotiation")).toBeVisible();

    // Verify Opportunity Custom Fields are integrated into stage exit gate options
    await expect(
      page.getByTestId("stage-default.qualification-exit-field-custom:contract_term_months")
    ).toBeVisible({ timeout: 10_000 });

    // Configure required exit gate fields on Qualification (primaryContactRole) and Solution Fit (solutionFitConfirmed)
    const qualContactRoleCheckbox = page.getByTestId(
      "stage-default.qualification-exit-field-primaryContactRole"
    );
    await expect(qualContactRoleCheckbox).toBeVisible();
    if ((await qualContactRoleCheckbox.getAttribute("data-state")) !== "checked") {
      await qualContactRoleCheckbox.click();
    }

    const solFitConfirmedCheckbox = page.getByTestId(
      "stage-default.solution_fit-exit-field-solutionFitConfirmed"
    );
    await expect(solFitConfirmedCheckbox).toBeVisible();
    if ((await solFitConfirmedCheckbox.getAttribute("data-state")) !== "checked") {
      await solFitConfirmedCheckbox.click();
    }

    // Save pipeline configuration and verify persistence banner
    const savePipelineBtn = page
      .getByRole("button", { name: /save pipeline/i })
      .first();
    if (await savePipelineBtn.isVisible()) {
      const putPipelinePromise = page.waitForResponse(
        (res) =>
          res.url().includes("/crm/pipelines/default") &&
          res.request().method() === "PUT" &&
          res.status() === 200,
        { timeout: 20_000 }
      );
      await savePipelineBtn.click();
      await putPipelinePromise;
      await expect(
        page.getByText(/Pipeline Configuration Saved/i).first()
      ).toBeVisible({ timeout: 10_000 });
    }

    await scrollAllToTop(page);
    await setThemeAndCapture(page, "02_crm_pipelines_page");

    // ═══════════════════════════════════════════════════════════════════════
    // 3. /crm/accounts: Single Modal + Inline Organization + PhoneInput + CustomFields
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/accounts");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

    const newAccountBtn = page
      .locator("main")
      .getByRole("button", { name: /new account|register account|حساب جديد/i })
      .first();
    await expect(newAccountBtn).toBeVisible({ timeout: 10_000 });
    await newAccountBtn.click();

    // CRITICAL CHECK: Assert ONLY ONE dialog opens (no double modal!)
    const openAccountDialogs = page.getByRole("dialog");
    await expect(openAccountDialogs).toHaveCount(1);

    const accountDialog = openAccountDialogs.first();
    const uniqueSuffix = Date.now().toString().slice(-6);
    const newOrgName = `Al-Ittihad Commercial Club ${uniqueSuffix}`;

    await accountDialog.locator("input[placeholder*='Al-Hilal' i]").fill(newOrgName);
    await accountDialog
      .locator("input[placeholder*='partnerships@' i]")
      .fill(`commercial.${uniqueSuffix}@ittihad.sa`);

    // Fill PhoneInput inside CreateAccountDialog
    const accountPhoneInput = accountDialog.locator("input[type='tel']").first();
    await expect(accountPhoneInput).toBeVisible();
    await accountPhoneInput.fill("551234567");

    // Verify CustomFieldsSection is visibly rendered inside CreateAccountDialog and fill Annual Sponsorship Budget
    await expect(accountDialog.getByText(/Annual Sponsorship Budget/i).first()).toBeVisible({
      timeout: 10_000,
    });
    const budgetInput = accountDialog.locator("input[placeholder*='250000']").first();
    if (await budgetInput.isVisible()) {
      await budgetInput.fill("450000");
    }

    await setThemeAndCapture(page, "03a_crm_create_account_single_modal");

    const createAccountPost = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/accounts") &&
        res.request().method() === "POST" &&
        (res.status() === 200 || res.status() === 201),
      { timeout: 20_000 }
    );
    const saveAccountCfPut = page.waitForResponse(
      (res) =>
        res.url().includes("/custom-fields/values/") &&
        res.request().method() === "PUT" &&
        (res.status() === 200 || res.status() === 204),
      { timeout: 20_000 }
    );
    await accountDialog.locator("button[type='submit']").click();
    await createAccountPost;
    await saveAccountCfPut;
    await expect(accountDialog).not.toBeVisible({ timeout: 10_000 });

    const createdAccountRow = page.locator("tr", { hasText: newOrgName }).first();
    await expect(createdAccountRow).toBeVisible({ timeout: 15_000 });
    await setThemeAndCapture(page, "03b_crm_accounts_list");

    // Click View 360 on the newly created Account
    const view360Btn = createdAccountRow.getByRole("button", { name: /view 360/i }).first();
    await view360Btn.click();
    await page.waitForURL(/\/crm\/accounts\/[a-zA-Z0-9_-]+/, { timeout: 20_000 });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(newOrgName).first()).toBeVisible({ timeout: 15_000 });
    await setThemeAndCapture(page, "03c_crm_account_360");

    // ═══════════════════════════════════════════════════════════════════════
    // 4. /crm/contacts: Single Modal + Searchable Account Select + PhoneInput
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/contacts");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

    const newContactBtn = page
      .locator("main")
      .getByRole("button", { name: /new contact|register contact|جهة اتصال/i })
      .first();
    await expect(newContactBtn).toBeVisible({ timeout: 10_000 });
    await newContactBtn.click();

    // CRITICAL CHECK: Assert ONLY ONE dialog opens (no double modal!)
    const openContactDialogs = page.getByRole("dialog");
    await expect(openContactDialogs).toHaveCount(1);

    const contactDialog = openContactDialogs.first();
    const newContactName = `Mansour Al-Harbi ${uniqueSuffix}`;

    await contactDialog.locator("input[placeholder*='Al-Dosari' i]").first().fill(newContactName);
    await contactDialog
      .locator("input[placeholder*='tariq@' i]")
      .first()
      .fill(`mansour.${uniqueSuffix}@ittihad.sa`);

    const contactPhoneInput = contactDialog.locator("input[type='tel']").first();
    await expect(contactPhoneInput).toBeVisible();
    await contactPhoneInput.fill("509876543");

    // Verify Primary Commercial Account is a Select trigger (#contact-account-id), NOT a text input
    const accountSelectTrigger = contactDialog.locator("#contact-account-id");
    await expect(accountSelectTrigger).toBeVisible();
    await accountSelectTrigger.click();
    const accountOption = page.getByRole("option", { name: new RegExp(newOrgName, "i") }).first();
    if (await accountOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await accountOption.click();
    } else {
      await page.getByRole("option").first().click();
    }

    await contactDialog.locator("#contact-job-title").fill("VP of Commercial Partnerships");

    // Verify CustomFieldsSection is visibly rendered inside CreateContactDialog
    await expect(contactDialog.getByText(/Preferred Contact Channel/i).first()).toBeVisible({
      timeout: 10_000,
    });

    await setThemeAndCapture(page, "04a_crm_create_contact_single_modal");

    const createContactPost = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/contacts") &&
        res.request().method() === "POST" &&
        (res.status() === 200 || res.status() === 201),
      { timeout: 20_000 }
    );
    await contactDialog.locator("button[type='submit']").click();
    await createContactPost;
    await expect(contactDialog).not.toBeVisible({ timeout: 10_000 });

    const createdContactRow = page.locator("tr", { hasText: newContactName }).first();
    await expect(createdContactRow).toBeVisible({ timeout: 15_000 });
    await setThemeAndCapture(page, "04b_crm_contacts_list");

    // ═══════════════════════════════════════════════════════════════════════
    // 5. /crm/leads: PhoneInput, CustomFields, Link Contact Select, Bidirectional Kanban & Convert Modal
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

    // Verify zero "PartyKernel" developer jargon on Leads view
    const leadsBodyText = await page.locator("main").first().innerText();
    expect(leadsBodyText).not.toContain("PartyKernel");

    const createLeadBtn = page
      .locator("main")
      .getByRole("button", { name: /new lead/i })
      .first();
    await createLeadBtn.click();

    const leadDialog = page.getByRole("dialog").first();
    await expect(leadDialog).toBeVisible({ timeout: 10_000 });

    const leadTitle = `Qiddiya Stadium VIP Hospitality ${uniqueSuffix}`;
    await leadDialog.locator("#lead-title").fill(leadTitle);
    await leadDialog.locator("#lead-company").fill(`Qiddiya Sports ${uniqueSuffix}`);
    await leadDialog.locator("#lead-firstName").fill("Faisal");
    await leadDialog.locator("#lead-lastName").fill("Al-Saud");
    await leadDialog.locator("#lead-email").fill(`faisal.${uniqueSuffix}@qiddiya.sa`);
    const leadPhoneInput = leadDialog.locator("input[type='tel']").first();
    await expect(leadPhoneInput).toBeVisible();
    await leadPhoneInput.fill("541112233");
    await leadDialog.locator("#lead-value").fill("680000");

    // Verify CustomFieldsSection is visibly rendered inside CreateLeadDialog and fill Campaign Source Code
    await expect(leadDialog.getByText(/Campaign Source Code/i).first()).toBeVisible({
      timeout: 10_000,
    });
    const campaignCodeInput = leadDialog.locator("input[placeholder*='Q4-SPONSOR' i]").first();
    if (await campaignCodeInput.isVisible()) {
      await campaignCodeInput.fill(`QIDDIYA-VIP-${uniqueSuffix}`);
    }

    await setThemeAndCapture(page, "05a_crm_create_lead_modal");

    const createLeadPost = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/leads") &&
        res.request().method() === "POST" &&
        (res.status() === 200 || res.status() === 201),
      { timeout: 20_000 }
    );
    const saveLeadCfPut = page.waitForResponse(
      (res) =>
        res.url().includes("/custom-fields/values/") &&
        res.request().method() === "PUT" &&
        (res.status() === 200 || res.status() === 204),
      { timeout: 20_000 }
    );
    await leadDialog.getByRole("button", { name: /create lead/i }).click();
    await createLeadPost;
    await saveLeadCfPut;
    await expect(leadDialog).not.toBeVisible({ timeout: 10_000 });

    // Switch to CardGrid to test Link Contact modal (searchable Select dropdowns, zero PartyKernel jargon)
    const cardGridBtn = page.getByTestId("toggle-cardgrid-view").first();
    await cardGridBtn.click();
    await page.waitForTimeout(500);

    const leadCard = page
      .locator("[data-testid^='lead-grid-card-']", { hasText: `Qiddiya Sports ${uniqueSuffix}` })
      .first();
    await expect(leadCard).toBeVisible({ timeout: 10_000 });

    const linkContactBtn = leadCard
      .getByRole("button", { name: /link organization|link contact/i })
      .first();
    await expect(linkContactBtn).toBeVisible({ timeout: 5_000 });
    await linkContactBtn.click();

    const linkDialog = page.getByRole("dialog").first();
    await expect(linkDialog).toBeVisible({ timeout: 5_000 });
    const linkDialogText = await linkDialog.innerText();
    expect(linkDialogText).not.toContain("PartyKernel");

    await setThemeAndCapture(page, "05b_crm_link_contact_modal");

    const linkPartyPost = page.waitForResponse(
      (res) =>
        res.url().includes("/link-party") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 20_000 }
    );
    await linkDialog.locator("button[type='submit']").click();
    await linkPartyPost;
    await expect(linkDialog).not.toBeVisible({ timeout: 10_000 });

    // Switch to Leads Kanban view and test forward AND backward transitions + Qualify & Convert modals
    const leadsKanbanBtn = page.getByTestId("toggle-kanban-view").first();
    await leadsKanbanBtn.click();
    await page.waitForTimeout(600);

    const targetLeadKanbanCard = page
      .locator("[data-testid^='lead-kanban-card-']", { hasText: `Qiddiya Sports ${uniqueSuffix}` })
      .first();
    await expect(targetLeadKanbanCard).toBeVisible({ timeout: 10_000 });

    // Move forward: New -> Working
    const moveWorkingBtn = targetLeadKanbanCard
      .locator("button[title='Advance to Working']")
      .first();
    await expect(moveWorkingBtn).toBeVisible({ timeout: 5_000 });
    await moveWorkingBtn.click();
    await page.waitForTimeout(1000);

    // Move backward: Working -> New
    const moveBackNewBtn = page
      .locator("[data-testid^='lead-kanban-card-']", { hasText: `Qiddiya Sports ${uniqueSuffix}` })
      .first()
      .locator("button[title='Move back to New']")
      .first();
    await expect(moveBackNewBtn).toBeVisible({ timeout: 5_000 });
    await moveBackNewBtn.click();
    await page.waitForTimeout(1000);

    // Move forward again: New -> Working
    await page
      .locator("[data-testid^='lead-kanban-card-']", { hasText: `Qiddiya Sports ${uniqueSuffix}` })
      .first()
      .locator("button[title='Advance to Working']")
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Move forward: Working -> Qualified (opens QualifyLeadDialog)
    const moveQualifiedBtn = page
      .locator("[data-testid^='lead-kanban-card-']", { hasText: `Qiddiya Sports ${uniqueSuffix}` })
      .first()
      .locator("button[title='Advance to Qualified']")
      .first();
    await expect(moveQualifiedBtn).toBeVisible({ timeout: 5_000 });
    await moveQualifiedBtn.click();

    const qualifyDialog = page.getByRole("dialog").first();
    await expect(qualifyDialog).toBeVisible({ timeout: 5_000 });
    const qualifyPost = page.waitForResponse(
      (res) =>
        res.url().includes("/qualify") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 20_000 }
    );
    await qualifyDialog.locator("button[type='submit']").click();
    await qualifyPost;
    await expect(qualifyDialog).not.toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(700);

    await setThemeAndCapture(page, "05c_crm_leads_kanban_workflow");

    // Move to Converted -> verify ConvertLeadDialog opens FIRST to collect Deal inputs
    const moveConvertedBtn = page
      .locator("[data-testid^='lead-kanban-card-']", { hasText: `Qiddiya Sports ${uniqueSuffix}` })
      .first()
      .locator("button[title='Advance to Converted']")
      .first();
    await expect(moveConvertedBtn).toBeVisible({ timeout: 5_000 });
    await moveConvertedBtn.click();

    const convertDialog = page.getByRole("dialog").first();
    await expect(convertDialog).toBeVisible({ timeout: 5_000 });
    await setThemeAndCapture(page, "05d_crm_convert_lead_modal");

    const convertPost = page.waitForResponse(
      (res) =>
        res.url().includes("/convert") &&
        res.request().method() === "POST" &&
        (res.status() === 200 || res.status() === 201),
      { timeout: 20_000 }
    );
    await convertDialog.locator("button[type='submit']").click();
    await convertPost;
    await expect(convertDialog).not.toBeVisible({ timeout: 10_000 });

    // ═══════════════════════════════════════════════════════════════════════
    // 6. /crm/opportunities: Verify Converted Deal, 5-Col Kanban & MoveStageDialog
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/opportunities");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

    // Verify converted deal appears in Opportunities table
    await expect(page.locator("tbody tr", { hasText: leadTitle }).first()).toBeVisible({
      timeout: 15_000,
    });
    await setThemeAndCapture(page, "06a_crm_opportunities_table");

    // Switch to Opportunities Kanban view
    const oppsKanbanToggle = page.getByTestId("toggle-kanban-view").first();
    await oppsKanbanToggle.click();
    await page.waitForTimeout(700);

    // Verify zero "Party Required (PD-1)" jargon on Kanban board
    const kanbanText = await page.locator("main").first().innerText();
    expect(kanbanText).not.toContain("PD-1");

    await setThemeAndCapture(page, "06b_crm_opportunities_kanban_5col");

    // Click Move forward on the Discovery Kanban card (moves optimistically to Qualification since amount is set)
    const targetKanbanCard = page
      .locator("[data-testid='kanban-card']", { hasText: leadTitle })
      .first();
    await expect(targetKanbanCard).toBeVisible({ timeout: 10_000 });

    const moveDiscoveryPost = page.waitForResponse(
      (res) =>
        res.url().includes("/stage") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 20_000 }
    );
    const advanceStageBtn = targetKanbanCard
      .getByRole("button", { name: /move forward|تقديم/i })
      .first();
    await advanceStageBtn.click();
    await moveDiscoveryPost;

    // Advance again from Qualification -> Solution Fit to trigger interactive MoveStageDialog (Primary Contact Role exit gate)
    const qualKanbanCard = page
      .locator("[data-testid='kanban-card']", { hasText: leadTitle })
      .first();
    await expect(qualKanbanCard).toBeVisible({ timeout: 10_000 });
    await qualKanbanCard
      .getByRole("button", { name: /move forward|تقديم/i })
      .first()
      .click();

    const qualMoveDialog = page.getByRole("dialog").first();
    await expect(qualMoveDialog).toBeVisible({ timeout: 10_000 });

    const contactRoleTrigger = qualMoveDialog.locator("#stage-gate-contact-role");
    await expect(contactRoleTrigger).toBeVisible({ timeout: 5_000 });
    await contactRoleTrigger.click();
    await page.getByRole("option", { name: /Executive Sponsor/i }).first().click();

    // Verify CustomFieldsSection is also rendered inside MoveStageDialog and fill Contract Term (Months)
    await expect(qualMoveDialog.getByText(/Contract Term \(Months\)/i).first()).toBeVisible({
      timeout: 10_000,
    });
    const contractTermInput = qualMoveDialog.locator("input[placeholder*='24']").first();
    if (await contractTermInput.isVisible()) {
      await contractTermInput.fill("36");
    }

    const stageReasonInput = qualMoveDialog.locator("#stage-reason");
    await expect(stageReasonInput).toBeVisible();
    await stageReasonInput.fill(
      "Verified Primary Contact Role and executive sponsor alignment with Qiddiya executive committee."
    );

    await setThemeAndCapture(page, "06c_crm_move_stage_dialog");

    const moveQualStagePost = page.waitForResponse(
      (res) =>
        res.url().includes("/stage") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 20_000 }
    );
    await qualMoveDialog.locator("button[type='submit']").click();
    await moveQualStagePost;
    await expect(qualMoveDialog).not.toBeVisible({ timeout: 10_000 });

    await setThemeAndCapture(page, "06d_crm_opportunity_stage_moved");
  });
});
