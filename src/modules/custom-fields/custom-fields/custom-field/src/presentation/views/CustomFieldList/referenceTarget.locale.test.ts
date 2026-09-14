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
//     different remedies — ask an administrator, retry, and re-pick the affected values
//     respectively. They are asserted as CONTENT in both languages, not merely as non-empty strings,
//     because the failure mode is not a missing string: it is three situations wearing one sentence,
//     which is the same "one grey dash for everything" defect the value-side reference copy was
//     written to avoid.
//
//  3. THE VALUE-SIDE TYPE SELECTOR'S OWN COPY, in the second describe below. The definition-level
//     picker and the record-form type selector answer the same question for two different readers,
//     and the strings that go wrong are the ones that name only one cause of an empty list or fold
//     three lookup failures into one "try again".
import { describe, it, expect } from "vitest";
import { en } from "../../../../locales/custom-field.en";
import { ar } from "../../../../locales/custom-field.ar";

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

  it("names BOTH causes of an empty list in English, and does not promise an unpin", () => {
    const copy = en.customField.referenceTarget.noneAvailable;
    // `EntityLookupRegistry.GetAvailableTypes` filters on `Resolve(t.Key) is not null` -- provider
    // composition -- BEFORE it filters on `HasPermission`. So in a split deployment the list is
    // empty for a reason no permission grant will ever fix, and copy that named only the permission
    // cause sent the admin to request access that would change nothing. Both causes, neither
    // asserted, same shape as `entityReference.missing`'s 403/404 merge.
    expect(copy).toMatch(/view access/i);
    expect(copy).toMatch(/deployment/i);
    expect(copy).toMatch(/either way/i);
    // Must hold on the EDIT form too: an already-pinned field keeps its pin through a save made while
    // the list is empty, because form state is seeded from the stored value and not from the options.
    expect(copy).toMatch(/left as it is/i);
  });

  it("names both causes in Arabic too, and makes the same promise about the stored pin", () => {
    const copy = ar.customField.referenceTarget.noneAvailable;
    // "صلاحية عرض" = "view permission"; "بيئة النشر" = "deployment"; "وفي الحالتين" = "either way";
    // "كما هو" = "as it is".
    expect(copy).toContain("صلاحية عرض");
    expect(copy).toContain("بيئة النشر");
    expect(copy).toContain("وفي الحالتين");
    expect(copy).toContain("كما هو");
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

// ── The VALUE-side type selector, shown on a record form for an unpinned field ──
//
// Its own describe rather than more rows in the block above, because these strings answer to a
// different reader: the admin configuring a definition versus the person filling a record in. They
// are pinned here rather than in EntityReferenceCustomFieldControl.test.tsx because that file mocks
// `t` to echo its key, so it can prove which key rendered and nothing at all about what it says.
describe("entity reference type-selector copy", () => {
  /** Every key the value-side type selector resolves at runtime. */
  const TYPE_SELECTOR_PATHS = [
    "customField.entityReference.noTargetConfigured",
    "customField.entityReference.typeLabel",
    "customField.entityReference.typeLabelFor",
    "customField.entityReference.typePlaceholder",
    "customField.entityReference.typeSearchPlaceholder",
    "customField.entityReference.typeNoResults",
    "customField.entityReference.noTypesAvailable",
    "customField.entityReference.noTypesAvailableHint",
    "customField.entityReference.typesFailed",
    "customField.entityReference.searchForbidden",
    "customField.entityReference.searchForbiddenHint",
    "customField.entityReference.searchUnavailable",
    "customField.entityReference.searchUnavailableHint",
  ];

  it("declares every key the selector resolves, as real Arabic prose in ar", () => {
    for (const path of TYPE_SELECTOR_PATHS) {
      expect(typeof readPath(en, path), path).toBe("string");
      expect(typeof readPath(ar, path), path).toBe("string");
      expect(readPath(ar, path), path).toMatch(ARABIC_CHAR);
    }
  });

  it("keeps the short visible label a substring of the accessible name, in both languages", () => {
    // WCAG 2.5.3 Label in Name. The visible label is short so it reads well beside the field; the
    // accessible name interpolates the field so two reference fields on one form do not both
    // announce as "Record type". If the two ever stop overlapping, a speech-input user saying what
    // they can see stops matching what the control is called.
    expect(en.customField.entityReference.typeLabelFor).toContain(
      en.customField.entityReference.typeLabel
    );
    expect(ar.customField.entityReference.typeLabelFor).toContain(
      ar.customField.entityReference.typeLabel
    );
  });

  it("keeps the accessible name's interpolation placeholder, so it cannot announce a raw brace", () => {
    // The only interpolated string in this block. A translation that dropped `{field}` would give
    // every reference field on a form the identical accessible name -- the exact ambiguity the
    // interpolation exists to remove.
    expect(en.customField.entityReference.typeLabelFor).toContain("{field}");
    expect(ar.customField.entityReference.typeLabelFor).toContain("{field}");
  });

  it("tells the record editor to pick a type, rather than to go and edit the definition", () => {
    // The old wording told the reader to set a target on the field's DEFINITION -- advice a record
    // editor usually cannot act on, and no longer the remedy now that the picker handles an unpinned
    // field itself. It has to name the two-step flow instead.
    expect(en.customField.entityReference.noTargetConfigured).toMatch(/choose the type/i);
    // "اختر أولاً نوع السجل" = "first choose the record type".
    expect(ar.customField.entityReference.noTargetConfigured).toContain("اختر أولاً نوع السجل");
  });

  it("keeps 'nothing you may reference' apart from 'your filter matched nothing'", () => {
    // A 200 with an empty list is an authorization outcome; an unmatched filter is the operator's own
    // typing. One sentence for both would tell someone who mistyped that they have no access.
    expect(en.customField.entityReference.noTypesAvailable).not.toBe(
      en.customField.entityReference.typeNoResults
    );
    expect(ar.customField.entityReference.noTypesAvailable).not.toBe(
      ar.customField.entityReference.typeNoResults
    );
  });

  it("names both causes of an empty type list, exactly as the definition-side copy does", () => {
    const enHint = en.customField.entityReference.noTypesAvailableHint;
    expect(enHint).toMatch(/deployment/i);
    expect(enHint).toMatch(/view access/i);
    expect(enHint).toMatch(/either way/i);
    // "بيئة النشر" = "deployment"; "صلاحية عرض" = "view permission"; "وفي الحالتين" = "either way".
    const arHint = ar.customField.entityReference.noTypesAvailableHint;
    expect(arHint).toContain("بيئة النشر");
    expect(arHint).toContain("صلاحية عرضها");
    expect(arHint).toContain("وفي الحالتين");
  });

  it("keeps the three panel failures as three different sentences, in both languages", () => {
    // 403 is fixed by a permission change, `unavailable` by an install change, and a transport
    // failure by retrying. searchFailed is the only one of the three the control gives a Retry
    // button to, so sharing wording with either of the others would put a useless button behind a
    // sentence that reads as though it belonged there.
    for (const dictionary of [en, ar]) {
      const block = dictionary.customField.entityReference;
      expect(new Set([block.searchForbidden, block.searchUnavailable, block.searchFailed]).size).toBe(
        3
      );
    }
  });

  it("says the records are fine on a permission refusal, and that they are absent on an unavailable type", () => {
    // The distinction an operator has to be able to draw without asking anyone: "these exist and you
    // may not list them" versus "this build cannot answer for that type at all".
    expect(en.customField.entityReference.searchForbiddenHint).toMatch(/records are there/i);
    expect(en.customField.entityReference.searchUnavailableHint).toMatch(/isn't installed here/i);
    // "السجلات موجودة" = "the records exist"; "غير مثبَّتة هنا" = "is not installed here".
    expect(ar.customField.entityReference.searchForbiddenHint).toContain("السجلات موجودة");
    expect(ar.customField.entityReference.searchUnavailableHint).toContain("غير مثبَّتة هنا");
  });
});
