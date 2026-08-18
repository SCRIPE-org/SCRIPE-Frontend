// CustomFieldMapper — validatorKind / validatorParam wire-through contract test
//
// Wave 2 Step 2.5 Task 9. Task 10's edit form reads `item.validatorKind` for
// its `initialValues` -- if these two fields don't survive
// JSON -> CustomFieldModel -> CustomField -> CustomFieldModel -> JSON intact,
// the edit form silently prefills empty and an admin editing an existing
// validated field would wipe its validator on save (TRAP 12's whole stated
// risk). This pins:
//   1. the detail-JSON round trip preserves both fields through every hop
//      (fromJson -> toEntity -> toModel -> toJson), including a
//      clearing/null case.
//   2. the list path still works with both fields absent -- the regression
//      most likely to be introduced by this change (R3: the list response
//      deliberately omits them; do not "fix" that here).
import { describe, it, expect } from "vitest";
import { CustomFieldMapper } from "./CustomFieldMapper";
import {
  CustomFieldModel,
  type CustomFieldJson,
  type CustomFieldListItemJson,
} from "../models/CustomFieldModel";

function detailJson(
  validatorKind: string | null,
  validatorParam: string | null
): CustomFieldJson {
  return {
    id: "id1",
    entityTypeKey: "party.person",
    key: "iban",
    labelEn: "IBAN",
    valueType: "Text",
    isRequired: false,
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    validatorKind,
    validatorParam,
  };
}

function listRow(): CustomFieldListItemJson {
  return {
    id: "id2",
    entityTypeKey: "party.person",
    key: "shirt_size",
    labelEn: "Shirt Size",
    valueType: "Text",
    isRequired: false,
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    isGlobal: false,
  };
}

describe("CustomFieldMapper validatorKind / validatorParam", () => {
  it("round-trips a parameterized validator (PostalCode + country param) through the full detail path", () => {
    const json = detailJson("PostalCode", "EG");

    const model = CustomFieldModel.fromJson(json);
    expect(model.validatorKind).toBe("PostalCode");
    expect(model.validatorParam).toBe("EG");

    const entity = CustomFieldMapper.toEntity(model);
    expect(entity.validatorKind).toBe("PostalCode");
    expect(entity.validatorParam).toBe("EG");

    const roundTripped = CustomFieldMapper.toModel(entity);
    expect(roundTripped.validatorKind).toBe("PostalCode");
    expect(roundTripped.validatorParam).toBe("EG");

    expect(roundTripped.toJson().validatorKind).toBe("PostalCode");
    expect(roundTripped.toJson().validatorParam).toBe("EG");
  });

  it("round-trips a non-parameterized validator (SwiftBic, no param) through the full detail path", () => {
    const json = detailJson("SwiftBic", null);

    const model = CustomFieldModel.fromJson(json);
    const entity = CustomFieldMapper.toEntity(model);
    const roundTripped = CustomFieldMapper.toModel(entity);

    expect(roundTripped.validatorKind).toBe("SwiftBic");
    expect(roundTripped.validatorParam).toBeNull();
    expect(roundTripped.toJson().validatorKind).toBe("SwiftBic");
  });

  it("round-trips a null validator (no validator attached) without turning it into a truthy value anywhere in the chain", () => {
    const json = detailJson(null, null);

    const model = CustomFieldModel.fromJson(json);
    const entity = CustomFieldMapper.toEntity(model);
    const roundTripped = CustomFieldMapper.toModel(entity);

    expect(model.validatorKind).toBeNull();
    expect(entity.validatorKind).toBeNull();
    expect(roundTripped.validatorKind).toBeNull();
    expect(roundTripped.toJson().validatorKind).toBeNull();
  });

  it("regression: the list path still works with validatorKind/validatorParam absent from the wire JSON (R3)", () => {
    const model = CustomFieldModel.fromListJson(listRow());

    expect(model.validatorKind).toBeUndefined();
    expect(model.validatorParam).toBeUndefined();

    const entity = CustomFieldMapper.toEntity(model);
    expect(entity.validatorKind).toBeUndefined();
    expect(entity.validatorParam).toBeUndefined();

    // Every other field the list row does carry must still thread through
    // unaffected by the new tail params.
    expect(entity.id).toBe("id2");
    expect(entity.key).toBe("shirt_size");
    expect(entity.isGlobal).toBe(false);
  });
});
