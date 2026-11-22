import { describe, expect, it } from "vitest";
import { en } from "./money.en";
import { ar } from "./money.ar";

function flattenEntries(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenEntries(child, prefix ? `${prefix}.${key}` : key)
  );
}

function extractPlaceholders(text: string): string[] {
  const matches = [...text.matchAll(/\{\{(\w+)\}\}|\{(\w+)\}/g)];
  return matches.map((m) => m[1] ?? m[2] ?? "").sort();
}

describe("Money locales", () => {
  it("keeps English and Arabic keys in parity with native Arabic and non-empty values", () => {
    const enEntries = flattenEntries(en).sort(([a], [b]) => a.localeCompare(b));
    const arEntries = flattenEntries(ar).sort(([a], [b]) => a.localeCompare(b));

    expect(arEntries.map(([k]) => k)).toEqual(enEntries.map(([k]) => k));
    expect(JSON.stringify(ar)).toMatch(/[\u0600-\u06ff]/);

    const arMap = new Map(arEntries);
    for (const [key, enValue] of enEntries) {
      const arValue = arMap.get(key) ?? "";
      expect(enValue.trim().length, `Empty EN string for ${key}`).toBeGreaterThan(0);
      expect(arValue.trim().length, `Empty AR string for ${key}`).toBeGreaterThan(0);
      expect(enValue, `Leading '+ ' prohibited in ${key}`).not.toMatch(/^\+\s/);
      expect(arValue, `Leading '+ ' prohibited in ${key}`).not.toMatch(/^\+\s/);
      expect(extractPlaceholders(arValue), `Placeholder mismatch in ${key}`).toEqual(
        extractPlaceholders(enValue)
      );
    }
  });
});
