// CustomFieldMapper — isGlobal wire-through contract test
//
// The list endpoint now marks GLOBAL definitions (backend TenantId == null) with
// `isGlobal: true` so the list view can badge them (see CustomFieldListView.tsx) --
// otherwise a tenant admin can't tell a platform-owned row from their own until a
// confusing NotFound on edit/delete. This pins that the flag survives
// JSON -> CustomFieldModel -> CustomField entity untouched.
import { describe, it, expect } from "vitest";
import { CustomFieldMapper } from "./CustomFieldMapper";
import { CustomFieldModel, type CustomFieldListItemJson } from "../models/CustomFieldModel";

function listRow(isGlobal: boolean): CustomFieldListItemJson {
  return {
    id: "id1",
    entityTypeKey: "party.person",
    key: "shirt_size",
    labelEn: "Shirt Size",
    valueType: 0,
    isRequired: false,
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    isGlobal,
  };
}

describe("CustomFieldMapper isGlobal", () => {
  it("threads isGlobal: true from list JSON through to the entity", () => {
    const model = CustomFieldModel.fromListJson(listRow(true));
    const entity = CustomFieldMapper.toEntity(model);

    expect(entity.isGlobal).toBe(true);
  });

  it("threads isGlobal: false from list JSON through to the entity", () => {
    const model = CustomFieldModel.fromListJson(listRow(false));
    const entity = CustomFieldMapper.toEntity(model);

    expect(entity.isGlobal).toBe(false);
  });
});
