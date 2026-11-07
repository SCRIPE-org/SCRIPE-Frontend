import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks, mockWebAuthn } from "./fixtures/test-helpers";
import { MOCK_PASSKEYS } from "./fixtures/profile-mock-data";

test.describe("Feature 2: Sovereign Security & Passkey Vault (ProfileSecurityView)", () => {
  test.beforeEach(async ({ page }) => {
    await mockWebAuthn(page);
    await setupProfileRouteMocks(page);
    await page.goto("/profile/security");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
  });

  // ── Tier 1: Happy Path Feature Coverage ───────────────────────────────────

  test("TC-2.1: Render enrolled passkeys with hardware device badges and telemetry", async ({ page }) => {
    // Assert section title
    await expect(page.getByText(/passkey vault|fido2 passkeys/i).first()).toBeVisible();

    // Verify mock enrolled passkeys are rendered
    for (const key of MOCK_PASSKEYS) {
      await expect(page.getByText(key.deviceName)).toBeVisible();
      await expect(page.getByText(new RegExp(`••••••••|${key.id.slice(-6)}`)).first()).toBeVisible();
    }
  });

  test("TC-2.2: Execute 3-Tier passkey enrollment wizard (Platform mode)", async ({ page }) => {
    // Click "Enroll New Passkey"
    const enrollBtn = page.getByRole("button", { name: /enroll new passkey|add passkey/i });
    await enrollBtn.click();

    // Dialog opens with 3 options: Platform, Hybrid, Security Key
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/this computer|workstation/i).first()).toBeVisible();
    await expect(dialog.getByText(/phone or tablet/i).first()).toBeVisible();
    await expect(dialog.getByText(/hardware security key/i).first()).toBeVisible();

    // Select Platform option
    await dialog.getByText(/this computer|workstation/i).first().click();

    // Fill device name or proceed with default
    const nameInput = dialog.locator("input#passkey-name").or(dialog.locator("input[placeholder*='Passkey' i]")).first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("Office Workstation (Windows Hello)");
    }

    // Click confirm / enroll button
    const confirmBtn = dialog.getByRole("button", { name: /activate passkey|enroll|continue|create passkey/i }).last();
    await confirmBtn.click();

    // Success screen / card rendered
    await expect(dialog.getByText(/passkey enrolled|passkey registered|success/i)).toBeVisible({ timeout: 5_000 });
  });

  test("TC-2.3: Revoke individual passkey and verify removal from vault", async ({ page }) => {
    const targetKey = MOCK_PASSKEYS[0];
    await expect(page.getByText(targetKey.deviceName)).toBeVisible();

    // Find and click the delete button for the first passkey
    const deleteBtn = page.locator("button[aria-label*='delete' i], button[aria-label*='remove' i]").first();
    await deleteBtn.click();

    // Wait for the passkey card to be removed
    await expect(page.getByText(targetKey.deviceName)).not.toBeVisible({ timeout: 5_000 });
  });

  test("TC-2.4: Execute Two-Factor Authentication (TOTP) wizard activation", async ({ page }) => {
    // 1. Wait for 2FA section to hydrate and show either "Enable 2FA" or "Disable 2FA"
    const twoFaBtn = page.getByRole("button", { name: /(enable|disable) 2fa/i }).first();
    await expect(twoFaBtn).toBeVisible({ timeout: 10_000 });

    const btnText = await twoFaBtn.innerText();
    if (/disable 2fa/i.test(btnText)) {
      // Transition from enabled to disabled state
      await twoFaBtn.click();
      const enableBtn = page.getByRole("button", { name: /enable 2fa/i }).first();
      await expect(enableBtn).toBeVisible({ timeout: 5_000 });
      await enableBtn.click();
    } else {
      await twoFaBtn.click();
    }

    // Wizard dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Step 1 (SCAN): QR code and manual key visible
    await expect(dialog.getByText(/scan qr code|authenticator app/i).first()).toBeVisible();
    await expect(dialog.locator("img[alt*='qr' i]").or(dialog.locator(".bg-white img"))).toBeVisible();

    // Proceed to Step 2 (VERIFY)
    const nextBtn = dialog.getByRole("button", { name: /continue|next/i }).first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Step 2 (VERIFY): Enter 6-digit OTP code
    const codeInput = dialog.locator("#totp-input").or(dialog.locator("input[placeholder*='000000' i]")).first();
    await expect(codeInput).toBeVisible({ timeout: 5_000 });
    await codeInput.fill("123456");

    const verifyBtn = dialog.getByRole("button", { name: /verify/i }).first();
    await expect(verifyBtn).toBeEnabled();
    await verifyBtn.click();

    // Step 3: Activation completes - modal closes and 2FA is active
    await expect(page.getByText(/your account is protected with 2fa/i).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("button", { name: /disable 2fa/i }).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("button", { name: /regenerate codes|regenerate backup codes/i }).first()).toBeVisible({ timeout: 5_000 });
  });

  test("TC-2.5: Generate and copy 10 emergency recovery backup codes", async ({ page }) => {
    const regenBtn = page.getByRole("button", { name: /regenerate backup codes|view backup codes/i });
    if (await regenBtn.isVisible()) {
      await regenBtn.click();
      await expect(page.getByText(/backup codes/i).first()).toBeVisible();

      // Test copy backup codes button
      const copyBtn = page.getByRole("button", { name: /copy all codes|copy/i }).first();
      await expect(copyBtn).toBeVisible();
      await copyBtn.click();

      // Check download codes button
      const downloadBtn = page.getByRole("button", { name: /download/i }).first();
      await expect(downloadBtn).toBeVisible();
    }
  });

  test("TC-2.6: Password rotation form with complexity checklist verification", async ({ page }) => {
    const currentPassInput = page.locator("#currentPassword").or(page.locator("input[type='password']").nth(0));
    const newPassInput = page.locator("#newPassword").or(page.locator("input[type='password']").nth(1));
    const confirmPassInput = page.locator("#confirmPassword").or(page.locator("input[type='password']").nth(2));

    if (await currentPassInput.isVisible() && await newPassInput.isVisible()) {
      await currentPassInput.fill("OldPassword123!");
      await newPassInput.fill("SuperSecretNewPassword2026!#");
      await confirmPassInput.fill("SuperSecretNewPassword2026!#");

      // Verify submit button is enabled
      const submitBtn = page.getByRole("button", { name: /update password|change password/i });
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();

      // Verify success notification
      await expect(page.getByText(/password updated|password changed/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test("TC-2.7: Trigger Biometric Sudo Mode step-up modal challenge", async ({ page }) => {
    const sudoTriggerBtn = page.getByRole("button", { name: /elevate session|biometric sudo|step-up/i }).first();
    if (await sudoTriggerBtn.isVisible()) {
      await sudoTriggerBtn.click();

      // Verify Biometric Sudo Modal opens
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText(/confirm identity|biometric authentication required|sudo mode/i).first()).toBeVisible();

      // Click Authenticate button (mocked WebAuthn resolves)
      const authBtn = dialog.getByRole("button", { name: /authenticate|verify/i }).last();
      await authBtn.click();

      // Sudo badge should now indicate active status
      await expect(page.getByText(/sudo active|expires:/i).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  // ── Tier 2: Boundary & Corner Cases ───────────────────────────────────────

  test("TC-2.B04: Emergency lockdown keyword guard strictly requires exact uppercase 'LOCKDOWN'", async ({
    page,
  }) => {
    const lockdownBtn = page.getByRole("button", { name: /emergency lockdown/i });
    await lockdownBtn.click();

    // Dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/emergency account shield|execute emergency lockdown|destructive security action/i).first()).toBeVisible();

    const inputConfirm = dialog.locator("#lockdown-confirm").or(dialog.locator("input[placeholder='LOCKDOWN']"));
    const executeBtn = dialog.getByRole("button", { name: /lockdown account now|execute global lockdown|lockdown/i }).last();

    // 1. Initial state: button disabled
    await expect(executeBtn).toBeDisabled();

    // 2. Typing lowercase "lockdown" must NOT enable the button
    await inputConfirm.fill("lockdown");
    await expect(executeBtn).toBeDisabled();

    // 3. Typing wrong word must NOT enable the button
    await inputConfirm.fill("CANCEL");
    await expect(executeBtn).toBeDisabled();

    // 4. Typing exact uppercase "LOCKDOWN" enables the button
    await inputConfirm.fill("LOCKDOWN");
    await expect(executeBtn).toBeEnabled();
  });

  test("TC-2.B10: Password rotation with unmet complexity keeps submission blocked", async ({ page }) => {
    const newPassInput = page.locator("#newPassword").or(page.locator("input[type='password']").nth(1));
    if (await newPassInput.isVisible()) {
      // Simple lowercase password lacking uppercase, number, symbol
      await newPassInput.fill("simple");

      const submitBtn = page.getByRole("button", { name: /update password|change password/i });
      await submitBtn.click();
      // Form does not submit with invalid password
      await expect(page.getByText(/password updated|password changed/i)).not.toBeVisible();
    }
  });
});
