import { useMemo } from "react";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
  type CustomFieldValueTypeName,
  VALIDATOR_KIND_CATALOG,
  ALL_VALIDATOR_KINDS,
} from "../../../../custom-field";
import {
  buildFieldGroupField,
  makeFieldGroupPickerVisibility,
} from "../../../../custom-field/src/presentation/form/fieldGroupFieldConfig";
import { buildReferenceTargetField } from "../../../../custom-field/src/presentation/form/referenceTargetFieldConfig";
import { buildCustomFieldScopeField } from "../../../../custom-field/src/presentation/form/customFieldScopeFieldConfig";
import type { EntityLookupType } from "../../../../entity-lookup/src/domain/entities/EntityLookup";
import type { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";

export interface UseInlineAddCustomFieldFormFieldsParams {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  isPlatformContext: boolean;
  canViewFieldGroups: boolean;
  fieldGroupOptions: readonly GenericSelectOption[];
  isFieldGroupsLoading: boolean;
  isFieldGroupsError: boolean;
  referenceTargetTypes: readonly EntityLookupType[];
  isReferenceTargetTypesLoading: boolean;
  isReferenceTargetTypesError: boolean;
  isReferenceTargetTypesEmpty: boolean;
  canViewOptionSets: boolean;
  canBindOptionSets: boolean;
  bindableOptionSets: readonly OptionSet[];
}

export function useInlineAddCustomFieldFormFields({
  t,
  language,
  isPlatformContext,
  canViewFieldGroups,
  fieldGroupOptions,
  isFieldGroupsLoading,
  isFieldGroupsError,
  referenceTargetTypes,
  isReferenceTargetTypesLoading,
  isReferenceTargetTypesError,
  isReferenceTargetTypesEmpty,
  canViewOptionSets,
  canBindOptionSets,
  bindableOptionSets,
}: UseInlineAddCustomFieldFormFieldsParams): FieldConfig[] {
  const validatorKindOptions = useMemo(
    () => [
      { value: "", label: t("customField.validatorKindNone") },
      ...ALL_VALIDATOR_KINDS.map((kind) => ({
        value: kind,
        label: t(VALIDATOR_KIND_CATALOG[kind].labelKey),
      })),
    ],
    [t]
  );

  const validatorParamFields = useMemo<FieldConfig[]>(
    () =>
      ALL_VALIDATOR_KINDS.filter((kind) => VALIDATOR_KIND_CATALOG[kind].hasParam).map((kind) => {
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
          isVisible: (form) => form.valueType === "Text" && form.validatorKind === kind,
        };
      }),
    [t]
  );

  const optionSetOptions = useMemo(
    () => [
      { value: "", label: t("customField.optionSetBinding.noneOption") },
      ...bindableOptionSets.map((set) => ({ value: set.id, label: set.displayLabel(language) })),
    ],
    [t, bindableOptionSets, language]
  );

  const fieldGroupField = useMemo(
    () => ({
      ...buildFieldGroupField({
        t,
        options: fieldGroupOptions as GenericSelectOption[],
        isLoading: isFieldGroupsLoading,
        isError: isFieldGroupsError,
      }),
      isVisible: makeFieldGroupPickerVisibility({
        canView: canViewFieldGroups,
        requireEntityType: false,
      }),
    }),
    [t, fieldGroupOptions, isFieldGroupsLoading, isFieldGroupsError, canViewFieldGroups]
  );

  const referenceTargetField = useMemo(
    () =>
      buildReferenceTargetField({
        t,
        language,
        types: referenceTargetTypes,
        isLoading: isReferenceTargetTypesLoading,
        isError: isReferenceTargetTypesError,
        isEmpty: isReferenceTargetTypesEmpty,
        isExistingDefinition: false,
      }),
    [
      t,
      language,
      referenceTargetTypes,
      isReferenceTargetTypesLoading,
      isReferenceTargetTypesError,
      isReferenceTargetTypesEmpty,
    ]
  );

  const classificationFields = useMemo<FieldConfig[]>(
    () => [
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
    ],
    [t]
  );

  const scopeField = useMemo(
    () => ({
      ...buildCustomFieldScopeField({ t, isPlatformContext }),
      section: t("customField.formSections.governance"),
    }),
    [t, isPlatformContext]
  );

  return useMemo<FieldConfig[]>(
    () => [
      // 1. Basic Information
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
      // 2. Data Type & Validation
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
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
      },
      {
        name: "placeholderAr",
        label: t("customField.fields.placeholderAr"),
        type: "text",
        section: t("customField.formSections.typeAndValidation"),
        placeholder: t("customField.placeholders.placeholderAr"),
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
      },
      {
        name: "validatorKind",
        label: t("customField.fields.validatorKind"),
        type: "select",
        section: t("customField.formSections.typeAndValidation"),
        options: validatorKindOptions,
        description: t("customField.validatorKindDescription"),
        isVisible: (form) => form.valueType === "Text",
      },
      ...validatorParamFields.map((f) => ({
        ...f,
        section: t("customField.formSections.typeAndValidation"),
      })),
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
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false,
      },
      {
        name: "optionSetId",
        label: t("customField.optionSetBinding.pickerLabel"),
        type: "select",
        section: t("customField.formSections.typeAndValidation"),
        options: optionSetOptions,
        description: t("customField.optionSetBinding.attachAtCreateHint"),
        isVisible: (form) =>
          canViewOptionSets &&
          canBindOptionSets &&
          (VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false),
      },
      // 3. Organization & Grouping
      {
        ...fieldGroupField,
        section: t("customField.formSections.layout"),
      },
      {
        name: "sortOrder",
        label: t("customField.fields.sortOrder"),
        type: "number",
        section: t("customField.formSections.layout"),
        min: 0,
      },
      // 4. Behavior & Governance
      {
        name: "isRequired",
        label: t("customField.fields.isRequired"),
        type: "switch",
        section: t("customField.formSections.governance"),
      },
      ...classificationFields,
      scopeField,
    ],
    [
      t,
      validatorKindOptions,
      validatorParamFields,
      referenceTargetField,
      optionSetOptions,
      canViewOptionSets,
      canBindOptionSets,
      fieldGroupField,
      classificationFields,
      scopeField,
    ]
  );
}
