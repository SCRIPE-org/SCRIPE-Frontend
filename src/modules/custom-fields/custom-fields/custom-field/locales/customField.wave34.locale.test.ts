// Wave 3.4's locale blocks -- en/ar parity, real Arabic, and the key names the
// backend actually points at.
//
// WHY A NEW FILE RATHER THAN AN ADDITION TO valueTypeCatalog.locale.test.ts.
// That file guards exactly one block (`valueTypeCatalog.descriptions`) and it can
// derive its whole expectation from `ALL_VALUE_TYPES`, because the screen it
// protects builds each description key from a catalog entry's own labelKey suffix.
// The three blocks below have no such derivation available and no gate at all
// today: `valueTypes.*` is read through `t(entry.labelKey)`, and `values.*`,
// `richText.*` and `mediaReference.*` are read through hand-written `t()` calls in
// the validators and controls. So a missing Arabic key in any of them is a raw
// key rendered to an Arabic-language operator, and nothing in the suite says so.
//
// WHAT EACH ASSERTION IS FOR, since "the keys match" is easy to write and easy to
// write vacuously:
//   - PARITY is checked in BOTH directions. A one-directional subset check passes
//     when ar is missing keys, which is the failure that actually happens.
//   - THE THREE LABEL KEYS ARE ASSERTED BY NAME, not derived from the catalog.
//     They are the strings the BACKEND Descriptors carry as their LabelKey
//     (`customField.valueTypes.file` / `.image` / `.richText`), and no backend
//     resource file declares a `customField.valueTypes` namespace -- these labels
//     have always resolved here. Deriving them from this repo's own catalog would
//     be this side agreeing with itself; spelling them out is what makes this a
//     cross-repository contract check.
//   - THE FIVE MESSAGE MIRRORS ARE ASSERTED BY LEAF NAME for the same reason: the
//     backend raises `customFields.values.<leaf>` (plural root, its own resource
//     files) and the frontend convention for a client-side mirror is
//     `customField.values.<leaf>` (singular root -- there is no plural namespace
//     anywhere in this repo). The ROOTS differ by convention; the LEAVES must not,
//     or the two tiers drift into two vocabularies for one refusal.
//   - ARABIC SCRIPT, not just presence. An English string copied into the ar file
//     is the most common way this goes wrong and is invisible to a parity check.
import { describe, it, expect } from "vitest";
import { en } from "./custom-field.en";
import { ar } from "./custom-field.ar";

/** Any character in the Arabic Unicode block -- distinguishes real copy from an English placeholder. */
const ARABIC_CHAR = /[؀-ۿ]/;

/** The three value-type labels the backend Descriptors name, spelled as the backend spells them. */
const WAVE_34_VALUE_TYPE_LEAVES = ["file", "image", "richText"] as const;

/**
 * The five refusal messages this wave's backend handlers raise, by LEAF name.
 *
 * Three of the five (`mediaReference*NotFound` / `*OwnerMismatch` / `*NotAnImage`)
 * have NO client-side caller and cannot have one: each depends on the `MediaFile`
 * row -- whether it exists and is visible, whose record owns it, what its content
 * type is -- and a stored value carries an entity type key and an encrypted id and
 * nothing else. There is not even a way to fetch the row, since no
 * `IEntityLookupProvider` is registered for `media.file`. They are kept in step
 * with the backend deliberately, so the pair stays discoverable and an
 * owner-scoped media endpoint would not have to invent a second wording for a
 * message the server already sends. This test is what keeps that promise honest
 * rather than aspirational: it is the only thing standing between "a documented
 * mirror" and "three dead strings nobody notices going stale".
 */
const WAVE_34_MESSAGE_LEAVES = [
  "mediaReferenceNotFound",
  "mediaReferenceOwnerMismatch",
  "mediaReferenceNotAnImage",
  "richTextInvalidShape",
  "richTextTooLong",
] as const;

/** Raised client-side only -- the half-blank reference the backend refuses as `referenceIncomplete`. */
const CLIENT_ONLY_MESSAGE_LEAVES = ["mediaReferenceIncomplete"] as const;

function keysOf(value: object): string[] {
  return Object.keys(value).sort();
}

describe("customField.valueTypes -- Wave 3.4's three new labels", () => {
  it.each(WAVE_34_VALUE_TYPE_LEAVES)(
    "declares `%s` in both locales, under the exact key the backend Descriptor names",
    (leaf) => {
      expect(en.customField.valueTypes).toHaveProperty(leaf);
      expect(ar.customField.valueTypes).toHaveProperty(leaf);
    }
  );

  it("keeps the whole valueTypes block at en/ar parity, in both directions", () => {
    expect(keysOf(ar.customField.valueTypes)).toEqual(keysOf(en.customField.valueTypes));
  });

  it.each(WAVE_34_VALUE_TYPE_LEAVES)(
    "gives `%s` real Arabic copy, not an English carry-over",
    (leaf) => {
      const value = (ar.customField.valueTypes as Record<string, string>)[leaf];
      expect(value.trim()).toBe(value);
      expect(value.length).toBeGreaterThan(1);
      expect(value).toMatch(ARABIC_CHAR);
    }
  );
});

describe("customField.values -- Wave 3.4's message mirrors", () => {
  it.each([...WAVE_34_MESSAGE_LEAVES, ...CLIENT_ONLY_MESSAGE_LEAVES])(
    "declares `%s` in both locales, under the same leaf name the backend uses",
    (leaf) => {
      expect(en.customField.values).toHaveProperty(leaf);
      expect(ar.customField.values).toHaveProperty(leaf);
    }
  );

  it("keeps the whole values block at en/ar parity, in both directions", () => {
    expect(keysOf(ar.customField.values)).toEqual(keysOf(en.customField.values));
  });

  it.each([...WAVE_34_MESSAGE_LEAVES, ...CLIENT_ONLY_MESSAGE_LEAVES])(
    "gives `%s` real Arabic prose",
    (leaf) => {
      const value = (ar.customField.values as Record<string, string>)[leaf];
      expect(value.length).toBeGreaterThan(10);
      expect(value).toMatch(ARABIC_CHAR);
      expect(value).not.toMatch(/TODO|FIXME/i);
    }
  );

  it("interpolates the field name in every Wave 3.4 message, in both locales", () => {
    // Every one of these names a specific field, and a form can hold several
    // custom fields at once -- a message that does not say which one leaves the
    // operator scanning the whole form. `{field}` is this module's own convention
    // (single braces, never `{{x}}`), and a missing placeholder is silent: the
    // sentence still renders, just uselessly.
    for (const leaf of [...WAVE_34_MESSAGE_LEAVES, ...CLIENT_ONLY_MESSAGE_LEAVES]) {
      expect((en.customField.values as Record<string, string>)[leaf]).toContain("{field}");
      expect((ar.customField.values as Record<string, string>)[leaf]).toContain("{field}");
    }
  });

  it("interpolates the cap in richTextTooLong, since the number is the whole point of the message", () => {
    expect(en.customField.values.richTextTooLong).toContain("{max}");
    expect(ar.customField.values.richTextTooLong).toContain("{max}");
  });
});

describe("customField.richText -- the raw-markup counter's copy", () => {
  it("declares the same keys in both locales", () => {
    expect(keysOf(ar.customField.richText)).toEqual(keysOf(en.customField.richText));
    expect(keysOf(en.customField.richText)).toEqual(["characterCount", "charactersOverLimit"]);
  });

  it("interpolates the placeholders each string actually needs", () => {
    // `characterCount` reports a running total; `charactersOverLimit` reports the
    // OVERAGE, not the total, matching LongText's own convention -- so the two
    // need different placeholders and swapping them would render a sentence that
    // reads correctly and states the wrong number.
    for (const locale of [en, ar]) {
      expect(locale.customField.richText.characterCount).toContain("{count}");
      expect(locale.customField.richText.characterCount).toContain("{max}");
      expect(locale.customField.richText.charactersOverLimit).toContain("{overBy}");
      expect(locale.customField.richText.charactersOverLimit).toContain("{max}");
    }
  });

  it("is real Arabic in the ar file", () => {
    for (const value of Object.values(ar.customField.richText)) {
      expect(value).toMatch(ARABIC_CHAR);
    }
  });
});

describe("customField.mediaReference -- the media control's copy", () => {
  it("declares the same keys in both locales", () => {
    expect(keysOf(ar.customField.mediaReference)).toEqual(keysOf(en.customField.mediaReference));
  });

  it("declares every key the control actually reads", () => {
    // Spelled out rather than derived, because the control builds two of these
    // names by concatenation (`imagesOnly ? ".imageAttached" : ".fileAttached"`),
    // and a `t()` call built that way is exactly the kind a grep for the literal
    // key misses. A missing member here renders the raw key to the operator.
    expect(keysOf(en.customField.mediaReference)).toEqual([
      "attachUnavailable",
      "clear",
      "fileAttached",
      "imageAttached",
      "imagesOnly",
      "noFile",
      "noImage",
      "notConfigured",
    ]);
  });

  it("keeps the file and image wordings DISTINCT, since that pair is the whole difference between the two types", () => {
    // If these collapsed to one string, the two value types would be
    // indistinguishable to a reader, and the tests that assert "the image wording
    // is used" would pass against a control that ignored `imagesOnly` entirely.
    for (const locale of [en, ar]) {
      expect(locale.customField.mediaReference.fileAttached).not.toBe(
        locale.customField.mediaReference.imageAttached
      );
      expect(locale.customField.mediaReference.noFile).not.toBe(
        locale.customField.mediaReference.noImage
      );
    }
  });

  it("is real Arabic in the ar file", () => {
    for (const value of Object.values(ar.customField.mediaReference)) {
      expect(value).toMatch(ARABIC_CHAR);
    }
  });
});
