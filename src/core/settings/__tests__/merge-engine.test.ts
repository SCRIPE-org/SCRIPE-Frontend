import { describe, it, expect } from "vitest";
import { migrateStoredSettings } from "../merge-engine";

describe("migrateStoredSettings", () => {
  it("backfills colorThemeCustomized: true for a raw blob with colorTheme but no colorThemeCustomized", () => {
    // Predates the colorThemeCustomized flag's introduction: only colorTheme
    // was ever persisted, so its presence alone means the user had actively
    // picked a swatch.
    const raw = {
      colorTheme: "violet",
    };

    const migrated = migrateStoredSettings(raw);

    expect(migrated.colorTheme).toBe("violet");
    expect(migrated.colorThemeCustomized).toBe(true);
  });

  it("does not override an explicitly stored colorThemeCustomized value", () => {
    const raw = {
      colorTheme: "violet",
      colorThemeCustomized: false,
    };

    const migrated = migrateStoredSettings(raw);

    expect(migrated.colorThemeCustomized).toBe(false);
  });

  it("does not backfill colorThemeCustomized when colorTheme is absent from the raw blob", () => {
    const raw = {
      fontSize: "large",
    };

    const migrated = migrateStoredSettings(raw);

    expect(migrated.colorThemeCustomized).toBeUndefined();
  });
});
