import { test, expect } from "@playwright/test";

test.describe("CRM Pipeline Administration Acceptance (SCRIPE-746)", () => {
  test("Opens PipelineAdminDialog, validates pre-proposal reachability, updates default pipeline, verifies dynamic Kanban reflection across reload, and idempotently restores defaults", async ({
    page,
  }) => {
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
      (res) =>
        res.url().includes("/crm/opportunities") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/opportunities");
    await oppsInitialResponse;

    // 3. Switch to Kanban Board View
    const kanbanToggle = page.getByTestId("toggle-kanban-view");
    await expect(kanbanToggle).toBeVisible({ timeout: 10_000 });
    await kanbanToggle.click();

    // 4. Verify initial canonical Kanban columns
    const discoveryCol = page.getByTestId("kanban-column-default.discovery");
    await expect(discoveryCol).toBeVisible({ timeout: 10_000 });

    // 5. Open PipelineAdminDialog via pipeline settings button
    const settingsBtn = page.getByTestId("pipeline-settings-button");
    await expect(settingsBtn).toBeVisible({ timeout: 10_000 });
    await settingsBtn.click();

    const adminDialog = page.getByTestId("pipeline-admin-dialog");
    await expect(adminDialog).toBeVisible({ timeout: 10_000 });

    // 6. Verify all 5 canonical stage config rows are rendered
    const discoveryRow = page.getByTestId("stage-config-row-default.discovery");
    const qualRow = page.getByTestId("stage-config-row-default.qualification");
    const solFitRow = page.getByTestId("stage-config-row-default.solution_fit");
    const proposalRow = page.getByTestId("stage-config-row-default.proposal");
    const negotiationRow = page.getByTestId("stage-config-row-default.negotiation");

    await expect(discoveryRow).toBeVisible();
    await expect(qualRow).toBeVisible();
    await expect(solFitRow).toBeVisible();
    await expect(proposalRow).toBeVisible();
    await expect(negotiationRow).toBeVisible();

    // 7. Test Pre-Proposal Reachability Client-Side Validation
    // Set Solution Fit sort order to 4 and Proposal to 3
    const solFitOrderInput = solFitRow.locator('input[type="number"]').first();
    const proposalOrderInput = proposalRow.locator('input[type="number"]').first();

    await solFitOrderInput.fill("4");
    await proposalOrderInput.fill("3");

    const saveBtn = adminDialog.getByRole("button", { name: /save pipeline/i });
    await saveBtn.click();

    // Verify pre-proposal rule warning alert is shown
    await expect(
      adminDialog.getByText(/Pre-proposal stages.*must precede Proposal/i)
    ).toBeVisible({ timeout: 5_000 });

    // Restore ordering: Solution Fit -> 3, Proposal -> 4
    await solFitOrderInput.fill("3");
    await proposalOrderInput.fill("4");

    // 8. Configure Discovery Stage with modified Label and Probability
    const discoveryLabelInput = discoveryRow.locator('input[placeholder="Stage label (EN)"]');
    const discoveryProbInput = discoveryRow.locator('input[type="number"]').nth(1);

    await discoveryLabelInput.fill("Discovery & Scope");
    await discoveryProbInput.fill("15");

    // 9. Save updated pipeline definition (expect PUT 200 OK)
    const putResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/pipelines/default") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );

    await saveBtn.click();
    await putResponsePromise;

    // Verify dialog closed
    await expect(adminDialog).not.toBeVisible({ timeout: 10_000 });

    // 10. Verify dynamic Kanban stage reflection: column title is "Discovery & Scope" with 15% badge
    await expect(
      discoveryCol.getByRole("heading", { name: "Discovery & Scope", exact: true })
    ).toBeVisible({ timeout: 10_000 });
    await expect(discoveryCol.getByText("15%")).toBeVisible({ timeout: 5_000 });

    // 11. Verify persistence across page reload
    const oppsReloadResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/opportunities") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 30_000 }
    );
    await page.reload();
    await oppsReloadResponse;

    // Switch to Kanban view again
    const kanbanToggleAfterReload = page.getByTestId("toggle-kanban-view");
    await expect(kanbanToggleAfterReload).toBeVisible({ timeout: 10_000 });
    await kanbanToggleAfterReload.click();

    const discoveryColReloaded = page.getByTestId("kanban-column-default.discovery");
    await expect(discoveryColReloaded).toBeVisible({ timeout: 15_000 });
    await expect(
      discoveryColReloaded.getByRole("heading", { name: "Discovery & Scope", exact: true })
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(discoveryColReloaded.getByText("15%")).toBeVisible({ timeout: 5_000 });

    // 12. Idempotent Restoration: Revert Discovery stage label back to default
    await settingsBtn.click();
    await expect(adminDialog).toBeVisible({ timeout: 10_000 });

    const discoveryRowRestore = page.getByTestId("stage-config-row-default.discovery");
    const discoveryLabelRestore = discoveryRowRestore.locator(
      'input[placeholder="Stage label (EN)"]'
    );
    const discoveryProbRestore = discoveryRowRestore.locator('input[type="number"]').nth(1);

    await discoveryLabelRestore.fill("Discovery");
    await discoveryProbRestore.fill("");

    const restorePutPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/crm/pipelines/default") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
      { timeout: 15_000 }
    );

    const saveBtnRestore = adminDialog.getByRole("button", { name: /save pipeline/i });
    await saveBtnRestore.click();
    await restorePutPromise;
    await expect(adminDialog).not.toBeVisible({ timeout: 10_000 });

    // Verify Kanban reflects restored default label
    await expect(
      discoveryColReloaded.getByRole("heading", { name: "Discovery", exact: true })
    ).toBeVisible({ timeout: 10_000 });
  });
});
