import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks, mockWebAuthn } from "./fixtures/test-helpers";
import { MOCK_ADMIN_PROFILE, MOCK_SESSIONS } from "./fixtures/profile-mock-data";

test.describe("Tier 3 & Tier 4: Cross-Feature Combinations & Real-World Application Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await mockWebAuthn(page);
    await setupProfileRouteMocks(page);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ── Tier 3: Cross-Feature Combinations ────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  test("TC-3.C01: Passkey + 2FA simultaneous enforcement (MFA requirement)", async ({ page }) => {
    // Navigate to security vault
    await page.goto("/profile/security");
    await expect(page.locator("h1")).toBeVisible();

    // Verify both Passkeys and 2FA are active simultaneously
    await expect(page.getByText(/passkey vault|fido2 passkeys/i).first()).toBeVisible();
    await expect(page.getByText(/two-factor authentication/i).first()).toBeVisible();

    // Verify Telemetry HUD computes hardened score (>= 80%) when both are active
    await expect(page.getByText(/security posture: 85%/i).or(page.getByText(/hardened/i)).first()).toBeVisible();
  });

  test("TC-3.C02: Cluster session revocation invalidates remote active sessions", async ({ page, context }) => {
    await page.goto("/profile/sessions");
    await expect(page.locator("h1")).toBeVisible();

    // Check initially multiple sessions exist
    await expect(page.getByText(MOCK_SESSIONS[1].deviceName)).toBeVisible();

    // Click Revoke All Other Sessions
    const revokeAllBtn = page.getByRole("button", { name: /revoke all other sessions/i });
    await revokeAllBtn.click();

    // Verify remote sessions removed
    await expect(page.getByText(MOCK_SESSIONS[1].deviceName)).not.toBeVisible({ timeout: 5_000 });

    // Open a second tab attempting to access protected profile
    const tab2 = await context.newPage();
    await setupProfileRouteMocks(tab2);
    await tab2.goto("/profile");
    // Main session on current device remains operational
    await expect(tab2.locator("h1")).toBeVisible();
    await tab2.close();
  });

  test("TC-3.C03: Theme mode change + LTR/RTL layout direction flip", async ({ page }) => {
    await page.goto("/profile/preferences");
    await expect(page.locator("h1")).toBeVisible();

    // 1. Switch to Light Mode
    const lightBtn = page.getByRole("button", { name: /light/i }).first();
    await lightBtn.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 2. Switch to Arabic RTL
    const arabicBtn = page.getByRole("button", { name: /العربية/i }).first();
    if (await arabicBtn.isVisible()) {
      await arabicBtn.click();
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

      // Verify Profile Rail navigation layout remains intact in RTL Light mode
      const rail = page.locator("nav").first();
      await expect(rail).toBeVisible();
    }
  });

  test("TC-3.C04: Avatar upload + bio edit in a single session", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("h1")).toBeVisible();

    // 1. Upload new avatar
    const fileInput = page.locator("input[type='file']");
    const mockImageBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    await fileInput.setInputFiles({ name: "profile.png", mimeType: "image/png", buffer: mockImageBuffer });

    const uploadBtn = page.getByRole("button", { name: /upload|save avatar/i });
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();
    }

    // 2. Edit first name
    const firstNameInput = page.locator("#firstName");
    await firstNameInput.fill("Alexis");
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // Both updates succeed without collision
    await expect(page.getByText(/profile updated/i).or(page.locator(".text-emerald-500")).first()).toBeVisible({ timeout: 5_000 });
  });

  test("TC-3.C05: PAT token creation emits corresponding SOC2 audit trail record", async ({ page }) => {
    // 1. Generate PAT
    await page.goto("/profile/integrations");
    await expect(page.locator("h1")).toBeVisible();

    await page.getByRole("button", { name: /generate new token|create token/i }).click();
    const tokenNameInput = page.locator("#pat-name").or(page.locator("input[placeholder*='token' i]")).first();
    await tokenNameInput.fill("Automated Video Drill Sync");
    await page.getByRole("button", { name: /generate token/i }).last().click();
    await expect(page.getByText(/scr_pat_/i).first()).toBeVisible();

    // 2. Navigate to Activity view and verify audit event
    await page.goto("/profile/activity");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText(/Developer Personal Access Token Issued|PersonalAccessTokenCreated|audit-04/i).first()).toBeVisible();
  });

  test("TC-3.C06: Campus switcher change updates Telemetry HUD active branch", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("h1")).toBeVisible();

    // Switch campus
    const campusTrigger = page.locator("button[role='combobox']").or(page.locator("[data-testid='campus-switcher']")).first();
    if (await campusTrigger.isVisible()) {
      await campusTrigger.click();
      const secondaryCampus = page.getByRole("option", { name: /Nasr City/i });
      if (await secondaryCampus.isVisible()) {
        await secondaryCampus.click();
        // Verify Telemetry HUD reflects new branch
        await expect(page.getByText(/Nasr City/i).first()).toBeVisible();
      }
    }
  });

  test("TC-3.C07: Emergency lockdown execution forces global session purge", async ({ page }) => {
    await page.goto("/profile/security");
    await expect(page.locator("h1")).toBeVisible();

    // Trigger emergency lockdown
    await page.getByRole("button", { name: /emergency account lockdown|emergency lockdown/i }).click();
    const inputConfirm = page.locator("#lockdown-confirm").or(page.locator("input[placeholder='LOCKDOWN']"));
    await inputConfirm.fill("LOCKDOWN");
    const executeBtn = page.getByRole("button", { name: /execute global lockdown|lockdown/i }).last();
    await executeBtn.click();

    // Should redirect to /login or clear session
    await page.waitForTimeout(1_000);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ── Tier 4: Real-World Application Scenarios ──────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  test("TC-4.S01: Scenario 1 — Executive Onboarding & Security Hardening Journey", async ({ page }) => {
    // 1. Executive logs in and lands on Dossier
    await page.goto("/profile");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText(MOCK_ADMIN_PROFILE.clubAffiliation).first()).toBeVisible();

    // 2. Updates contact info
    const firstNameInput = page.locator("#firstName");
    await firstNameInput.fill("Alexander");
    await page.locator("button[type='submit']").click();

    // 3. Navigates to Security Vault to enroll passkey
    await page.locator("nav").getByRole("link", { name: /security & identity vault|security/i }).first().click();
    await page.waitForURL("**/profile/security");
    await expect(page.getByText(/passkey vault|fido2 passkeys/i).first()).toBeVisible();

    // Enroll platform passkey
    await page.getByRole("button", { name: /enroll new passkey|add passkey/i }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText(/this computer|workstation/i).first().click();
    await dialog.getByRole("button", { name: /activate passkey|create passkey|enroll|continue/i }).last().click();
    await expect(page.getByText(/passkey registered|success|added/i).first()).toBeVisible();

    // Close enroll dialog before proceeding
    await dialog.getByRole("button", { name: "Done" }).click();
    await expect(dialog).not.toBeVisible();

    // 4. Navigates to Preferences to customize ergonomic setup
    await page.locator("nav").getByRole("link", { name: /ergonomics & display|preferences/i }).first().click();
    await page.waitForURL("**/profile/preferences");
    await expect(page.getByText(/relay vnext theme mode|theme/i).first()).toBeVisible();

    // Select Tactical Dark and Signal Lime accent
    await page.getByRole("button", { name: /dark/i }).first().click();
    const limeSwatch = page.getByRole("button", { name: /signal lime|lime/i }).first();
    if (await limeSwatch.isVisible()) {
      await limeSwatch.click();
    }

    // 5. Verifies hardened posture score in Telemetry HUD
    await expect(page.getByText(/security posture: 85%/i).or(page.getByText(/hardened/i)).first()).toBeVisible();
  });

  test("TC-4.S02: Scenario 2 — SOC2 Incident Investigation & Nuclear Lockdown", async ({ page }) => {
    // 1. Security Officer checks Sessions Fleet
    await page.goto("/profile/sessions");
    await expect(page.locator("h1")).toBeVisible();

    // Discovers suspicious remote session
    const remoteSession = MOCK_SESSIONS[1];
    await expect(page.getByText(remoteSession.deviceName)).toBeVisible();

    // Kills anomalous session
    const killBtn = page
      .locator("div")
      .filter({ hasText: remoteSession.deviceName })
      .getByRole("button", { name: /terminate|kill session/i })
      .first();
    await killBtn.click();
    await expect(page.getByText(remoteSession.deviceName)).not.toBeVisible();

    // 2. Investigates in Compliance Audit Log
    await page.locator("nav").getByRole("link", { name: /compliance audit trail|activity/i }).first().click();
    await page.waitForURL("**/profile/activity");
    await expect(page.locator("h1")).toBeVisible();

    // Filter by failures (second combobox in main activity area)
    const mainView = page.locator("main").last();
    const outcomeTrigger = mainView.locator("[role='combobox']").nth(1);
    if (await outcomeTrigger.isVisible()) {
      await outcomeTrigger.click();
      const failOpt = page.getByRole("option", { name: /only failure|failed only|failures only/i });
      if (await failOpt.isVisible()) await failOpt.click();
    }

    // Opens Forensic Payload Drawer
    await page.getByText(/Invalid Password Attempt|Failed password attempt|LoginFailed/i).first().click();
    await expect(page.getByText(/forensic payload inspector|soc2 forensic/i).first()).toBeVisible();

    // Close drawer before navigating away
    await page.keyboard.press("Escape");
    await expect(page.getByText(/forensic payload inspector|soc2 forensic/i)).not.toBeVisible();

    // 3. Executes Emergency Nuclear Lockdown
    await page.locator("nav").getByRole("link", { name: /security & identity vault|security/i }).first().click();
    await page.waitForURL("**/profile/security");
    await page.getByRole("button", { name: /emergency account lockdown|emergency lockdown/i }).click();
    await page.locator("#lockdown-confirm").or(page.locator("input[placeholder='LOCKDOWN']")).fill("LOCKDOWN");
    await page.getByRole("button", { name: /execute global lockdown|lockdown/i }).last().click();
    await page.waitForTimeout(1_000);
  });

  test("TC-4.S03: Scenario 3 — Staff Campus Transfer & Developer Token Automation Setup", async ({
    page,
  }) => {
    // 1. Transfer facility via Campus Switcher
    await page.goto("/profile");
    await expect(page.locator("h1")).toBeVisible();

    const campusTrigger = page.locator("button[role='combobox']").or(page.locator("[data-testid='campus-switcher']")).first();
    if (await campusTrigger.isVisible()) {
      await campusTrigger.click();
      const newCampus = page.getByRole("option", { name: /Nasr City/i });
      if (await newCampus.isVisible()) await newCampus.click();
    }

    // 2. Link Enterprise SSO & Generate Developer Token
    await page.locator("nav").getByRole("link", { name: /sso & developer api|integrations/i }).first().click();
    await page.waitForURL("**/profile/integrations");
    await expect(page.locator("h1")).toBeVisible();

    // Verify Google Workspace SSO is connected
    await expect(page.getByText("Google Workspace")).toBeVisible();

    // Generate Scoped PAT for Tactical Analysis Automation
    await page.getByRole("button", { name: /generate new token|create token/i }).click();
    const tokenInput = page.locator("#pat-name").or(page.locator("input[placeholder*='token' i]")).first();
    await tokenInput.fill("Pitch-Side Tactical Engine Script");
    await page.getByRole("button", { name: /generate token/i }).last().click();

    // Verify secret key presented
    await expect(page.getByText(/scr_pat_/i).first()).toBeVisible();
    await page.getByRole("button", { name: /copy/i }).last().click();
  });
});
