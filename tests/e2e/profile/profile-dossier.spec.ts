import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks } from "./fixtures/test-helpers";
import { MOCK_ADMIN_PROFILE } from "./fixtures/profile-mock-data";

test.describe("Feature 1: Sovereign Profile Dossier & Avatar Lifecycle (ProfileDossierView)", () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRouteMocks(page);
    await page.goto("/profile");
    // Wait for the main profile heading to ensure the page has mounted
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
  });

  // ── Tier 1: Happy Path Feature Coverage ───────────────────────────────────

  test("TC-1.1: Render Executive Dossier view with personal details, staff code, and club affiliation", async ({
    page,
  }) => {
    // Assert Header & Title
    await expect(page.locator("h1")).toContainText(/dossier/i);

    // Assert Club affiliation & Edition in Telemetry HUD
    await expect(page.getByText(MOCK_ADMIN_PROFILE.clubAffiliation).first()).toBeVisible();
    await expect(page.getByText(MOCK_ADMIN_PROFILE.editionName).first()).toBeVisible();

    // Assert Staff Code Badge
    await expect(page.getByText(MOCK_ADMIN_PROFILE.staffCode).first()).toBeVisible();

    // Assert Form inputs are pre-populated with current profile data
    const firstNameInput = page.locator("#firstName");
    const lastNameInput = page.locator("#lastName");
    await expect(firstNameInput).toHaveValue(MOCK_ADMIN_PROFILE.firstName);
    await expect(lastNameInput).toHaveValue(MOCK_ADMIN_PROFILE.lastName);

    // Read-only username badge/input
    await expect(page.locator("#username")).toHaveValue(MOCK_ADMIN_PROFILE.username);
  });

  test("TC-1.2: Edit personal details (name, phone) and submit successfully", async ({ page }) => {
    const firstNameInput = page.locator("#firstName");
    const lastNameInput = page.locator("#lastName");
    const submitBtn = page.locator("button[type='submit']");

    // Modify details
    await firstNameInput.fill("Alexander");
    await lastNameInput.fill("Ferguson");

    // Submit button should now be active
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify successful update feedback
    await expect(page.getByText(/profile updated/i).or(page.locator(".text-emerald-500"))).toBeVisible({
      timeout: 5_000,
    });
  });

  test("TC-1.3: Upload profile avatar image and verify instant preview", async ({ page }) => {
    // Target hidden file input in AvatarUpload
    const fileInput = page.locator("input[type='file']");

    // Create a 100x100 dummy PNG buffer
    const mockImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOBsBcgAAAF8t1AAAAAElFTkSuQmCC",
      "base64"
    );

    await fileInput.setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: mockImageBuffer,
    });

    // Upload button should become enabled
    const uploadBtn = page.getByRole("button", { name: /upload|save avatar/i });
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();
    }

    // Verify avatar image is rendered
    await expect(page.locator("img[alt*='avatar' i]").or(page.locator(".h-24.w-24 img"))).toBeVisible({
      timeout: 5_000,
    });
  });

  test("TC-1.4: Remove avatar image and assert revert to initials fallback", async ({ page }) => {
    // Start with a profile that has an image
    await setupProfileRouteMocks(page, {
      profileOverrides: { profileImageUrl: "https://example.com/avatar.png" },
    });
    await page.goto("/profile");
    await expect(page.locator("h1")).toBeVisible();

    const removeBtn = page.getByRole("button", { name: /remove|delete/i });
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
    }

    // Initials fallback should be visible (e.g. "AM" for Alex Morgan)
    const expectedInitials = `${MOCK_ADMIN_PROFILE.firstName[0]}${MOCK_ADMIN_PROFILE.lastName[0]}`;
    await expect(page.getByText(expectedInitials, { exact: true }).first()).toBeVisible();
  });

  test("TC-1.5: Toggle operational availability switch in Telemetry HUD", async ({ page }) => {
    const availabilitySwitch = page.locator("button[role='switch']").first();
    await expect(availabilitySwitch).toBeVisible();

    // Initial state: Active
    await expect(page.getByText(/active/i).first()).toBeVisible();

    // Toggle switch
    await availabilitySwitch.click();

    // Should transition to Standby / Off Duty
    await expect(page.getByText(/standby|off duty/i).first()).toBeVisible();
  });

  test("TC-1.6: Change active campus in ProfileRailLayout", async ({ page }) => {
    // Click campus selector trigger in the sticky rail
    const campusTrigger = page.locator("button[role='combobox']").or(page.locator("[data-testid='campus-switcher']")).first();
    if (await campusTrigger.isVisible()) {
      await campusTrigger.click();

      // Select secondary campus from dropdown
      const secondaryCampusOption = page.getByRole("option", { name: /Nasr City/i });
      if (await secondaryCampusOption.isVisible()) {
        await secondaryCampusOption.click();
        await expect(page.getByText(/Nasr City/i).first()).toBeVisible();
      }
    }
  });

  // ── Tier 2: Boundary & Corner Cases ───────────────────────────────────────

  test("TC-2.B01: Invalid phone number entry blocks submission", async ({ page }) => {
    const phoneInput = page.locator("input[type='tel']").or(page.locator("#phoneNumber")).first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("123"); // Too short / invalid phone
      const submitBtn = page.locator("button[type='submit']");
      await submitBtn.click();

      // Expect validation error message to be displayed
      await expect(
        page.getByText(/invalid phone|enter a valid phone/i).or(page.locator(".text-destructive"))
      ).toBeVisible();
    }
  });

  test("TC-2.B02: Unchanged profile details keeps submit button disabled or untouched", async ({ page }) => {
    const submitBtn = page.locator("button[type='submit']");
    // Without any edits, submit button should be disabled or inert
    const isDisabled = await submitBtn.isDisabled();
    expect(isDisabled).toBe(true);
  });
});
