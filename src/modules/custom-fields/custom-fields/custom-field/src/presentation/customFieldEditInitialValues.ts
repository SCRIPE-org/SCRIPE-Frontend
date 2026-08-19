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
 * (ruling R3) and `fieldGroupId` (Wave 5 row 5.2), so
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
  options: string;
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
    options: item.options ?? "",
    isRequired: item.isRequired,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  };
}
