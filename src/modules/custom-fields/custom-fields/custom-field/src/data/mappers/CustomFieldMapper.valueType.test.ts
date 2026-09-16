// CustomFieldMapper — valueType wire-encoding regression test
//
// The definitions API returns valueType as a STRING enum member name
// ("Text"/"Number"/"Boolean"/"Date"/"Select") via the backend's global
// JsonStringEnumConverter -- CustomFieldModel/CustomField used to type this
// as `number`, which silently broke the admin list's value-type badge and
// the edit form's placeholder/options visibility (design doc W0-3/GAP 1).
// This pins the string all the way through JSON -> Model -> Entity -> Model.
import { describe, it, expect } from "vitest";
import { CustomFieldMapper } from "./CustomFieldMapper";
import { CustomFieldModel, type CustomFieldListItemJson } from "../models/CustomFieldModel";

function listRow(valueType: CustomFieldListItemJson["valueType"]): CustomFieldListItemJson {
  return {
    id: "id1",
    entityTypeKey: "party.person",
    key: "size",
    labelEn: "Size",
    valueType,
    isRequired: false,
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    isGlobal: false,
  };
}

describe("CustomFieldMapper valueType", () => {
  it.each(["Text", "Number", "Boolean", "Date", "Select"] as const)(
    "threads valueType %s from list JSON through entity and back to model unchanged",
    (valueType) => {
      const model = CustomFieldModel.fromListJson(listRow(valueType));
      const entity = CustomFieldMapper.toEntity(model);
      const roundTripped = CustomFieldMapper.toModel(entity);

      expect(entity.valueType).toBe(valueType);
      expect(roundTripped.valueType).toBe(valueType);
    }
  );
});
