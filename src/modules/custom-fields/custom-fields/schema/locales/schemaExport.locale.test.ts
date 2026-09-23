// Schema-export i18n completeness -- Wave 6 row 6.5
//
// The translation function in this codebase has NO defaultValue support: a key that exists in `en`
// and not in `ar` renders as the raw string "schemaExport.empty.description" to an Arabic-speaking
// admin. Nothing else in the suite would notice, so structural parity is pinned here.
//
// Two pieces of CONTENT are pinned as well, because both are promises the UI makes that a
// well-meaning copy edit would quietly break:
//
//  1. **The file contains no stored values.** Someone exporting a schema in order to migrate an
//     environment will otherwise assume the data came with it. Row 6.5's bundle is shape only.
//  2. **The placeholders the result and version lines depend on.** These interpolate counts and a
//     version number; a translation that drops `{definitions}` renders a sentence with a hole in it.
import { describe, it, expect } from "vitest";
import { en } from "./schema.en";
import { ar } from "./schema.ar";

function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe("schemaExport locale parity", () => {
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

describe("schemaExport placeholders", () => {
  it("keeps both count placeholders on the result line, in both languages", () => {
    for (const dictionary of [en, ar]) {
      expect(dictionary.schemaExport.result).toContain("{definitions}");
      expect(dictionary.schemaExport.result).toContain("{groups}");
    }
  });

  it("keeps the version placeholder on the unsupported-format warning, in both languages", () => {
    for (const dictionary of [en, ar]) {
      expect(dictionary.schemaExport.unsupportedVersion.description).toContain("{version}");
    }
  });
});

describe("schemaExport tells the truth about what is in the file", () => {
  it("says no stored values are included, to an English admin", () => {
    expect(en.schemaExport.description).toMatch(/no stored values/i);
    expect(en.schemaExport.contents).toMatch(/no stored values/i);
  });

  it("says the same thing to an Arabic admin", () => {
    // "قيم مخزّنة" = "stored values"; both strings deny them.
    expect(ar.schemaExport.description).toContain("قيم مخزّنة");
    expect(ar.schemaExport.contents).toContain("قيم مخزّنة");
  });

  it("names the restricted-fields cause of an empty result in both languages", () => {
    // An empty bundle may mean the scope is empty OR that every field in it is invisible to this
    // caller. Dropping the second half of that sentence lets someone conclude their schema is empty.
    expect(en.schemaExport.empty.description).toMatch(/can't see|cannot see/i);
    expect(ar.schemaExport.empty.description).toContain("رؤيته");
  });
});
