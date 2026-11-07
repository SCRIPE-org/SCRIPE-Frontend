import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks } from "./fixtures/test-helpers";
import { MOCK_SESSIONS } from "./fixtures/profile-mock-data";

test.describe("Feature 3: Workstation Session Fleet Control (ProfileSessionsView)", () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRouteMocks(page);
    await page.goto("/profile/sessions");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
  });

  // ── Tier 1: Happy Path Feature Coverage ───────────────────────────────────

  test("TC-3.1: Render Current Workstation telemetry slab with active pulse badge", async ({ page }) => {
    // Current workstation section title
    await expect(page.getByText(/current workstation|this device/i).first()).toBeVisible();

    const current = MOCK_SESSIONS.find((s) => s.isCurrent)!;

    // Check device name and telemetry
    await expect(page.getByText(current.deviceName)).toBeVisible();
    await expect(page.getByText(current.ipAddress)).toBeVisible();
    await expect(page.getByText(new RegExp(current.city, "i"))).toBeVisible();

    // Check green pulse badge
    await expect(page.locator(".animate-pulse").first()).toBeVisible();
  });

  test("TC-3.2: Render Other Active Workstations fleet list with remote telemetry", async ({ page }) => {
    // Other sessions section
    await expect(page.getByText(/other active workstations|other active sessions/i).first()).toBeVisible();

    const remoteSession = MOCK_SESSIONS.find((s) => !s.isCurrent && !s.isImpersonated)!;
    await expect(page.getByText(remoteSession.deviceName)).toBeVisible();
    await expect(page.getByText(remoteSession.ipAddress)).toBeVisible();
    await expect(page.getByText(new RegExp(remoteSession.city, "i"))).toBeVisible();
  });

  test("TC-3.3: Detect and badge administrative impersonation sessions", async ({ page }) => {
    const impersonated = MOCK_SESSIONS.find((s) => s.isImpersonated)!;

    // Device name and impersonation badge
    await expect(page.getByText(impersonated.deviceName)).toBeVisible();
    await expect(
      page.getByText(/managed session|impersonated/i).or(page.getByText(impersonated.impersonatorName!)).first()
    ).toBeVisible();
  });

  test("TC-3.4: Terminate individual remote session via 'Kill Session' button", async ({ page }) => {
    const remoteSession = MOCK_SESSIONS.find((s) => !s.isCurrent && !s.isImpersonated)!;
    await expect(page.getByText(remoteSession.deviceName)).toBeVisible();

    // Find the Kill Session button for the remote device
    const killBtn = page
      .locator("div")
      .filter({ hasText: remoteSession.deviceName })
      .getByRole("button", { name: /terminate|kill session|revoke/i })
      .first();

    await killBtn.click();

    // Session should be removed
    await expect(page.getByText(remoteSession.deviceName)).not.toBeVisible({ timeout: 5_000 });
  });

  test("TC-3.5: Execute 1-click cluster revocation ('Revoke All Other Sessions')", async ({ page }) => {
    const revokeAllBtn = page.getByRole("button", { name: /revoke all other sessions/i });
    await expect(revokeAllBtn).toBeVisible();

    await revokeAllBtn.click();

    // After cluster kill, only the Current Workstation should remain
    const current = MOCK_SESSIONS.find((s) => s.isCurrent)!;
    await expect(page.getByText(current.deviceName)).toBeVisible();

    // Remote sessions should disappear
    for (const s of MOCK_SESSIONS.filter((s) => !s.isCurrent)) {
      await expect(page.getByText(s.deviceName)).not.toBeVisible({ timeout: 5_000 });
    }
  });

  test("TC-3.6: Manual sessions list refresh action", async ({ page }) => {
    const refreshBtn = page.getByRole("button", { name: /refresh/i }).first();
    await expect(refreshBtn).toBeVisible();

    await refreshBtn.click();

    // Verify current workstation is still visible and intact
    await expect(page.getByText(MOCK_SESSIONS[0].deviceName)).toBeVisible();
  });

  // ── Tier 2: Boundary & Corner Cases ───────────────────────────────────────

  test("TC-2.B14: Graceful handling of zero remote sessions", async ({ page }) => {
    // Only current session active
    await setupProfileRouteMocks(page, {
      initialSessions: [MOCK_SESSIONS[0]],
    });
    await page.goto("/profile/sessions");
    await expect(page.locator("h1")).toBeVisible();

    // The 'Revoke All Other Sessions' button should not be displayed or should be disabled
    const revokeAllBtn = page.getByRole("button", { name: /revoke all other sessions/i });
    await expect(revokeAllBtn).not.toBeVisible();

    // Empty state message for other devices
    await expect(page.getByText(/no other active workstations|no other active sessions|no other devices/i).first()).toBeVisible();
  });
});
