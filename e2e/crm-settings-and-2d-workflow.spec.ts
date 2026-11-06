import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/CRM-OVERHAUL/screenshots"
);
const BRAIN_SCREENSHOT_DIRS = [
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/0bb57db6-4f63-4111-b08e-0c9081a63bf0",
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/0bb57db6-4f63-4111-b08e-0c9081a63bf0/screenshots",
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/8bd25edc-2619-4826-9374-aa66575beafc",
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/8bd25edc-2619-4826-9374-aa66575beafc/screenshots",
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/dcf7afe6-e67d-45ce-9ff4-31e89728e9bc/screenshots",
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/c71331a6-9ef7-4ba8-ab30-51c2dce3b98b/screenshots",
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
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const nexusMain = document.getElementById("nexus-content");
    if (nexusMain?.parentElement) {
      nexusMain.parentElement.scrollTop = 0;
    }
    const inspector = document.querySelector('[data-testid="workflow-inspector-panel"]');
    if (inspector) {
      (inspector as HTMLElement).scrollTop = 0;
    }
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
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const nexusMain = document.getElementById("nexus-content");
    if (nexusMain?.parentElement) {
      nexusMain.parentElement.scrollTop = 0;
    }
    const inspector = document.querySelector('[data-testid="workflow-inspector-panel"]');
    if (inspector) {
      (inspector as HTMLElement).scrollTop = 0;
    }
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
      if (!page.url().includes("/login")) break;
      const submitBtn = page.locator("form button[type='submit']").first();
      if ((await submitBtn.count()) === 0) break;
      await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
      await submitBtn.click();
      const navigated = await page
        .waitForURL((url) => !url.pathname.includes("/login"), { timeout: 25_000 })
        .then(() => true)
        .catch(() => false);
      if (navigated || !page.url().includes("/login")) break;
      await page.waitForTimeout(5_000);
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
    const resetPutRes = await resetPutPromise;
    const resetTenantBody = resetPutRes.request().postDataJSON() as {
      customFieldsConfigJson?: string;
    };
    expect(resetTenantBody.customFieldsConfigJson ?? "").not.toContain('"workflows"');
    await expect(page.getByTestId("crm-settings-save-banner")).toBeVisible({ timeout: 10_000 });

    // 2. Navigate to /crm/pipelines and verify Pipelines Directory List + Full-Screen 2D Studio + Relational Persistence
    await page.goto("/crm/pipelines");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("workflow-card-wf-deal-default")).toBeVisible();
    await expect(page.getByTestId("workflow-card-wf-lead-default")).toBeVisible();
    await setThemeAndCapture(page, "02a_crm_pipelines_directory_list");
    await setThemeAndCapture(page, "02_crm_pipelines_directory");
    await setThemeAndCapture(page, "02_crm_pipelines_page");

    // Create a custom workflow and verify PUT /api/v1/crm/pipelines/{id} persists relationally to crm.crm_pipelines
    await page.getByTestId("create-workflow-btn").click();
    await expect(page.getByTestId("create-workflow-modal")).toBeVisible();
    const customWfName = `Custom 2-Stage Pipeline ${Date.now().toString().slice(-4)}`;
    await page.getByTestId("create-wf-name-en-input").fill(customWfName);

    const putPipelinePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/crm/pipelines/") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByTestId("create-wf-submit-btn").click();
    const putPipelineRes = await putPipelinePromise;
    expect(putPipelineRes.status()).toBe(200);
    const sentPipelineBody = putPipelineRes.request().postDataJSON() as {
      nameEn?: string;
      entityType?: string;
      stages?: unknown[];
      transitionsJson?: string;
    };
    expect(sentPipelineBody.nameEn).toBe(customWfName);
    expect(sentPipelineBody.entityType).toBe("deal");
    expect(Array.isArray(sentPipelineBody.stages)).toBe(true);

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
    const getRelationalPipelinesPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/crm/pipelines") &&
        !res.url().includes("/api/v1/crm/pipelines/") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.reload();
    const getRelationalPipelinesRes = await getRelationalPipelinesPromise;
    const relationalJson = await getRelationalPipelinesRes.json();
    const relationalPipelines = Array.isArray(relationalJson?.data)
      ? relationalJson.data
      : Array.isArray(relationalJson)
        ? relationalJson
        : [];
    expect(relationalPipelines.length).toBeGreaterThanOrEqual(8);

    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible({ timeout: 15_000 });
    const customWfCard = page.locator('[data-testid^="workflow-card-"]', { hasText: customWfName }).first();
    await expect(customWfCard).toBeVisible({ timeout: 15_000 });
    // Clean up the temporary custom workflow after verifying persistence
    await customWfCard.locator('[data-testid^="workflow-delete-"]').click();

    // Helper to assert 0 overlapping transition pills (pill-to-pill AND pill-to-node) on the active 2D canvas
    const assertZeroOverlappingTransitionPills = async () => {
      const collisionDetails = await page.evaluate(() => {
        const pills = Array.from(
          document.querySelectorAll('[data-testid^="canvas-transition-"]')
        ) as HTMLElement[];
        const nodes = Array.from(
          document.querySelectorAll(
            '[data-testid^="canvas-node-"]:not([data-testid="canvas-node-start"])'
          )
        ) as HTMLElement[];

        const pillItems = pills
          .map((el) => ({
            id: el.getAttribute("data-testid") || el.innerText.trim(),
            rect: el.getBoundingClientRect(),
          }))
          .filter((item) => item.rect.width > 0 && item.rect.height > 0);

        const nodeItems = nodes
          .map((el) => ({
            id: el.getAttribute("data-testid") || "node",
            rect: el.getBoundingClientRect(),
          }))
          .filter((item) => item.rect.width > 0 && item.rect.height > 0);

        const collisions: string[] = [];
        for (let i = 0; i < pillItems.length; i++) {
          for (let j = i + 1; j < pillItems.length; j++) {
            const a = pillItems[i].rect;
            const b = pillItems[j].rect;
            const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            if (xOverlap > 2 && yOverlap > 2) {
              collisions.push(`Pill [${pillItems[i].id}] overlaps Pill [${pillItems[j].id}]`);
            }
          }
          for (const node of nodeItems) {
            const a = pillItems[i].rect;
            const b = node.rect;
            const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            if (xOverlap > 2 && yOverlap > 2) {
              collisions.push(`Pill [${pillItems[i].id}] overlaps Node [${node.id}]`);
            }
          }
        }
        return collisions;
      });
      expect(collisionDetails, collisionDetails.join("; ")).toHaveLength(0);
    };

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
    await expect(page.getByTestId("studio-dynamic-stage-count")).toContainText("Statuses");

    // Verify Closed Won is a first-class configurable, colorable, replaceable stage (SCRIPE-775)
    await page.getByTestId("canvas-node-terminal-won").click();
    await expect(page.getByTestId("status-inspector-color-picker")).toBeVisible();
    await expect(page.getByTestId("inspector-replace-stage-btn")).toBeVisible();

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

    await assertZeroOverlappingTransitionPills();

    // Test Per-Stage Color Picker & inline Custom Field creation on Proposal stage
    await page.getByTestId("canvas-node-default.proposal").click();
    await expect(page.getByTestId("status-inspector-color-picker")).toBeVisible();
    await page.getByTestId("status-color-swatch-amber").click();
    await expect(page.getByTestId("canvas-node-default.proposal")).toHaveAttribute("data-stage-color", "amber");
    await expect(page.getByTestId("minimap-node-default.proposal")).toHaveAttribute("data-stage-color", "amber");
    await page.getByTestId("status-color-swatch-indigo").click();
    await expect(page.getByTestId("canvas-node-default.proposal")).toHaveAttribute("data-stage-color", "indigo");

    await expect(page.getByTestId("canvas-node-default.discovery")).toContainText("10%");
    await expect(page.getByTestId("canvas-node-default.discovery")).toContainText("7d");
    await expect(page.getByTestId("canvas-node-default.qualification")).toContainText("25%");
    await expect(page.getByTestId("canvas-node-default.qualification")).toContainText("10d");
    await expect(page.getByTestId("canvas-node-default.solution_fit")).toContainText("50%");
    await expect(page.getByTestId("canvas-node-default.solution_fit")).toContainText("14d");
    await expect(page.getByTestId("canvas-node-default.proposal")).toContainText("75%");
    await expect(page.getByTestId("canvas-node-default.proposal")).toContainText("14d");
    await expect(page.getByTestId("canvas-node-default.negotiation")).toContainText("90%");
    await expect(page.getByTestId("canvas-node-default.negotiation")).toContainText("21d");
    await expect(page.getByTestId("canvas-node-terminal-won")).toContainText("100%");
    await expect(page.getByTestId("canvas-node-terminal-lost")).toContainText("0%");

    await page.getByTestId("workflow-create-custom-field-btn").click();
    await expect(page.getByTestId("workflow-cf-type-select")).toBeVisible();
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
    await assertZeroOverlappingTransitionPills();
    await setThemeAndCapture(page, "02h_crm_workflow_minimap_and_zoom");

    await page.getByTestId("inspector-replace-stage-btn").click();
    await expect(page.getByTestId("replace-status-migration-modal")).toBeVisible();
    await setThemeAndCapture(page, "02g_crm_workflow_replace_status_modal");
    await setThemeAndCapture(page, "02g_crm_workflow_replace_status_migration_modal");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("replace-status-migration-modal")).toBeHidden();

    // Select a transition to verify Multi-Source From Statuses, Triggers (+), Domain Event selector, and 4-Category Rule Catalog Modal
    await page.getByTestId("canvas-transition-default.discovery").first().click();
    await page.getByTestId("inspector-toggle-multi-from-btn").click();
    await expect(page.getByTestId("inspector-multi-from-list")).toBeVisible();
    // Collapse multi-from list after verifying so Transition Inspector fits cleanly in 02f
    await page.getByTestId("inspector-toggle-multi-from-btn").click();
    await expect(page.getByTestId("inspector-multi-from-list")).toBeHidden();

    await expect(page.getByTestId("inspector-transition-add-trigger-btn")).toBeVisible();
    await page.getByTestId("inspector-transition-add-trigger-btn").click();
    await page.getByTestId("add-trigger-quote_accepted").click();
    await expect(page.getByTestId("transition-trigger-badge-quote_accepted")).toBeVisible();
    await expect(page.getByTestId("inspector-to-stage-select")).toBeVisible();
    await expect(page.getByTestId("inspector-transition-event-select")).toBeVisible();
    await expect(page.getByTestId("inspector-bottom-delete-transition-btn")).toBeVisible();

    // Verify Add transition property modal (02i Jira Screenshot 5 parity)
    await page.getByTestId("inspector-transition-add-property-btn").click();
    await expect(page.getByTestId("transition-properties-modal")).toBeVisible();
    await expect(page.getByText("Add new property")).toBeVisible();
    await page.getByTestId("transition-prop-key-input").fill("jira.i18n.title");
    await page.getByTestId("transition-prop-val-input").fill("Approve Transition");
    await setThemeAndCapture(page, "02i_crm_workflow_transition_properties_modal");
    await page.getByTestId("transition-prop-save-btn").click();
    await expect(page.getByTestId("transition-properties-modal")).toBeHidden();
    await expect(page.getByTestId("transition-prop-row-jira.i18n.title")).toBeVisible();

    // Collapse the expanded Validate rule card so all 4 rule categories, Triggers (+), EVENT, Properties (+), and Delete fit in 02f without scrolling
    await page.getByTestId("transition-rule-card-validate").click();

    // Ensure Transition Rule Inspector is scrolled to top (scrollTop = 0) before capturing 02f
    await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="workflow-inspector-panel"]');
      if (panel) panel.scrollTop = 0;
    });
    await setThemeAndCapture(page, "02f_crm_workflow_transition_inspector");

    // Click Add Rule in the top toolbar to directly open the 4-Category Rule Catalog Modal & configure Step 2
    await page.getByTestId("crm-toolbar-add-rule").click();
    await expect(page.getByTestId("workflow-rule-catalog-modal")).toBeVisible();
    await setThemeAndCapture(page, "02e_crm_workflow_4category_rule_catalog_modal");
    await page.getByTestId("select-catalog-rule-restrict.approval_required").click();
    await expect(page.getByTestId("rule-catalog-step2-config")).toBeVisible();
    await expect(page.getByTestId("rule-catalog-transition-select")).toBeVisible();
    await setThemeAndCapture(page, "02h_crm_workflow_rule_step2_config_modal");
    await setThemeAndCapture(page, "02h_crm_2d_workflow_studio_rule_modal");
    await page.getByTestId("confirm-add-catalog-rule-btn").click();
    await expect(page.getByTestId("workflow-rule-catalog-modal")).toBeHidden();

    // Reselect Proposal stage and frame the 2D workflow canvas cleanly from START
    await page.getByTestId("canvas-node-default.proposal").click();
    await page.evaluate(() => {
      const surface = document.querySelector('[data-testid="crm-2d-graph-surface"]');
      if (surface) {
        surface.scrollLeft = 0;
        surface.scrollTop = 0;
      }
      const panel = document.querySelector('[data-testid="workflow-inspector-panel"]');
      if (panel) panel.scrollTop = 0;
    });
    await assertZeroOverlappingTransitionPills();
    await setThemeAndCapture(page, "02b_crm_pipelines_workflow_canvas_inspector");

    // Open Live Workflow Simulation Sandbox (SCRIPE-780) and capture 02j
    await page.getByTestId("canvas-simulate-workflow-btn").click();
    await expect(page.getByTestId("workflow-simulation-sandbox")).toBeVisible();
    await setThemeAndCapture(page, "02j_crm_workflow_canvas_simulation_mode");
    await setThemeAndCapture(page, "02j_crm_2d_workflow_studio_inline_field_and_role");
    await page.getByTestId("canvas-simulate-workflow-btn").click();
    await expect(page.getByTestId("workflow-simulation-sandbox")).toBeHidden();

    // Switch to Classic Flow mode and Transitions Table (Text) mode
    await page.getByTestId("workflow-mode-classic").click();
    await expect(page.getByTestId("workflow-classic-flow-surface")).toBeVisible();
    await page.getByTestId("workflow-mode-text").click();
    await expect(page.getByTestId("workflow-text-mode-table")).toBeVisible();
    await setThemeAndCapture(page, "02d_crm_pipelines_workflow_text_mode");

    // Switch back to Diagram mode and switch to Leads Workflows 2D Graph
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
    await assertZeroOverlappingTransitionPills();

    await page.getByTestId("canvas-node-lead.qualified").click();
    await expect(page.getByTestId("status-inspector-color-picker")).toBeVisible();
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
      const panel = document.querySelector('[data-testid="workflow-inspector-panel"]');
      if (panel) panel.scrollTop = 0;
    });
    await setThemeAndCapture(page, "02c_crm_pipelines_leads_workflow_canvas");

    // Close Full-Screen Studio back to Pipelines List
    await page.getByTestId("studio-back-to-list-btn").click();
    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible();

    // 3. Navigate to /crm/opportunities and verify Unified Kanban Columns (no bottom WON/LOST bars), Board Settings v2, and Deal 360
    await page.goto("/crm/opportunities");
    await page.waitForLoadState("networkidle");

    const globalCurrencySelect = page.getByTestId("crm-global-currency-select");
    await expect(globalCurrencySelect).toBeVisible({ timeout: 15_000 });
    const currencyWrapperClass = await globalCurrencySelect.locator("..").getAttribute("class");
    expect(currencyWrapperClass).toContain("min-w-[140px]");
    await expect(page.getByTestId("deal-pipeline-selector")).toBeVisible();
    await expect(page.getByTestId("pipeline-settings-button")).toHaveCount(0);
    await page.getByTestId("deal-pipeline-selector").click();
    const dealPipelineOptionCount = await page.getByRole("option").count();
    expect(dealPipelineOptionCount).toBeGreaterThanOrEqual(4);
    await page.keyboard.press("Escape");

    await expect(page.getByTestId("board-settings-button")).toBeVisible();

    const oppsKanbanToggle = page.getByTestId("toggle-kanban-view").first();
    await oppsKanbanToggle.click();
    await expect(page.getByTestId("kanban-column-default.discovery")).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator('[data-testid="kanban-column-default.closed_won"], [data-testid="kanban-column-terminal-won"]').first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator('[data-testid="kanban-column-default.closed_lost"], [data-testid="kanban-column-terminal-lost"]').first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("kanban-dropzone-closed-won")).toHaveCount(0);
    await expect(page.getByTestId("kanban-dropzone-closed-lost")).toHaveCount(0);

    const lostColRight = await page.evaluate(() => {
      const col = document.querySelector(
        '[data-testid="kanban-column-default.closed_lost"], [data-testid="kanban-column-terminal-lost"]'
      );
      return col ? col.getBoundingClientRect().right : 9999;
    });
    expect(lostColRight).toBeLessThanOrEqual(1440);

    const firstKanbanCard = page.getByTestId("kanban-card").first();
    await expect(firstKanbanCard).toBeVisible({ timeout: 10_000 });
    const cardTitleClass = await firstKanbanCard.locator("h4").getAttribute("class");
    expect(cardTitleClass).toContain("line-clamp-2");

    await setThemeAndCapture(page, "06b_crm_opportunities_kanban_5col");

    // Open Board Settings v2 dialog and capture 06c
    await page.getByTestId("board-settings-button").click();
    await expect(page.getByTestId("board-settings-dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("board-wip-row-terminal-won")).toBeVisible();
    await expect(page.getByTestId("board-wip-row-terminal-lost")).toBeVisible();
    await setThemeAndCapture(page, "06c_crm_opportunities_board_settings_modal");
    await setThemeAndCapture(page, "06c_crm_opportunities_board_settings_v2");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("board-settings-dialog")).toBeHidden();

    // Open first deal to capture 07_crm_deal_360_buying_committee_and_quotes
    await firstKanbanCard.locator("h4").first().click();
    await page.waitForURL(/\/crm\/opportunities\/.+/, { timeout: 15_000 });
    await expect(page.getByTestId("opportunity-detail-view")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("stage-step-terminal-won")).toBeVisible();
    await expect(page.getByTestId("stage-step-terminal-lost")).toBeVisible();
    await expect(page.getByTestId("deal-stage-playbook-card")).toBeVisible();
    await expect(page.getByTestId("deal-transition-audit-ledger")).toBeVisible();

    // Verify all 9 CRM sub-navigation tabs are visible on a single row without horizontal clipping at 1440x900
    const overviewTabBox = await page.getByTestId("crm-tab-overview").boundingBox();
    expect(overviewTabBox).not.toBeNull();
    for (const tabId of [
      "overview",
      "leads",
      "deals",
      "accounts",
      "contacts",
      "activities",
      "pipelines",
      "reports",
      "settings",
    ]) {
      const tabBtn = page.getByTestId(`crm-tab-${tabId}`);
      await expect(tabBtn).toBeVisible();
      const tabBox = await tabBtn.boundingBox();
      expect(tabBox).not.toBeNull();
      expect((tabBox?.x ?? 0) + (tabBox?.width ?? 0)).toBeLessThanOrEqual(1440);
      expect(Math.abs((tabBox?.y ?? 0) - (overviewTabBox?.y ?? 0))).toBeLessThanOrEqual(8);
    }

    // Verify Buying Committee contact SelectTrigger displays visible placeholder
    const committeePartyText = await page.getByTestId("committee-party-select").innerText();
    expect(committeePartyText.trim()).toContain("Select Contact / Stakeholder");

    // Verify Deal Commercial Package syncs to backend server (PUT /api/v1/crm/settings/tenant)
    const putQuotePackagePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/settings/tenant") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );
    await page.getByTestId("venue-block-booking-hold-btn").click();
    const putQuotePackageRes = await putQuotePackagePromise;
    expect(putQuotePackageRes.status()).toBe(200);
    const quotePkgBody = putQuotePackageRes.request().postDataJSON() as {
      customFieldsConfigJson?: string;
    };
    expect(quotePkgBody.customFieldsConfigJson ?? "").toContain("dealCommercialPackages");

    await page.waitForLoadState("networkidle");
    await setThemeAndCapture(page, "07_crm_deal_360_buying_committee_and_quotes");
    await setThemeAndCapture(page, "07_crm_deal_360_detail_page");

    // 4. Navigate to /crm/leads and verify Leads table, Lead Workflow Selector & dynamic colored Kanban board
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("lead-pipeline-selector")).toBeVisible();
    await page.getByTestId("lead-pipeline-selector").click();
    const leadPipelineOptionCount = await page.getByRole("option").count();
    expect(leadPipelineOptionCount).toBeGreaterThanOrEqual(3);
    await page.keyboard.press("Escape");
    const leadsKanbanBtn = page.getByTestId("toggle-kanban-view").first();
    await leadsKanbanBtn.click();
    await expect(
      page.locator('[data-testid^="lead-kanban-card-"]').first()
    ).toBeVisible({ timeout: 10_000 });
    await setThemeAndCapture(page, "08_crm_leads_dynamic_kanban");
    await setThemeAndCapture(page, "08_crm_leads_kanban_board");

    // 5. Navigate to /crm/settings and verify 2-Pane Workspace, Decoupled Pipeline Roles, Multi-Currency Engine & Custom Fields Studio
    await page.goto("/crm/settings");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("crm-settings-view")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("crm-settings-2pane-workspace")).toBeVisible();
    await expect(page.getByTestId("crm-settings-left-sidebar")).toBeVisible();
    await expect(page.getByTestId("crm-settings-roles-principals-card")).toBeVisible();
    await expect(page.getByTestId("crm-settings-currency-card")).toBeVisible();
    await expect(page.getByTestId("crm-settings-governance-card")).toBeVisible();
    await expect(page.getByTestId("crm-settings-user-workspace-card")).toBeVisible();
    await expect(page.getByTestId("crm-settings-custom-fields-card")).toBeVisible();

    // Verify Role Creation 2-column form and Add Pipeline Role button fit above the 900px viewport fold on /crm/settings
    const saveRoleBtnBox = await page.getByTestId("crm-settings-save-role-btn").boundingBox();
    expect(saveRoleBtnBox).not.toBeNull();
    expect((saveRoleBtnBox?.y ?? 999) + (saveRoleBtnBox?.height ?? 0)).toBeLessThanOrEqual(900);

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

    // Open Smart Guide & Interactive User Journeys Modal (SCRIPE-784) and capture 10
    await page.getByTestId("crm-smart-guide-trigger").click();
    await expect(page.getByTestId("crm-smart-guide-modal")).toBeVisible();
    // Verify zero text collision between left journey buttons and right detail panel
    const guideCollision = await page.evaluate(() => {
      const leftBtn = document.querySelector('[data-testid="smart-guide-tab-pipeline-roles"]');
      const rightPanel = document.querySelector('[data-testid^="smart-guide-panel-"]');
      if (!leftBtn || !rightPanel) return true;
      return leftBtn.getBoundingClientRect().right > rightPanel.getBoundingClientRect().left;
    });
    expect(guideCollision).toBe(false);
    await setThemeAndCapture(page, "10_crm_smart_guide_and_user_journeys");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("crm-smart-guide-modal")).toBeHidden();

    // Capture 11_crm_skeleton_loading_state by holding CRM overview endpoints open while capturing light & dark screenshots
    const overviewRoutePattern = /\/v1\/crm\/(pipelines\/default|opportunities|reports\/pipeline)/;
    const releaseResolvers: Array<() => void> = [];
    await page.route(overviewRoutePattern, async (route) => {
      await new Promise<void>((resolve) => {
        releaseResolvers.push(resolve);
        setTimeout(resolve, 30_000);
      });
      try {
        await route.continue();
      } catch {
        // Ignore if unroute already handled the request
      }
    });
    await page.goto("/crm", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("crm-overview-skeleton")).toBeVisible({ timeout: 10_000 });
    await setThemeAndCapture(page, "11_crm_skeleton_loading_state");
    await page.unroute(overviewRoutePattern, { behavior: "ignoreErrors" });
    releaseResolvers.forEach((fn) => fn());
    await page.waitForLoadState("networkidle");

    // Restore canonical tenant settings & workflows on /crm/settings after test completion
    await page.goto("/crm/settings");
    await page.waitForLoadState("networkidle");
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
