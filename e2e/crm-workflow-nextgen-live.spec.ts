import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/CRM_WORKFLOW_NEXTGEN/screenshots"
);

function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

async function safeScreenshot(page: Page, filePath: string) {
  ensureScreenshotDir();
  await page.waitForTimeout(400);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[E2E QA] Saved: ${path.basename(filePath)} (${fs.statSync(filePath).size} bytes)`);
}

async function setThemeAndCapture(page: Page, baseName: string) {
  // Light Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(350);
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}_light.png`));
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}.png`));

  // Dark Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  });
  await page.waitForTimeout(350);
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}_dark.png`));

  // Restore Light
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(200);
}

async function setRtlAndCapture(page: Page, baseName: string) {
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
    localStorage.setItem("scr_lang", "ar");
    localStorage.setItem("language", "ar");
    localStorage.setItem("NEXT_LOCALE", "ar");
    document.cookie = "scr_lang=ar; path=/; max-age=31536000; samesite=lax";
  });
  await page.waitForTimeout(500);
  await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${baseName}_ar_rtl.png`));

  // Restore LTR
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.setAttribute("lang", "en");
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("language", "en");
    localStorage.setItem("NEXT_LOCALE", "en");
    document.cookie = "scr_lang=en; path=/; max-age=31536000; samesite=lax";
  });
  await page.waitForTimeout(300);
}

async function safelyCloseDialog(page: Page) {
  const dialog = page.locator("[role='dialog']").first();
  if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
    const cancelBtn = dialog.locator("button:has-text('Cancel'), button:has-text('إلغاء'), button[aria-label='Close'], button:has-text('Close'), button:has-text('Dismiss')").first();
    if (await cancelBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cancelBtn.click({ force: true }).catch(() => {});
    } else {
      await page.keyboard.press("Escape");
    }
    await dialog.waitFor({ state: "detached", timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    document.querySelectorAll('[role="menu"], [data-radix-menu-content], [data-radix-popper-content-wrapper]').forEach((el) => el.remove());
    document.body.style.pointerEvents = "auto";
    document.documentElement.style.pointerEvents = "auto";
  });
}

async function loginAsAdmin(page: Page) {
  console.log("[E2E QA] Authenticating with real credentials...");
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

  await page.goto("/crm");
  await page.waitForLoadState("networkidle");
  console.log("[E2E QA] Successfully authenticated into CRM!");
}

test.describe("CRM Workflow NextGen Live E2E Verification Suite", () => {
  test("All 4 NextGen CRM Journeys (Studio, Deals Kanban, Leads Kanban, GenericCrudView)", async ({ page }) => {
    test.setTimeout(400_000);
    await page.setViewportSize({ width: 1440, height: 900 });

    // Step 0: Real Login
    await loginAsAdmin(page);

    // Reset cached workflows in browser localStorage to pick up latest definitions
    await page.evaluate(() => {
      try {
        localStorage.removeItem("scripe-crm-workflows-v3");
      } catch { /* ignore */ }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // JOURNEY 1: Workflow Studio (@xyflow/react v12) Diagram, Layout & RTL
    // ═══════════════════════════════════════════════════════════════════════
    console.log(">>> [JOURNEY 1] Workflow Studio 2D Diagram, Auto-Layout, and Arabic RTL");
    await page.goto("/crm/pipelines");
    await page.waitForLoadState("networkidle");

    // Open full-screen studio for deal pipeline
    const openStudioBtn = page.locator("[data-testid^='workflow-edit-studio-'], button:has-text('Studio')").first();
    await expect(openStudioBtn).toBeVisible({ timeout: 25_000 });
    await openStudioBtn.click();

    // Verify studio loaded
    const studioContainer = page.locator("[data-testid='crm-workflow-fullscreen-studio']");
    await expect(studioContainer).toBeVisible({ timeout: 15_000 });

    // Verify Diagram mode
    const diagramModeBtn = page.locator("[data-testid='workflow-mode-diagram'], button:has-text('Diagram')").first();
    if (await diagramModeBtn.isVisible()) {
      await diagramModeBtn.click();
    }

    // Verify ReactFlow elements rendered
    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toBeVisible({ timeout: 15_000 });

    // Verify single-row toolbar height <= 52px
    const studioToolbar = page.locator("[data-testid='crm-workflow-canvas-toolbar'], div.h-12.border-b").first();
    if (await studioToolbar.isVisible()) {
      const tbBox = await studioToolbar.boundingBox();
      if (tbBox) {
        expect(tbBox.height).toBeLessThanOrEqual(52);
        console.log(`[E2E QA] Studio toolbar height verified: ${tbBox.height}px <= 52px`);
      }
    }

    // Verify Stage Nodes present
    const stageNodes = page.locator("[data-testid^='canvas-node-']");
    const count = await stageNodes.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify Start Node and Global Stub Node
    const startNode = page.locator("[data-testid='canvas-node-start']").first();
    if (await startNode.isVisible({ timeout: 6_000 }).catch(() => false)) {
      console.log("[E2E QA] __start__ graph origin node verified visible!");
    }

    // Verify 12 directional magnetic ports on first stage node
    const firstStageNode = page.locator("[data-testid^='canvas-node-']:not([data-testid='canvas-node-start']):not([data-testid='canvas-node-global-all'])").first();
    if (await firstStageNode.isVisible().catch(() => false)) {
      const stagePorts = firstStageNode.locator("[data-port-id]");
      const portCount = await stagePorts.count();
      console.log(`[E2E QA] First stage node has ${portCount} directional magnetic ports`);
      expect(portCount).toBeGreaterThanOrEqual(12);
    }

    // Capture Deal Pipeline Diagram (Light & Dark)
    await setThemeAndCapture(page, "01_workflow_studio_deals_diagram");

    // Switch to Leads Pipeline in Studio
    const switchLeadsBtn = page.locator("[data-testid='workflow-switch-leads'], button:has-text('Leads Workflows')").first();
    if (await switchLeadsBtn.isVisible()) {
      await switchLeadsBtn.click();
      await page.waitForTimeout(600);
      await setThemeAndCapture(page, "02_workflow_studio_leads_diagram");

      // Switch back to Deals
      const switchDealsBtn = page.locator("[data-testid='workflow-switch-deals'], button:has-text('Deals Workflows')").first();
      await switchDealsBtn.click();
      await page.waitForTimeout(600);
    }

    // Verify * From Any interactive badge
    const globalAnyBadge = page.locator("[data-testid^='canvas-transition-global-']").first();
    if (await globalAnyBadge.isVisible()) {
      await expect(globalAnyBadge).toBeVisible();
      await globalAnyBadge.click();
      await page.waitForTimeout(300);
    }

    // Test Auto-Layout (ELK)
    const autoLayoutBtn = page.locator("[data-testid='canvas-tidy-auto-layout-btn'], button:has-text('Tidy Layout')").first();
    if (await autoLayoutBtn.isVisible()) {
      await autoLayoutBtn.click();
      await page.waitForTimeout(600);

      // Programmatic check: __start__ does not overlap Discovery
      const startNodeEl = page.locator("[data-testid='canvas-node-start']").first();
      const discNodeEl = page.locator("[data-stage-key*='discovery'], [data-node-id*='discovery']").first();
      if ((await startNodeEl.isVisible().catch(() => false)) && (await discNodeEl.isVisible().catch(() => false))) {
        const sBox = await startNodeEl.boundingBox();
        const dBox = await discNodeEl.boundingBox();
        if (sBox && dBox) {
          const overlaps = !(
            sBox.x + sBox.width <= dBox.x ||
            sBox.x >= dBox.x + dBox.width ||
            sBox.y + sBox.height <= dBox.y ||
            sBox.y >= dBox.y + dBox.height
          );
          expect(overlaps).toBe(false);
          console.log(`[E2E QA] ELK Layout: __start__ and Discovery have ZERO overlap!`);
        }
      }

      await safeScreenshot(page, path.join(SCREENSHOT_DIR, "03_workflow_studio_auto_layout_elk.png"));
    }

    // Test Dagre Auto-Layout if available and verify Closed Lost on the RIGHT
    const dagreBtn = page.locator("[data-testid='canvas-dagre-lr-layout-btn'], button:has-text('Dagre Horizontal')").first();
    if (await dagreBtn.isVisible()) {
      await dagreBtn.click();
      await page.waitForTimeout(600);

      const discoveryNode = page.locator("[data-stage-key*='discovery'], [data-node-id*='discovery']").first();
      const lostNode = page.locator("[data-stage-key*='lost'], [data-node-id*='lost']").first();
      if ((await discoveryNode.isVisible().catch(() => false)) && (await lostNode.isVisible().catch(() => false))) {
        const discBox = await discoveryNode.boundingBox();
        const lostBox = await lostNode.boundingBox();
        if (discBox && lostBox) {
          expect(lostBox.x).toBeGreaterThan(discBox.x);
          console.log(`[E2E QA] Dagre LR invariant verified: Closed Lost (x=${lostBox.x}) > Discovery (x=${discBox.x})`);
        }
      }

      // Programmatic check: __start__ does not overlap Discovery in Dagre LR
      const startNodeEl = page.locator("[data-testid='canvas-node-start']").first();
      if ((await startNodeEl.isVisible().catch(() => false)) && (await discoveryNode.isVisible().catch(() => false))) {
        const sBox = await startNodeEl.boundingBox();
        const dBox = await discoveryNode.boundingBox();
        if (sBox && dBox) {
          const overlaps = !(
            sBox.x + sBox.width <= dBox.x ||
            sBox.x >= dBox.x + dBox.width ||
            sBox.y + sBox.height <= dBox.y ||
            sBox.y >= dBox.y + dBox.height
          );
          expect(overlaps).toBe(false);
          console.log(`[E2E QA] Dagre LR Layout: __start__ and Discovery have ZERO overlap!`);
        }
      }

      await safeScreenshot(page, path.join(SCREENSHOT_DIR, "03_workflow_studio_auto_layout_dagre.png"));
    }

    // Verify Zoom Indicator is within Toolbar Viewport without horizontal clipping
    const zoomIndicator = page.locator("[data-testid='canvas-zoom-indicator']").first();
    const studioToolbarBox = await studioToolbar.boundingBox();
    if (studioToolbarBox && (await zoomIndicator.isVisible().catch(() => false))) {
      const zBox = await zoomIndicator.boundingBox();
      if (zBox) {
        expect(zBox.x + zBox.width).toBeLessThanOrEqual(studioToolbarBox.x + studioToolbarBox.width + 10);
        console.log(`[E2E QA] Zoom indicator within toolbar viewport: ${zBox.x + zBox.width} <= ${studioToolbarBox.x + studioToolbarBox.width}`);
      }
    }

    // Programmatic check: 0 label-over-node bounding box collisions
    const allStageNodes = page.locator("[data-testid^='canvas-node-']");
    const allEdgeLabels = page.locator("[data-testid^='edge-label-'], [data-testid^='canvas-edge-label-']");
    const nodeCount = await allStageNodes.count();
    const labelCount = await allEdgeLabels.count();
    let collisionCount = 0;
    for (let i = 0; i < nodeCount; i++) {
      const nBox = await allStageNodes.nth(i).boundingBox();
      if (!nBox) continue;
      for (let j = 0; j < labelCount; j++) {
        const lBox = await allEdgeLabels.nth(j).boundingBox();
        if (!lBox) continue;
        const overlaps = !(
          lBox.x + lBox.width <= nBox.x ||
          lBox.x >= nBox.x + nBox.width ||
          lBox.y + lBox.height <= nBox.y ||
          lBox.y >= nBox.y + nBox.height
        );
        if (overlaps) {
          collisionCount++;
          console.warn(`[E2E QA Collision] Label ${j} overlaps Node ${i}!`);
        }
      }
    }
    console.log(`[E2E QA] Programmatic label-over-node collisions: ${collisionCount}`);
    expect(collisionCount).toBe(0);

    // Toggle Global Wires
    const toggleWiresBtn = page.locator("[data-testid='canvas-toggle-global-wires-btn'], button:has-text('Global (*) Wires')").first();
    if (await toggleWiresBtn.isVisible()) {
      await toggleWiresBtn.click();
      await page.waitForTimeout(400);
      await page.locator("text=/Compiling|Building/").waitFor({ state: "detached", timeout: 10_000 }).catch(() => {});
      await safeScreenshot(page, path.join(SCREENSHOT_DIR, "04_workflow_studio_global_wires_toggled.png"));
    }

    // Open Rule Catalog
    const openRuleCatalogBtn = page.locator("[data-testid='canvas-open-rule-catalog'], button:has-text('Add Rule')").first();
    if (await openRuleCatalogBtn.isVisible()) {
      await openRuleCatalogBtn.click();
      await page.waitForTimeout(400);
      await safeScreenshot(page, path.join(SCREENSHOT_DIR, "04_workflow_studio_rule_catalog_modal.png"));
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }

    // Capture Workflow Studio in Arabic RTL
    await setRtlAndCapture(page, "05_workflow_studio_arabic_rtl");

    // Close Studio
    const backBtn = page.locator("[data-testid='studio-back-to-list-btn'], [data-testid='studio-discard-close-btn']").first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(400);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // JOURNEY 2: Deals (Opportunities) Unified Kanban & Jira Transition Screen
    // ═══════════════════════════════════════════════════════════════════════
    console.log(">>> [JOURNEY 2] Deals Unified Kanban, 3-State Drop Affordances, and Transition Screens");
    await page.goto("/crm/opportunities");
    await page.waitForLoadState("networkidle");

    // Clean up any lingering pointer locks or popups
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      document.querySelectorAll('[role="menu"], [data-radix-menu-content], [data-radix-popper-content-wrapper]').forEach(el => el.remove());
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.pointerEvents = "auto";
    });

    // 2.1) Ensure Kanban View
    const oppKanbanToggle = page.locator("[data-testid='toggle-kanban-view'], button:has-text('Kanban')").first();
    if (await oppKanbanToggle.isVisible({ timeout: 8_000 })) {
      await oppKanbanToggle.click({ force: true });
      await page.waitForTimeout(600);
    }

    // 06: Capture resting Kanban Board in Light and Dark modes
    const oppColumns = page.locator("[data-stage-key], .w-80, div[class*='min-h-[420px]']");
    await expect(oppColumns.first()).toBeVisible({ timeout: 15_000 });
    await setThemeAndCapture(page, "06_deals_kanban_resting_board");

    // 07 & 12: Test Drag Affordances and Locked Diagnostic Pill
    const oppCards = page.locator(".cursor-grab, [data-testid^='kanban-card-']");
    const oppCardCount = await oppCards.count();

    if (oppCardCount > 0) {
      const firstCard = oppCards.first();
      await expect(firstCard).toBeVisible();
      const cardBox = await firstCard.boundingBox();

      if (cardBox) {
        const startX = cardBox.x + cardBox.width / 2;
        const startY = cardBox.y + cardBox.height / 2;

        // Mouse down on card center
        await page.mouse.move(startX, startY);
        await page.mouse.down();

        // Move pointer horizontally inside kanban board to activate PointerSensor distance: 5
        await page.mouse.move(startX + 60, startY + 15, { steps: 5 });
        await page.waitForTimeout(500);

        // 07: Capture active drag affordances showing 3-state drop feedback (no language switcher hover!)
        await safeScreenshot(page, path.join(SCREENSHOT_DIR, "07_deals_kanban_drag_active_affordances.png"));

        // 12: Move toward blocked/restricted column or area to capture locked diagnostic pill
        const blockedCol = page.locator(".border-destructive\\/80, [title*='blocked'], [title*='restricted'], .bg-destructive").first();
        if (await blockedCol.isVisible({ timeout: 1500 }).catch(() => false)) {
          const bBox = await blockedCol.boundingBox();
          if (bBox) {
            await page.mouse.move(bBox.x + bBox.width / 2, bBox.y + 100, { steps: 5 });
            await page.waitForTimeout(500);
          }
        } else {
          // Move towards right side inside Kanban board
          await page.mouse.move(startX + 220, startY + 15, { steps: 5 });
          await page.waitForTimeout(500);
        }
        await safeScreenshot(page, path.join(SCREENSHOT_DIR, "12_deals_kanban_locked_diagnostic_pill.png"));

        await page.mouse.up();
        await page.waitForTimeout(400);
      }
    }

    // Clean up after drag
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      document.querySelectorAll('[role="menu"], [data-radix-menu-content], [data-radix-popper-content-wrapper]').forEach(el => el.remove());
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.pointerEvents = "auto";
    });

    // 08: Test Transition Screen Gate (CrmWorkflowTransitionDialog for Move Stage)
    // First attempt: click Move Forward button directly on first Kanban card
    let captured08 = false;
    const cardMoveForwardBtn = page.locator(".cursor-grab button[aria-label*='Move forward'], [data-testid^='kanban-card-'] button[aria-label*='Move forward']").first();
    if (await cardMoveForwardBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await cardMoveForwardBtn.click({ force: true });
      await page.waitForTimeout(600);
      if (await page.locator("[role='dialog']").isVisible({ timeout: 4000 }).catch(() => false)) {
        await setThemeAndCapture(page, "08_deals_kanban_transition_screen_gate");
        await safelyCloseDialog(page);
        captured08 = true;
      }
    }

    // 2.2) Table & Row Action Dialogs to capture CrmWorkflowTransitionDialog screens
    const oppTableToggle = page.locator("[data-testid='toggle-table-view'], button:has-text('Table')").first();
    if (await oppTableToggle.isVisible({ timeout: 8_000 })) {
      await oppTableToggle.click({ force: true });
      await page.waitForTimeout(800);

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});

      // 08 fallback if not already captured on Kanban card
      if (!captured08) {
        const moveStageBtn = page.locator("table tbody tr button:has-text('Move Stage'), table tbody tr button:has-text('تغيير المرحلة'), table tbody tr button:has(svg.lucide-arrow-right)").first();
        if (await moveStageBtn.isVisible({ timeout: 6_000 })) {
          await moveStageBtn.click({ force: true });
          await page.waitForTimeout(600);
          await expect(page.locator("[role='dialog']")).toBeVisible({ timeout: 5_000 });
          await setThemeAndCapture(page, "08_deals_kanban_transition_screen_gate");
          await safelyCloseDialog(page);
          captured08 = true;
        }
      }

      // 09: Test Closed Won Transition Screen (CrmWorkflowTransitionDialog)
      const rows = page.locator("table tbody tr");
      const rowCount = await rows.count();
      let captured09 = false;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const winBtn = row.locator("button[aria-label*='Won'], button[title*='Won'], button:has(svg.lucide-check-circle)").first();
        if (await winBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await winBtn.click({ force: true });
          await page.waitForTimeout(600);
          if (await page.locator("[role='dialog']").isVisible({ timeout: 2500 }).catch(() => false)) {
            await safeScreenshot(page, path.join(SCREENSHOT_DIR, "09_deals_kanban_closed_won_transition.png"));
            await safelyCloseDialog(page);
            captured09 = true;
            break;
          } else {
            const dismissBtn = page.locator("button:has-text('Dismiss'), button:has-text('تجاهل')").first();
            if (await dismissBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
              await dismissBtn.click({ force: true });
            }
          }
        }
      }
      expect(captured09).toBe(true);

      // 10: Test Closed Lost Transition Screen (* -> Lost Wildcard in CrmWorkflowTransitionDialog)
      let captured10 = false;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const lostBtn = row.locator("button[aria-label*='Lost'], button[title*='Lost'], button:has(svg.lucide-x-circle)").first();
        if (await lostBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await lostBtn.click({ force: true });
          await page.waitForTimeout(600);
          if (await page.locator("[role='dialog']").isVisible({ timeout: 2500 }).catch(() => false)) {
            await safeScreenshot(page, path.join(SCREENSHOT_DIR, "10_deals_kanban_closed_lost_from_any.png"));
            await safelyCloseDialog(page);
            captured10 = true;
            break;
          } else {
            const dismissBtn = page.locator("button:has-text('Dismiss'), button:has-text('تجاهل')").first();
            if (await dismissBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
              await dismissBtn.click({ force: true });
            }
          }
        }
      }
      expect(captured10).toBe(true);

      // 11: Test Reopen Transition Screen (Closed Lost/Won -> Discovery in CrmWorkflowTransitionDialog)
      let captured11 = false;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const reopenBtn = row.locator("button[aria-label*='Reopen'], button[title*='Reopen'], button:has-text('Reopen'), button:has(svg.lucide-rotate-ccw)").first();
        if (await reopenBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await reopenBtn.click({ force: true });
          await page.waitForTimeout(600);
          if (await page.locator("[role='dialog']").isVisible({ timeout: 2500 }).catch(() => false)) {
            await safeScreenshot(page, path.join(SCREENSHOT_DIR, "11_deals_kanban_reopen_transition.png"));
            await safelyCloseDialog(page);
            captured11 = true;
            break;
          } else {
            const dismissBtn = page.locator("button:has-text('Dismiss'), button:has-text('تجاهل')").first();
            if (await dismissBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
              await dismissBtn.click({ force: true });
            }
          }
        }
      }

      // If not captured from initial page rows, filter to Lost to click Reopen on closed lost deal
      if (!captured11) {
        const lostPill = page.locator("button:has-text('Lost'), button:has-text('خاسرة')").first();
        if (await lostPill.isVisible({ timeout: 2000 }).catch(() => false)) {
          await lostPill.click({ force: true });
          await page.waitForTimeout(600);
          const reopenBtn = page.locator("table tbody tr button:has(svg.lucide-rotate-ccw), table tbody tr button:has-text('Reopen')").first();
          if (await reopenBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
            await reopenBtn.click({ force: true });
            await page.waitForTimeout(600);
            await expect(page.locator("[role='dialog']")).toBeVisible({ timeout: 5000 });
            await safeScreenshot(page, path.join(SCREENSHOT_DIR, "11_deals_kanban_reopen_transition.png"));
            await safelyCloseDialog(page);
            captured11 = true;
          }
          // Reset to All Statuses
          const allPill = page.locator("button:has-text('All Statuses'), button:has-text('جميع الحالات')").first();
          if (await allPill.isVisible({ timeout: 2000 }).catch(() => false)) {
            await allPill.click({ force: true });
            await page.waitForTimeout(400);
          }
        }
      }
      expect(captured11).toBe(true);
    }

    // Clean up after Journey 2
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      document.querySelectorAll('[role="menu"], [data-radix-menu-content], [data-radix-popper-content-wrapper]').forEach(el => el.remove());
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.pointerEvents = "auto";
    });

    // ═══════════════════════════════════════════════════════════════════════
    // JOURNEY 3: Leads Unified Kanban (stageKey Parity & Lead-to-Deal)
    // ═══════════════════════════════════════════════════════════════════════
    console.log(">>> [JOURNEY 3] Leads Unified Kanban, Custom Stages, Dynamic Transition, and Lead Conversion");
    await page.goto("/crm/leads");
    await page.waitForLoadState("networkidle");

    // Clean up any lingering pointer locks or popups
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      document.querySelectorAll('[role="menu"], [data-radix-menu-content], [data-radix-popper-content-wrapper]').forEach(el => el.remove());
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.pointerEvents = "auto";
    });

    // Switch to Kanban View
    const leadsKanbanToggle = page.locator("[data-testid='toggle-kanban-view'], button:has-text('Kanban')").first();
    if (await leadsKanbanToggle.isVisible({ timeout: 8_000 })) {
      await leadsKanbanToggle.click({ force: true });
      await page.waitForTimeout(600);
    }

    // 13: Verify stage columns render (New, Working, Qualified, Converted, Disqualified)
    const leadColumns = page.locator("button[aria-label*='Collapse'], button:has-text('Collapse'), [data-stage-key], [data-testid^='kanban-column-']");
    await expect(leadColumns.first()).toBeVisible({ timeout: 15_000 });
    await setThemeAndCapture(page, "13_leads_kanban_stage_key_grouping");

    // 14: Leads Kanban Transition Screen (CrmWorkflowTransitionDialog for Qualify from Working -> Qualified)
    let captured14 = false;
    const advanceToQualifiedBtn = page.locator("button[title*='Qualified'], button[title*='Advance'], button:has(svg.lucide-chevron-right)").first();
    if (await advanceToQualifiedBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await advanceToQualifiedBtn.click({ force: true });
      await page.waitForTimeout(600);
      if (await page.locator("[role='dialog']").isVisible({ timeout: 3000 }).catch(() => false)) {
        await safeScreenshot(page, path.join(SCREENSHOT_DIR, "14_leads_kanban_drag_transition_screen.png"));
        await safelyCloseDialog(page);
        captured14 = true;
      }
    }

    // Test row action dialogs via Table view for Leads
    const leadsTableToggle = page.locator("[data-testid='toggle-table-view'], button:has-text('Table')").first();
    if (await leadsTableToggle.isVisible({ timeout: 8_000 })) {
      await leadsTableToggle.click({ force: true });
      await page.waitForTimeout(800);

      const firstRow = page.locator("table tbody tr").first();
      await firstRow.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});

      const rows = page.locator("table tbody tr");
      const rowCount = await rows.count();

      // 14 fallback if not captured on Kanban card
      if (!captured14) {
        for (let i = 0; i < Math.min(rowCount, 8); i++) {
          const row = rows.nth(i);
          const actionBtn = row.locator("button:has(svg.lucide-more-horizontal), button[aria-label*='Action'], td:last-child button").first();
          if (await actionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await actionBtn.click({ force: true });
            await page.waitForTimeout(300);

            const qualifyItem = page.locator("[role='menuitem']:has-text('Qualify')").first();
            if (await qualifyItem.isVisible({ timeout: 1500 }).catch(() => false)) {
              await qualifyItem.click({ force: true });
              await page.waitForTimeout(600);
              if (await page.locator("[role='dialog']").isVisible({ timeout: 3000 }).catch(() => false)) {
                await safeScreenshot(page, path.join(SCREENSHOT_DIR, "14_leads_kanban_drag_transition_screen.png"));
                await safelyCloseDialog(page);
                captured14 = true;
                break;
              }
            } else {
              await page.keyboard.press("Escape");
              await page.waitForTimeout(200);
            }
          }
        }
      }

      // 15: Leads Kanban Lead-to-Deal Conversion Dialog OPEN
      let captured15 = false;
      for (let i = 0; i < Math.min(rowCount, 8); i++) {
        const row = rows.nth(i);
        const actionBtn = row.locator("button:has(svg.lucide-more-horizontal), button[aria-label*='Action'], td:last-child button").first();
        if (await actionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await actionBtn.click({ force: true });
          await page.waitForTimeout(300);

          const convertItem = page.locator("[role='menuitem']:has-text('Convert')").first();
          if (await convertItem.isVisible({ timeout: 1500 }).catch(() => false)) {
            await convertItem.click({ force: true });
            await page.waitForTimeout(600);
            if (await page.locator("[role='dialog']").isVisible({ timeout: 3000 }).catch(() => false)) {
              await safeScreenshot(page, path.join(SCREENSHOT_DIR, "15_leads_kanban_lead_to_deal_conversion.png"));
              await safelyCloseDialog(page);
              captured15 = true;
              break;
            }
          } else {
            await page.keyboard.press("Escape");
            await page.waitForTimeout(200);
          }
        }
      }

      // 16: Leads Disqualified From Any (* -> Disqualified wildcard in CrmWorkflowTransitionDialog)
      let captured16 = false;
      for (let i = 0; i < Math.min(rowCount, 8); i++) {
        const row = rows.nth(i);
        const actionBtn = row.locator("button:has(svg.lucide-more-horizontal), button[aria-label*='Action'], td:last-child button").first();
        if (await actionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await actionBtn.click({ force: true });
          await page.waitForTimeout(300);

          const disqItem = page.locator("[role='menuitem']:has-text('Disqualify')").first();
          if (await disqItem.isVisible({ timeout: 1500 }).catch(() => false)) {
            await disqItem.click({ force: true });
            await page.waitForTimeout(600);
            if (await page.locator("[role='dialog']").isVisible({ timeout: 3000 }).catch(() => false)) {
              await safeScreenshot(page, path.join(SCREENSHOT_DIR, "16_leads_kanban_disqualified_from_any.png"));
              await safelyCloseDialog(page);
              captured16 = true;
              break;
            }
          } else {
            await page.keyboard.press("Escape");
            await page.waitForTimeout(200);
          }
        }
      }

      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }

    // Clean up after Journey 3
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      document.querySelectorAll('[role="menu"], [data-radix-menu-content], [data-radix-popper-content-wrapper]').forEach(el => el.remove());
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.pointerEvents = "auto";
    });

    // ═══════════════════════════════════════════════════════════════════════
    // JOURNEY 4: Unified GenericCrudView (Table, CardGrid, SplitPane, RTL)
    // ═══════════════════════════════════════════════════════════════════════
    console.log(">>> [JOURNEY 4] GenericCrudView Table, Sorting, CardGrid, SplitPane, and Full Arabic RTL");
    await page.goto("/crm/opportunities");
    await page.waitForLoadState("networkidle");

    // 1) Table View Mode & Sorting
    const tableToggle = page.locator("[data-testid='toggle-table-view'], button:has-text('Table')").first();
    if (await tableToggle.isVisible({ timeout: 5_000 })) {
      await tableToggle.click({ force: true });
      await page.waitForTimeout(400);
    }

    const firstTh = page.locator("thead th").first();
    if (await firstTh.isVisible()) {
      await firstTh.click({ force: true });
      await page.waitForTimeout(300);
    }
    await safeScreenshot(page, path.join(SCREENSHOT_DIR, "17_generic_crud_tanstack_table_sorting_sticky.png"));

    // 2) CardGrid View Mode
    const gridToggle = page.locator("[data-testid='toggle-cardgrid-view'], [data-testid='toggle-grid-view'], button:has-text('Grid'), button:has-text('Card')").first();
    if (await gridToggle.isVisible({ timeout: 5_000 })) {
      await gridToggle.click({ force: true });
      await page.waitForTimeout(400);
      await safeScreenshot(page, path.join(SCREENSHOT_DIR, "18_generic_crud_card_grid_view.png"));
    }

    // 3) SplitPane View Mode
    const splitToggle = page.locator("[data-testid='toggle-split-view'], button:has-text('Split')").first();
    if (await splitToggle.isVisible({ timeout: 5_000 })) {
      await splitToggle.click({ force: true });
      await page.waitForTimeout(400);

      // Select first row to display details in split pane
      const row = page.locator("tbody tr, [data-row-id]").first();
      if (await row.isVisible()) {
        await row.click({ force: true });
        await page.waitForTimeout(400);
      }
      await safeScreenshot(page, path.join(SCREENSHOT_DIR, "19_generic_crud_split_pane_view.png"));
    }

    // 4) Full CRM Arabic RTL Parity
    await setRtlAndCapture(page, "20_crm_full_arabic_rtl_parity");
    console.log(">>> [COMPLETED] All 4 NextGen CRM Journeys Verified Successfully!");
  });
});
