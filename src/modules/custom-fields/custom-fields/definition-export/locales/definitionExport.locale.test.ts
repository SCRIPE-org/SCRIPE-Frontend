// Definition-export i18n completeness -- Wave 6 row 6.4
//
// The translation function in this codebase has NO defaultValue support: a key that exists in `en`
// and not in `ar` renders as the raw string "definitionExport.refused.title" to an Arabic-speaking
// admin. Nothing else in the suite would notice, so structural parity is pinned here.
//
// Three pieces of CONTENT are pinned as well, because each is a promise the UI makes that a
// well-meaning copy edit would quietly break:
//
//  1. **The {max} placeholder on the refusal.** That sentence's whole job is to name the cap the
//     export was refused for. A translation that drops the placeholder renders a sentence with a hole
//     in it, and the admin is told they hit a limit without being told which.
//  2. **The refusal reads as a refusal, not as a fault.** Nothing is broken past the row cap; the
//     server declined and the remedy is to narrow the scope. Copy that says "failed" or "error" would
//     send an admin hunting a defect in a working system.
//  3. **'Included in exports' is reported, never used as a filter.** The flag's name invites exactly
//     the wrong inference, so the note has to say that every visible definition is listed. Copy that
//     implied filtering would make a complete workbook read as a partial one.
import { describe, it, expect } from "vitest";
import { en } from "./definition-export.en";
import { ar } from "./definition-export.ar";

function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe("definitionExport locale parity", () => {
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

describe("definitionExport placeholders", () => {
  it("keeps the cap placeholder on the refusal, in both languages", () => {
    for (const dictionary of [en, ar]) {
      expect(dictionary.definitionExport.refused.description).toContain("{max}");
    }
  });

  it("keeps the filename and size placeholders on the result line, in both languages", () => {
    for (const dictionary of [en, ar]) {
      expect(dictionary.definitionExport.result).toContain("{fileName}");
      expect(dictionary.definitionExport.result).toContain("{size}");
    }
  });
});

describe("definitionExport tells the truth about the refusal", () => {
  it("says the export was refused, and names the remedy, to an English admin", () => {
    expect(en.definitionExport.refused.title).toMatch(/refused/i);
    // The remedy is the actionable half: narrow to one entity type.
    expect(en.definitionExport.refused.description).toMatch(/single entity type/i);
    // NOT a fault. "Failed" or "error" here would misdescribe a working system declining a request.
    expect(en.definitionExport.refused.title).not.toMatch(/failed|error/i);
    expect(en.definitionExport.refused.description).not.toMatch(/failed|error/i);
  });

  it("says the same thing to an Arabic admin", () => {
    // "رُفض" = "was refused"; "نوع كيان واحد" = "a single entity type".
    expect(ar.definitionExport.refused.title).toContain("رُفض");
    expect(ar.definitionExport.refused.description).toContain("نوع كيان واحد");
  });
});

describe("definitionExport tells the truth about what is in the file", () => {
  it("says no stored values are included, to an English admin", () => {
    expect(en.definitionExport.description).toMatch(/no stored values/i);
  });

  it("says the same thing to an Arabic admin", () => {
    // "قيم مخزّنة" = "stored values".
    expect(ar.definitionExport.description).toContain("قيم مخزّنة");
  });

  it("never implies the 'Included in exports' flag filters the rows", () => {
    // The handler reports the flag and deliberately does not filter on it -- filtering a DEFINITIONS
    // export on a setting about VALUES would hide exactly the fields an admin most wants to audit.
    expect(en.definitionExport.exportableNote).toMatch(/doesn't decide which rows appear/i);
    expect(en.definitionExport.exportableNote).toMatch(/including ones with that setting off/i);
    // "لا يحدّد أي السطور تظهر" = "doesn't decide which rows appear".
    expect(ar.definitionExport.exportableNote).toContain("لا يحدّد أي السطور تظهر");
  });
});
