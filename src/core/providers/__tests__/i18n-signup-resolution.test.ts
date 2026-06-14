import { describe, it, expect } from "vitest";
import { allModulesEn, allModulesAr } from "@core/locales/module-registry";
import { en as coreEn } from "@core/locales/en";
import { ar as coreAr } from "@core/locales/ar";
import { deepMerge } from "@core/utils/deep-merge";

/**
 * Regression test for the signup i18n bug (Task A2):
 *
 * On the signup discovery step, a button rendered the literal key
 * "signup.discovery.seePlans" instead of its translation. This test
 * asserts that the signup locale namespace is merged into the active
 * dictionary EXACTLY the way the I18nProvider assembles it, and that
 * resolution returns the real localized string — never the bare key.
 */

// Mirror the provider's registry assembly (i18n-provider.tsx).
const enDict = deepMerge({} as Record<string, unknown>, coreEn, allModulesEn);
const arDict = deepMerge({} as Record<string, unknown>, coreAr, allModulesAr);

/** Minimal mirror of the provider's dot-path resolver (no interpolation needed here). */
function resolve(dict: Record<string, unknown>, key: string): string {
  let value: unknown = dict;
  for (const k of key.split(".")) {
    if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // miss → bare key (the bug we are guarding against)
    }
  }
  return typeof value === "string" ? value : key;
}

describe("i18n — signup namespace resolution", () => {
  it("resolves signup.discovery.seePlans in English (not the raw key)", () => {
    const result = resolve(enDict, "signup.discovery.seePlans");
    expect(result).toBe("See your personalized plans");
    expect(result).not.toBe("signup.discovery.seePlans");
  });

  it("resolves signup.discovery.seePlans in Arabic (not the raw key)", () => {
    const result = resolve(arDict, "signup.discovery.seePlans");
    expect(result).toBe("اكتشف الخطط المناسبة لك");
    expect(result).not.toBe("signup.discovery.seePlans");
  });

  it("resolves a representative spread of signup keys in both languages", () => {
    const keys = [
      "signup.header.signIn",
      "signup.discovery.q1Title",
      "signup.plan.title",
      "signup.review.freeTitle",
    ];
    for (const key of keys) {
      expect(resolve(enDict, key)).not.toBe(key);
      expect(resolve(arDict, key)).not.toBe(key);
    }
  });

  it("still returns the bare key for a genuinely undefined key (graceful miss)", () => {
    expect(resolve(enDict, "signup.discovery.thisKeyDoesNotExist")).toBe(
      "signup.discovery.thisKeyDoesNotExist"
    );
  });
});
