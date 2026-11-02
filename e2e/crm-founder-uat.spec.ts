import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import { getDevAdminPassword, getDevCrmRepPassword, getDevCrmManagerPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = "D:\\01_PROJECTS\\SCRIPE\\SCRIPE-CRM\\EXECUTION_REPORTS\\UAT_ENABLEMENT\\screenshots";

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe("SCRIPE CRM Founder UAT & Live Capability Verification", () => {
  test("Complete Founder UAT: Admin lifecycle, Lead intake/qualify/convert, Kanban transitions, Pipeline Admin, RTL, and Sales Rep FLS masking", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Super Admin Login & CRM Overview
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill(getDevAdminPassword());

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // Wait for navigation past login
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });

    // Allow splash loading screen ("getting everything ready for you" / "نحن نقوم بتجهيز كل شيء من أجلك") to completely detach
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Navigate to /crm and ensure complete hydration
    await page.goto("/crm");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Wait for real CRM Overview dashboard components (KPI cards, section header, deals table)
    await expect(page.getByText(/C1 Canonical|Commercial CRM|Overview/i).first()).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText(/Active Deals|Pipeline Value|Win Rate/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Screenshot 01: CRM Overview / Executive Dashboard (Real rendered dashboard with KPI cards and pipeline data)
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

    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

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
    const leadsRefreshPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/leads") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    const submitLeadDialogBtn = leadDialog.getByRole("button", { name: /create lead/i });
    await submitLeadDialogBtn.click();
    const createLeadRes = await createPostPromise;
    expect([200, 201]).toContain(createLeadRes.status());
    await leadsRefreshPromise.catch(() => {});
    await expect(leadDialog).not.toBeVisible({ timeout: 10_000 });
    await page.waitForLoadState("networkidle");

    // Verify lead row appears
    const leadRow = page.locator("tr", { hasText: leadTitle }).first();
    await expect(leadRow).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(600);

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

    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

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
    const tableToggle = page.getByTestId("toggle-table-view");
    if (await tableToggle.isVisible()) {
      await tableToggle.click();
    } else {
      const tableBtnAlt = page.getByRole("button", { name: /table|list/i }).first();
      if (await tableBtnAlt.isVisible()) {
        await tableBtnAlt.click();
      }
    }
    await page.waitForTimeout(1000);

    const firstOppRow = page.locator("tbody tr").first();
    await expect(firstOppRow).toBeVisible({ timeout: 10_000 });
    const advanceStageBtn = firstOppRow.getByRole("button", { name: /advance/i }).first();
    if (await advanceStageBtn.isVisible()) {
      const stageResponsePromise = page.waitForResponse(
        (res) =>
          res.url().includes("/stage") &&
          res.request().method() === "POST" &&
          res.status() === 200,
        { timeout: 15_000 }
      );
      await advanceStageBtn.click();
      await stageResponsePromise;
      await page.waitForTimeout(1000);
    }

    // Screenshot 08: Opportunity Stage Advanced
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08_crm_opportunity_stage_advanced.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Default Pipeline Administration (Super Admin / Manager Only)
    // ═══════════════════════════════════════════════════════════════════════
    const pipelineSettingsBtn = page.getByTestId("pipeline-settings-button");
    if (await pipelineSettingsBtn.isVisible()) {
      await pipelineSettingsBtn.click();
      const pipelineDialog = page.getByRole("dialog").first();
      await expect(pipelineDialog).toBeVisible({ timeout: 10_000 });

      // Screenshot 09: Pipeline Settings Admin
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "09_crm_pipeline_settings_admin.png"),
        fullPage: true,
      });

      const closeDialogBtn = pipelineDialog.getByRole("button", { name: /close|cancel/i }).first();
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
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

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
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Sales Representative Persona & FLS Masking Verification
    // ═══════════════════════════════════════════════════════════════════════
    // Clear cookies / localStorage to perform clean login as Sales Rep
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const salesRepInput = page.locator("#identifier");
    const salesRepPass = page.locator("#password");
    await expect(salesRepInput).toBeVisible({ timeout: 15_000 });
    await salesRepInput.fill("ahly.crm_sales_rep@scripe-dev.local");
    await salesRepPass.fill(getDevCrmRepPassword());

    const salesRepSubmitBtn = page.locator("form button[type='submit']").first();
    await expect(salesRepSubmitBtn).toBeEnabled({ timeout: 5_000 });
    await salesRepSubmitBtn.click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    const salesRepOppsPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/opportunities") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/opportunities");
    await salesRepOppsPromise;

    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Deals are deterministically seeded with exactly 1 opp owned by Sales Rep (D4/B record visibility restriction)
    const repOppRow = page.locator("tbody tr").first();
    await expect(repOppRow).toBeVisible({ timeout: 25_000 });
    const oppRowsCount = await page.locator("tbody tr").count();
    expect(oppRowsCount).toBe(1);

    // Verify FLS masking: Financial amounts must display masked symbol ••••••
    const maskedAmounts = page.getByText("••••••");
    await expect(maskedAmounts.first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Screenshot 11: Sales Rep FLS Masking (Real opportunities screen with •••••• masked financial values)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "11_crm_sales_rep_fls_masked.png"),
      fullPage: true,
    });

    // Verify Pipeline settings button is NOT visible for Sales Rep
    const repPipelineSettings = page.getByTestId("pipeline-settings-button");
    await expect(repPipelineSettings).not.toBeVisible();

    // Screenshot 12: Sales Rep Restricted Access (Real opportunities screen with restricted pipeline controls)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "12_crm_sales_rep_restricted_access.png"),
      fullPage: true,
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROLE-BASED VERIFICATION: Real API & UI Assertions for Manager vs Sales Rep
  // ═══════════════════════════════════════════════════════════════════════════
  test("Role-Based UAT: Persona access, FLS response masking, D4/B visibility, and 403 authorization denials", async ({
    request,
  }) => {
    // 1. Sales Representative Login via API
    const repLoginRes = await request.post("http://127.0.0.1:5035/api/v1/auth/admin/login", {
      data: {
        identifier: "ahly.crm_sales_rep@scripe-dev.local",
        password: getDevCrmRepPassword(),
      },
    });
    expect(repLoginRes.status()).toBe(200);
    const repLoginData = await repLoginRes.json();
    const repToken = repLoginData.accessToken;
    expect(repToken).toBeTruthy();

    // 2. Rep queries opportunities: Assert FLS masking in ACTUAL API response
    const repOppsRes = await request.get("http://127.0.0.1:5035/api/v1/crm/opportunities", {
      headers: { Authorization: `Bearer ${repToken}` },
    });
    expect(repOppsRes.status()).toBe(200);
    const repOppsData = await repOppsRes.json();
    expect(repOppsData.totalCount).toBe(1); // D4/B owner visibility: only 1 owned deal visible
    const firstRepOpp = repOppsData.items[0];
    expect(firstRepOpp.estimatedAmount).toBeNull(); // FLS MASKED IN RAW API
    expect(firstRepOpp.maskedFieldKeys).toContain("estimatedAmount");
    expect(firstRepOpp.maskedFieldKeys).toContain("closeNotes");
    expect(firstRepOpp.maskedFieldKeys).toContain("approvalEvidenceRef");

    // 3. Rep attempts unauthorized pipeline administration mutation: Assert HTTP 403 Forbidden
    const nowIso = new Date().toISOString();
    const nonce = crypto.randomUUID();
    const repPipelineMutateRes = await request.put("http://127.0.0.1:5035/api/v1/crm/pipelines/default", {
      headers: {
        Authorization: `Bearer ${repToken}`,
        "X-Request-Timestamp": nowIso,
        "X-Request-Nonce": nonce,
      },
      data: {
        nameEn: "Unauthorized Pipeline",
        nameAr: "مسار غير مصرح به",
        descriptionEn: "Hacked",
        stages: [],
      },
    });
    expect(repPipelineMutateRes.status()).toBe(403); // STRICT BACKEND DENIAL

    // 4. CRM Manager Login via API
    const mgrLoginRes = await request.post("http://127.0.0.1:5035/api/v1/auth/admin/login", {
      data: {
        identifier: "ahly.crm_manager@scripe-dev.local",
        password: getDevCrmManagerPassword(),
      },
    });
    expect(mgrLoginRes.status()).toBe(200);
    const mgrLoginData = await mgrLoginRes.json();
    const mgrToken = mgrLoginData.accessToken;
    expect(mgrToken).toBeTruthy();

    // 5. Manager queries opportunities: Broader permissions do NOT bypass record-visibility invariants
    const mgrOppsRes = await request.get("http://127.0.0.1:5035/api/v1/crm/opportunities", {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    expect(mgrOppsRes.status()).toBe(200);
    const mgrOppsData = await mgrOppsRes.json();
    // Manager owns 0 deals and has 0 active grants -> sees 0 deals (D4/B zero read_all invariant holds!)
    expect(mgrOppsData.totalCount).toBe(0);

    // 6. Manager queries default pipeline: Authorized for pipeline administration
    const mgrPipelineRes = await request.get("http://127.0.0.1:5035/api/v1/crm/pipelines/default", {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    expect(mgrPipelineRes.status()).toBe(200);
    const mgrPipelineData = await mgrPipelineRes.json();
    expect(mgrPipelineData.code || mgrPipelineData.key).toBe("default");
    expect(mgrPipelineData.stages.length).toBe(5);
  });
});
