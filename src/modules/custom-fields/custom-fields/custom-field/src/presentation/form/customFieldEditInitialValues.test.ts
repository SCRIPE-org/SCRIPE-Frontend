/**
 * buildCustomFieldEditInitialValues — Wave 2 Step 2.5 fix round (C-1).
 *
 * Runs the REAL builder against REAL `CustomField` entities produced by the
 * REAL model + mapper from REAL wire JSON, in both shapes the read path can
 * produce: a detail response and a list row.
 *
 * The list-row case is deliberately asserted as a documented HAZARD rather
 * than as desired behaviour. The builder cannot defend itself — it has no way
 * to tell a sparse list row from a definition that genuinely has no
 * placeholders — so the invariant it depends on ("callers pass a detail
 * fetch") is enforced one level up, in
 * `useCustomFieldViewModel.openEditModal`, and pinned by
 * `__tests__/useCustomFieldViewModel.editHydration.test.tsx`. Spelling the
 * hazard out here is what stops a future reader from "simplifying" that
 * hydration back out again.
 */
import { describe, it, expect } from "vitest";
import { CustomFieldModel } from "../../data/models/CustomFieldModel";
import { CustomFieldMapper } from "../../data/mappers/CustomFieldMapper";
import { buildCustomFieldEditInitialValues } from "./customFieldEditInitialValues";

const DETAIL_JSON = {
  id: "enc-1",
  entityTypeKey: "party.person",
  key: "bank_account",
  labelEn: "Bank Account",
  labelAr: "الحساب البنكي",
  placeholderEn: "GB00 XXXX",
  placeholderAr: "أدخل رقم الآيبان",
  valueType: "Text" as const,
  isRequired: true,
  options: null,
  sortOrder: 3,
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  modifiedAt: null,
  validatorKind: "Iban",
  validatorParam: null,
  fieldGroupId: "enc-group-7",
};

const LIST_ROW_JSON = {
  id: "enc-1",
  entityTypeKey: "party.person",
  key: "bank_account",
  labelEn: "Bank Account",
  labelAr: "الحساب البنكي",
  valueType: "Text" as const,
  isRequired: true,
  sortOrder: 3,
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  isGlobal: false,
};

describe("buildCustomFieldEditInitialValues", () => {
  it("carries every stored value through from a detail-fetched definition", () => {
    const item = CustomFieldMapper.toEntity(CustomFieldModel.fromJson(DETAIL_JSON));

    expect(buildCustomFieldEditInitialValues(item)).toEqual({
      id: "enc-1",
      valueType: "Text",
      labelEn: "Bank Account",
      labelAr: "الحساب البنكي",
      placeholderEn: "GB00 XXXX",
      placeholderAr: "أدخل رقم الآيبان",
      validatorKind: "Iban",
      validatorParam: "",
      fieldGroupId: "enc-group-7",
      // Wave 4 follow-up, acknowledged here rather than tolerated, per this assertion's own note
      // below. `""` because DETAIL_JSON carries no pin -- and `""` is the honest wire value for
      // "unpinned", which the server reads identically to an absent one.
      referenceTargetEntityTypeKey: "",
      // Added by the bilingual options editor. This assertion is deliberately EXHAUSTIVE -- it
      // exists because a new form-populating field once slipped in and silently blanked stored
      // data on every save, so a new key must be acknowledged here rather than tolerated.
      optionsAr: "",
      options: "",
      // Wave 6 ruling R10. Acknowledged here rather than tolerated, per this assertion's own note
      // above. Both values are the SERVER's defaults, seeded because DETAIL_JSON carries neither --
      // and isExportable must be TRUE, since seeding false would silently un-export every field an
      // admin edited through this form.
      sensitivity: "None",
      isExportable: true,
      isRequired: true,
      sortOrder: 3,
      isActive: true,
    });
  });

  it("preserves a Select definition's options verbatim", () => {
    const item = CustomFieldMapper.toEntity(
      CustomFieldModel.fromJson({
        ...DETAIL_JSON,
        valueType: "Select" as const,
        options: "Small\nMedium\nLarge",
        validatorKind: null,
      })
    );

    expect(buildCustomFieldEditInitialValues(item).options).toBe("Small\nMedium\nLarge");
  });

  it("carries a stored reference target pin through from a detail-fetched definition", () => {
    // The positive case for the Wave 4 follow-up column, separate from the exhaustive assertion
    // above (which only ever sees an unpinned definition). A pinned EntityReference must arrive at
    // the form holding its pin, because the update command replaces the column from the request.
    const item = CustomFieldMapper.toEntity(
      CustomFieldModel.fromJson({
        ...DETAIL_JSON,
        valueType: "EntityReference" as const,
        validatorKind: null,
        referenceTargetEntityTypeKey: "hrms.staff-member",
      })
    );

    expect(buildCustomFieldEditInitialValues(item).referenceTargetEntityTypeKey).toBe(
      "hrms.staff-member"
    );
  });

  it("HAZARD: a list row blanks the validator, the options, both placeholders and the field group — which is why callers must hydrate first", () => {
    const listRow = CustomFieldMapper.toEntity(CustomFieldModel.fromListJson(LIST_ROW_JSON));
    const values = buildCustomFieldEditInitialValues(listRow);

    // These are what the update handler would then write back as blank.
    expect(values.validatorKind).toBe("");
    expect(values.validatorParam).toBe("");
    expect(values.placeholderEn).toBe("");
    expect(values.placeholderAr).toBe("");
    expect(values.options).toBe("");
    // Wave 5 row 5.2 joined the same hazard class: CustomFieldListResponse
    // carries no fieldGroupId either, and an empty one on update UNGROUPS the
    // field rather than leaving its group alone.
    expect(values.fieldGroupId).toBe("");
    // The Wave 4 follow-up column joined it again: no ReferenceTargetEntityTypeKey on the list
    // response, and a blank one on update UNPINS the field's target entity type.
    expect(values.referenceTargetEntityTypeKey).toBe("");
    // The fields the list row DOES carry survive, which is why the defect was
    // invisible in the UI: the form looked correctly populated.
    expect(values.labelEn).toBe("Bank Account");
    expect(values.sortOrder).toBe(3);
    expect(values.isActive).toBe(true);
  });
});
