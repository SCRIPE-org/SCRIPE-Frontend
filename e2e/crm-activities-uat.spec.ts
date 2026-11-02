import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/SCRIPE-739/screenshots"
);

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe("SCRIPE-739: CRM Sales Activities & Interaction Timeline Live UAT", () => {
  test.setTimeout(240_000);

  test("Verify Sales Execution Desk, Append-Only Timeline, Activity Logging, WorkManagement Follow-up, and Arabic RTL", async ({
    page,
  }) => {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Authenticate as Ahly CRM Manager / Admin
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

    // Wait for redirect away from /login
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });

    // Wait for splash transition screen to completely detach
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Navigate to Sales Execution Desk (/crm/activities)
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/activities");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // Wait for Execution Desk title
    await expect(
      page.getByText(/sales execution desk|مكتب التنفيذ البيعي/i).first()
    ).toBeVisible({ timeout: 25_000 });

    // Wait for accounts list to populate on the left
    await expect(
      page.getByText(/commercial accounts|حسابات تجارية/i).first()
    ).toBeVisible({ timeout: 20_000 });

    // Wait for loading spinners to detach
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Verify protocol badge
    await expect(page.getByText(/SCRIPE D5\/B Append-Only/i).first()).toBeVisible({ timeout: 15_000 });

    // Verify timeline heading on the right
    await expect(
      page.getByText(/activity & interaction timeline|الجدول الزمني/i).first()
    ).toBeVisible({ timeout: 20_000 });

    // Screenshot 01: Sales Execution Desk
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01_crm_activities_execution_desk.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Open Create Activity Modal
    // ═══════════════════════════════════════════════════════════════════════
    const logActivityBtn = page.getByRole("button", { name: /log activity|سجل نشاط/i }).first();
    await expect(logActivityBtn).toBeVisible({ timeout: 15_000 });
    await logActivityBtn.click();

    // Verify modal is open
    const modalTitle = page.getByText(/log sales activity|سجل نشاطاً بيعياً|record sales interaction/i).first();
    await expect(modalTitle).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#activity-summary")).toBeVisible({ timeout: 10_000 });

    // Wait for modal animation to completely settle
    await page.waitForTimeout(600);

    // Screenshot 03: Create Activity Modal
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03_crm_create_activity_modal.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Fill and Submit Activity (Log Meeting / Call)
    // ═══════════════════════════════════════════════════════════════════════
    // Click Call option or keep Note
    const callOptionBtn = page.getByRole("button", { name: /call|اتصال|phone call/i }).first();
    if (await callOptionBtn.isVisible()) {
      await callOptionBtn.click();
    }

    const testSummary = `Founder Strategic Alignment & Pitch Access Review (${Date.now()})`;
    await page.locator("#activity-summary").fill(testSummary);
    await page.locator("#activity-body").fill(
      "Confirmed multi-sport venue allocation, commercial sponsorship tier structure, and WorkManagement task delegation protocol."
    );

    const submitActivityBtn = page.locator("button[type='submit']").filter({ hasText: /record|save|log|سجل/i }).first();
    await expect(submitActivityBtn).toBeEnabled({ timeout: 5_000 });

    const createActivityPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/activities") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 20_000 }
    ).catch(() => null);

    await submitActivityBtn.click();
    await createActivityPromise;

    // Wait for modal to close
    await expect(page.locator("#activity-summary")).toBeHidden({ timeout: 15_000 });
    await page.waitForLoadState("networkidle");

    // Wait for the new activity to appear in timeline
    await expect(page.getByText(testSummary).first()).toBeVisible({ timeout: 20_000 });

    // Screenshot 04: Activity Logged Success in Timeline
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04_crm_activity_logged_success.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Open Schedule Follow-up Modal (WorkManagement Task)
    // ═══════════════════════════════════════════════════════════════════════
    const followUpBtn = page.getByRole("button", { name: /follow-up|متابعة/i }).first();
    if (await followUpBtn.isVisible()) {
      await followUpBtn.click();

      // Verify follow-up modal opens
      await expect(
        page.getByText(/schedule follow-up task|جدولة مهمة متابعة/i).first()
      ).toBeVisible({ timeout: 10_000 });
      await expect(page.locator("#followup-title")).toBeVisible({ timeout: 10_000 });

      // Wait for modal animation to completely settle
      await page.waitForTimeout(600);

      // Screenshot 05: Schedule Follow-up Modal
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "05_crm_schedule_followup_modal.png"),
        fullPage: true,
      });

      // Close modal
      const cancelBtn = page.getByRole("button", { name: /cancel|إلغاء/i }).first();
      await cancelBtn.click();
      await expect(page.locator("#followup-title")).toBeHidden({ timeout: 10_000 });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Account 360 Detail View with Embedded Timeline (/crm/accounts/[id])
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/accounts");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 20_000 });

    const view360Btn = firstRow.getByRole("button", { name: /view 360/i }).first();
    await expect(view360Btn).toBeVisible({ timeout: 10_000 });
    await view360Btn.click();

    await page.waitForURL(/\/crm\/accounts\/[a-zA-Z0-9_-]+/, { timeout: 30_000 });
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Scroll down to Activity Timeline section
    const embeddedTimelineHeading = page.getByText(/activity & interaction timeline|الجدول الزمني/i).first();
    await expect(embeddedTimelineHeading).toBeVisible({ timeout: 20_000 });
    await embeddedTimelineHeading.scrollIntoViewIfNeeded();

    // Screenshot 02: Account 360 Detail with Embedded Activities Timeline
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02_crm_account_timeline_with_activities.png"),
      fullPage: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 7: Arabic RTL Verification (/crm/activities)
    // ═══════════════════════════════════════════════════════════════════════
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "ar");
      localStorage.setItem("language", "ar");
    });

    await page.goto("/crm/activities");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Verify RTL
    const rtlContainer = page.locator('[dir="rtl"]').first();
    await expect(rtlContainer).toBeVisible({ timeout: 20_000 });

    // Screenshot 06: Arabic RTL Mode
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06_crm_activities_arabic_rtl.png"),
      fullPage: true,
    });

    // Reset language back to en
    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("language", "en");
    });
  });
});
