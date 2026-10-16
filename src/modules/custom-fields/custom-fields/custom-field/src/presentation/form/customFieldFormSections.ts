/**
 * Custom Field Form Sections Configuration
 *
 * Provides reusable field configuration groupings (identity, option sets,
 * classifications, layout, and governance) for custom field creation and editing forms.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";

export * from "./customFieldLayoutSections";

export interface CreateIdentityFieldsArgs {
  t: (key: string, params?: Record<string, string | number>) => string;
  entityTypeOptions: { value: string; label: string }[];
  noFrontendScreenDescription?: string;
  handleEntityTypeChange: (value: unknown) => { fieldGroupId: string };
}

/**
 * Builds identity fields for the custom field creation form.
 */
export function buildCreateIdentityFields({
  t,
  entityTypeOptions,
  noFrontendScreenDescription,
  handleEntityTypeChange,
}: CreateIdentityFieldsArgs): FieldConfig[] {
  return [
    {
      name: "entityTypeKey",
      label: t("customField.fields.entityTypeKey"),
      type: "select",
      section: t("customField.formSections.identity"),
      options: entityTypeOptions,
      placeholder: t("customField.placeholders.entityTypeKey"),
      required: true,
      description: noFrontendScreenDescription,
      onChange: handleEntityTypeChange,
    },
    {
      name: "key",
      label: t("customField.fields.key"),
      type: "text",
      section: t("customField.formSections.identity"),
      placeholder: t("customField.placeholders.key"),
      required: true,
      pattern: "^[a-z][a-z0-9_]*$",
      patternError:
        t("customField.validation.keyPattern") ||
        "Key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores (e.g. 'national_id')",
      description:
        t("customField.hints.keyFormat") ||
        "Lowercase letters, numbers, and underscores only (e.g. 'national_id')",
    },
    {
      name: "labelEn",
      label: t("customField.fields.labelEn"),
      type: "text",
      section: t("customField.formSections.identity"),
      placeholder: t("customField.placeholders.labelEn"),
      required: true,
    },
    {
      name: "labelAr",
      label: t("customField.fields.labelAr"),
      type: "text",
      section: t("customField.formSections.identity"),
      placeholder: t("customField.placeholders.labelAr"),
    },
  ];
}

/**
 * Builds identity fields for the custom field edit form.
 */
export function buildEditIdentityFields(
  t: (key: string, params?: Record<string, string | number>) => string
): FieldConfig[] {
  return [
    { name: "id", type: "hidden", required: true },
    { name: "valueType", type: "hidden" },
    {
      name: "labelEn",
      label: t("customField.fields.labelEn"),
      type: "text",
      section: t("customField.formSections.identity"),
      placeholder: t("customField.placeholders.labelEn"),
      required: true,
    },
    {
      name: "labelAr",
      label: t("customField.fields.labelAr"),
      type: "text",
      section: t("customField.formSections.identity"),
      placeholder: t("customField.placeholders.labelAr"),
    },
  ];
}

/**
 * Documentation for module export
 */
export interface OptionSetSelectionFieldsArgs {
  t: (key: string, params?: Record<string, string | number>) => string;
  optionSetOptions: { value: string; label: string }[];
  isSetsLoading: boolean;
}

/**
 * Builds options source and option set binding selector fields.
 */
export function buildOptionSetSelectionFields({
  t,
  optionSetOptions,
  isSetsLoading,
}: OptionSetSelectionFieldsArgs): FieldConfig[] {
  return [
    {
      name: "optionsSource",
      label: t("customField.fields.optionsSource"),
      type: "radio",
      section: t("customField.formSections.typeAndValidation"),
      options: [
        { value: "custom", label: t("customField.optionsSource.custom") },
        { value: "optionSet", label: t("customField.optionsSource.optionSet") },
      ],
      description: t("customField.hints.optionsSource"),
      isVisible: (form: Record<string, unknown>) =>
        form.valueType === "Select" || form.valueType === "MultiSelect",
    },
    {
      name: "optionSetVersionId",
      label: t("customField.fields.optionSet"),
      type: "select",
      section: t("customField.formSections.typeAndValidation"),
      options: optionSetOptions,
      placeholder: t("customField.placeholders.selectOptionSet"),
      description: t("customField.hints.optionSetSelect"),
      loading: isSetsLoading,
      required: true,
      isVisible: (form: Record<string, unknown>) =>
        (form.valueType === "Select" || form.valueType === "MultiSelect") &&
        form.optionsSource === "optionSet",
    },
  ];
}
