import { describe, it, expect } from "vitest";
import { CustomFieldMapper } from "./CustomFieldMapper";
import { CustomFieldModel, type CustomFieldJson } from "../models/CustomFieldModel";
import { CustomField, type CustomFieldData } from "../../domain/entities/CustomField";

/**
 * Structural pins against a property being added to the model, the JSON shape or the entity and
 * silently dropped in the mapper between them.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * A real, shipped bug. `optionsAr` was added to `CustomFieldJson`, to `CustomFieldModel`, to
 * `CustomFieldData` and to the edit form — and `CustomFieldMapper.toEntity` never copied it. So
 * `entity.optionsAr` was `undefined` after every round trip, the edit form seeded `""`, and the next
 * save wrote that back, clearing every Arabic option label the user had entered.
 *
 * Nothing caught it. The initial-values test asserts the shape built FROM an entity, so it passes a
 * hand-made entity straight through and never exercises the mapper. TypeScript could not help either:
 * every field on `CustomFieldData` is optional, so an omitted key is a legal object.
 *
 * These tests therefore go through the real JSON → model → entity path with a distinct value in every
 * field, and assert nothing was lost. A property added to the JSON shape but not mapped fails here
 * without anyone having to remember to extend an assertion list.
 */

/** Every field populated, each distinguishable from its type's default. */
const FULL_JSON: CustomFieldJson = {
  id: "enc-id",
  entityTypeKey: "staff",
  key: "jersey_size",
  labelEn: "Jersey size",
  labelAr: "مقاس القميص",
  placeholderEn: "Pick a size",
  placeholderAr: "اختر مقاسا",
  valueType: "Select",
  isRequired: true,
  options: "Small\nLarge",
  optionsAr: "صغير\nكبير",
  sortOrder: 7,
  isActive: false,
  createdAt: "2026-08-20T10:00:00Z",
  modifiedAt: "2026-08-20T11:00:00Z",
  validatorKind: "PostalCode",
  validatorParam: "EG",
  fieldGroupId: "enc-group",
  sensitivity: "Confidential",
  isExportable: false,
  // Wave 4 follow-up. A definition-level reference target pin. Present in this fixture even though
  // FULL_JSON's valueType is Select — this file pins the MAPPER's completeness, and the mapper does
  // not (and must not) know which value types may legally carry a pin; that refusal belongs to the
  // backend's ReferenceTargetOwnership gate, not to a copy of it on the client.
  referenceTargetEntityTypeKey: "hrms.staff-member",
};

/**
 * Keys on `CustomFieldData` that deliberately do NOT survive a detail-JSON round trip, each with its
 * reason. Anything else must.
 */
const EXPECTED_ABSENT: Record<string, string> = {
  isGlobal:
    "List-response only. The detail endpoint does not return it, and CustomFieldModel.fromJson " +
    "passes `undefined` for it on purpose rather than inventing a value.",
};

describe("CustomFieldMapper round-trip completeness", () => {
  it("carries every detail-JSON field through to the entity", () => {
    const entity = CustomFieldMapper.fromJsonToEntity(FULL_JSON);

    // Compared field by field against the JSON rather than against a hand-written expected object:
    // a hand-written expectation only covers the keys whoever wrote it remembered, which is exactly
    // how optionsAr came to be missing.
    for (const [key, value] of Object.entries(FULL_JSON)) {
      if (key in EXPECTED_ABSENT) continue;
      expect(
        (entity as unknown as Record<string, unknown>)[key],
        `${key} was dropped between the API JSON and the entity`
      ).toEqual(value);
    }
  });

  it("keeps every entity key reachable through the model", () => {
    // The reverse direction: toModel -> toEntity. The edit form submits from entity-derived state, so
    // a key lost here is a key silently cleared on save.
    const entity = CustomFieldMapper.fromJsonToEntity(FULL_JSON);
    const roundTripped = CustomFieldMapper.toEntity(CustomFieldMapper.toModel(entity));

    for (const key of Object.keys(FULL_JSON)) {
      if (key in EXPECTED_ABSENT) continue;
      expect(
        (roundTripped as unknown as Record<string, unknown>)[key],
        `${key} was lost on the entity -> model -> entity round trip`
      ).toEqual((entity as unknown as Record<string, unknown>)[key]);
    }
  });

  it("reports isGlobal as false on a detail fetch, which is a lossy default worth knowing about", () => {
    // NOT the behaviour I expected when writing this, and the test is kept because the real
    // behaviour is the thing worth pinning. `isGlobal` is a LIST-only field -- the detail response
    // does not carry it -- and the entity getter coalesces the absent value to `false`
    // (CustomField.ts: `this.data.isGlobal ?? false`).
    //
    // So a detail fetch of a PLATFORM-OWNED field reports it as tenant-owned. That is pre-existing
    // and out of scope here, but it means no UI may branch on `isGlobal` after a detail fetch: the
    // false is indistinguishable from a real answer. Recorded rather than "fixed" silently, because
    // changing the getter to return `undefined` would change a non-nullable public type.
    const entity = CustomFieldMapper.fromJsonToEntity(FULL_JSON);

    expect(entity.isGlobal).toBe(false);
    // The MODEL is honest about it; only the entity getter coalesces.
    expect(CustomFieldModel.fromJson(FULL_JSON).isGlobal).toBeUndefined();
  });

  it("preserves optionsAr specifically", () => {
    // Named explicitly, not just covered by the sweep above. This one shipped broken, and a named
    // test says so to whoever reads the file next.
    expect(CustomFieldMapper.fromJsonToEntity(FULL_JSON).optionsAr).toBe("صغير\nكبير");
  });

  it("preserves the reference target pin specifically", () => {
    // Named rather than left to the sweep above, for the same reason optionsAr is: this column is in
    // the C-1 hazard class. It is detail-response only, and the update command full-replaces it, so a
    // drop anywhere on the JSON -> model -> entity path turns every unrelated edit of a pinned
    // reference field into a silent unpin.
    expect(CustomFieldMapper.fromJsonToEntity(FULL_JSON).referenceTargetEntityTypeKey).toBe(
      "hrms.staff-member"
    );
  });

  it("leaves an omitted reference target pin undefined rather than defaulting it to a key", () => {
    // Unpinned must be distinguishable from "not fetched" on the ENTITY. The coercion to "" belongs
    // to the edit-form initial-values builder, which documents why blanking is safe there; inventing
    // a value here would make a list row indistinguishable from a genuinely unpinned definition.
    const { referenceTargetEntityTypeKey, ...withoutPin } = FULL_JSON;
    void referenceTargetEntityTypeKey;

    expect(
      CustomFieldMapper.fromJsonToEntity(withoutPin as CustomFieldJson).referenceTargetEntityTypeKey
    ).toBeUndefined();
  });

  it("never invents a reference target pin for a list row", () => {
    // CustomFieldListResponse carries no ReferenceTargetEntityTypeKey (verified against that record),
    // so `fromListJson` must leave it undefined. Asserted so nobody "fixes" the list mapper by
    // guessing.
    const listRow = CustomFieldModel.fromListJson({
      id: "enc-id",
      entityTypeKey: "staff",
      key: "jersey_size",
      labelEn: "Jersey size",
      valueType: "EntityReference",
      isRequired: false,
      sortOrder: 0,
      isActive: true,
      createdAt: "2026-08-20T10:00:00Z",
      isGlobal: false,
    });

    expect(listRow.referenceTargetEntityTypeKey).toBeUndefined();
    expect(CustomFieldMapper.toEntity(listRow).referenceTargetEntityTypeKey).toBeUndefined();
  });

  it("preserves the classification specifically", () => {
    const entity = CustomFieldMapper.fromJsonToEntity(FULL_JSON);

    expect(entity.sensitivity).toBe("Confidential");
    // Asserted as `false`, not falsy: the server default is TRUE, so a dropped isExportable arrives
    // as undefined and the form's `?? true` would turn a deliberately non-exportable field back into
    // an exportable one on the next save.
    expect(entity.isExportable).toBe(false);
  });

  it("leaves an omitted classification undefined rather than defaulting it here", () => {
    // The default belongs to ONE place -- the initial-values builder, which documents that it must
    // match the server's. A second default in the mapper would be a second thing to keep in step.
    const { sensitivity, isExportable, ...withoutClassification } = FULL_JSON;
    void sensitivity;
    void isExportable;

    const entity = CustomFieldMapper.fromJsonToEntity(withoutClassification as CustomFieldJson);

    expect(entity.sensitivity).toBeUndefined();
    expect(entity.isExportable).toBeUndefined();
  });

  it("survives a model built positionally with only the required arguments", () => {
    // The model's optionals are positional and interchangeably typed, which is why its own comments
    // forbid reordering them. This pins that the required prefix still produces a usable entity, so
    // a future insertion that shifts arguments fails here rather than mis-assigning fields at runtime.
    const minimal = new CustomFieldModel(
      "enc-id",
      "staff",
      "jersey_size",
      "Jersey size",
      "Text",
      false,
      0,
      true,
      "2026-08-20T10:00:00Z"
    );

    const entity = CustomFieldMapper.toEntity(minimal);

    expect(entity).toBeInstanceOf(CustomField);
    expect(entity.key).toBe("jersey_size");
    expect(entity.labelEn).toBe("Jersey size");
    expect(entity.optionsAr).toBeUndefined();
  });

  it("exposes no CustomFieldData key that the mapper cannot populate", () => {
    // Catches the reverse gap: a key added to the entity's data shape with no model source can only
    // ever be undefined, so it is better to be told now than to ship a permanently empty field.
    const entity = CustomFieldMapper.fromJsonToEntity(FULL_JSON);

    // Read through the GETTERS rather than Object.keys: CustomField exposes its fields as accessors
    // on the prototype and keeps the backing object private, so Object.keys returns the private
    // field name and nothing else. A test built on that would pass vacuously.
    const read = (k: string) => (entity as unknown as Record<string, unknown>)[k];

    const declared: Array<keyof CustomFieldData> = [
      "id",
      "entityTypeKey",
      "key",
      "labelEn",
      "labelAr",
      "placeholderEn",
      "placeholderAr",
      "valueType",
      "isRequired",
      "options",
      "optionsAr",
      "sensitivity",
      "isExportable",
      "sortOrder",
      "isActive",
      "createdAt",
      "modifiedAt",
      "validatorKind",
      "validatorParam",
      "fieldGroupId",
      "referenceTargetEntityTypeKey",
    ];

    const unpopulated = declared.filter((k) => read(k as string) === undefined);
    expect(
      unpopulated,
      "these CustomFieldData keys were not populated from a full detail JSON"
    ).toEqual([]);
  });
});
