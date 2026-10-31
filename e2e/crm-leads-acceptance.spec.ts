import { test, expect } from "@playwright/test";

test.describe("CRM Leads Intake Acceptance & View Mode Tour", () => {
  test("Loads /login, logs in, visits /crm/leads, verifies header, view modes, and Create Lead dialog", async ({ page }) => {
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
    await passwordInput.fill("P@ssw0rd");

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // 2. Wait for navigation after login and navigate to /crm/leads, waiting for the API response
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    
    const leadsResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/crm/leads") && res.status() === 200,
      { timeout: 30_000 }
    );
    await page.goto("/crm/leads");
    await leadsResponsePromise;

    // 3. Verify CRM Leads Header is rendered
    const titleLocator = page.getByRole("heading", { name: /lead|intake|crm/i }).first();
    await expect(titleLocator).toBeVisible({ timeout: 20_000 });

    // 4. Verify Create Lead button in the action bar exists and click it
    const createBtn = page.locator("main").getByRole("button", { name: /new lead/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
    await createBtn.click();

    // 5. Verify Create Lead modal dialog opens
    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // 6. Verify D1=B identity inputs (Title, Company Name, Contact Name/Email, etc.)
    const titleInput = dialog.getByRole("textbox", { name: "Inquiry Title *" });
    await expect(titleInput).toBeVisible({ timeout: 5_000 });

    // Fill Title
    await titleInput.fill("Real Madrid Commercial Partnership Q4");

    // Fill Company Name (D1=B requirement)
    const companyInput = dialog.getByRole("textbox", { name: "Company / Organization" });
    if (await companyInput.isVisible()) {
      await companyInput.fill("Real Madrid Holdings");
    }

    // 7. Submit Create Lead dialog (D1=B valid submission)
    const createPostResponse = page.waitForResponse(
      (res) => res.url().includes("/crm/leads") && res.request().method() === "POST" && (res.status() === 201 || res.status() === 200),
      { timeout: 15_000 }
    );
    const submitDialogBtn = dialog.getByRole("button", { name: /create lead/i });
    await submitDialogBtn.click();
    await createPostResponse;
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // 8. Verify the created lead appears in the table cell
    const leadCell = page.getByRole("cell", { name: "Real Madrid Commercial Partnership Q4" }).first();
    await expect(leadCell).toBeVisible({ timeout: 15_000 });

    // 9. Tour View Modes: Kanban, CardGrid, SplitPane, and Table
    const kanbanBtn = page.getByRole("button", { name: "Kanban" }).first();
    await expect(kanbanBtn).toBeVisible({ timeout: 5_000 });
    await kanbanBtn.click();
    await expect(page.locator("main").getByText("Real Madrid Commercial Partnership Q4").first()).toBeVisible({ timeout: 10_000 });

    const cardGridBtn = page.getByRole("button", { name: "CardGrid" }).first();
    await expect(cardGridBtn).toBeVisible({ timeout: 5_000 });
    await cardGridBtn.click();
    await expect(page.locator("main").getByText("Real Madrid Commercial Partnership Q4").first()).toBeVisible({ timeout: 10_000 });

    const splitPaneBtn = page.getByRole("button", { name: "SplitPane" }).first();
    await expect(splitPaneBtn).toBeVisible({ timeout: 5_000 });
    await splitPaneBtn.click();
    await expect(page.locator("main").getByText("Real Madrid Commercial Partnership Q4").first()).toBeVisible({ timeout: 10_000 });

    const tableBtn = page.getByRole("button", { name: "Table" }).first();
    await expect(tableBtn).toBeVisible({ timeout: 5_000 });
    await tableBtn.click();
    await expect(leadCell).toBeVisible({ timeout: 10_000 });

    // 10. Assert no fatal react runtime exceptions occurred
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
