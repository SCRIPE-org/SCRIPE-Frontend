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
import { describe, it, expect } from "vitest";
import * as CustomFieldValueModel from "./CustomFieldValueModel";
import { isEntityReferenceValue } from "./CustomFieldValueModel";

describe("the reference wire shape", () => {
  it("names the id `entityId` on the way out too, so this module exports no translator", () => {
    // The regression guard for the defect above, asserted on the module surface
    // because that is where the bug was shaped: a translator existing at all is
    // what invited the save path to call it. There is nothing to translate --
    // read and write spell both properties identically -- so a reappearing
    // `toEntityReferenceInput` (or any renamer beside it) is the bug returning,
    // not a refactor.
    expect(CustomFieldValueModel).not.toHaveProperty("toEntityReferenceInput");
    expect(Object.keys(CustomFieldValueModel)).toEqual(["isEntityReferenceValue"]);
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
