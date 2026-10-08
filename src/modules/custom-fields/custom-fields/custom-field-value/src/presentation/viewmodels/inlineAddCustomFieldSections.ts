/**
 * Inline Add Custom Field Section Builders
 *
 * Provides reusable field configuration builders for identity, validator parameters,
 * data type validation, and governance fields in the inline custom field creation form.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";
import {
  VALIDATOR_KIND_CATALOG,
  ALL_VALIDATOR_KINDS,
  ALL_VALUE_TYPES,
  type CustomFieldValueTypeName,
  VALUE_TYPE_CATALOG,
} from "../../../../custom-field";

/**
 * Documentation for buildInlineIdentityFields
 */
export function buildInlineIdentityFields(
  t: (key: string, params?: Record<string, string | number>) => string
): FieldConfig[] {
  return [
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
 * Documentation for buildInlineValidatorParamFields
 */
export function buildInlineValidatorParamFields(
  t: (key: string, params?: Record<string, string | number>) => string
): FieldConfig[] {
  return ALL_VALIDATOR_KINDS.filter((kind) => VALIDATOR_KIND_CATALOG[kind].hasParam).map(
    (kind) => {
      const entry = VALIDATOR_KIND_CATALOG[kind];
      const isClosedSet = entry.supportedParamValues !== undefined;
      return {
        name: "validatorParam",
        label: t("customField.fields.validatorParam"),
        type: isClosedSet ? "select" : "text",
        placeholder: isClosedSet ? undefined : t(entry.paramHintKey as string),
        description: t(entry.paramHintKey as string),
        options: isClosedSet
          ? entry.supportedParamValues!.map((code) => ({ value: code, label: code }))
          : undefined,
        isVisible: (form: Record<string, unknown>) =>
          form.valueType === "Text" && form.validatorKind === kind,
        section: t("customField.formSections.typeAndValidation"),
      };
    }
  );
}

/**
 * Documentation for buildInlineClassificationFields
 */
export function buildInlineClassificationFields(
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

/**
 * Documentation for module export
 */
export interface BuildTypeAndValidationFieldsArgs {
  t: (key: string, params?: Record<string, string | number>) => string;
  validatorKindOptions: { value: string; label: string }[];
  validatorParamFields: FieldConfig[];
  referenceTargetField: FieldConfig;
  optionSetOptions: { value: string; label: string }[];
  canViewOptionSets: boolean;
  canBindOptionSets: boolean;
}

/**
 * Documentation for buildInlineTypeAndValidationFields
 */
export function buildInlineTypeAndValidationFields({
  t,
  validatorKindOptions,
  validatorParamFields,
  referenceTargetField,
  optionSetOptions,
  canViewOptionSets,
  canBindOptionSets,
}: BuildTypeAndValidationFieldsArgs): FieldConfig[] {
  return [
    {
      name: "valueType",
      label: t("customField.fields.valueType"),
      type: "select",
      section: t("customField.formSections.typeAndValidation"),
      required: true,
      options: ALL_VALUE_TYPES.map((type) => ({
        value: type,
        label: t(VALUE_TYPE_CATALOG[type].labelKey),
      })),
    },
    {
      name: "placeholderEn",
      label: t("customField.fields.placeholderEn"),
      type: "text",
      section: t("customField.formSections.typeAndValidation"),
      placeholder: t("customField.placeholders.placeholderEn"),
      isVisible: (form: Record<string, unknown>) =>
        VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
    },
    {
      name: "placeholderAr",
      label: t("customField.fields.placeholderAr"),
      type: "text",
      section: t("customField.formSections.typeAndValidation"),
      placeholder: t("customField.placeholders.placeholderAr"),
      isVisible: (form: Record<string, unknown>) =>
        VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
    },
    {
      name: "validatorKind",
      label: t("customField.fields.validatorKind"),
      type: "select",
      section: t("customField.formSections.typeAndValidation"),
      options: validatorKindOptions,
      description: t("customField.validatorKindDescription"),
      isVisible: (form: Record<string, unknown>) => form.valueType === "Text",
    },
    ...validatorParamFields,
    {
      ...referenceTargetField,
      section: t("customField.formSections.typeAndValidation"),
    },
    {
      name: "options",
      label: t("customField.fields.options"),
      type: "bilingual-options",
      section: t("customField.formSections.typeAndValidation"),
      pairedName: "optionsAr",
      placeholder: t("customField.placeholders.optionEn"),
      searchPlaceholder: t("customField.placeholders.optionAr"),
      addLabel: t("customField.actions.addOption"),
      removeLabel: t("customField.actions.removeOption"),
      emptyHint: t("customField.placeholders.optionsEmpty"),
      isVisible: (form: Record<string, unknown>) =>
        VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false,
    },
    {
      name: "optionSetId",
      label: t("customField.optionSetBinding.pickerLabel"),
      type: "select",
      section: t("customField.formSections.typeAndValidation"),
      options: optionSetOptions,
      description: t("customField.optionSetBinding.attachAtCreateHint"),
      isVisible: (form: Record<string, unknown>) =>
        canViewOptionSets &&
        canBindOptionSets &&
        (VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false),
    },
  ];
}
