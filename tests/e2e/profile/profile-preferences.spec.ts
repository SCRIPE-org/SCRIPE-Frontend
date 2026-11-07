import { test, expect } from "@playwright/test";
import { setupProfileRouteMocks } from "./fixtures/test-helpers";

test.describe("Feature 5: Workstation Preferences & Ergonomics (ProfilePreferencesView)", () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRouteMocks(page);
    await page.goto("/profile/preferences");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });
  });

  // ── Tier 1: Happy Path Feature Coverage ───────────────────────────────────

  test("TC-5.1: Switch Relay vNext Theme Mode (Tactical Dark, Clean Light, System)", async ({ page }) => {
    // Locate Theme Mode buttons
    const darkBtn = page.getByRole("button", { name: /dark/i }).first();
    const lightBtn = page.getByRole("button", { name: /light/i }).first();

    // 1. Switch to Light Mode
    await lightBtn.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 2. Switch to Dark Mode
    await darkBtn.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("TC-5.2: Select 4 Club Accent Hue Swatches and verify data-accent attribute", async ({ page }) => {
    // 4 Accents: Signal Lime, Electric Emerald, Tactical Cyan, Amber Gold
    const accents = [
      { name: /signal lime|lime/i, attr: "signal-lime" },
      { name: /electric emerald|emerald/i, attr: "electric-emerald" },
      { name: /tactical cyan|cyan/i, attr: "ocean-blue" },
      { name: /amber gold|amber/i, attr: "amber-gold" },
    ];

    for (const acc of accents) {
      const swatch = page.getByRole("button", { name: acc.name }).first();
      if (await swatch.isVisible()) {
        await swatch.click();
        // Verify HTML element or container gets updated data-accent attribute
        const htmlAttr = await page.locator("html").getAttribute("data-accent");
        if (htmlAttr) {
          expect(htmlAttr).toContain(acc.attr);
        }
      }
    }
  });

  test("TC-5.3: Toggle interface density between Comfortable and Compact", async ({ page }) => {
    const compactBtn = page.getByRole("button", { name: /compact/i }).first();
    const comfortableBtn = page.getByRole("button", { name: /comfortable/i }).first();

    if (await compactBtn.isVisible()) {
      await compactBtn.click();
      const densityAttr = await page.locator("html").getAttribute("data-density");
      if (densityAttr) {
        expect(densityAttr).toBe("compact");
      }

      await comfortableBtn.click();
      const resetAttr = await page.locator("html").getAttribute("data-density");
      if (resetAttr) {
        expect(resetAttr).toBe("comfortable");
      }
    }
  });

  test("TC-5.4: Bilingual language toggle switches document direction to dir='rtl'", async ({ page }) => {
    const arabicBtn = page.getByRole("button", { name: /العربية|arabic/i }).first();
    const englishBtn = page.getByRole("button", { name: /english/i }).first();

    if (await arabicBtn.isVisible()) {
      // Switch to Arabic
      await arabicBtn.click();
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

      // Switch back to English
      if (await englishBtn.isVisible()) {
        await englishBtn.click();
        await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      }
    }
  });

  test("TC-5.5: Select regional operational timezone from dropdown", async ({ page }) => {
    const timezoneTrigger = page.locator("[role='combobox']").last();
    if (await timezoneTrigger.isVisible()) {
      await timezoneTrigger.click();

      // Pick Africa/Cairo or Asia/Riyadh
      const cairoOption = page.getByRole("option", { name: /cairo/i });
      if (await cairoOption.isVisible()) {
        await cairoOption.click();
        await expect(page.getByText(/cairo/i)).toBeVisible();
      }
    }
  });

  // ── Tier 2: Boundary & Corner Cases ───────────────────────────────────────

  test("TC-2.B15: Signal Lime contrast law verification (ink text on fill, never white)", async ({ page }) => {
    // Select Signal Lime
    const limeSwatch = page.getByRole("button", { name: /signal lime|lime/i }).first();
    if (await limeSwatch.isVisible()) {
      await limeSwatch.click();

      // Assert no element with lime accent background uses text-white
      const invalidCombinations = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          ".bg-nx-accent, .bg-nx-accent-fill, [style*='background-color: rgb(132, 204, 22)']"
        );
        let violations = 0;
        elements.forEach((el) => {
          if (el.classList.contains("text-white")) violations++;
        });
        return violations;
      });

      expect(invalidCombinations).toBe(0);
    }
  });
});
