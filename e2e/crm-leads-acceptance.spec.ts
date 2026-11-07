import { test, expect } from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

test.describe("CRM Leads Intake & Complete Qualification/Conversion Lifecycle Acceptance", () => {
  test("Performs login, creates lead, qualifies, links party, converts to opportunity, and verifies persistence across reload", async ({ page }) => {
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
    await page.goto("/login?redirect=%2Fcrm%2Fleads");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill(getDevAdminPassword());

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // 2. Wait for navigation after login and navigate to /crm/leads, waiting for the API response
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    const leadsInitialResponse = page.waitForResponse(
      (res) => res.url().includes("/crm/leads") && res.request().method() === "GET" && res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/leads");
    await leadsInitialResponse;

    // 3. Verify CRM Leads Header is rendered
    const titleLocator = page.getByRole("heading", { name: /lead|intake|crm/i }).first();
    await expect(titleLocator).toBeVisible({ timeout: 20_000 });

    // Generate unique test identifier for lead
    const uniqueSuffix = Date.now().toString().slice(-6);
    const leadTitle = `Real Madrid Commercial Partnership ${uniqueSuffix}`;
    const companyName = `Real Madrid Holdings ${uniqueSuffix}`;
    const firstName = "Vinicius";
    const lastName = "Junior";
    const email = `vini.${uniqueSuffix}@realmadrid.example`;

    // 4. Click Create Lead button
    const createBtn = page.locator("main").getByRole("button", { name: /new lead/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
    await createBtn.click();

    // 5. Verify Create Lead modal dialog opens
    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // Step 1: Create Lead
    // Fill Title, Company Name, First Name, Last Name, Email, and Estimated Value (250000)
    await dialog.locator("#lead-title").fill(leadTitle);
    await dialog.locator("#lead-company").fill(companyName);
    await dialog.locator("#lead-first-name").fill(firstName);
    await dialog.locator("#lead-last-name").fill(lastName);
    await dialog.locator("#lead-email").fill(email);
    await dialog.locator("#lead-value").fill("250000");

    // Submit POST /api/v1/crm/leads (201)
    const createPostPromise = page.waitForResponse(
      (res) => res.url().includes("/crm/leads") && res.request().method() === "POST" && (res.status() === 201 || res.status() === 200),
      { timeout: 15_000 }
    );
    const submitDialogBtn = dialog.getByRole("button", { name: /create lead/i });
    await submitDialogBtn.click();
    const createRes = await createPostPromise;
    expect([200, 201]).toContain(createRes.status());
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Verify lead row appears with status New
    const leadRow = page.locator("tr", { hasText: leadTitle }).first();
    await expect(leadRow).toBeVisible({ timeout: 15_000 });
    await expect(leadRow.getByText("New", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    // Tour view modes to ensure stability
    const kanbanBtn = page.getByRole("button", { name: "Kanban" }).first();
    await expect(kanbanBtn).toBeVisible({ timeout: 5_000 });
    await kanbanBtn.click();
    await expect(page.locator("main").getByText(leadTitle).first()).toBeVisible({ timeout: 10_000 });

    const cardGridBtn = page.getByRole("button", { name: "CardGrid" }).first();
    await expect(cardGridBtn).toBeVisible({ timeout: 5_000 });
    await cardGridBtn.click();
    await expect(page.locator("main").getByText(leadTitle).first()).toBeVisible({ timeout: 10_000 });

    const splitPaneBtn = page.getByRole("button", { name: "SplitPane" }).first();
    await expect(splitPaneBtn).toBeVisible({ timeout: 5_000 });
    await splitPaneBtn.click();
    await expect(page.locator("main").getByText(leadTitle).first()).toBeVisible({ timeout: 10_000 });

    // Switch to CardGrid for reliable direct action buttons (Qualify, Link Party, Convert)
    await cardGridBtn.click();
    const leadCard = page.locator("main").locator(".rounded-nx-lg", { hasText: leadTitle }).first();
    await expect(leadCard).toBeVisible({ timeout: 10_000 });

    // Step 2: Qualify Lead
    // Click Qualify, fill Qualification Notes in QualifyLeadDialog, submit POST /api/v1/crm/leads/{id}/qualify (200)
    const qualifyActionBtn = leadCard.getByRole("button", { name: "Qualify" });
    await expect(qualifyActionBtn).toBeVisible({ timeout: 5_000 });
    await qualifyActionBtn.click();

    const qualifyDialog = page.getByRole("dialog").first();
    await expect(qualifyDialog).toBeVisible({ timeout: 5_000 });
    await qualifyDialog.locator("#qualify-notes").fill("Approved by commercial committee for enterprise tier.");

    const qualifyResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/qualify") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    const saveDecisionBtn = qualifyDialog.getByRole("button", { name: /save decision/i });
    await saveDecisionBtn.click();
    const qualifyRes = await qualifyResponsePromise;
    expect(qualifyRes.status()).toBe(200);
    await expect(qualifyDialog).not.toBeVisible({ timeout: 10_000 });

    // Verify lead status updates to Qualified
    await expect(leadCard.getByText("Qualified", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    // Step 3: Link/Create Party
    // Click Link Party, submit LinkPartyDialog (createMissingParties = true) -> POST /api/v1/crm/leads/{id}/link-party (200)
    const linkPartyActionBtn = leadCard.getByRole("button", { name: "Link Party" });
    await expect(linkPartyActionBtn).toBeVisible({ timeout: 5_000 });
    await linkPartyActionBtn.click();

    const linkDialog = page.getByRole("dialog").first();
    await expect(linkDialog).toBeVisible({ timeout: 5_000 });

    const linkResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/link-party") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    const saveLinkBtn = linkDialog.getByRole("button", { name: /link parties/i });
    await saveLinkBtn.click();
    const linkRes = await linkResponsePromise;
    expect(linkRes.status()).toBe(200);
    const linkBody = await linkRes.json();
    expect(linkBody.organizationPartyId).toBeTruthy();
    expect(linkBody.personPartyId).toBeTruthy();
    await expect(linkDialog).not.toBeVisible({ timeout: 10_000 });

    // Step 4: Convert Lead to Opportunity
    // Click Convert, verify ConvertLeadDialog opens with amount 250000, submit POST /api/v1/crm/leads/{id}/convert (200)
    const convertActionBtn = leadCard.getByRole("button", { name: /convert/i });
    await expect(convertActionBtn).toBeVisible({ timeout: 5_000 });
    await convertActionBtn.click();

    const convertDialog = page.getByRole("dialog").first();
    await expect(convertDialog).toBeVisible({ timeout: 5_000 });

    const amountInput = convertDialog.locator("#opp-amount");
    await expect(amountInput).toHaveValue("250000");

    const convertResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/convert") && res.request().method() === "POST" && res.status() === 201,
      { timeout: 15_000 }
    );
    const submitConvertBtn = convertDialog.getByRole("button", { name: /convert to deal/i });
    await submitConvertBtn.click();
    const convertRes = await convertResponsePromise;
    expect(convertRes.status()).toBe(201);
    const convertBody = await convertRes.json();
    expect(convertBody.lead?.status).toBe("Converted");
    expect(convertBody.lead?.convertedOpportunityId).toBeTruthy();
    expect(convertBody.opportunity?.id).toBeTruthy();
    await expect(convertDialog).not.toBeVisible({ timeout: 10_000 });

    // Step 5: Refresh & Verify Persisted Relationships
    // Reload /crm/leads (page.reload()), wait for GET /api/v1/crm/leads (200), and verify the lead still renders Converted status and linked Party badges after reload!
    const reloadLeadsPromise = page.waitForResponse(
      (res) => res.url().includes("/crm/leads") && res.request().method() === "GET" && res.status() === 200,
      { timeout: 30_000 }
    );
    await page.reload();
    await reloadLeadsPromise;
    await page.waitForLoadState("domcontentloaded");

    const reloadedLeadRow = page.locator("tr", { hasText: leadTitle }).first();
    await expect(reloadedLeadRow).toBeVisible({ timeout: 15_000 });
    await expect(reloadedLeadRow.getByText("Converted").first()).toBeVisible({ timeout: 10_000 });

    const partyBadges = reloadedLeadRow.locator('[title="Party Linked"], [title="مرتبط بالجهة"]');
    await expect(partyBadges.first()).toBeVisible({ timeout: 10_000 });
    expect(await partyBadges.count()).toBeGreaterThanOrEqual(1);

    // 6. Assert no fatal react runtime exceptions occurred
    const fatalErrors = consoleErrors.filter(
      (err) =>
        err.includes("Uncaught Error") ||
        err.includes("Minified React error") ||
        err.includes("Cannot read properties of undefined") ||
        err.includes("Invariant Violation")
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test("Explicitly converts a Qualified Lead WITHOUT a linked Party into initial Discovery stage (Closure Action 1)", async ({ page }) => {
    // 1. Log in via UI
    await page.goto("/login?redirect=%2Fcrm%2Fleads");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill("ahly.admin@scripe-dev.local");
    await passwordInput.fill(getDevAdminPassword());

    const loginSubmitBtn = page.locator("form button[type='submit']").first();
    await expect(loginSubmitBtn).toBeEnabled({ timeout: 5_000 });
    await loginSubmitBtn.click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    const leadsInitialResponse = page.waitForResponse(
      (res) => res.url().includes("/crm/leads") && res.request().method() === "GET" && res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/leads");
    await leadsInitialResponse;

    const titleLocator = page.getByRole("heading", { name: /lead|intake|crm/i }).first();
    await expect(titleLocator).toBeVisible({ timeout: 20_000 });

    const uniqueSuffix = Date.now().toString().slice(-6);
    const leadTitle = `Unlinked Discovery Lead ${uniqueSuffix}`;
    const companyName = `Prospective Enterprise Club ${uniqueSuffix}`;

    // 2. Create Lead
    const createBtn = page.locator("main").getByRole("button", { name: /new lead/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
    await createBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    await dialog.locator("#lead-title").fill(leadTitle);
    await dialog.locator("#lead-company").fill(companyName);
    await dialog.locator("#lead-first-name").fill("Tariq");
    await dialog.locator("#lead-last-name").fill("Hamed");
    await dialog.locator("#lead-email").fill(`tariq.${uniqueSuffix}@club.example`);
    await dialog.locator("#lead-value").fill("180000");

    const createResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/crm/leads") && res.request().method() === "POST" && (res.status() === 201 || res.status() === 200),
      { timeout: 15_000 }
    );
    const submitBtn = dialog.getByRole("button", { name: /create lead/i });
    await submitBtn.click();
    const createRes = await createResponsePromise;
    expect([200, 201]).toContain(createRes.status());
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Switch to CardGrid for reliable direct action buttons
    const cardGridBtn = page.getByRole("button", { name: "CardGrid" }).first();
    if (await cardGridBtn.isVisible({ timeout: 3_000 })) {
      await cardGridBtn.click();
    }
    const leadCard = page.locator("main").locator(".rounded-nx-lg", { hasText: leadTitle }).first();
    await expect(leadCard).toBeVisible({ timeout: 10_000 });

    // 3. Qualify Lead
    const qualifyActionBtn = leadCard.getByRole("button", { name: "Qualify" });
    await expect(qualifyActionBtn).toBeVisible({ timeout: 5_000 });
    await qualifyActionBtn.click();

    const qualifyDialog = page.getByRole("dialog").first();
    await expect(qualifyDialog).toBeVisible({ timeout: 5_000 });
    await qualifyDialog.locator("#qualify-notes").fill("Direct qualification without pre-linked Party per PD-1 discovery phase.");

    const qualifyResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/qualify") && res.request().method() === "POST" && res.status() === 200,
      { timeout: 15_000 }
    );
    await qualifyDialog.getByRole("button", { name: /save decision/i }).click();
    const qualifyRes = await qualifyResponsePromise;
    expect(qualifyRes.status()).toBe(200);
    await expect(qualifyDialog).not.toBeVisible({ timeout: 10_000 });

    // 4. Convert directly WITHOUT calling Link Party!
    // Party linkage is optional at conversion per PD-1 for initial Discovery stage
    const convertActionBtn = leadCard.getByRole("button", { name: /convert/i });
    await expect(convertActionBtn).toBeVisible({ timeout: 5_000 });
    await convertActionBtn.click();

    const convertDialog = page.getByRole("dialog").first();
    await expect(convertDialog).toBeVisible({ timeout: 5_000 });

    const convertResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/convert") && res.request().method() === "POST" && res.status() === 201,
      { timeout: 15_000 }
    );
    const submitConvertBtn = convertDialog.getByRole("button", { name: /convert to deal/i });
    await submitConvertBtn.click();
    const convertRes = await convertResponsePromise;

    // Must be 201 Created per C1
    expect(convertRes.status()).toBe(201);
    const convertBody = await convertRes.json();
    expect(convertBody.lead?.status).toBe("Converted");
    expect(convertBody.opportunity?.id).toBeTruthy();
    expect(convertBody.opportunity?.stageKey).toBe("default.discovery");
    // Verify partyId is null on opportunity created without party
    expect(convertBody.opportunity?.partyId).toBeNull();
    await expect(convertDialog).not.toBeVisible({ timeout: 10_000 });
  });
});
