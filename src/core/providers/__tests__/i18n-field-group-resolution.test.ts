import { describe, it, expect } from "vitest";
import { allModulesEn, allModulesAr } from "@core/locales/module-registry";
import { en as coreEn } from "@core/locales/en";
import { ar as coreAr } from "@core/locales/ar";
import { deepMerge } from "@core/utils/deep-merge";

/**
 * Regression test for fieldGroup i18n resolution:
 *
 * Asserts that the fieldGroup locale namespace (along with all other
 * custom-fields submodules) is eagerly merged into the active dictionary
 * via module-registry so that the I18nProvider resolves every key on first render.
 */

// Mirror the provider's registry assembly (i18n-provider.tsx).
const enDict = deepMerge({} as Record<string, unknown>, coreEn, allModulesEn);
const arDict = deepMerge({} as Record<string, unknown>, coreAr, allModulesAr);

/** Minimal mirror of the provider's dot-path resolver. */
function resolve(dict: Record<string, unknown>, key: string): string {
  let value: unknown = dict;
  for (const k of key.split(".")) {
    if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // miss -> bare key
    }
  }
  return typeof value === "string" ? value : key;
}

describe("i18n — fieldGroup namespace resolution", () => {
  const reportedMissingKeys = [
    "fieldGroup.moveUp",
    "fieldGroup.moveDown",
    "fieldGroup.global",
    "fieldGroup.fields.sortOrder",
    "fieldGroup.addNew",
    "fieldGroup.fields.stableKey",
    "fieldGroup.fields.stableKeyHint",
    "fieldGroup.fields.labelEn",
    "fieldGroup.fields.labelAr",
    "fieldGroup.fields.isGlobal",
    "fieldGroup.isGlobalDescription.tenantContext",
    "fieldGroup.title",
    "fieldGroup.description",
    "fieldGroup.fields.entityTypeKey",
    "fieldGroup.placeholders.entityTypeKey",
    "fieldGroup.selectEntityType.title",
    "fieldGroup.selectEntityType.description",
    "fieldGroup.deleteTitle",
    "fieldGroup.deleteConfirm",
  ];

  it("resolves all reported fieldGroup keys in English (never returns bare key)", () => {
    for (const key of reportedMissingKeys) {
      const result = resolve(enDict, key);
      expect(result, `Expected English translation for key: ${key}`).not.toBe(key);
      expect(typeof result).toBe("string");
      expect(result.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves all reported fieldGroup keys in Arabic (never returns bare key)", () => {
    for (const key of reportedMissingKeys) {
      const result = resolve(arDict, key);
      expect(result, `Expected Arabic translation for key: ${key}`).not.toBe(key);
      expect(typeof result).toBe("string");
      expect(result.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves specific critical fieldGroup translations accurately", () => {
    expect(resolve(enDict, "fieldGroup.title")).toBe("Field Groups");
    expect(resolve(arDict, "fieldGroup.title")).toBe("مجموعات الحقول");

    expect(resolve(enDict, "fieldGroup.addNew")).toBe("Add Field Group");
    expect(resolve(arDict, "fieldGroup.addNew")).toBe("إضافة مجموعة حقول");

    expect(resolve(enDict, "fieldGroup.moveUp")).toBe("Move group up");
    expect(resolve(arDict, "fieldGroup.moveUp")).toBe("تحريك المجموعة لأعلى");

    expect(resolve(enDict, "fieldGroup.global")).toBe("Global");
    expect(resolve(arDict, "fieldGroup.global")).toBe("عام");
  });
});
