import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/SCRIPE-739/screenshots"
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function safeScreenshot(page: Page, targetPath: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (fs.existsSync(targetPath)) {
        try {
          fs.unlinkSync(targetPath);
        } catch {}
      }
      await page.screenshot({ path: targetPath, fullPage: true });
      return;
    } catch (err) {
      if (attempt === 2) throw err;
      await page.waitForTimeout(300);
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

async function assertPrimaryButtonContrast(page: Page, buttonSelector: ReturnType<Page["locator"]>, contextLabel: string) {
  await expect(buttonSelector).toBeVisible({ timeout: 15_000 });
  for (const mode of ["light", "dark"] as const) {
    await page.evaluate((m) => {
      if (m === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, mode);
    await page.waitForTimeout(150);

    const styles = await buttonSelector.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        opacity: cs.opacity,
      };
    });

    expect(styles.backgroundColor, `${contextLabel} (${mode}) bg should not be transparent`).not.toBe("rgba(0, 0, 0, 0)");
    expect(styles.color, `${contextLabel} (${mode}) primary button text must use high-contrast ink, never pure white`).not.toBe(
      "rgb(255, 255, 255)"
    );
    expect(Number(styles.opacity), `${contextLabel} (${mode}) opacity`).toBeGreaterThanOrEqual(0.95);
  }
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
}

test.describe("SCRIPE-739: CRM Sales Activities & Interaction Timeline Live UAT (Dark + Light Themes)", () => {
  test.setTimeout(300_000);

  test("Verify Sales Execution Desk, Append-Only Timeline, Activity Logging, WorkManagement Follow-up Persistence, Retry/Idempotency, Button Regressions, and Arabic RTL in Dark & Light modes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const runId = Date.now();

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Authenticate as Ahly CRM Manager / Admin + Non-CRM Button Check
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

    // Non-CRM Primary Button Regression Check (/login)
    await assertPrimaryButtonContrast(page, submitBtn, "Login Page Submit Button");

    await submitBtn.click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 35_000 });
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Navigate to Sales Execution Desk (/crm/activities) & Verify Clean UX
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/activities");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(/sales execution desk|مكتب تنفيذ المبيعات/i).first()
    ).toBeVisible({ timeout: 25_000 });
    await expect(
      page.getByText(/commercial accounts|الحسابات التجارية/i).first()
    ).toBeVisible({ timeout: 20_000 });
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    // Verify developer-oriented architecture cards were removed from ActivitiesExecutionDeskView
    await expect(page.getByText(/SCRIPE D5\/B Append-Only/i)).toHaveCount(0);
    await expect(page.getByText(/Zero physical foreign keys/i)).toHaveCount(0);
    await expect(page.getByText(/PII Policy Enforced/i)).toHaveCount(0);

    await expect(
      page.getByText(/activity & interaction timeline|الجدول الزمني/i).first()
    ).toBeVisible({ timeout: 20_000 });

    const logActivityBtn = page.getByRole("button", { name: /log activity|تسجيل نشاط/i }).first();
    await assertPrimaryButtonContrast(page, logActivityBtn, "CRM Activities Log Activity Primary Button");

    // Capture 01: Sales Execution Desk (Light & Dark)
    await setThemeAndCapture(page, "01_crm_activities_execution_desk");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Open Create Activity Modal
    // ═══════════════════════════════════════════════════════════════════════
    await logActivityBtn.click();

    const modalTitle = page.getByText(/log sales activity|تسجيل نشاط مبيعات/i).first();
    await expect(modalTitle).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#activity-summary")).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(400);

    // Capture 03: Create Activity Modal (Light & Dark)
    await setThemeAndCapture(page, "03_crm_create_activity_modal");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Fill and Submit Activity (Log Call Interaction)
    // ═══════════════════════════════════════════════════════════════════════
    const callOptionBtn = page.getByRole("button", { name: /phone call|مكالمة هاتفية/i }).first();
    if (await callOptionBtn.isVisible()) {
      await callOptionBtn.click();
    }

    const testSummary = `Founder Strategic Alignment & Pitch Access Review (${runId})`;
    await page.locator("#activity-summary").fill(testSummary);
    await page.locator("#activity-body").fill(
      "Confirmed multi-sport venue allocation, commercial sponsorship tier structure, and follow-up action items."
    );

    const submitActivityBtn = page.locator("button[type='submit']").filter({ hasText: /log activity|تسجيل النشاط/i }).first();
    await expect(submitActivityBtn).toBeEnabled({ timeout: 5_000 });

    const createActivityPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/activities") &&
        !res.url().includes("/follow-up") &&
        res.request().method() === "POST" &&
        (res.status() === 201 || res.status() === 200),
      { timeout: 20_000 }
    );

    await submitActivityBtn.click();
    const createActivityRes = await createActivityPromise;
    expect(createActivityRes.status()).toBe(201);
    const createdActivityJson = await createActivityRes.json();
    const createdActivityData = createdActivityJson.data ?? createdActivityJson;
    const sourceActivityId: string = createdActivityData.activityId;
    expect(sourceActivityId).toBeTruthy();

    await expect(page.locator("#activity-summary")).toBeHidden({ timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(testSummary).first()).toBeVisible({ timeout: 20_000 });

    // Capture 04: Activity Logged Success in Timeline (Light & Dark)
    await setThemeAndCapture(page, "04_crm_activity_logged_success");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Complete WorkManagement Follow-up E2E
    // (Create Follow-up -> Transient Failure Retry -> Submit -> Verify Persistence -> Refresh -> Verify Still Exists)
    // ═══════════════════════════════════════════════════════════════════════
    const followUpBtn = page.getByRole("button", { name: /follow-up|متابعة/i }).first();
    await expect(followUpBtn).toBeVisible({ timeout: 15_000 });
    await followUpBtn.click();

    await expect(
      page.getByText(/schedule follow-up task|جدولة مهمة متابعة/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const followUpTitleInput = page.locator("#followup-title");
    await expect(followUpTitleInput).toBeVisible({ timeout: 10_000 });
    // Verify pre-populated title from source activity
    await expect(followUpTitleInput).toHaveValue(new RegExp("Follow-up on:", "i"));

    const followUpTaskTitle = `Deliver Sponsorship Contract & Rate Card (${runId})`;
    const followUpTaskDesc = "Prepare final commercial schedule and coordinate legal sign-off with ProSport Supplies Co.";
    await followUpTitleInput.fill(followUpTaskTitle);
    await page.locator("#followup-desc").fill(followUpTaskDesc);

    const scheduleFollowUpBtn = page
      .locator("button[type='submit']")
      .filter({ hasText: /schedule follow-up|جدولة المتابعة/i })
      .first();
    await expect(scheduleFollowUpBtn).toBeEnabled({ timeout: 5_000 });
    await assertPrimaryButtonContrast(page, scheduleFollowUpBtn, "Schedule Follow-up Modal Submit Button");

    // Capture 05: Schedule Follow-up Modal Ready (Light & Dark)
    await setThemeAndCapture(page, "05_crm_schedule_followup_modal");

    // 5A. Simulate transient failure on first attempt to verify UI retry resilience
    let interceptedOnce = false;
    await page.route("**/api/v1/crm/activities/*/follow-up", async (route) => {
      if (!interceptedOnce && route.request().method() === "POST") {
        interceptedOnce = true;
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: {
              code: "TRANSIENT_DISPATCH_ERROR",
              message: "Temporary service interruption while dispatching follow-up task. Please retry.",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await scheduleFollowUpBtn.click();
    // Modal must remain open with error alert displayed and input preserved
    await expect(followUpTitleInput).toBeVisible({ timeout: 10_000 });
    await expect(followUpTitleInput).toHaveValue(followUpTaskTitle);
    await expect(page.locator("[role='alert']").first()).toBeVisible({ timeout: 10_000 });

    // Remove route interceptor and retry against live backend
    await page.unroute("**/api/v1/crm/activities/*/follow-up");

    const createFollowUpPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/follow-up") &&
        res.request().method() === "POST",
      { timeout: 20_000 }
    );

    await scheduleFollowUpBtn.click();
    const followUpRes = await createFollowUpPromise;
    expect(followUpRes.status()).toBe(201);

    const followUpBody = await followUpRes.json();
    const followUpData = followUpBody.data ?? followUpBody;
    expect(followUpData.workItemRefId).toBeTruthy();
    expect(followUpData.workItemStatus).toBe("Todo");
    expect(followUpData.followUpActivity?.activityKind).toBe("FollowUpLinked");
    expect(followUpData.followUpActivity?.summary).toBe(`Follow-up scheduled: ${followUpTaskTitle}`);

    // Modal closes and FollowUpLinked item + WorkManagement status badge appear on timeline
    await expect(followUpTitleInput).toBeHidden({ timeout: 15_000 });
    await page.waitForLoadState("networkidle");

    const expectedFollowUpHeadline = `Follow-up scheduled: ${followUpTaskTitle}`;
    await expect(page.getByText(expectedFollowUpHeadline).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Task:\s*Todo/i).first()).toBeVisible({ timeout: 15_000 });

    // 5B. Verify Backend Retry Idempotency (Submitting the exact same Follow-up on the same source activity returns the existing WorkItem & FollowUpLinked activity without duplicating)
    const followUpUrl = followUpRes.url();
    const retryFollowUpBtn = page.getByRole("button", { name: /follow-up|متابعة/i }).first();
    await expect(retryFollowUpBtn).toBeVisible({ timeout: 10_000 });
    await retryFollowUpBtn.click();

    await expect(followUpTitleInput).toBeVisible({ timeout: 10_000 });
    await followUpTitleInput.fill(followUpTaskTitle);
    await page.locator("#followup-desc").fill(followUpTaskDesc);

    const idempotentRetryPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/follow-up") &&
        res.request().method() === "POST",
      { timeout: 20_000 }
    );

    await scheduleFollowUpBtn.click();
    const idempotentRetryRes = await idempotentRetryPromise;
    expect(idempotentRetryRes.status()).toBe(201);
    const idempotentRetryJson = await idempotentRetryRes.json();
    const idempotentRetryData = idempotentRetryJson.data ?? idempotentRetryJson;
    expect(idempotentRetryData.workItemRefId).toBe(followUpData.workItemRefId);
    expect(idempotentRetryData.followUpActivity.activityId).toBe(
      followUpData.followUpActivity.activityId
    );
    await expect(followUpTitleInput).toBeHidden({ timeout: 15_000 });

    // Verify unauthenticated request is rejected (401/403)
    const unauthRes = await page.request.post(followUpUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-Request-Timestamp": Math.floor(Date.now() / 1000).toString(),
        "X-Request-Nonce": `unauth-${Date.now()}`,
      },
      data: {
        title: "Unauthorized attempt",
        assigneeUserId: "00000000-0000-0000-0000-000000000001",
      },
    });
    expect([400, 401, 403]).toContain(unauthRes.status());

    // 5C. Hard Page Refresh -> Verify WorkManagement Follow-up Task & Timeline Entry Still Exist
    await page.reload();
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    await page.locator(".animate-spin").waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});

    await expect(page.getByText(expectedFollowUpHeadline).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(testSummary).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Task:\s*Todo/i).first()).toBeVisible({ timeout: 15_000 });
    // Verify no duplicate FollowUpLinked entry was created by the idempotent retry
    await expect(page.getByText(expectedFollowUpHeadline)).toHaveCount(1);

    await setThemeAndCapture(page, "05b_crm_followup_persisted_after_refresh");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Account 360 Detail View with Embedded Timeline (/crm/accounts/[id])
    // & Primary Button Regression Check on Accounts & Opportunities
    // ═══════════════════════════════════════════════════════════════════════
    await page.goto("/crm/opportunities");
    await page
      .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/")
      .waitFor({ state: "detached", timeout: 35_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle");
    const newOppBtn = page.getByRole("button", { name: /new opportunity|new deal|فرصة جديدة/i }).first();
    await assertPrimaryButtonContrast(page, newOppBtn, "CRM Opportunities New Deal Primary Button");

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

    const embeddedTimelineHeading = page.getByText(/activity & interaction timeline|الجدول الزمني/i).first();
    await expect(embeddedTimelineHeading).toBeVisible({ timeout: 20_000 });
    await embeddedTimelineHeading.scrollIntoViewIfNeeded();
    await expect(page.getByText(expectedFollowUpHeadline).first()).toBeVisible({ timeout: 20_000 });

    // Capture 02: Account 360 Detail with Embedded Activities Timeline (Light & Dark)
    await setThemeAndCapture(page, "02_crm_account_timeline_with_activities");

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 7: Arabic RTL Verification (/crm/activities) (Light & Dark)
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

    const rtlContainer = page.locator('[dir="rtl"]').first();
    await expect(rtlContainer).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(expectedFollowUpHeadline).first()).toBeVisible({ timeout: 20_000 });

    // Capture 06: Arabic RTL Mode (Light & Dark)
    await setThemeAndCapture(page, "06_crm_activities_arabic_rtl");

    await page.evaluate(() => {
      localStorage.setItem("scr_lang", "en");
      localStorage.setItem("language", "en");
    });
  });
});
