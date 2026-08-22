// Reference target picker i18n — Wave 4 follow-up
//
// Two separate things are pinned here, and the first one is new to this dictionary:
//
//  1. WHOLE-FILE STRUCTURAL PARITY between custom-field.en.ts and custom-field.ar.ts. The two
//     existing locale tests in this folder (valueTypeCatalog, entityTypeCatalog) each check parity
//     for their OWN block only, so a key added anywhere else could be English-only and nothing would
//     notice — an Arabic-speaking admin would get a raw key like
//     "customField.referenceTarget.noneAvailable" rendered into the form. `field-group`'s own locale
//     test already takes the whole-dictionary approach; this brings the same guarantee to the
//     definitions dictionary. It passes at the moment it is written (both files were already in exact
//     leaf parity), so it is a fence, not a repair.
//
//  2. THE THREE-WAY DISTINCTION THIS FEATURE'S COPY EXISTS TO MAKE. An empty available-types list, a
//     failed fetch, and a re-point of a live definition are three different situations with three
//     different remedies — ask for view access, retry, and re-pick the affected values respectively.
//     They are asserted as CONTENT in both languages, not merely as non-empty strings, because the
//     failure mode is not a missing string: it is three situations wearing one sentence, which is the
//     same "one grey dash for everything" defect the value-side reference copy was written to avoid.
import { describe, it, expect } from "vitest";
import { en } from "../../../locales/custom-field.en";
import { ar } from "../../../locales/custom-field.ar";

function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

function readPath(dictionary: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, segment) => (node as Record<string, unknown>)[segment], dictionary);
}

/** Any character in the Arabic Unicode block. */
const ARABIC_CHAR = /[؀-ۿ]/;

/** Every key the picker resolves at runtime, so a rename cannot silently render a raw key. */
const REQUIRED_PATHS = [
  "customField.fields.referenceTargetEntityTypeKey",
  "customField.referenceTarget.unpinned",
  "customField.referenceTarget.description",
  "customField.referenceTarget.repointWarning",
  "customField.referenceTarget.noneAvailable",
  "customField.referenceTarget.loadFailed",
];

describe("custom-field dictionary parity (whole file)", () => {
  it("covers exactly the same key set in en and ar", () => {
    expect(leafPaths(ar).sort()).toEqual(leafPaths(en).sort());
  });

  it("has no empty, untrimmed or TODO-marked strings in either language", () => {
    for (const [name, dictionary] of [
      ["en", en],
      ["ar", ar],
    ] as const) {
      for (const path of leafPaths(dictionary)) {
        const value = readPath(dictionary, path);
        expect(typeof value, `${name}:${path}`).toBe("string");
        expect((value as string).trim().length, `${name}:${path}`).toBeGreaterThan(0);
        expect(value, `${name}:${path}`).toBe((value as string).trim());
        expect(value, `${name}:${path}`).not.toMatch(/TODO|FIXME/i);
      }
    }
  });
});

describe("reference target picker copy", () => {
  it("declares every key the picker resolves, in both languages", () => {
    for (const path of REQUIRED_PATHS) {
      expect(typeof readPath(en, path), path).toBe("string");
      expect(typeof readPath(ar, path), path).toBe("string");
    }
  });

  it("is real Arabic prose, not an English placeholder", () => {
    for (const path of REQUIRED_PATHS) {
      // The one exception this would need is a string that is legitimately a Latin identifier; there
      // is none in this block, so every value must carry Arabic script.
      expect(readPath(ar, path), path).toMatch(ARABIC_CHAR);
    }
  });

  it("keeps the empty-list state and the failed-fetch state as different sentences", () => {
    // Fixed by a permission change vs. fixed by retrying. One string for both sends an admin to the
    // wrong person.
    expect(en.customField.referenceTarget.noneAvailable).not.toBe(
      en.customField.referenceTarget.loadFailed
    );
    expect(ar.customField.referenceTarget.noneAvailable).not.toBe(
      ar.customField.referenceTarget.loadFailed
    );
  });

  it("tells an English admin the empty list is about access, and does not promise an unpin", () => {
    const copy = en.customField.referenceTarget.noneAvailable;
    expect(copy).toMatch(/view access/i);
    // Must hold on the EDIT form too: an already-pinned field keeps its pin through a save made while
    // the list is empty, because form state is seeded from the stored value and not from the options.
    expect(copy).toMatch(/left as it is/i);
  });

  it("tells an Arabic admin the same two things", () => {
    // "صلاحية عرض" = "view permission"; "كما هو" = "as it is".
    expect(ar.customField.referenceTarget.noneAvailable).toContain("صلاحية عرض");
    expect(ar.customField.referenceTarget.noneAvailable).toContain("كما هو");
  });

  it("promises the load-failure leaves the stored pin alone, in both languages", () => {
    expect(en.customField.referenceTarget.loadFailed).toMatch(/unchanged/i);
    // "كما هو" = "as it is".
    expect(ar.customField.referenceTarget.loadFailed).toContain("كما هو");
  });

  it("states both halves of the re-point consequence in English", () => {
    const copy = en.customField.referenceTarget.repointWarning;
    // Half one: nothing already stored breaks. Half two: the next save of an old-type value is
    // refused. Either half alone is a lie by omission -- the first reads as "this is free", the
    // second as "this destroys data".
    expect(copy).toMatch(/still reads back correctly/i);
    expect(copy).toMatch(/refused/i);
  });

  it("states both halves in Arabic too", () => {
    const copy = ar.customField.referenceTarget.repointWarning;
    // "لا يمسّ القيم المخزَّنة" = "does not touch the stored values"; "ستُرفض" = "will be refused".
    expect(copy).toContain("لا يمسّ القيم المخزَّنة");
    expect(copy).toContain("ستُرفض");
  });

  it("words the unpin sentinel as a state rather than as an absence", () => {
    // It is a real, permanently legal configuration and the only way to clear a pin -- not a "none
    // selected" placeholder. Both languages name the alternative it grants.
    expect(en.customField.referenceTarget.unpinned).toMatch(/any allowed type/i);
    // "أي نوع مسموح" = "any allowed type".
    expect(ar.customField.referenceTarget.unpinned).toContain("أي نوع مسموح");
  });

  it("keeps the definition's own entity type and the reference target distinguishable", () => {
    // Two fields on one form. If the labels match, an admin cannot tell which direction each means.
    expect(en.customField.fields.referenceTargetEntityTypeKey).not.toBe(
      en.customField.fields.entityTypeKey
    );
    expect(ar.customField.fields.referenceTargetEntityTypeKey).not.toBe(
      ar.customField.fields.entityTypeKey
    );
  });

  it("does not overlap the value-side noTargetConfigured message, which speaks to a different reader", () => {
    // `entityReference.noTargetConfigured` is shown on a RECORD form to whoever fills the field in;
    // this block is shown on the definitions screen to whoever configures it. Same subject, different
    // audience, so they must not be the same sentence.
    expect(en.customField.referenceTarget.description).not.toBe(
      en.customField.entityReference.noTargetConfigured
    );
    expect(ar.customField.referenceTarget.description).not.toBe(
      ar.customField.entityReference.noTargetConfigured
    );
  });
});
