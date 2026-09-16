// Schema-import i18n completeness -- Wave 6 row 6.5's import half
//
// Same structural-parity rule as `schemaExport.locale.test.ts` and `definitionExport.locale.test.ts`:
// the translation function has NO defaultValue support, so a key present in `en` and missing in
// `ar` renders as the raw key string to an Arabic-speaking admin.
import { describe, it, expect } from "vitest";
import { en } from "./schema-import.en";
import { ar } from "./schema-import.ar";

function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe("schemaImport locale parity", () => {
  it("covers exactly the same key set in en and ar", () => {
    expect(leafPaths(ar).sort()).toEqual(leafPaths(en).sort());
  });

  it("has no empty, untrimmed or TODO-marked strings in either language", () => {
    for (const dictionary of [en, ar]) {
      for (const path of leafPaths(dictionary)) {
        const value = path
          .split(".")
          .reduce<unknown>(
            (node, segment) => (node as Record<string, unknown>)[segment],
            dictionary
          );
        expect(typeof value, path).toBe("string");
        expect((value as string).trim().length, path).toBeGreaterThan(0);
        expect(value, path).toBe((value as string).trim());
        expect(value, path).not.toMatch(/TODO|FIXME/i);
      }
    }
  });
});

describe("schemaImport placeholders", () => {
  it("keeps the item-cap placeholder on the refusal, in both languages", () => {
    for (const dictionary of [en, ar]) {
      expect(dictionary.schemaImport.refused.description).toContain("{max}");
    }
  });

  it("keeps the three counts on the summary and toast lines, in both languages", () => {
    for (const dictionary of [en, ar]) {
      for (const placeholder of ["{created}", "{skipped}", "{failed}"]) {
        expect(dictionary.schemaImport.summary).toContain(placeholder);
        expect(dictionary.schemaImport.toast.imported).toContain(placeholder);
      }
    }
  });
});

describe("schemaImport states the collision policy plainly", () => {
  it("says a collision is left untouched, and reported as Skipped, to an English admin", () => {
    expect(en.schemaImport.collisionNote).toMatch(/skipped/i);
    expect(en.schemaImport.collisionNote).toMatch(/nothing is ever overwritten/i);
  });

  it("says the same thing to an Arabic admin", () => {
    // "لا يُستبدَل شيء أبداً" = "nothing is ever overwritten".
    expect(ar.schemaImport.collisionNote).toContain("لا يُستبدَل شيء أبداً");
  });
});

describe("schemaImport tells the refusal apart from a fault", () => {
  it("says refused, not failed, to an English admin", () => {
    expect(en.schemaImport.refused.title).toMatch(/refused/i);
    expect(en.schemaImport.refused.title).not.toMatch(/failed|error/i);
  });

  it("names splitting the file as the remedy, not a retry", () => {
    expect(en.schemaImport.refused.description).toMatch(/split/i);
  });
});
