/**
 * Custom Field Form Sections Configuration
 *
 * Provides reusable field configuration groupings (identity, option sets,
 * classifications, layout, and governance) for custom field creation and editing forms.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";

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

/**
 * Builds classification and data export governance fields.
 */
export function buildClassificationFields(
  t: (key: string, params?: Record<string, string | number>) => string
): FieldConfig[] {
  return [
    {
      name: "sensitivity",
      label: t("customField.fields.sensitivity"),
      type: "select",
      section: t("customField.formSections.governance"),
      options: [
        { value: "None", label: t("customField.sensitivity.none") },
        { value: "Internal", label: t("customField.sensitivity.internal") },
        { value: "Confidential", label: t("customField.sensitivity.confidential") },
        { value: "Restricted", label: t("customField.sensitivity.restricted") },
      ],
      description: t("customField.hints.sensitivity"),
    },
    {
      name: "isExportable",
      label: t("customField.fields.isExportable"),
      type: "switch",
      section: t("customField.formSections.governance"),
      description: t("customField.hints.isExportable"),
    },
  ];
}

export interface LayoutAndGovernanceArgs {
  fieldGroupField: FieldConfig;
  classificationFields: FieldConfig[];
  t: (key: string, params?: Record<string, string | number>) => string;
  scopeField?: FieldConfig;
}

/**
 * Builds layout, order, and governance fields for definition creation.
 */
export function buildCreateLayoutFields({
  fieldGroupField,
  classificationFields,
  t,
  scopeField,
}: LayoutAndGovernanceArgs): FieldConfig[] {
  return [
    fieldGroupField,
    {
      name: "sortOrder",
      label: t("customField.fields.sortOrder"),
      type: "number",
      section: t("customField.formSections.layout"),
      min: 0,
    },
    {
      name: "isRequired",
      label: t("customField.fields.isRequired"),
      type: "switch",
      section: t("customField.formSections.governance"),
    },
    ...classificationFields,
    ...(scopeField ? [scopeField] : []),
  ];
}

/**
 * Builds layout, order, and governance fields for definition editing.
 */
export function buildEditLayoutFields({
  fieldGroupField,
  classificationFields,
  t,
}: LayoutAndGovernanceArgs): FieldConfig[] {
  return [
    fieldGroupField,
    {
      name: "sortOrder",
      label: t("customField.fields.sortOrder"),
      type: "number",
      section: t("customField.formSections.layout"),
      min: 0,
    },
    {
      name: "isRequired",
      label: t("customField.fields.isRequired"),
      type: "switch",
      section: t("customField.formSections.governance"),
    },
    ...classificationFields,
    {
      name: "isActive",
      label: t("customField.fields.isActive"),
      type: "switch",
      section: t("customField.formSections.governance"),
    },
  ];
}
