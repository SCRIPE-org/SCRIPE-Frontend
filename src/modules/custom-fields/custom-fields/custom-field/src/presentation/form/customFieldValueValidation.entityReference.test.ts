// `validateEntityReferenceCustomFieldValue` and its arm in
// `assertSelectCustomFieldValuesValid` -- Wave 4 follow-up.
//
// THE GAP THESE PIN. `assertSelectCustomFieldValuesValid` is the ONE save-flow
// gate all 8 hand-wired consumer sites call (9 flows -- TenantPlanStep has
// separate create/edit viewmodels), and it had arms for currency, select and
// multi-select and none for entity-reference. Those sites do not run
// GenericForm's required pass -- they render each field through
// `renderCustomFieldControl` inside their own sections -- so a required
// reference left blank was submitted blank and refused on a round trip, and on a
// CREATE flow refused only after the owner record had already been written.
//
// RED WITHOUT THE FIX: every `toThrow` below passes vacuously against the old
// loop (`if (fc.type !== "select" && fc.type !== "multi-select") continue;` after
// the currency arm skipped an entity-reference field outright), so they are the
// discriminating assertions -- and `validateEntityReferenceCustomFieldValue` did
// not exist at all, so the whole first describe block fails to import.
//
// A separate file from renderCustomFieldControl.test.tsx because these need no
// DOM: same "one concern, one file" split that file's own header establishes for
// the reference branch's other tests.
import { describe, it, expect } from "vitest";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import {
  assertSelectCustomFieldValuesValid,
  validateEntityReferenceCustomFieldValue,
  CustomFieldValidationError,
} from "./customFieldValueValidation";

/** Echoes key + params, so an assertion can prove WHICH message key was chosen. */
const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key;

const OPTIONAL_REF: FieldConfig = {
  name: "cf_assignee",
  label: "Assignee",
  type: "entity-reference",
};

const REQUIRED_REF: FieldConfig = { ...OPTIONAL_REF, required: true };

const COMPLETE = { entityTypeKey: "hrms.staff-member", entityId: "ENC-1" };

describe("validateEntityReferenceCustomFieldValue", () => {
  it("accepts a complete reference", () => {
    expect(validateEntityReferenceCustomFieldValue(REQUIRED_REF, COMPLETE, t)).toBeNull();
  });

  it("ignores a field of any other type, even one holding a broken reference", () => {
    // The type filter is the first line for the same reason every other
    // validator in this file has one: this must be safe to call over a whole
    // unfiltered fieldConfigs list.
    expect(
      validateEntityReferenceCustomFieldValue(
        { name: "cf_note", label: "Note", type: "text" },
        { entityTypeKey: "hrms.staff-member" },
        t
      )
    ).toBeNull();
  });

  describe("fully blank", () => {
    // Mirrors EntityReferenceValueTypeHandler.IsEmpty: BOTH pieces blank is
    // "no reference here", which is a legitimate save on an optional field and
    // the exact defect on a required one.
    const blanks: Array<[string, unknown]> = [
      ["null", null],
      ["undefined", undefined],
      ["empty string", ""],
      ["a stray non-object", 42],
      ["an array", []],
      ["an empty object", {}],
      ["both pieces empty", { entityTypeKey: "", entityId: "" }],
      ["both pieces whitespace", { entityTypeKey: "  ", entityId: "\t" }],
    ];

    it.each(blanks)("returns null on an OPTIONAL field for %s", (_name, value) => {
      expect(validateEntityReferenceCustomFieldValue(OPTIONAL_REF, value, t)).toBeNull();
    });

    it.each(blanks)("refuses a REQUIRED field for %s", (_name, value) => {
      // `validation.required` -- the same CORE key GenericForm shows for the
      // identical condition, so one defect reads the same words whichever path
      // the operator came in by.
      expect(validateEntityReferenceCustomFieldValue(REQUIRED_REF, value, t)).toBe(
        "validation.required"
      );
    });
  });

  describe("half-blank", () => {
    // Validate refuses these outright (422 customFields.values.referenceIncomplete),
    // so they are invalid regardless of required-ness -- exactly like Currency's
    // half-blank case. Not reachable through the picker (handleSelect always emits
    // both, handleClear emits null); this covers stale or tampered form state.
    const halves: Array<[string, unknown]> = [
      ["type key only", { entityTypeKey: "hrms.staff-member", entityId: "" }],
      ["id only", { entityTypeKey: "", entityId: "ENC-1" }],
      ["type key with whitespace id", { entityTypeKey: "hrms.staff-member", entityId: "   " }],
      ["id with a missing type key", { entityId: "ENC-1" }],
      ["non-string id", { entityTypeKey: "hrms.staff-member", entityId: 7 }],
    ];

    it.each(halves)("refuses an OPTIONAL field for %s", (_name, value) => {
      expect(validateEntityReferenceCustomFieldValue(OPTIONAL_REF, value, t)).toBe(
        "customField.entityReference.invalid"
      );
    });

    it.each(halves)("refuses a REQUIRED field for %s", (_name, value) => {
      expect(validateEntityReferenceCustomFieldValue(REQUIRED_REF, value, t)).toBe(
        "customField.entityReference.invalid"
      );
    });
  });
});

describe("assertSelectCustomFieldValuesValid covers entity-reference", () => {
  const fieldConfigs: FieldConfig[] = [
    {
      name: "cf_priority",
      type: "select",
      label: "Priority",
      options: [{ value: "Low", label: "Low" }],
    },
    REQUIRED_REF,
  ];

  it("does not throw when the reference is complete", () => {
    expect(() =>
      assertSelectCustomFieldValuesValid(
        fieldConfigs,
        { cf_priority: "Low", cf_assignee: COMPLETE },
        t
      )
    ).not.toThrow();
  });

  it("throws for a required reference the caller never filled, before saveValues would 422", () => {
    expect(() =>
      assertSelectCustomFieldValuesValid(fieldConfigs, { cf_priority: "Low" }, t)
    ).toThrow(CustomFieldValidationError);
  });

  it("throws for a half-blank reference even on an optional field", () => {
    expect(() =>
      assertSelectCustomFieldValuesValid(
        [OPTIONAL_REF],
        { cf_assignee: { entityTypeKey: "hrms.staff-member", entityId: "" } },
        t
      )
    ).toThrow(CustomFieldValidationError);
  });

  it("carries the already-localized message so a consumer's catch block can surface it verbatim", () => {
    // The whole reason CustomFieldValidationError is a distinct type: the flow's
    // existing catch shows `error.message` instead of its generic save-failed
    // toast.
    expect(() => assertSelectCustomFieldValuesValid([REQUIRED_REF], {}, t)).toThrow(
      "validation.required"
    );
  });

  it("does not throw for an untouched OPTIONAL reference field", () => {
    expect(() => assertSelectCustomFieldValuesValid([OPTIONAL_REF], {}, t)).not.toThrow();
  });

  it("validates the field's own defaultValue when the caller submitted nothing", () => {
    // Same `values[fc.name] ?? fc.defaultValue` fallback every other arm uses:
    // an untouched field's stored default can itself be stale, and it is the
    // value about to be submitted.
    expect(() =>
      assertSelectCustomFieldValuesValid(
        [{ ...OPTIONAL_REF, defaultValue: { entityTypeKey: "hrms.staff-member", entityId: "" } }],
        {},
        t
      )
    ).toThrow(CustomFieldValidationError);
  });

  it("still catches an invalid Select value alongside a valid reference", () => {
    // Guards against the new arm's `continue` swallowing the rest of the loop.
    expect(() =>
      assertSelectCustomFieldValuesValid(
        fieldConfigs,
        { cf_priority: "Urgent", cf_assignee: COMPLETE },
        t
      )
    ).toThrow(CustomFieldValidationError);
  });
});
