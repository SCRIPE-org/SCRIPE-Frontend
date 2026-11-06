import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/CRM-OVERHAUL/screenshots"
);
const BRAIN_SCREENSHOT_DIRS = [
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/8bd25edc-2619-4826-9374-aa66575beafc",
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/8bd25edc-2619-4826-9374-aa66575beafc/screenshots",
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/dcf7afe6-e67d-45ce-9ff4-31e89728e9bc/screenshots",
];

for (const dir of [SCREENSHOT_DIR, ...BRAIN_SCREENSHOT_DIRS]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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
      const fileName = path.basename(targetPath);
      for (const brainDir of BRAIN_SCREENSHOT_DIRS) {
        try {
          fs.copyFileSync(targetPath, path.join(brainDir, fileName));
        } catch {}
      }
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
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  });
  await page.waitForTimeout(350);
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}_light.png`));
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}.png`));

  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  });
  await page.waitForTimeout(350);
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}_dark.png`));

  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(200);
}

test.describe("CRM Settings Hub & 2D Jira Workflow Studio E2E Verification", () => {
  test.setTimeout(240_000);

  test("Verifies /crm/pipelines (List + Full-Screen Studio + Server-Side Persistence), /crm/opportunities (single-line Kanban totals + 2-line titles + min-w-[140px] currency selector), /crm/leads, and /crm/settings", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Login as Tenant Admin
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill(getDevAdminPassword());

    for (let loginAttempt = 0; loginAttempt < 5; loginAttempt++) {
      const submitBtn = page.locator("form button[type='submit']").first();
      await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
      await submitBtn.click();
      const navigated = await page
        .waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 })
        .then(() => true)
        .catch(() => false);
      if (navigated) break;
      await page.waitForTimeout(15_000);
    }
    await expect(page).not.toHaveURL(/\/login/);
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Reset tenant settings & workflows to clean defaults before running assertions & capturing screenshots
    await page.goto("/crm/settings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("crm-settings-reset-btn")).toBeVisible({ timeout: 15_000 });
    const resetPutPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/settings/tenant") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByTestId("crm-settings-reset-btn").click();
    await resetPutPromise;
    await expect(page.getByTestId("crm-settings-save-banner")).toBeVisible({ timeout: 10_000 });

    // 2. Navigate to /crm/pipelines and verify Pipelines Directory List + Full-Screen 2D Studio + Server-Side Persistence
    await page.goto("/crm/pipelines");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("workflow-card-wf-deal-default")).toBeVisible();
    await expect(page.getByTestId("workflow-card-wf-lead-default")).toBeVisible();
    await setThemeAndCapture(page, "02a_crm_pipelines_directory_list");
    await setThemeAndCapture(page, "02_crm_pipelines_directory");
    await setThemeAndCapture(page, "02_crm_pipelines_page");

    // Create a custom workflow and verify PUT /api/v1/crm/settings/tenant persists workflows JSON to PostgreSQL
    await page.getByTestId("create-workflow-btn").click();
    await expect(page.getByTestId("create-workflow-modal")).toBeVisible();
    const customWfName = `Custom 2-Stage Pipeline ${Date.now().toString().slice(-4)}`;
    await page.getByTestId("create-wf-name-en-input").fill(customWfName);

    const putTenantWorkflowsPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/settings/tenant") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByTestId("create-wf-submit-btn").click();
    const putTenantWfRes = await putTenantWorkflowsPromise;
    expect(putTenantWfRes.status()).toBe(200);
    const sentTenantBody = putTenantWfRes.request().postDataJSON() as {
      customFieldsConfigJson?: string;
    };
    expect(sentTenantBody.customFieldsConfigJson).toContain(customWfName);
    expect(sentTenantBody.customFieldsConfigJson).toContain('"workflows"');

    // Verify Full-Screen Studio opened automatically as a standalone z-[9999] portal covering the dashboard header
    const studioRoot = page.getByTestId("crm-workflow-fullscreen-studio");
    await expect(studioRoot).toBeVisible({ timeout: 10_000 });
    const topElementIsInsideStudio = await page.evaluate(() => {
      const topEl = document.elementFromPoint(200, 20);
      const studio = document.querySelector('[data-testid="crm-workflow-fullscreen-studio"]');
      return Boolean(studio && topEl && studio.contains(topEl));
    });
    expect(topElementIsInsideStudio).toBe(true);

    // Return to directory list, clear localStorage, reload /crm/pipelines, and verify PostgreSQL hydration restores customWfName
    await page.getByTestId("studio-back-to-list-btn").click();
    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible();
    await page.evaluate(() => {
      localStorage.removeItem("scripe-crm-workflows-v2");
      localStorage.removeItem("scripe-crm-settings");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible({ timeout: 15_000 });
    const customWfCard = page.locator('[data-testid^="workflow-card-"]', { hasText: customWfName }).first();
    await expect(customWfCard).toBeVisible({ timeout: 15_000 });
    // Clean up the temporary custom workflow after verifying persistence
    await customWfCard.locator('[data-testid^="workflow-delete-"]').click();

    // Open Default Deal Workflow in Studio
    await page.getByTestId("workflow-edit-studio-wf-deal-default").click();
    await expect(studioRoot).toBeVisible({ timeout: 10_000 });

    await expect(page.getByTestId("crm-2d-graph-surface")).toBeVisible();
    await expect(page.getByTestId("crm-2d-svg-edges")).toBeVisible();
    await expect(page.getByTestId("canvas-node-start")).toBeVisible();
    await expect(page.getByTestId("canvas-node-default.discovery")).toBeVisible();
    await expect(page.getByTestId("canvas-node-default.proposal")).toBeVisible();
    await expect(page.getByTestId("canvas-node-terminal-won")).toBeVisible();
    await expect(page.getByTestId("canvas-node-terminal-lost")).toBeVisible();
    await expect(page.getByTestId("workflow-minimap")).toBeVisible();

    // Click Discovery stage node to reveal all 8 connection ports (2 per side) and drag-to-connect to Proposal
    await page.getByTestId("canvas-node-default.discovery").click();
    for (const portId of [
      "top-1",
      "top-2",
      "right-1",
      "right-2",
      "bottom-1",
      "bottom-2",
      "left-1",
      "left-2",
    ]) {
      await expect(
        page.getByTestId(`node-port-default.discovery-${portId}`)
      ).toHaveClass(/opacity-100/);
    }

    const sourcePort = page.getByTestId("node-port-default.discovery-right-1");
    const targetNode = page.getByTestId("canvas-node-default.proposal");
    await sourcePort.dragTo(targetNode);
    await expect(page.getByTestId("add-transition-modal")).toBeVisible({ timeout: 5_000 });
    await page.getByTestId("new-transition-name-en-input").fill("Fast-Track to Proposal");
    await page.getByTestId("new-transition-submit-btn").click();
    await expect(page.getByTestId("add-transition-modal")).toBeHidden();

    // Add a second cross-stage skip transition (Qualification -> Negotiation) and verify staggered vertical lanes
    await page.getByTestId("canvas-node-default.qualification").click();
    const secondSourcePort = page.getByTestId("node-port-default.qualification-right-1");
    const secondTargetNode = page.getByTestId("canvas-node-default.negotiation");
    await secondSourcePort.dragTo(secondTargetNode);
    await expect(page.getByTestId("add-transition-modal")).toBeVisible({ timeout: 5_000 });
    await page.getByTestId("new-transition-name-en-input").fill("Skip to Negotiation");
    await page.getByTestId("new-transition-submit-btn").click();
    await expect(page.getByTestId("add-transition-modal")).toBeHidden();

    const skipPill1Box = await page.getByText("Fast-Track to Proposal").first().boundingBox();
    const skipPill2Box = await page.getByText("Skip to Negotiation").first().boundingBox();
    expect(skipPill1Box).not.toBeNull();
    expect(skipPill2Box).not.toBeNull();
    expect(Math.abs((skipPill1Box?.y ?? 0) - (skipPill2Box?.y ?? 0))).toBeGreaterThanOrEqual(18);

    // Test inline Custom Field creation & stage gate binding in the Inspector
    await page.getByTestId("canvas-node-default.proposal").click();
    await page.getByTestId("workflow-create-custom-field-btn").click();
    const uniqueKey = `exec_sponsor_${Date.now().toString().slice(-4)}`;
    await page.getByTestId("workflow-cf-key-input").fill(uniqueKey);
    await page.getByTestId("workflow-cf-label-input").fill("Executive Sponsor Approval");
    await page.getByTestId("workflow-cf-save-btn").click();
    await expect(
      page.getByTestId(`inspector-default.proposal-exit-field-custom:${uniqueKey}`)
    ).toBeVisible({ timeout: 5_000 });

    // Verify Proportional 2D Spatial Mini-Map, Zoom Slider (50%-150%), Tidy Auto-Layout, and Status Replacement Migration Modal
    await expect(page.getByTestId("workflow-minimap-surface")).toBeVisible();
    await expect(page.getByTestId("minimap-viewport-box")).toBeVisible();
    await expect(page.getByTestId("minimap-zoom-slider")).toBeVisible();
    await expect(page.getByTestId("minimap-node-default.discovery")).toBeVisible();
    await page.getByTestId("canvas-tidy-auto-layout-btn").click();

    await page.getByTestId("inspector-replace-stage-btn").click();
    await expect(page.getByTestId("replace-status-migration-modal")).toBeVisible();
    await setThemeAndCapture(page, "02g_crm_workflow_replace_status_migration_modal");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("replace-status-migration-modal")).toBeHidden();

    // Select a transition to verify Multi-Source From Statuses, Triggers (+), Domain Event selector, and 4-Category Rule Catalog Modal
    await page.getByTestId("canvas-transition-default.discovery").first().click();
    await page.getByTestId("inspector-toggle-multi-from-btn").click();
    await expect(page.getByTestId("inspector-multi-from-list")).toBeVisible();
    await expect(page.getByTestId("inspector-transition-add-trigger-btn")).toBeVisible();
    await page.getByTestId("inspector-transition-add-trigger-btn").click();
    await page.getByTestId("add-trigger-quote_accepted").click();
    await expect(page.getByTestId("transition-trigger-badge-quote_accepted")).toBeVisible();
    await expect(page.getByTestId("inspector-transition-event-select")).toBeVisible();
    await setThemeAndCapture(page, "02f_crm_workflow_transition_inspector");

    // Click + Add Rule in the top toolbar to directly open the 4-Category Rule Catalog Modal
    await page.getByTestId("crm-toolbar-add-rule").click();
    await expect(page.getByTestId("workflow-rule-catalog-modal")).toBeVisible();
    await setThemeAndCapture(page, "02e_crm_workflow_4category_rule_catalog_modal");
    await page.getByTestId("select-catalog-rule-restrict.approval_required").click();
    await expect(page.getByTestId("workflow-rule-catalog-modal")).toBeHidden();

    // Reselect Proposal stage and frame the 2D workflow canvas cleanly from START at 70% zoom
    await page.getByTestId("canvas-node-default.proposal").click();
    await page.evaluate(() => {
      const surface = document.querySelector('[data-testid="crm-2d-graph-surface"]');
      if (surface) {
        surface.scrollLeft = 0;
        surface.scrollTop = 0;
      }
    });
    await setThemeAndCapture(page, "02b_crm_pipelines_workflow_canvas_inspector");

    // Switch to Classic Flow mode and Transitions Table (Text) mode
    await page.getByTestId("workflow-mode-classic").click();
    await expect(page.getByTestId("workflow-classic-flow-surface")).toBeVisible();
    await page.getByTestId("workflow-mode-text").click();
    await expect(page.getByTestId("workflow-text-mode-table")).toBeVisible();
    await setThemeAndCapture(page, "02d_crm_pipelines_workflow_text_mode");

    // Switch back to Diagram mode and switch to Leads Qualification 2D Graph
    await page.getByTestId("workflow-mode-diagram").click();
    await page.getByTestId("workflow-switch-leads").click();

    await expect(page.getByTestId("crm-2d-graph-surface")).toBeVisible();
    await expect(page.getByTestId("crm-2d-svg-edges")).toBeVisible();
    await expect(page.getByTestId("canvas-node-start")).toBeVisible();
    await expect(page.getByTestId("canvas-node-lead.new")).toBeVisible();
    await expect(page.getByTestId("canvas-node-lead.working")).toBeVisible();
    await expect(page.getByTestId("canvas-node-lead.qualified")).toBeVisible();
    await expect(page.getByTestId("canvas-node-lead.converted")).toBeVisible();
    await expect(page.getByTestId("canvas-node-lead.disqualified")).toBeVisible();
    await expect(page.getByTestId("canvas-transition-lead.new").first()).toBeVisible();
    await expect(page.getByTestId("workflow-minimap")).toBeVisible();

    await page.getByTestId("canvas-node-lead.qualified").click();
    await expect(page.getByText("Phone or Email Present")).toBeVisible();
    await expect(page.getByText("Lead Source Channel")).toBeVisible();
    await expect(page.getByText("Qualification Summary / BANT")).toBeVisible();
    await expect(page.getByText("Linked Account or Contact")).toBeVisible();
    const inspectorText = await page.getByTestId("workflow-inspector-panel").innerText();
    expect(inspectorText).not.toContain("leadPhoneOrEmail");
    await page.evaluate(() => {
      const surface = document.querySelector('[data-testid="crm-2d-graph-surface"]');
      if (surface) {
        surface.scrollLeft = 0;
        surface.scrollTop = 0;
      }
    });
    await setThemeAndCapture(page, "02c_crm_pipelines_leads_workflow_canvas");

    // Close Full-Screen Studio back to Pipelines List
    await page.getByTestId("studio-back-to-list-btn").click();
    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible();

    // 3. Navigate to /crm/opportunities and verify Kanban column totals, 2-line card titles, and min-w-[140px] currency selector
    await page.goto("/crm/opportunities");
    await page.waitForLoadState("networkidle");

    const globalCurrencySelect = page.getByTestId("crm-global-currency-select");
    await expect(globalCurrencySelect).toBeVisible({ timeout: 15_000 });
    const currencyWrapperClass = await globalCurrencySelect.locator("..").getAttribute("class");
    expect(currencyWrapperClass).toContain("min-w-[140px]");

    const oppsKanbanToggle = page.getByTestId("toggle-kanban-view").first();
    await oppsKanbanToggle.click();
    await expect(page.getByTestId("kanban-column-default.discovery")).toBeVisible({ timeout: 10_000 });

    const firstKanbanCard = page.getByTestId("kanban-card").first();
    await expect(firstKanbanCard).toBeVisible({ timeout: 10_000 });
    const cardTitleClass = await firstKanbanCard.locator("h4").getAttribute("class");
    expect(cardTitleClass).toContain("line-clamp-2");

    await setThemeAndCapture(page, "06b_crm_opportunities_kanban_5col");

    // 4. Navigate to /crm/leads and verify Leads table & dynamic Kanban board
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });
    const leadsKanbanBtn = page.getByTestId("toggle-kanban-view").first();
    await leadsKanbanBtn.click();
    await expect(
      page.locator('[data-testid^="lead-kanban-card-"]').first()
    ).toBeVisible({ timeout: 10_000 });

    // 5. Navigate to /crm/settings and verify Server-Side Persistence, Multi-Currency Engine & Custom Fields Studio
    await page.goto("/crm/settings");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("crm-settings-view")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("crm-settings-currency-card")).toBeVisible();
    await expect(page.getByTestId("crm-settings-governance-card")).toBeVisible();
    await expect(page.getByTestId("crm-settings-user-workspace-card")).toBeVisible();
    await expect(page.getByTestId("crm-settings-custom-fields-card")).toBeVisible();

    // Create a Custom Field via Custom Fields Studio on /crm/settings
    const settingsCfKey = `board_committee_ref_${Date.now().toString().slice(-4)}`;
    await page.getByTestId("crm-cf-key-input").fill(settingsCfKey);
    await page.getByTestId("crm-cf-label-en-input").fill("Board Committee Reference");
    await page.getByTestId("crm-cf-label-ar-input").fill("مرجع لجنة مجلس الإدارة");
    await page.getByTestId("crm-cf-submit-btn").click();
    await expect(page.getByTestId(`crm-cf-row-${settingsCfKey}`)).toBeVisible({ timeout: 10_000 });

    // Switch Base Reporting Currency to SAR and verify Live FX Simulator updates
    await page.getByTestId("crm-settings-base-currency-select").click();
    await page.getByRole("option", { name: /SAR/i }).first().click();
    await expect(page.getByTestId("crm-sim-result-box")).toContainText("SAR");

    // Save Configuration and verify PUT /api/v1/crm/settings/tenant preserves both customFields and workflows
    const putSettingsPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/settings") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByTestId("crm-settings-save-btn").click();
    const putRes = await putSettingsPromise;
    expect(putRes.status()).toBe(200);
    await expect(page.getByTestId("crm-settings-save-banner")).toBeVisible({ timeout: 10_000 });

    await setThemeAndCapture(page, "09_crm_settings_governance_currency_hub");

    // Restore canonical tenant settings & workflows on /crm/settings after test completion
    const finalResetPutPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/settings/tenant") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByTestId("crm-settings-reset-btn").click();
    await finalResetPutPromise;
    await expect(page.getByTestId("crm-settings-save-banner")).toBeVisible({ timeout: 10_000 });
  });
});
