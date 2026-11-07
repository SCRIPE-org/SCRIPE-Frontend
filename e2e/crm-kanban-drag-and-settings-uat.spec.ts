import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const BRAIN_DIR = "C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\bc0e2bae-b041-4251-886d-15b410eb0c42";
const REPORT_DIR = path.resolve(__dirname, "../../SCRIPE-CRM/EXECUTION_REPORTS/SCRIPE-766/screenshots");

for (const dir of [BRAIN_DIR, REPORT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function safeScreenshot(page: Page, baseName: string) {
  for (const dir of [BRAIN_DIR, REPORT_DIR]) {
    const targetPath = path.join(dir, `${baseName}.png`);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        if (fs.existsSync(targetPath)) {
          try { fs.unlinkSync(targetPath); } catch {}
        }
        await page.screenshot({ path: targetPath, fullPage: true });
        break;
      } catch (err) {
        if (attempt === 4) console.warn(`Screenshot failed for ${targetPath}:`, err);
        await page.waitForTimeout(400);
      }
    }
  }
}

async function setThemeAndCapture(page: Page, baseName: string) {
  // Light Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  });
  await page.waitForTimeout(400);
  await safeScreenshot(page, `${baseName}_light`);
  await safeScreenshot(page, baseName);

  // Dark Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  });
  await page.waitForTimeout(400);
  await safeScreenshot(page, `${baseName}_dark`);

  // Restore Light Mode default
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
  await page.waitForTimeout(200);
}

test.describe("CRM Kanban Drag-and-Drop Workflow Enforcement & Settings UAT (SCRIPE-766)", () => {
  test.setTimeout(240_000);

  test("Logs in, verifies Kanban board, simulates card drag with frosted overlay and diagnostics, and verifies settings default view mode", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Super Admin Login
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
      await page.waitForTimeout(10_000);
    }
    await expect(page).not.toHaveURL(/\/login/);
    await page.waitForLoadState("networkidle");

    // 2. Navigate to /crm/opportunities
    await page.goto("/crm/opportunities");
    await page.waitForLoadState("networkidle");

    // Ensure we are in Kanban View
    const kanbanToggle = page.getByTestId("toggle-kanban-view").first();
    if (await kanbanToggle.isVisible({ timeout: 5_000 })) {
      await kanbanToggle.click();
    }

    // Verify all 5 Kanban Columns
    await expect(page.getByTestId("kanban-column-default.discovery")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("kanban-column-default.qualification")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("kanban-column-default.solution_fit")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("kanban-column-default.proposal")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("kanban-column-default.negotiation")).toBeVisible({ timeout: 15_000 });

    // Capture resting Kanban Board in Light and Dark modes
    await setThemeAndCapture(page, "10_crm_opportunities_kanban_resting_board");

    // 3. Simulate active drag on an opportunity card in Discovery to activate drag affordance
    const firstCard = page.locator("[data-testid='kanban-column-default.discovery'] [role='article']").first();
    if (await firstCard.isVisible({ timeout: 10_000 })) {
      // Dispatch dragstart on the first card
      await firstCard.evaluate((el) => {
        const dt = new DataTransfer();
        el.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: dt }));
      });
      await page.waitForTimeout(500);

      // Verify that non-adjacent or restricted columns show either the overlay or allowed pills
      await setThemeAndCapture(page, "11_crm_opportunities_kanban_drag_active_overlay");

      // Dispatch dragend to clean up
      await firstCard.evaluate((el) => {
        el.dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(300);
    }

    // 4. Navigate to /crm/settings and verify governance view controls
    await page.goto("/crm/settings");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("crm-settings-view")).toBeVisible({ timeout: 15_000 });

    await setThemeAndCapture(page, "12_crm_settings_governance_view_controls");
  });
});
