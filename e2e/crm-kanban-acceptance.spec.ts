import { test, expect } from "@playwright/test";

test.describe("CRM Kanban Board Lifecycle Acceptance (SCRIPE-738)", () => {
  test("Renders 5 canonical columns, displays PD-1 party gate badges, moves deals across stages, tests optimistic rollback on rejection, and verifies WCAG accessibility", async ({ page }) => {
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

    // 3. Switch to Kanban Board View
    const kanbanToggle = page.getByTestId("toggle-kanban-view");
    await expect(kanbanToggle).toBeVisible({ timeout: 10_000 });
    await kanbanToggle.click();

    // 4. Verify all 5 canonical columns are present in order
    const discoveryCol = page.getByTestId("kanban-column-default.discovery");
    const qualificationCol = page.getByTestId("kanban-column-default.qualification");
    const solutionFitCol = page.getByTestId("kanban-column-default.solution_fit");
    const proposalCol = page.getByTestId("kanban-column-default.proposal");
    const negotiationCol = page.getByTestId("kanban-column-default.negotiation");

    await expect(discoveryCol).toBeVisible({ timeout: 10_000 });
    await expect(qualificationCol).toBeVisible({ timeout: 10_000 });
    await expect(solutionFitCol).toBeVisible({ timeout: 10_000 });
    await expect(proposalCol).toBeVisible({ timeout: 10_000 });
    await expect(negotiationCol).toBeVisible({ timeout: 10_000 });

    // 5. Verify Visual PD-1 Party Verification Gate Indicators
    const proposalPd1Badge = page.getByTestId("pd1-badge-default.proposal");
    const negotiationPd1Badge = page.getByTestId("pd1-badge-default.negotiation");
    await expect(proposalPd1Badge).toBeVisible({ timeout: 10_000 });
    await expect(negotiationPd1Badge).toBeVisible({ timeout: 10_000 });

    // Ensure early stages do NOT have PD-1 badges
    await expect(page.getByTestId("pd1-badge-default.discovery")).not.toBeVisible();
    await expect(page.getByTestId("pd1-badge-default.qualification")).not.toBeVisible();
    await expect(page.getByTestId("pd1-badge-default.solution_fit")).not.toBeVisible();

    // 6. Create a test opportunity to manipulate in Kanban
    const uniqueSuffix = Date.now().toString().slice(-6);
    const dealTitle = `Kanban E2E Test Contract ${uniqueSuffix}`;

    const createBtn = page.locator("main").getByRole("button", { name: /new deal|create deal|new opportunity/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
    await createBtn.click();

    const createDialog = page.getByRole("dialog").first();
    await expect(createDialog).toBeVisible({ timeout: 10_000 });

    await createDialog.locator("#opp-title").fill(dealTitle);
    await createDialog.locator("#opp-amount").fill("275000");
    await createDialog.locator("#opp-rationale").fill("Automated E2E acceptance test deal");

    const createPostPromise = page.waitForResponse(
      (res) => res.url().includes("/crm/opportunities") && res.request().method() === "POST" && (res.status() === 201 || res.status() === 200),
      { timeout: 15_000 }
    );
    const submitCreateBtn = createDialog.getByRole("button", { name: /create/i }).last();
    await submitCreateBtn.click();
    await createPostPromise;
    await expect(createDialog).not.toBeVisible({ timeout: 10_000 });

    // 7. Verify new card appears in Discovery column
    const oppCard = discoveryCol.locator("[role='article']", { hasText: dealTitle }).first();
    await expect(oppCard).toBeVisible({ timeout: 15_000 });

    // Since partyId was not provided, verify Unlinked party indicator is visible
    await expect(oppCard.getByText(/unlinked/i).first()).toBeVisible({ timeout: 5_000 });

    // 8. Test Stage Movement: Advance from Discovery to Qualification
    const forwardBtn = oppCard.getByLabel(/move forward/i).first();
    await expect(forwardBtn).toBeVisible({ timeout: 5_000 });

    const moveStagePromise = page.waitForResponse(
      (res) => res.url().includes("/stage") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    await forwardBtn.click();
    await moveStagePromise;

    // Verify card has moved to Qualification column
    const cardInQual = qualificationCol.locator("[role='article']", { hasText: dealTitle }).first();
    await expect(cardInQual).toBeVisible({ timeout: 10_000 });
    await expect(discoveryCol.locator("[role='article']", { hasText: dealTitle })).toHaveCount(0);

    // 9. Advance from Qualification to Solution Fit using WCAG Keyboard ArrowRight
    await cardInQual.focus();
    const moveStagePromise2 = page.waitForResponse(
      (res) => res.url().includes("/stage") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    await page.keyboard.press("ArrowRight");
    await moveStagePromise2;

    const cardInSolFit = solutionFitCol.locator("[role='article']", { hasText: dealTitle }).first();
    await expect(cardInSolFit).toBeVisible({ timeout: 10_000 });

    // 10. Test Optimistic Rollback: Attempt to move unlinked card to Proposal
    // Backend will reject with 422 CRM_OPPORTUNITY_PARTY_REQUIRED
    const forwardToProposalBtn = cardInSolFit.getByLabel(/move forward/i).first();
    await expect(forwardToProposalBtn).toBeVisible({ timeout: 5_000 });

    const rejectStagePromise = page.waitForResponse(
      (res) => res.url().includes("/stage") && res.request().method() === "POST" && res.status() === 422,
      { timeout: 15_000 }
    );
    await forwardToProposalBtn.click();
    await rejectStagePromise;

    // Verify card rolled back to Solution Fit
    await expect(solutionFitCol.locator("[role='article']", { hasText: dealTitle }).first()).toBeVisible({ timeout: 10_000 });
    await expect(proposalCol.locator("[role='article']", { hasText: dealTitle })).toHaveCount(0);

    // Verify Error Alert banner is rendered
    const alertBanner = page.locator("[role='alert']").first();
    await expect(alertBanner).toBeVisible({ timeout: 5_000 });
    await expect(alertBanner.getByText(/party|required/i).first()).toBeVisible({ timeout: 5_000 });

    // 11. Toggle back to Table View and assert data integrity
    const tableToggle = page.getByTestId("toggle-table-view");
    await tableToggle.click();

    const oppRow = page.locator("tr", { hasText: dealTitle }).first();
    await expect(oppRow).toBeVisible({ timeout: 10_000 });
    await expect(oppRow.getByText("Solution Fit", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    // 12. Assert no fatal react exceptions
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
