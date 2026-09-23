/**
 * Custom Field Layout and Governance Sections Configuration
 *
 * Provides reusable classification, layout, order, and governance field
 * configurations for custom field creation and editing forms.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Builds classification and data export governance fields.
 */
export function buildClassificationFields(
  t: (key: string, params?: Record<string, string | number>) => string,
  isTenantKeyInitialized?: boolean
): FieldConfig[] {
  const isKeyReady = isTenantKeyInitialized !== false;
  return [
    {
      name: "sensitivity",
      label: t("customField.fields.sensitivity"),
      type: "select",
      section: t("customField.formSections.governance"),
      options: [
        { value: "None", label: t("customField.sensitivity.none") },
        { value: "Internal", label: t("customField.sensitivity.internal") },
        {
          value: "Confidential",
          label: isKeyReady
            ? t("customField.sensitivity.confidential")
            : `${t("customField.sensitivity.confidential")} (${t("customField.sensitivity.requiresKey")})`,
          disabled: !isKeyReady,
        },
        {
          value: "Restricted",
          label: isKeyReady
            ? t("customField.sensitivity.restricted")
            : `${t("customField.sensitivity.restricted")} (${t("customField.sensitivity.requiresKey")})`,
          disabled: !isKeyReady,
        },
      ],
      description: isKeyReady
        ? t("customField.hints.sensitivity")
        : t("customField.hints.sensitivityRequiresKey"),
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
