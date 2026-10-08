import { useMemo } from "react";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import {
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
import {
  buildInlineIdentityFields,
  buildInlineValidatorParamFields,
  buildInlineClassificationFields,
  buildInlineTypeAndValidationFields,
} from "./inlineAddCustomFieldSections";

/**
 * Documentation for module export
 */
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

/**
 * Documentation for useInlineAddCustomFieldFormFields
 */
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
    () => buildInlineValidatorParamFields(t),
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
    () => buildInlineClassificationFields(t),
    [t]
  );

  const scopeField = useMemo(
    () => ({
      ...buildCustomFieldScopeField({ t, isPlatformContext }),
      section: t("customField.formSections.governance"),
    }),
    [t, isPlatformContext]
  );

  const identityFields = useMemo<FieldConfig[]>(
    () => buildInlineIdentityFields(t),
    [t]
  );

  const typeAndValidationFields = useMemo<FieldConfig[]>(
    () =>
      buildInlineTypeAndValidationFields({
        t,
        validatorKindOptions,
        validatorParamFields,
        referenceTargetField,
        optionSetOptions,
        canViewOptionSets,
        canBindOptionSets,
      }),
    [
      t,
      validatorKindOptions,
      validatorParamFields,
      referenceTargetField,
      optionSetOptions,
      canViewOptionSets,
      canBindOptionSets,
    ]
  );

  return useMemo<FieldConfig[]>(
    () => [
      ...identityFields,
      ...typeAndValidationFields,
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
      identityFields,
      typeAndValidationFields,
      fieldGroupField,
      classificationFields,
      scopeField,
    ]
  );
}
