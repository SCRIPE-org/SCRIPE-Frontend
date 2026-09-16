// `validateMediaReferenceCustomFieldValue` and its arm in
// `assertSelectCustomFieldValuesValid` -- Wave 3.4.
//
// A SEPARATE FILE FROM THE RICH-TEXT ONE, following the precedent
// `customFieldValueValidation.entityReference.test.ts` set: per-type validator
// tests get their own file, because the thing each one has to state up front is
// different, and a shared header would have to state both.
//
// WHAT IS DELIBERATELY NOT TESTED HERE, said first because it is most of what a
// reader expects to find. The backend's real gate on a media value is the OWNER
// PAIR -- the referenced `MediaFile`'s `(OwnerEntityTypeKey, OwnerEntityId)` must
// BE the record being edited -- and Image adds a content-type check on top. NONE
// of that is checkable on this tier: the value carries an entity type key and an
// encrypted id and nothing else, and there is no endpoint that would return the
// row (no `IEntityLookupProvider` is registered for `media.file`). So this
// validator does not mirror `mediaReferenceNotFound`,
// `mediaReferenceOwnerMismatch` or `mediaReferenceNotAnImage`, and no test below
// pretends it does. Guessing at a server verdict is the frontend/backend
// mismatch this module's whole design forbids; those three messages arrive from
// the server already localized.
//
// WHAT IS TESTED is the half that IS checkable, and it is exactly the reference
// completeness rule, because `FileValueTypeHandler` inherits
// `EntityReferenceValueTypeHandler.Validate` verbatim.
//
// RED WITHOUT THE FIX: the first describe block fails to import, and every
// `toThrow` in the save-flow block passes vacuously against a loop with no media
// arms -- which is what makes those the discriminating assertions.
import { describe, it, expect } from "vitest";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import {
  assertSelectCustomFieldValuesValid,
  validateMediaReferenceCustomFieldValue,
  CustomFieldValidationError,
} from "./customFieldValueValidation";

/** Echoes key + params, so an assertion can prove WHICH message key was chosen. */
const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key;

const FILE_FIELD: FieldConfig = { name: "cf_waiver", label: "Waiver", type: "media-file" };
const IMAGE_FIELD: FieldConfig = { name: "cf_photo", label: "Photo", type: "media-image" };
const COMPLETE = { entityTypeKey: "media.file", entityId: "ENC-1" };

describe("validateMediaReferenceCustomFieldValue", () => {
  it("accepts a complete reference on BOTH media types", () => {
    // Both, not one: the two field types are separate arms of the type filter, and
    // testing only one would leave the other free to reject everything.
    expect(validateMediaReferenceCustomFieldValue({ ...FILE_FIELD, required: true }, COMPLETE, t))
      .toBeNull();
    expect(validateMediaReferenceCustomFieldValue({ ...IMAGE_FIELD, required: true }, COMPLETE, t))
      .toBeNull();
  });

  it("does NOT try to judge the owner pair or the content type it cannot see", () => {
    // Stated as a test so the omission is deliberate and visible rather than
    // looking like missing coverage. A value that the SERVER will refuse -- a
    // tenant-global file, a PDF on an Image field -- is indistinguishable here
    // from a good one, because the only thing this tier holds is an opaque id.
    // Returning null is the honest answer; inventing a refusal would block saves
    // the server would have accepted.
    expect(
      validateMediaReferenceCustomFieldValue(
        IMAGE_FIELD,
        { entityTypeKey: "media.file", entityId: "ENC-a-pdf-for-all-we-know" },
        t
      )
    ).toBeNull();
  });

  it("ignores a field of any other type, including the general reference type", () => {
    // The type filter has to be exact. Admitting `"entity-reference"` here would
    // give reference fields a SECOND, differently-worded verdict for the same
    // defect, depending on which validator the loop reached first.
    expect(
      validateMediaReferenceCustomFieldValue(
        { name: "cf_assignee", label: "Assignee", type: "entity-reference" },
        { entityTypeKey: "identity.user" },
        t
      )
    ).toBeNull();
    // And not FieldConfig's pre-existing `"file"`/`"image"` members, whose values
    // are a browser File and a base64 string -- shapes this rule would refuse.
    expect(
      validateMediaReferenceCustomFieldValue(
        { name: "cf_upload", label: "Upload", type: "file" },
        null,
        t
      )
    ).toBeNull();
    expect(
      validateMediaReferenceCustomFieldValue(
        { name: "cf_avatar", label: "Avatar", type: "image" },
        "data:image/png;base64,AAAA",
        t
      )
    ).toBeNull();
  });

  describe("emptiness", () => {
    it("treats null, undefined and a stray non-object as nothing attached", () => {
      for (const value of [null, undefined, "", 42, [], "data:image/png;base64,AAAA"]) {
        expect(validateMediaReferenceCustomFieldValue(FILE_FIELD, value, t)).toBeNull();
      }
    });

    it("reports a required field with nothing attached as required", () => {
      // The reason this arm enforces required-ness when Select's does not: at the 8
      // hand-wired sites this is the ONLY client-side gate a media field has --
      // `isRequiredFieldEmpty` covers the GenericForm path and nothing covers this
      // one.
      expect(validateMediaReferenceCustomFieldValue({ ...FILE_FIELD, required: true }, null, t))
        .toBe("validation.required");
      expect(
        validateMediaReferenceCustomFieldValue(
          { ...FILE_FIELD, required: true },
          { entityTypeKey: "", entityId: "  " },
          t
        )
      ).toBe("validation.required");
    });
  });

  describe("the half-blank refusal", () => {
    it("refuses a value with an id but no target key", () => {
      // Asserted on the message KEY, so a validator that answered
      // `validation.required` here -- non-null, and wrong -- fails. The two are
      // different facts: this value is not missing, it is unusable.
      expect(
        validateMediaReferenceCustomFieldValue(FILE_FIELD, { entityId: "ENC-1" }, t)
      ).toBe('customField.values.mediaReferenceIncomplete:{"field":"Waiver"}');
    });

    it("refuses a value with a target key but no id", () => {
      expect(
        validateMediaReferenceCustomFieldValue(FILE_FIELD, { entityTypeKey: "media.file" }, t)
      ).toBe('customField.values.mediaReferenceIncomplete:{"field":"Waiver"}');
      // Whitespace is not a value either -- the same trim the backend's own
      // blank check applies.
      expect(
        validateMediaReferenceCustomFieldValue(
          FILE_FIELD,
          { entityTypeKey: "media.file", entityId: "   " },
          t
        )
      ).toBe('customField.values.mediaReferenceIncomplete:{"field":"Waiver"}');
    });

    it("refuses it on an OPTIONAL field too -- Validate refuses it regardless of required-ness", () => {
      // Half-blank is not "empty". The backend's `IsEmpty` needs BOTH pieces blank,
      // so a half-blank value reaches `Validate` and is refused there. Treating it
      // as empty client-side would let it through to a round-trip 422.
      expect(
        validateMediaReferenceCustomFieldValue(FILE_FIELD, { entityTypeKey: "media.file" }, t)
      ).toBe('customField.values.mediaReferenceIncomplete:{"field":"Waiver"}');
    });

    it("does NOT reuse the reference control's 'choose a record again' message", () => {
      // `customField.entityReference.invalid` prescribes a remedy that does not
      // exist on a media field: there is no picker to choose from. This asserts the
      // key that WAS chosen and, separately, that the reference key was not -- the
      // second half is the one that fails if someone consolidates the two.
      const message = validateMediaReferenceCustomFieldValue(
        FILE_FIELD,
        { entityTypeKey: "media.file" },
        t
      );
      expect(message).toContain("customField.values.mediaReferenceIncomplete");
      expect(message).not.toContain("customField.entityReference.invalid");
    });

    it("names the field by its LABEL, falling back to its name", () => {
      expect(
        validateMediaReferenceCustomFieldValue(
          { name: "__cf__waiver", type: "media-file" },
          { entityId: "ENC-1" },
          t
        )
      ).toBe('customField.values.mediaReferenceIncomplete:{"field":"__cf__waiver"}');
    });
  });
});

describe("assertSelectCustomFieldValuesValid -- the media arms", () => {
  it("throws CustomFieldValidationError for a half-blank media value", () => {
    expect(() =>
      assertSelectCustomFieldValuesValid([FILE_FIELD], { cf_waiver: { entityId: "ENC-1" } }, t)
    ).toThrow(CustomFieldValidationError);
  });

  it("covers BOTH media types, not just the first one the loop happens to match", () => {
    // The two are separate `fc.type` comparisons in the loop. Testing only
    // `"media-file"` would leave `"media-image"` silently skipped -- exactly the
    // gap Wave 3.1 found when MultiSelect fell through Select's guard.
    expect(() =>
      assertSelectCustomFieldValuesValid([IMAGE_FIELD], { cf_photo: { entityId: "ENC-1" } }, t)
    ).toThrow(CustomFieldValidationError);
  });

  it("throws for a REQUIRED media field with nothing attached", () => {
    expect(() =>
      assertSelectCustomFieldValuesValid([{ ...FILE_FIELD, required: true }], {}, t)
    ).toThrow(CustomFieldValidationError);
  });

  describe("the `?? null` default on an untouched media field", () => {
    // `assertSelectCustomFieldValuesValid`'s media arm defaults an untouched
    // field with `values[fc.name] ?? fc.defaultValue ?? null` -- `?? null`,
    // not `?? ""`, matching the reference and currency arms above it. A prior
    // version of this test was named "defaults an untouched field to null
    // rather than the empty string" and asserted only `.not.toThrow()` on an
    // OPTIONAL field. That name claimed a guarantee the body could not give:
    // mutating the production source from `?? null` to `?? ""` was applied by
    // hand and every test in this file, including that one, stayed green --
    // the mutation is genuinely undetectable through this validator's public
    // surface, not merely untested by an oversight.
    //
    // The reason is structural. `validateMediaReferenceCustomFieldValue`'s
    // very first move is `typeof value === "object"`, which is false for BOTH
    // `null` and `""`, so both collapse into the exact same "fully blank"
    // branch (`typeKey === "" && entityId === ""`) -- and that branch's own
    // output depends only on `fc.required`, never on which of the two
    // falsy-but-not-an-object inputs produced it. There is no required-field
    // variant, no half-blank variant, and no other public entry point that can
    // tell the two apart. Contrast the rich-text arm two cases below: `?? ""`
    // hands `validateRichTextCustomFieldValue` a BARE STRING (not
    // null/undefined), which trips its "invalid shape" branch on both
    // optional and required fields and diverges sharply from `?? null` --
    // THAT is what a genuinely discriminating test looks like, and this arm
    // has no equivalent available.
    //
    // So this states the true, useful fact instead of a false guarantee: the
    // two candidate defaults are OBSERVABLY EQUIVALENT here, today, on both an
    // optional and a required field. If a future change to
    // `validateMediaReferenceCustomFieldValue`'s emptiness rule ever makes
    // `""` diverge from `null` (e.g. it starts reading `typeof value ===
    // "string"` as well as `"object"`), one of the two equality assertions
    // below goes red and tells the next reader the `?? null` choice just
    // became load-bearing -- at which point it deserves a real discriminating
    // test, not this one.
    it("treats null and the empty string identically on an OPTIONAL media field", () => {
      expect(validateMediaReferenceCustomFieldValue(FILE_FIELD, null, t)).toBe(
        validateMediaReferenceCustomFieldValue(FILE_FIELD, "", t)
      );
      expect(validateMediaReferenceCustomFieldValue(FILE_FIELD, null, t)).toBeNull();
    });

    it("treats null and the empty string identically on a REQUIRED media field too", () => {
      const required = { ...FILE_FIELD, required: true };
      expect(validateMediaReferenceCustomFieldValue(required, null, t)).toBe(
        validateMediaReferenceCustomFieldValue(required, "", t)
      );
      expect(validateMediaReferenceCustomFieldValue(required, null, t)).toBe("validation.required");
    });

    it("does not throw through the real save-flow entry point for an untouched optional field", () => {
      // Kept as a wiring smoke test, not a defaulting-choice test: a real
      // regression in the loop reaching this arm at all (e.g. the "media-file"
      // / "media-image" guard above stopped matching) would throw here even
      // though the two tests above show the defaulting choice itself is inert.
      expect(() => assertSelectCustomFieldValuesValid([FILE_FIELD], {}, t)).not.toThrow();
    });
  });

  it("accepts good values and leaves other field types alone in the same list", () => {
    expect(() =>
      assertSelectCustomFieldValuesValid(
        [
          FILE_FIELD,
          IMAGE_FIELD,
          { name: "cf_note", label: "Note", type: "text" },
          { name: "cf_avatar", label: "Avatar", type: "image" },
        ],
        {
          cf_waiver: COMPLETE,
          cf_photo: COMPLETE,
          cf_note: "text",
          cf_avatar: "data:image/png;base64,AAAA",
        },
        t
      )
    ).not.toThrow();
  });
});
