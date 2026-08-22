/**
 * Edit-form initial values for a CustomField definition.
 *
 * Extracted out of `CustomFieldListView.tsx`'s inline `editInitialValues`
 * during the Wave 2 Step 2.5 fix round (finding C-1) so the REAL function can
 * be exercised by a test against a REAL entity, rather than pinned by a
 * source-regex assertion that a particular expression appears in the view file.
 * That regex style is what let C-1 ship with a fully green suite: every
 * assertion checked that `item.validatorKind ?? ""` was written, none checked
 * what it evaluated to for the object the edit modal is actually handed.
 *
 * WHAT THIS FUNCTION ASSUMES ABOUT ITS INPUT — read before reusing it
 * -------------------------------------------------------------------
 * Every value here is submitted verbatim. `GenericForm` seeds its `formData`
 * from these values and `submitData` is a raw spread of that state, and
 * `isVisible` filters RENDERING only, never the payload. So a field this
 * function blanks is a field the next save WRITES as blank — it is not
 * "omitted and therefore left alone" server-side:
 *
 *   - `UpdateCustomFieldCommandHandler` assigns `entity.PlaceholderEn` /
 *     `PlaceholderAr` / `ValidatorKind` / `ValidatorParam` unconditionally from
 *     the request, with no "null means no change" semantics anywhere.
 *   - A cleared `validatorKind` is *legal* by design (clearing a validator is
 *     always allowed), so it is accepted silently rather than rejected.
 *   - The Wave 4 follow-up adds `referenceTargetEntityTypeKey` to the same class again:
 *     `UpdateCustomFieldCommandHandler` assigns the reference-target gate's output
 *     unconditionally (null when the request omits it or sends `""`), so an omitted or
 *     blank pin on update means UNPIN THIS FIELD, not "leave its target type alone".
 *     `CustomFieldListResponse` does not carry it either, so the same
 *     list-row-vs-detail-fetch rule below governs it.
 *   - Wave 5 row 5.2 adds `fieldGroupId` to exactly the same hazard class:
 *     `UpdateCustomFieldCommandHandler` resolves it from the request and
 *     assigns `resolvedFieldGroupId` (null when the request omits it or sends
 *     `""`), so an omitted/blank group on update means UNGROUP THIS FIELD, not
 *     "leave its group alone". `CustomFieldListResponse` does not carry
 *     `fieldGroupId` either, so the same list-row-vs-detail-fetch rule below
 *     governs it.
 *
 * Therefore the `item` passed here MUST be a fully-hydrated definition from
 * the detail endpoint (`GET /v1/custom-fields/{id}` -> `CustomFieldResponse`
 * -> `CustomFieldModel.fromJson`), never a list row. `CustomFieldListResponse`
 * deliberately omits `options`, both placeholders, both validator columns
 * (ruling R3), `fieldGroupId` (Wave 5 row 5.2) and
 * `referenceTargetEntityTypeKey` (Wave 4 follow-up), so
 * `CustomFieldModel.fromListJson` leaves them `null`/`undefined` and every
 * `?? ""` below would blank a real stored value.
 * `useCustomFieldViewModel.openEditModal` is what guarantees the hydration.
 */
import type { CustomField } from "../domain/entities/CustomField";
import type { CustomFieldValueTypeName } from "./valueTypeRegistry";

/**
 * The shape `GenericForm` is seeded with for an edit, and submits verbatim.
 *
 * A `type` alias rather than an `interface` on purpose: `CrudConfig`'s
 * `editInitialValues` is typed `(item) => Record<string, any>`, and only type
 * aliases get the implicit index signature that assignment needs.
 */
export type CustomFieldEditInitialValues = {
  id: string;
  /**
   * Carried as a hidden field, never submitted as a change — `ValueType` is
   * immutable post-creation and `UpdateCustomFieldCommand` has no such
   * property. It exists in form state only to drive the placeholder/options/
   * validator `isVisible` guards.
   */
  valueType: CustomFieldValueTypeName;
  labelEn: string;
  labelAr: string;
  placeholderEn: string;
  placeholderAr: string;
  validatorKind: string;
  validatorParam: string;
  /**
   * Wave 5 row 5.2. `""` means "no group". Submitted verbatim; the backend's
   * `string.IsNullOrEmpty` check treats `""` and an absent value identically,
   * so an empty string is the honest wire representation of "ungrouped" and
   * needs no write-seam normalization the way `validatorKind` does (that one
   * is a nullable ENUM, which cannot deserialize `""` at all).
   */
  fieldGroupId: string;
  /**
   * Wave 4 follow-up. The definition-level reference target pin, or `""` for an unpinned field.
   *
   * `""` is the honest wire representation of "unpinned" and needs no write-seam normalization:
   * `ReferenceTargetOwnership.NormalizeTargetEntityType` and
   * `EntityReferenceValueTypeHandler.NormalizeTargetEntityTypeKey` both branch on
   * `string.IsNullOrWhiteSpace`, so an empty string and an absent value mean the identical thing to
   * the server. Same situation as `fieldGroupId` above, and the opposite of `validatorKind`, which is
   * a nullable ENUM and cannot model-bind `""` at all.
   *
   * Carried for EVERY value type, not only the reference ones. A Text definition round-trips `""`
   * here, which the server accepts as "unpinned" rather than refusing as a meaningless target -- the
   * blank check runs before the "may this value type carry a pin at all" check.
   */
  referenceTargetEntityTypeKey: string;
  options: string;
  optionsAr: string;
  /** Wave 6 ruling R10. Wire value is the C# enum member name; `""` is never valid, so it is
   *  normalized to `"None"` on read rather than submitted empty. */
  sensitivity: string;
  isExportable: boolean;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
};

/**
 * Builds the edit form's initial values from a fully-hydrated definition.
 *
 * @param item - A detail-fetched `CustomField`. Passing a list row silently
 *   blanks `options`, both placeholders and the validator on the next save —
 *   see this module's own doc comment.
 * @returns The form-state object `GenericForm` seeds from and submits.
 */
export function buildCustomFieldEditInitialValues(item: CustomField): CustomFieldEditInitialValues {
  return {
    id: item.id,
    valueType: item.valueType,
    labelEn: item.labelEn,
    labelAr: item.labelAr ?? "",
    placeholderEn: item.placeholderEn ?? "",
    placeholderAr: item.placeholderAr ?? "",
    validatorKind: item.validatorKind ?? "",
    validatorParam: item.validatorParam ?? "",
    fieldGroupId: item.fieldGroupId ?? "",
    // Wave 4 follow-up. Joins the same hazard class as `fieldGroupId` and the two validator columns:
    // `CustomFieldResponse` carries the pin but `CustomFieldListResponse` does not, and
    // `UpdateCustomFieldCommandHandler` full-replaces the column from the gate's output on every
    // update. So a list row reaching this function blanks the pin, and the next save UNPINS the
    // definition -- turning "this field holds an Employee" into "this field holds anything" with
    // nobody having asked. The detail-fetch requirement in this module's header comment is what
    // prevents that; there is no defence available inside this function.
    referenceTargetEntityTypeKey: item.referenceTargetEntityTypeKey ?? "",
    options: item.options ?? "",
    // Same "?? \"\"" discipline as every other form-populating field here: absent must
    // become an empty string, not undefined, or the controlled editor loses its value on
    // first render and writes the loss back on save.
    optionsAr: item.optionsAr ?? "",
    // Wave 6 ruling R10. Both defaults MATCH THE SERVER'S, and that matters more here than for any
    // other field on this form: the update command replaces every property, so a form that seeded
    // the wrong default would write it back as truth on the next unrelated save. `isExportable`
    // defaults TRUE -- seeding false would silently un-export every field an admin edited.
    sensitivity: item.sensitivity ?? "None",
    isExportable: item.isExportable ?? true,
    isRequired: item.isRequired,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  };
}
