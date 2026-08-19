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
