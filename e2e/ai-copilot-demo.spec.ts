import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const SCREENSHOT_DIR =
  "C:/Users/seifmoustafa/.gemini/antigravity/brain/62160a98-eea3-472e-828c-f9534c40c2be/scratch/copilot-screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Valid 3-segment JWT format accepted by SecureTokenService.validateTokenFormat()
const MOCK_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLWFkbWluIiwiZXhwIjo0MTAyNDQ0ODAwfQ.c2lnbmF0dXJl";

async function setupAuthenticatedShell(page: Page) {
  // Catch-all for backend API calls so /overview renders cleanly even when backend is offline
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/menus/navigation/routes")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          message: "OK",
          data: {
            routes: ["/overview", "/hub", "/venue", "/venue/reports", "/settings"],
            routeDescriptors: [
              { route: "/overview", accessState: "authorized" },
              { route: "/hub", accessState: "authorized" },
              { route: "/venue", accessState: "authorized" },
              { route: "/venue/reports", accessState: "authorized" },
              { route: "/settings", accessState: "authorized" },
            ],
          },
          errors: null,
        }),
      });
      return;
    }

    if (url.includes("/menus/navigation")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          message: "OK",
          data: {
            menuItems: [
              {
                id: "root-overview",
                slug: "overview",
                nameEn: "Overview",
                nameAr: "نظرة عامة",
                href: "/overview",
                icon: "LayoutDashboard",
                order: 1,
                children: [],
              },
            ],
            routes: ["/overview", "/hub", "/venue", "/venue/reports", "/settings"],
            workspaceGroups: [
              {
                workspaceKey: "admin",
                workspaceNameEn: "Admin",
                workspaceNameAr: "الإدارة",
                abbreviation: "AD",
                icon: "Shield",
                isLocked: false,
                isPinned: true,
                isModuleWorkspace: false,
                isAdminWorkspace: true,
                homeRoute: "/overview",
                defaultHref: "/overview",
                displayOrder: 1,
              },
            ],
          },
          errors: null,
        }),
      });
      return;
    }

    if (url.includes("/auth/refresh")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          message: "OK",
          data: {
            accessToken: MOCK_JWT,
            user: {
              id: "usr-demo-01",
              username: "mokawloon.admin",
              email: "admin@mokawloon-demo.local",
              firstName: "Karim",
              lastName: "Nasser",
              roles: ["SuperAdmin"],
              permissions: ["*"],
              tenantId: "tenant-mokawloon",
              tenantName: "Al Mokawloon Al Arab SC",
              tenantCode: "MOKAWLOON",
            },
          },
          errors: null,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ statusCode: 200, message: "OK", data: {}, errors: null }),
    });
  });

  // Set cookie and pre-seed Zustand persisted app-storage + session dev token
  await page.context().addCookies([
    {
      name: "scr_auth_state",
      value: "true",
      domain: "localhost",
      path: "/",
    },
    {
      name: "scr_lang",
      value: "en",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.addInitScript((token) => {
    sessionStorage.setItem("dev_access_token", token);
    localStorage.setItem("scr_lang", "en");
    localStorage.setItem("theme", "dark");
    localStorage.setItem(
      "app-storage",
      JSON.stringify({
        state: {
          sidebarOpen: true,
          density: "comfortable",
          user: {
            id: "usr-demo-01",
            username: "mokawloon.admin",
            email: "admin@mokawloon-demo.local",
            firstName: "Karim",
            lastName: "Nasser",
            roles: ["SuperAdmin"],
            permissions: ["*"],
            tenantId: "tenant-mokawloon",
            tenantName: "Al Mokawloon Al Arab SC",
            tenantCode: "MOKAWLOON",
          },
          isAuthenticated: true,
          permissions: ["*"],
          roles: ["SuperAdmin"],
          restrictedFields: {},
          tenantCode: "MOKAWLOON",
          subscriptionStatus: "Active",
          gracePhase: null,
          editionName: "Enterprise",
          mustChangePassword: false,
          defaultRedirectPath: "/overview",
        },
        version: 0,
      })
    );
  }, MOCK_JWT);
}

async function capture(page: Page, name: string) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, name), fullPage: false });
}

test.describe("SCRIPE AI Copilot Interactive Product Demo", () => {
  test("Verifies welcome, Scenario 1, Scenario 2, attachments, light/dark, Arabic RTL, and mobile responsiveness", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await setupAuthenticatedShell(page);

    await page.goto("/overview", { waitUntil: "domcontentloaded" });

    // 1. Verify Copilot Trigger Button exists in NexusTopbar
    const trigger = page.getByTestId("ai-copilot-trigger");
    await expect(trigger).toBeVisible({ timeout: 30_000 });

    // Open Copilot side panel
    await trigger.click();
    const sidePanel = page.getByTestId("ai-copilot-side-panel");
    await expect(sidePanel).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("copilot-welcome-state")).toBeVisible();
    await expect(page.getByTestId("copilot-club-name")).toContainText("Arab Contractors FC");
    await expect(page.getByTestId("copilot-club-avatar")).toBeVisible();
    await capture(page, "01_copilot_welcome_dark.png");

    // 1b. Max Mode in Welcome state (edge-to-edge) -> Exit Max Mode back to side panel
    const expandBtn = page.getByTestId("copilot-expand-btn");
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();
    const maxWorkspace = page.getByTestId("ai-copilot-expanded-workspace");
    await expect(maxWorkspace).toBeVisible({ timeout: 5_000 });
    await expect(expandBtn).toContainText(/Exit Max Mode/i);
    const maxBox = await maxWorkspace.boundingBox();
    expect(maxBox?.x).toBe(0);
    expect(maxBox?.y).toBe(0);
    expect(maxBox?.width).toBe(1440);
    expect(maxBox?.height).toBe(900);
    await capture(page, "01b_copilot_welcome_max_mode.png");

    // Exit Max Mode cleanly
    await expandBtn.click();
    await expect(maxWorkspace).toBeHidden();
    await expect(sidePanel).toBeVisible();

    // 1c. Ask & Explore quick cross-module demo Q&A with live AI thinking trace
    await page.getByTestId("quick-query-roster").click();
    await expect(page.getByTestId("ai-thinking-trace")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("ai-thinking-trace")).toContainText("academy.roster.summary");
    await expect(page.getByTestId("copilot-ask-stream")).toContainText("1,920", {
      timeout: 10_000,
    });
    await page.getByTestId("copilot-reset-btn").click();
    await expect(page.getByTestId("copilot-welcome-state")).toBeVisible();

    // 2. Scenario 1: Click suggested prompt -> populate input -> Send
    await page.getByTestId("suggested-prompt-academy").click();
    const composer = page.getByTestId("copilot-composer-input");
    await expect(composer).toHaveValue(/Coach Ahmed is unavailable tomorrow/);
    await page.getByTestId("copilot-send-btn").click();

    const thinkingTrace = page.getByTestId("ai-thinking-trace");
    await expect(thinkingTrace).toBeVisible({ timeout: 5_000 });
    await expect(thinkingTrace).toContainText("academy.sessions.list");
    await expect(thinkingTrace).toContainText("hr.coaches.checkAvailability");
    await expect(thinkingTrace).toContainText("venue.pitches.detectConflicts");

    const academyCard = page.getByTestId("academy-coach-plan-card");
    await expect(academyCard).toBeVisible({ timeout: 15_000 });
    await expect(academyCard).toContainText("U12 Football");
    await expect(academyCard).toContainText("U14 Football");
    await expect(academyCard).toContainText("U16 Football");
    await expect(thinkingTrace).toContainText("3 sessions");
    await expect(thinkingTrace).toContainText("24 guardians");

    // Verify collapsible AI Thinking & Tool Trace toggle
    await page.getByTestId("ai-thinking-toggle").click();
    await expect(page.getByTestId("tool-call-chip-tool-sessions")).toBeHidden();
    await page.getByTestId("ai-thinking-toggle").click();
    await expect(page.getByTestId("tool-call-chip-tool-sessions")).toBeVisible();

    // Enter Max Mode during Scenario 1 -> spacious full-layout Copilot -> Exit Max Mode
    await page.getByTestId("copilot-expand-btn").click();
    await expect(maxWorkspace).toBeVisible({ timeout: 5_000 });
    await expect(academyCard).toBeVisible();
    await capture(page, "02_academy_plan_max_mode.png");
    await page.getByTestId("copilot-expand-btn").click();
    await expect(maxWorkspace).toBeHidden();
    await capture(page, "02_academy_plan_dark.png");

    // Interactive checks: Review Plan dialog -> close -> Approve Demo Actions -> Completed
    await page.getByTestId("academy-review-plan-btn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).first().click();

    await page.getByTestId("academy-approve-actions-btn").click();
    await expect(page.getByTestId("academy-completed-alert")).toBeVisible({ timeout: 10_000 });
    await capture(page, "03_academy_completed_dark.png");

    // 2b. Verify ALL 4 Mode Tabs switch views cleanly with rich demo data AFTER Scenario 1
    await page.getByTestId("copilot-mode-analyze").click();
    await expect(page.getByTestId("copilot-analyze-view")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("financial-summary-card")).toContainText("EGP 4.85M");
    await capture(page, "03b_mode_analyze_after_scenario1.png");

    await page.getByTestId("copilot-mode-monitor").click();
    await expect(page.getByTestId("copilot-monitor-view")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("monitor-alert-card-alert-u16-conflict")).toBeVisible();
    await page.getByTestId("monitor-filter-critical").click();
    await expect(page.getByTestId("monitor-alert-card-alert-u16-conflict")).toBeVisible();
    await expect(page.getByTestId("monitor-alert-card-alert-overdue-receivables")).toBeHidden();
    await page.getByTestId("monitor-ack-alert-u16-conflict").click();
    await page.getByTestId("monitor-filter-resolved").click();
    await expect(page.getByTestId("monitor-alert-card-alert-u16-conflict")).toBeVisible();
    await page.getByTestId("monitor-ack-alert-u16-conflict").click();
    await page.getByTestId("monitor-filter-all").click();
    await capture(page, "03c_mode_monitor.png");

    await page.getByTestId("copilot-mode-ask").click();
    await expect(page.getByTestId("copilot-ask-stream")).toBeVisible({ timeout: 5_000 });

    await page.getByTestId("copilot-mode-execute").click();
    await expect(page.getByTestId("copilot-execute-view")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("academy-completed-alert")).toBeVisible();

    // 3. Reset & Switch to Scenario 2: Financial Intelligence
    await page.getByTestId("copilot-reset-btn").click();
    await expect(page.getByTestId("copilot-welcome-state")).toBeVisible();

    await page.getByTestId("run-scenario-financial-btn").click();
    const financialSummaryCard = page.getByTestId("financial-summary-card");
    await expect(financialSummaryCard).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("ai-thinking-trace")).toContainText("finance.ledger.consolidate");
    await expect(page.getByTestId("ai-thinking-trace")).toContainText("finance.receivables.aging");
    await expect(page.getByTestId("ai-thinking-trace")).toContainText("412 invoices");
    await expect(financialSummaryCard).toContainText("EGP 4.85M");
    await expect(financialSummaryCard).toContainText("EGP 3.72M");
    await expect(financialSummaryCard).toContainText("EGP 1.13M");
    await expect(financialSummaryCard).toContainText("EGP 740K");

    // Open Expanded Split Financial Intelligence Workspace
    await page.getByTestId("financial-view-full-report-btn").click();
    const expandedWorkspace = page.getByTestId("ai-copilot-expanded-workspace");
    await expect(expandedWorkspace).toBeVisible({ timeout: 10_000 });
    await expect(expandedWorkspace).toContainText("49.7%");
    await capture(page, "04_financial_workspace_dark.png");

    // Open Attachments tab & preview document
    await page.getByTestId("financial-tab-attachments").click();
    await expect(page.getByTestId("doc-preview-btn-doc-payroll")).toBeVisible();
    await page.getByTestId("doc-preview-btn-doc-payroll").click();
    await expect(page.getByTestId("supporting-doc-dialog")).toBeVisible();
    await capture(page, "05_financial_attachments_dark.png");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("supporting-doc-dialog")).toBeHidden();

    // Return to Overview tab and switch to Light Theme
    await page.getByRole("tab", { name: /Executive Overview/i }).click();
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    });
    await capture(page, "06_financial_workspace_light.png");

    // Collapse workspace back to side panel
    await page.getByTestId("copilot-expand-btn").click();
    await expect(expandedWorkspace).toBeHidden();

    // 4. Switch Application Language to Arabic (RTL) via NexusTopbar LanguageSwitcher
    const langSwitcher = page.getByRole("button", { name: /Change language|تغيير اللغة/i }).first();
    await expect(langSwitcher).toBeVisible({ timeout: 5_000 });
    await langSwitcher.click();
    const arItem = page.getByRole("menuitemradio", { name: /العربية/i });
    await expect(arItem).toBeVisible({ timeout: 5_000 });
    await arItem.click();

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId("copilot-club-name")).toContainText("نادي المقاولون العرب");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await capture(page, "07_arabic_rtl_financial.png");

    // Reset & Run Scenario 1 in Arabic RTL
    await page.getByTestId("copilot-reset-btn").click();
    await page.getByTestId("run-scenario-academy-btn").click();
    await expect(page.getByTestId("academy-coach-plan-card")).toBeVisible({ timeout: 15_000 });
    await capture(page, "08_arabic_rtl_academy.png");

    // 5. Responsive Mobile Check (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("ai-copilot-mobile-sheet")).toBeVisible({ timeout: 10_000 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(hasHorizontalOverflow).toBe(false);
    await capture(page, "09_mobile_sheet_rtl.png");
  });
});
