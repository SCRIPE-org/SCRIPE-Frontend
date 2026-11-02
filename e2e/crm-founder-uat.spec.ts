import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import { getDevAdminPassword, getDevCrmRepPassword, getDevCrmManagerPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = "D:\\01_PROJECTS\\SCRIPE\\SCRIPE-CRM\\EXECUTION_REPORTS\\UAT_ENABLEMENT\\screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function setThemeAndCapture(page: Page, baseName: string) {
  // Light Mode capture
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${baseName}_light.png`),
    fullPage: true,
  });
  // Also save canonical baseName.png as Light Mode for backward compatibility
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${baseName}.png`),
    fullPage: true,
  });

  // Dark Mode capture
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${baseName}_dark.png`),
    fullPage: true,
  });

  // Restore Light Mode default for next step
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(150);
}

test.describe("SCRIPE CRM Founder UAT & Live Capability Verification (Dark + Light Themes)", () => {
  test("Complete Founder UAT: Admin lifecycle, Lead intake/qualify/convert, Kanban/CardGrid/SplitPane transitions, Pipeline Admin, RTL, and Sales Rep FLS masking in Dark & Light modes", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1440, height: 900 });

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

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    await page.goto("/crm");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/C1 Canonical|Commercial CRM|Overview/i).first()).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText(/Active Deals|Pipeline Value|Win Rate/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Capture 01: CRM Overview (Light & Dark)
    await setThemeAndCapture(page, "01_crm_overview_admin");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Leads Intake & Qualification Lifecycle (Table, Kanban, CardGrid, SplitPane)
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

    const createLeadBtn = page
      .locator("main")
      .getByRole("button", { name: /new lead/i })
      .first();
    await expect(createLeadBtn).toBeVisible({ timeout: 10_000 });
    const createLeadText = await createLeadBtn.innerText();
    expect(createLeadText).not.toContain("+ +");

    // Verify single search bar on /crm/leads (no duplicate search inputs)
    const searchInputsCount = await page.locator("main input[placeholder*='Search' i]").count();
    expect(searchInputsCount).toBe(1);

    // Explicitly verify Ink-on-Lime (#0d0d0e -> rgb(13, 13, 14) on #c6ff00 -> rgb(198, 255, 0)) in BOTH Light Mode and Dark Mode
    const lightThemeStyles = await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      const btn = document.querySelector("main button.bg-nx-accent-fill") as HTMLElement | null;
      const span = btn?.querySelector("span") as HTMLElement | null;
      const svg = btn?.querySelector("svg") as SVGElement | null;
      return {
        bg: btn ? window.getComputedStyle(btn).backgroundColor : "",
        color: btn ? window.getComputedStyle(btn).color : "",
        spanColor: span ? window.getComputedStyle(span).color : "",
        svgColor: svg ? window.getComputedStyle(svg).color : "",
      };
    });
    expect(lightThemeStyles.bg).toBe("rgb(198, 255, 0)");
    expect(lightThemeStyles.color).toBe("rgb(13, 13, 14)");
    expect(lightThemeStyles.spanColor).toBe("rgb(13, 13, 14)");
    expect(lightThemeStyles.svgColor).toBe("rgb(13, 13, 14)");

    const darkThemeStyles = await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      const btn = document.querySelector("main button.bg-nx-accent-fill") as HTMLElement | null;
      const span = btn?.querySelector("span") as HTMLElement | null;
      const svg = btn?.querySelector("svg") as SVGElement | null;
      return {
        bg: btn ? window.getComputedStyle(btn).backgroundColor : "",
        color: btn ? window.getComputedStyle(btn).color : "",
        spanColor: span ? window.getComputedStyle(span).color : "",
        svgColor: svg ? window.getComputedStyle(svg).color : "",
      };
    });
    expect(darkThemeStyles.bg).toBe("rgb(198, 255, 0)");
    expect(darkThemeStyles.color).toBe("rgb(13, 13, 14)");
    expect(darkThemeStyles.spanColor).toBe("rgb(13, 13, 14)");
    expect(darkThemeStyles.svgColor).toBe("rgb(13, 13, 14)");

    // Capture 02: Leads Table View (Light & Dark)
    await setThemeAndCapture(page, "02_crm_leads_table");

    // Switch to Leads Kanban View & Capture (Light & Dark)
    const leadsKanbanBtn = page.getByTestId("toggle-kanban-view").first();
    if (await leadsKanbanBtn.isVisible()) {
      await leadsKanbanBtn.click();
      await page.waitForTimeout(500);
      await setThemeAndCapture(page, "02b_crm_leads_kanban");
    }

    // Switch to Leads SplitPane View & Capture (Light & Dark)
    const leadsSplitBtn = page.getByTestId("toggle-splitpane-view").first();
    if (await leadsSplitBtn.isVisible()) {
      await leadsSplitBtn.click();
      await page.waitForTimeout(500);
      await setThemeAndCapture(page, "02c_crm_leads_splitpane");
    }

    // Switch back to Table View
    const leadsTableBtn = page.getByTestId("toggle-table-view").first();
    if (await leadsTableBtn.isVisible()) {
      await leadsTableBtn.click();
      await page.waitForTimeout(400);
    }

    // Open Create New Lead Dialog & Capture Modal (Light & Dark)
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

    await setThemeAndCapture(page, "03a_crm_create_lead_modal");

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

    const leadRow = page.locator("tr", { hasText: leadTitle }).first();
    await expect(leadRow).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);

    // Capture 03: Lead Created in Table (Light & Dark)
    await setThemeAndCapture(page, "03_crm_lead_created");

    // Switch to CardGrid view to perform Qualification
    const cardGridBtn = page.getByTestId("toggle-cardgrid-view").first();
    if (await cardGridBtn.isVisible()) {
      await cardGridBtn.click();
      await page.waitForTimeout(500);
    }
    const leadCard = page
      .locator("main")
      .locator(".rounded-nx-lg", { hasText: leadTitle })
      .first();
    await expect(leadCard).toBeVisible({ timeout: 10_000 });

    // Capture CardGrid View (Light & Dark)
    await setThemeAndCapture(page, "03b_crm_leads_cardgrid");

    // Qualify Lead
    const qualifyBtn = leadCard.getByRole("button", { name: "Qualify" });
    await expect(qualifyBtn).toBeVisible({ timeout: 5_000 });
    await qualifyBtn.click();

    const qualifyDialog = page.getByRole("dialog").first();
    await expect(qualifyDialog).toBeVisible({ timeout: 5_000 });
    await qualifyDialog
      .locator("#qualify-notes")
      .fill("Approved by commercial sponsorship committee for flagship tier.");

    await setThemeAndCapture(page, "04a_crm_qualify_lead_modal");

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

    // Capture 04: Lead Qualified (Light & Dark)
    await setThemeAndCapture(page, "04_crm_lead_qualified");

    // Link Party
    const linkPartyBtn = leadCard.getByRole("button", { name: "Link Party" });
    await expect(linkPartyBtn).toBeVisible({ timeout: 5_000 });
    await linkPartyBtn.click();

    const linkDialog = page.getByRole("dialog").first();
    await expect(linkDialog).toBeVisible({ timeout: 5_000 });
    await setThemeAndCapture(page, "04b_crm_link_party_modal");

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
    await setThemeAndCapture(page, "05a_crm_convert_lead_modal");

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

    // Capture 05: Lead Converted (Light & Dark)
    await setThemeAndCapture(page, "05_crm_lead_converted");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Opportunities Table (GenericCrudView + Sticky Actions) & Kanban Board
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

    // Verify single search bar on /crm/opportunities and no "+ +"
    const oppSearchCount = await page.locator("main input[placeholder*='Search' i]").count();
    expect(oppSearchCount).toBe(1);
    const newOppBtn = page.getByTestId("create-opportunity-button");
    const newOppText = await newOppBtn.innerText();
    expect(newOppText).not.toContain("+ +");

    // Capture 06: Opportunities Table via GenericCrudView with Sticky Actions (Light & Dark)
    await setThemeAndCapture(page, "06_crm_opportunities_table_admin");

    // Switch to Kanban View via GenericCrudView switcher
    const kanbanToggle = page.getByTestId("toggle-kanban-view").first();
    await expect(kanbanToggle).toBeVisible({ timeout: 10_000 });
    await kanbanToggle.click();
    await page.waitForTimeout(800);

    // Capture 07: Opportunities Kanban Board (Light & Dark)
    await setThemeAndCapture(page, "07_crm_opportunities_kanban");

    // Switch back to Table View and Advance Stage
    const tableToggle = page.getByTestId("toggle-table-view").first();
    await tableToggle.click();
    await page.waitForTimeout(600);

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
      await page.waitForTimeout(800);
    }

    // Capture 08: Opportunity Stage Advanced (Light & Dark)
    await setThemeAndCapture(page, "08_crm_opportunity_stage_advanced");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Default Pipeline Administration (Super Admin / Manager Only)
    // ═══════════════════════════════════════════════════════════════════════
    const pipelineSettingsBtn = page.getByTestId("pipeline-settings-button");
    if (await pipelineSettingsBtn.isVisible()) {
      await pipelineSettingsBtn.click();
      const pipelineDialog = page.getByRole("dialog").first();
      await expect(pipelineDialog).toBeVisible({ timeout: 10_000 });

      // Capture 09: Pipeline Settings Admin (Light & Dark)
      await setThemeAndCapture(page, "09_crm_pipeline_settings_admin");

      const closeDialogBtn = pipelineDialog.getByRole("button", { name: /close|cancel/i }).first();
      if (await closeDialogBtn.isVisible()) {
        await closeDialogBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Arabic RTL Mode (Light & Dark)
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

    // Capture 10: Arabic RTL View (Light & Dark)
    await setThemeAndCapture(page, "10_crm_arabic_rtl_view");

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
    // PHASE 6: Sales Representative Persona & FLS Masking Verification (Light & Dark)
    // ═══════════════════════════════════════════════════════════════════════
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

    const repOppRow = page.locator("tbody tr").first();
    await expect(repOppRow).toBeVisible({ timeout: 25_000 });
    const oppRowsCount = await page.locator("tbody tr").count();
    expect(oppRowsCount).toBe(1);

    const maskedAmounts = repOppRow.getByText("••••••");
    await expect(maskedAmounts.first()).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Capture 11: Sales Rep FLS Masking in Table (Light & Dark)
    await setThemeAndCapture(page, "11_crm_sales_rep_fls_masked");

    // Switch to Kanban View
    const repKanbanToggle = page.getByTestId("toggle-kanban-view").first();
    await repKanbanToggle.click();
    await page.waitForTimeout(800);

    const repPipelineSettings = page.getByTestId("pipeline-settings-button");
    await expect(repPipelineSettings).not.toBeVisible();
    await expect(page.getByText("••••••").first()).toBeVisible({ timeout: 15_000 });

    // Capture 12: Sales Rep Restricted Access in Kanban (Light & Dark)
    await setThemeAndCapture(page, "12_crm_sales_rep_restricted_access");
  });

  test("Role-Based UAT: Persona access, FLS response masking, D4/B visibility, and 403 authorization denials", async ({
    request,
  }) => {
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

    const repOppsRes = await request.get("http://127.0.0.1:5035/api/v1/crm/opportunities", {
      headers: { Authorization: `Bearer ${repToken}` },
    });
    expect(repOppsRes.status()).toBe(200);
    const repOppsData = await repOppsRes.json();
    expect(repOppsData.totalCount).toBe(1);
    const firstRepOpp = repOppsData.items[0];
    expect(firstRepOpp.estimatedAmount).toBeNull();
    expect(firstRepOpp.maskedFieldKeys).toContain("estimatedAmount");
    expect(firstRepOpp.maskedFieldKeys).toContain("closeNotes");
    expect(firstRepOpp.maskedFieldKeys).toContain("approvalEvidenceRef");

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
    expect(repPipelineMutateRes.status()).toBe(403);

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

    const mgrOppsRes = await request.get("http://127.0.0.1:5035/api/v1/crm/opportunities", {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    expect(mgrOppsRes.status()).toBe(200);
    const mgrOppsData = await mgrOppsRes.json();
    expect(mgrOppsData.totalCount).toBe(0);

    const mgrPipelineRes = await request.get("http://127.0.0.1:5035/api/v1/crm/pipelines/default", {
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    expect(mgrPipelineRes.status()).toBe(200);
    const mgrPipelineData = await mgrPipelineRes.json();
    expect(mgrPipelineData.code || mgrPipelineData.key).toBe("default");
    expect(mgrPipelineData.stages.length).toBe(5);
  });
});
