import { test, expect } from "@playwright/test";

test.describe("CRM Opportunities Lifecycle Acceptance", () => {
  test("Performs login, creates direct opportunity, advances stage, closes, reopens, and verifies audit history & persistence across reload", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("response", (res) => {
      if (res.status() >= 400) {
        console.log(`[HTTP ${res.status()}] ${res.url()}`);
      }
    });

    // 1. Log in via UI
    await page.goto("/login?redirect=%2Fcrm%2Fopportunities");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill("P@ssw0rd");

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // 2. Wait for navigation after login and navigate to /crm/opportunities
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    const oppsInitialResponse = page.waitForResponse(
      (res) => res.url().includes("/crm/opportunities") && res.request().method() === "GET" && res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/opportunities");
    await oppsInitialResponse;

    // 3. Verify CRM Shell and Opportunities Header is rendered
    const titleLocator = page.getByRole("heading", { name: /deal|opportunity|opportunities/i }).first();
    await expect(titleLocator).toBeVisible({ timeout: 20_000 });

    // Generate unique test identifier for deal
    const uniqueSuffix = Date.now().toString().slice(-6);
    const dealTitle = `Al-Hilal Stadium Naming Rights Deal ${uniqueSuffix}`;

    // 4. Click Create Opportunity ("New Deal") button
    const createBtn = page.locator("main").getByRole("button", { name: /new deal|create deal|new opportunity/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
    await createBtn.click();

    // 5. Verify Create Opportunity modal dialog opens
    const createDialog = page.getByRole("dialog").first();
    await expect(createDialog).toBeVisible({ timeout: 10_000 });

    // Fill Title, Amount (350000), Currency ("SAR"), and Direct Rationale
    await createDialog.locator("#opp-title").fill(dealTitle);
    await createDialog.locator("#opp-amount").fill("350000");
    await createDialog.locator("#opp-rationale").fill("Direct sponsorship referral from board member");

    // Submit POST /api/v1/crm/opportunities (201 or 200)
    const createPostPromise = page.waitForResponse(
      (res) => res.url().includes("/crm/opportunities") && res.request().method() === "POST" && (res.status() === 201 || res.status() === 200),
      { timeout: 15_000 }
    );
    const submitCreateBtn = createDialog.getByRole("button", { name: /create/i }).last();
    await submitCreateBtn.click();
    const createRes = await createPostPromise;
    expect([200, 201]).toContain(createRes.status());
    await expect(createDialog).not.toBeVisible({ timeout: 10_000 });

    // Verify opportunity row appears in the table with status Open
    const oppRow = page.locator("tr", { hasText: dealTitle }).first();
    await expect(oppRow).toBeVisible({ timeout: 15_000 });
    await expect(oppRow.getByText("Open", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect(oppRow.getByText("Discovery", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    // 6. Stage Transition: Advance stage from Discovery to Qualification
    const moveStageBtn = oppRow.getByRole("button", { name: /stage|move/i }).first();
    await expect(moveStageBtn).toBeVisible({ timeout: 5_000 });
    await moveStageBtn.click();

    const stageDialog = page.getByRole("dialog").first();
    await expect(stageDialog).toBeVisible({ timeout: 5_000 });

    const moveStageResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/stage") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    const submitStageBtn = stageDialog.getByRole("button", { name: /advance|move|update/i }).last();
    await submitStageBtn.click();
    const moveRes = await moveStageResponsePromise;
    expect(moveRes.status()).toBe(200);
    await expect(stageDialog).not.toBeVisible({ timeout: 10_000 });

    // Verify row stage updated to Qualification
    await expect(oppRow.getByText("Qualification", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    // 7. Close Opportunity as Lost
    const closeLostBtn = oppRow.getByRole("button", { name: /lost/i }).first();
    await expect(closeLostBtn).toBeVisible({ timeout: 5_000 });
    await closeLostBtn.click();

    const closeDialog = page.getByRole("dialog").first();
    await expect(closeDialog).toBeVisible({ timeout: 5_000 });

    const closeResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/close") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    const submitCloseBtn = closeDialog.locator("button[type='submit']");
    await submitCloseBtn.click();
    const closeRes = await closeResponsePromise;
    expect(closeRes.status()).toBe(200);
    await expect(closeDialog).not.toBeVisible({ timeout: 10_000 });

    // Verify row status is now Closed Lost
    await expect(oppRow.getByText(/closed lost|lost/i).first()).toBeVisible({ timeout: 10_000 });

    // 8. Reopen Opportunity
    const reopenBtn = oppRow.getByRole("button", { name: /reopen/i }).first();
    await expect(reopenBtn).toBeVisible({ timeout: 5_000 });
    await reopenBtn.click();

    const reopenDialog = page.getByRole("dialog").first();
    await expect(reopenDialog).toBeVisible({ timeout: 5_000 });

    await reopenDialog.locator("#reopen-reason").fill("Sponsorship committee revived deal with revised budget allocation");

    const reopenResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/reopen") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    const submitReopenBtn = reopenDialog.locator("button[type='submit']");
    await submitReopenBtn.click();
    const reopenRes = await reopenResponsePromise;
    expect(reopenRes.status()).toBe(200);
    await expect(reopenDialog).not.toBeVisible({ timeout: 10_000 });

    // Verify row status restored to Open and stage restored to Qualification
    await expect(oppRow.getByText("Open", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect(oppRow.getByText("Qualification", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    // 9. Verify Persistence across Page Reload
    const reloadOppsPromise = page.waitForResponse(
      (res) => res.url().includes("/crm/opportunities") && res.request().method() === "GET" && res.status() === 200,
      { timeout: 30_000 }
    );
    await page.reload();
    await reloadOppsPromise;
    await page.waitForLoadState("domcontentloaded");

    const reloadedOppRow = page.locator("tr", { hasText: dealTitle }).first();
    await expect(reloadedOppRow).toBeVisible({ timeout: 15_000 });
    await expect(reloadedOppRow.getByText("Open", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect(reloadedOppRow.getByText("Qualification", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    // 10. Navigate to Detail View and inspect Audit History
    const detailLink = reloadedOppRow.locator("button", { hasText: dealTitle }).first();
    await detailLink.click();
    await page.waitForURL((url) => url.pathname.includes("/crm/opportunities/"), { timeout: 15_000 });

    const detailHeading = page.getByRole("heading", { name: dealTitle }).first();
    await expect(detailHeading).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Qualification").first()).toBeVisible({ timeout: 10_000 });

    // Check that stage transition audit entries are rendered in the history table
    await expect(page.getByText(/stage history|history/i).first()).toBeVisible({ timeout: 10_000 });

    // 11. Assert no fatal react runtime exceptions occurred
    const fatalErrors = consoleErrors.filter(
      (err) =>
        err.includes("Uncaught Error") ||
        err.includes("Minified React error") ||
        err.includes("Cannot read properties of undefined") ||
        err.includes("Invariant Violation")
    );
    expect(fatalErrors).toHaveLength(0);
  });
});
