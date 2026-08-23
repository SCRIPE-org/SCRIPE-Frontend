// EntityReference/UserReference wire-shape guard -- Wave 4
//
// This file exists for ONE defect, and the property names are in the test
// titles so it cannot be reopened by someone who reads the C# and "fixes" the
// spelling:
//
//   a reference reads AND writes as `{ entityTypeKey, entityId }`
//
// Verified against the real handler source, not a doc.
// `EntityReferenceValueTypeHandler.Parse` reads the JSON properties
// `entityTypeKey` and `entityId`; the `EncryptedEntityId` in its
// `EntityReferenceInput` record is a CLR parameter name, constructed
// positionally, with no `[JsonPropertyName]` and no converter anywhere. A save
// that renames `entityId` to `encryptedEntityId` therefore submits a payload
// with `entityId` ABSENT: `TryReadStringProperty` reports absent-as-null with
// success (by design -- a half-blank is Validate's business, not Parse's),
// `IsEmpty` stays false because it needs BOTH pieces blank, and `Validate`
// answers 422 `customFields.values.referenceIncomplete`. Every fully-picked
// reference is rejected with the message written for a half-filled one, and on
// a create the owner row is already written by then.
//
// Which is why this module exports a SHAPE GUARD and no translator at all.
//
// Wave 3.4 adds `isRichTextValue` beside it, for the same class of defect one
// type over: RichText's wire shape is the one-key OBJECT `{ html }`, and a bare
// string -- the obvious modelling -- is the shape the backend refuses outright,
// because `InputSanitizationMiddleware`'s carve-out for this route is the PATH
// `values.*.html`, so a bare string at `values.myField` arrives tag-stripped. So
// this module again exports a shape guard and no translator: nothing here may
// turn a string into a value or a value into a string on the way to the wire.
import { describe, it, expect } from "vitest";
import * as CustomFieldValueModel from "./CustomFieldValueModel";
import { isEntityReferenceValue, isRichTextValue } from "./CustomFieldValueModel";

describe("the reference wire shape", () => {
  it("names the id `entityId` on the way out too, so this module exports no translator", () => {
    // The regression guard for the defect above, asserted on the module surface
    // because that is where the bug was shaped: a translator existing at all is
    // what invited the save path to call it. There is nothing to translate --
    // read and write spell both properties identically -- so a reappearing
    // `toEntityReferenceInput` (or any renamer beside it) is the bug returning,
    // not a refactor.
    expect(CustomFieldValueModel).not.toHaveProperty("toEntityReferenceInput");
    // Wave 3.4 raises this from one export to two. The list is exhaustive on
    // purpose and is the reason it is spelled out rather than derived: this
    // module's whole runtime surface is shape GUARDS, so any new export here is
    // either another guard or the translator this file exists to keep out.
    expect(Object.keys(CustomFieldValueModel)).toEqual([
      "isEntityReferenceValue",
      "isRichTextValue",
    ]);
  });
});

describe("isEntityReferenceValue", () => {
  it("accepts `{ entityTypeKey, entityId }` -- the shape the wire uses in both directions", () => {
    expect(isEntityReferenceValue({ entityTypeKey: "identity.user", entityId: "ENC-1" })).toBe(
      true
    );
  });

  it("accepts a blank `entityId` -- it is a SHAPE guard, not a completeness check", () => {
    // Completeness is asked separately, by the one caller that needs it:
    // generic-form.tsx's required-field emptiness check. A half-blank that gets
    // past a required check must still reach the wire intact, so the backend
    // answers with its own localized `referenceIncomplete` 422 instead of the
    // client second-guessing it into a null -- which is the wire's "clear this
    // field", i.e. a silent delete.
    expect(isEntityReferenceValue({ entityTypeKey: "identity.user", entityId: "" })).toBe(true);
  });

  it("rejects an object whose id is spelled `encryptedEntityId`, because no such wire name exists", () => {
    // Not a write shape -- there is no write shape. It is simply an object
    // missing `entityId`, and the guard treats it as what it is so a stray
    // renamed payload can never be rendered as a readable reference.
    expect(
      isEntityReferenceValue({ entityTypeKey: "identity.user", encryptedEntityId: "ENC-1" })
    ).toBe(false);
  });

  it("rejects null, undefined, arrays, scalars and objects missing either property", () => {
    expect(isEntityReferenceValue(null)).toBe(false);
    expect(isEntityReferenceValue(undefined)).toBe(false);
    expect(isEntityReferenceValue([])).toBe(false);
    expect(isEntityReferenceValue("ENC-1")).toBe(false);
    expect(isEntityReferenceValue(42)).toBe(false);
    expect(isEntityReferenceValue({ entityTypeKey: "identity.user" })).toBe(false);
    expect(isEntityReferenceValue({ entityId: "ENC-1" })).toBe(false);
  });

  it("rejects a non-string `entityId` or `entityTypeKey` -- no JSON number can be an encrypted id", () => {
    // Mirrors the handler's own fail-closed posture: Parse rejects the whole
    // payload for a non-string entityId rather than coercing it.
    expect(isEntityReferenceValue({ entityTypeKey: "identity.user", entityId: 7 })).toBe(false);
    expect(isEntityReferenceValue({ entityTypeKey: 7, entityId: "ENC-1" })).toBe(false);
  });
});

// isRichTextValue -- Wave 3.4.
//
// The guard's job is to separate the wire's object envelope from the bare string
// the backend refuses. Every test below names the property or the shape rather
// than the verdict, because "returns false" is a status two different reasons
// both produce and would prove nothing on its own.
describe("isRichTextValue", () => {
  it("accepts `{ html }` -- the shape the wire uses in both directions", () => {
    expect(isRichTextValue({ html: "<p>hello</p>" })).toBe(true);
  });

  it("accepts a blank `html` -- it is a SHAPE guard, not an emptiness check", () => {
    // Emptiness is asked separately, by the two callers that need it: the
    // control (which emits null rather than `{ html: "" }` so a cleared field is
    // genuinely cleared server-side) and generic-form's required-field check
    // (which must read blank markup as unfilled). Conflating the two here would
    // force one of those answers on the other.
    expect(isRichTextValue({ html: "" })).toBe(true);
  });

  it("REJECTS a bare string, which is the one shape RichTextValueTypeHandler.Parse refuses", () => {
    // Not a stylistic rejection. A bare string at `values.myField` does not
    // match InputSanitizationMiddleware's `values.*.html` carve-out, so it
    // reaches the handler already stripped of every tag; Parse answers
    // WasExtractable:false and the save 422s with `unsupportedType`. A guard
    // that accepted strings would let that shape travel to the wire wearing the
    // name of a valid value.
    expect(isRichTextValue("<p>hello</p>")).toBe(false);
    expect(isRichTextValue("")).toBe(false);
  });

  it("rejects an object whose `html` is not a string -- no JSON number is markup", () => {
    // Mirrors the handler's own fail-closed posture: `TryReadStringProperty`
    // fails the WHOLE payload for a non-string `html` rather than coercing it
    // and rejecting it late with a misleading message.
    expect(isRichTextValue({ html: 7 })).toBe(false);
    expect(isRichTextValue({ html: null })).toBe(false);
    expect(isRichTextValue({ html: { html: "x" } })).toBe(false);
  });

  it("rejects an object with no `html` member at all", () => {
    // The backend PARSES this successfully as an empty value (an absent property
    // reads as null-with-success everywhere in that module), but it is not a
    // rich-text VALUE, and this guard's callers narrow `unknown` down to
    // something they can read `.html` off. Reporting true would hand them
    // `undefined` where they expect a string.
    expect(isRichTextValue({})).toBe(false);
    expect(isRichTextValue({ Html: "<p>capitalised</p>" })).toBe(false);
  });

  it("rejects null, undefined, arrays and scalars", () => {
    expect(isRichTextValue(null)).toBe(false);
    expect(isRichTextValue(undefined)).toBe(false);
    expect(isRichTextValue([])).toBe(false);
    expect(isRichTextValue([{ html: "<p>x</p>" }])).toBe(false);
    expect(isRichTextValue(42)).toBe(false);
    expect(isRichTextValue(true)).toBe(false);
  });

  it("does not confuse a reference value for a rich-text value, or the reverse", () => {
    // The two guards are the two object envelopes this module knows, and they
    // must not overlap: a File/Image value is a reference envelope, and if
    // either guard admitted the other's shape the renderer's narrowing would
    // hand a control a value it cannot read.
    expect(isRichTextValue({ entityTypeKey: "media.file", entityId: "ENC-1" })).toBe(false);
    expect(isEntityReferenceValue({ html: "<p>x</p>" })).toBe(false);
  });
});
