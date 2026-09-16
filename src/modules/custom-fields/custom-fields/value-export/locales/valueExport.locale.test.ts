// Value-export i18n completeness -- Wave 6 row 6.4's completion
//
// Same structural-parity rule as `definitionExport.locale.test.ts`: the translation function in
// this codebase has NO defaultValue support, so a key present in `en` and missing in `ar` renders as
// the raw key string to an Arabic-speaking admin.
//
// Content is pinned for the same reasons the definitions export's own suite pins its refusal copy:
//
//  1. **The {max} placeholder on the refusal** must survive translation, or the sentence names a
//     limit with a hole where the number belongs.
//  2. **The refusal reads as a refusal, not as a fault**, in both languages -- nothing is broken past
//     the cell-count ceiling.
//  3. **The forbidden message names the remedy** -- ask for access, or reopen -- never "retry", which
//     would misdescribe a correct authorization refusal as a transient failure.
import { describe, it, expect } from "vitest";
import { en } from "./value-export.en";
import { ar } from "./value-export.ar";

function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe("valueExport locale parity", () => {
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

describe("valueExport placeholders", () => {
  it("keeps the cap placeholder on the refusal, in both languages", () => {
    for (const dictionary of [en, ar]) {
      expect(dictionary.valueExport.refused.description).toContain("{max}");
    }
  });

  it("keeps the filename and size placeholders on the result line, in both languages", () => {
    for (const dictionary of [en, ar]) {
      expect(dictionary.valueExport.result).toContain("{fileName}");
      expect(dictionary.valueExport.result).toContain("{size}");
    }
  });
});

describe("valueExport tells the truth about the row-cap refusal", () => {
  it("says the export was refused, not that something failed, to an English admin", () => {
    expect(en.valueExport.refused.title).toMatch(/refused/i);
    expect(en.valueExport.refused.title).not.toMatch(/failed|error/i);
    expect(en.valueExport.refused.description).not.toMatch(/failed|error/i);
  });

  it("says the same thing to an Arabic admin", () => {
    // "رُفض" = "was refused".
    expect(ar.valueExport.refused.title).toContain("رُفض");
  });
});

describe("valueExport names a real remedy for the forbidden refusal", () => {
  it("points at asking for access, never at retrying, to an English admin", () => {
    expect(en.valueExport.forbidden.description).toMatch(/administrator|access/i);
    expect(en.valueExport.forbidden.description).not.toMatch(/\btry again\b|\bretry\b/i);
  });

  it("says the same thing to an Arabic admin", () => {
    // "مسؤول" = "an administrator".
    expect(ar.valueExport.forbidden.description).toContain("مسؤول");
  });
});

describe("valueExport's empty state names what would change the answer", () => {
  it("doesn't just say 'nothing' -- it says what grants access, to an English admin", () => {
    expect(en.valueExport.noViewableEntityTypes.description).toMatch(/administrator/i);
  });

  it("says the same thing to an Arabic admin", () => {
    expect(ar.valueExport.noViewableEntityTypes.description).toContain("مسؤول");
  });
});
