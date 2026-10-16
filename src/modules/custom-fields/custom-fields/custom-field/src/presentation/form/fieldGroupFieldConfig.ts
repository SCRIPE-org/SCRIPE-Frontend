/**
 * The field-group picker's `FieldConfig` -- Wave 5 row 5.2.
 *
 * Extracted out of `CustomFieldListView.tsx` for exactly the reason
 * `customFieldEditInitialValues.ts` was extracted during the Wave 2 Step 2.5
 * fix round: so a test can render the REAL config object through the REAL
 * `GenericForm` and ask what it produces, instead of regex-matching the view's
 * source for a literal that may or may not mean anything at runtime. That
 * regex style is how C-1 shipped with a fully green suite.
 *
 * WHY `type: "select"` IS LOAD-BEARING FOR ACCESSIBILITY
 * -----------------------------------------------------
 * GenericForm's `select` branch is the one that passes
 * `aria-label={field.label ?? field.name}` down to GenericSelect. That
 * aria-label is the control's ONLY accessible name: the trigger is a
 * `role="combobox"` DIV, and HTML restricts `<label for>` association to
 * labelable elements, so the visible `<Label htmlFor>` GenericForm also
 * renders computes nothing for it. A test must therefore assert the name with
 * `getByRole("combobox", { name })`. `getByLabelText` passes against a control
 * with no accessible name at all and proves nothing.
 */
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";

/**
 * The form-state key. Matches `CreateCustomFieldRequest.FieldGroupId` /
 * `UpdateCustomFieldRequest.FieldGroupId` exactly -- `GenericForm.submitData`
 * is a raw spread of form state, so this string IS the wire property name.
 */
export const FIELD_GROUP_FIELD_NAME = "fieldGroupId";

export interface BuildFieldGroupFieldArgs {
  /** i18n lookup; the same `t` the surrounding view uses. */
  t: (key: string) => string;
  /**
   * Sentinel-first option list from `useFieldGroupOptions`. The leading `""`
   * entry is what lets an admin pick "no group" AND clear an existing
   * assignment.
   */
  options: FieldOption[];
  /** Groups query still in flight -- renders the select's own loading state. */
  isLoading: boolean;
  /** Groups query failed; swaps the helper text for a reassuring explanation. */
  isError: boolean;
}

/**
 * Build the picker's FieldConfig. Identical on the create and edit forms; only
 * the create form wraps it with {@link isFieldGroupPickerVisible}.
 */
export function buildFieldGroupField({
  t,
  options,
  isLoading,
  isError,
}: BuildFieldGroupFieldArgs): FieldConfig {
  return {
    name: FIELD_GROUP_FIELD_NAME,
    label: t("customField.fields.fieldGroup"),
    type: "select",
    options,
    loading: isLoading,
    // On a failed groups fetch the picker still renders, and still submits
    // whatever `fieldGroupId` the form was seeded with -- so the honest
    // message is "your current group is safe", not a generic error.
    description: isError
      ? t("customField.fieldGroupLoadFailed")
      : t("customField.fieldGroupDescription"),
  };
}

/**
 * Create-form visibility guard: a group belongs to exactly one entity type and
 * the list endpoint has no "all groups" mode, so before an entity type is
 * chosen there is genuinely nothing to pick from.
 *
 * Not applied on the edit form: `entityTypeKey` is immutable and already known
 * there.
 */
export function isFieldGroupPickerVisible(form: Record<string, unknown>): boolean {
  return typeof form.entityTypeKey === "string" && form.entityTypeKey.length > 0;
}

/**
 * Documentation for module export
 */
export interface FieldGroupPickerVisibilityArgs {
  /**
   * Whether the caller holds `custom-field-groups.view`.
   *
   * The picker's option list comes from `GET /field-groups`, which the backend
   * gates on that permission -- it is a NEW permission (Wave 5 row 5.2), so
   * every role that predates the row lacks it, including roles holding the full
   * `custom-fields.*` set. Rendering the picker to such an admin means a 403 on
   * every modal open and a picker that can only ever offer "no group".
   *
   * Hiding the field is safe for the stored value: `GenericForm` seeds
   * `formData` from `initialValues` and submits a raw spread of that state,
   * and `isVisible` gates rendering and required-validation only -- it never
   * removes the key. So an edit save by an admin who cannot see the picker
   * still carries the field's existing `fieldGroupId` unchanged. Pinned by
   * `fieldGroupFieldConfig.test.tsx`; removing the field from the `fields`
   * array instead would NOT be safe on the create form, whose
   * `createInitialValues` is the only thing seeding the key there.
   */
  canView: boolean;
  /**
   * Whether an entity type must be chosen first. True on the create form (the
   * list endpoint has no "all groups" mode, so there is genuinely nothing to
   * offer yet); false on the edit form, where `entityTypeKey` is immutable and
   * already known.
   */
  requireEntityType: boolean;
}

/**
 * Build the picker's `isVisible` guard. Both call sites go through this, so the
 * permission half can never be wired on one form and forgotten on the other.
 */
export function makeFieldGroupPickerVisibility({
  canView,
  requireEntityType,
}: FieldGroupPickerVisibilityArgs): (form: Record<string, unknown>) => boolean {
  return (form) => canView && (!requireEntityType || isFieldGroupPickerVisible(form));
}
