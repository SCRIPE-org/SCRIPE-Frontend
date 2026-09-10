/**
 * Configuration and visibility predicate for the definition-level reference target picker.
 *
 * CustomField.ReferenceTargetEntityTypeKey defines which entity type an EntityReference custom field
 * points to. These helpers build the field config and manage option resolution.
 */

import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import type { CustomFieldValueTypeName } from "../registries/valueTypeRegistry";
import {
  type RegistryNamedType,
  readWireString,
  formatRegistryTypeOptionLabel,
  compareRegistryTypes,
} from "../utils/registryTypeFormatting";

/** The form-state key and API wire property name. */
export const REFERENCE_TARGET_FIELD_NAME = "referenceTargetEntityTypeKey";

/** Sentinel value for an unpinned reference target. */
export const UNPINNED_REFERENCE_TARGET = "";

const PINNABLE_VALUE_TYPE: CustomFieldValueTypeName = "EntityReference";

/**
 * Returns true if the reference target picker should be visible (EntityReference only).
 */
export function isReferenceTargetPickerVisible(form: Record<string, unknown>): boolean {
  return form.valueType === PINNABLE_VALUE_TYPE;
}

/** Arguments required to build the reference target FieldConfig. */
export interface BuildReferenceTargetFieldArgs {
  t: (key: string) => string;
  language: string;
  types: readonly RegistryNamedType[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isExistingDefinition: boolean;
}

/**
 * Builds the target-entity-type picker's FieldConfig.
 */
export function buildReferenceTargetField({
  t,
  language,
  types,
  isLoading,
  isError,
  isEmpty,
  isExistingDefinition,
}: BuildReferenceTargetFieldArgs): FieldConfig {
  const availableTypes: readonly RegistryNamedType[] = Array.isArray(types) ? types : [];

  const options: FieldOption[] = [
    { value: UNPINNED_REFERENCE_TARGET, label: t("customField.referenceTarget.unpinned") },
    ...availableTypes
      .filter((type) => readWireString(type?.key) !== undefined)
      .sort((a, b) => compareRegistryTypes(a, b, language))
      .map((type) => ({ value: type.key, label: formatRegistryTypeOptionLabel(type, language) })),
  ];

  const description = isError
    ? t("customField.referenceTarget.loadFailed")
    : isEmpty
      ? t("customField.referenceTarget.noneAvailable")
      : isExistingDefinition
        ? `${t("customField.referenceTarget.description")} ${t("customField.referenceTarget.repointWarning")}`
        : t("customField.referenceTarget.description");

  return {
    name: REFERENCE_TARGET_FIELD_NAME,
    label: t("customField.fields.referenceTargetEntityTypeKey"),
    type: "select",
    options,
    loading: isLoading,
    description,
    isVisible: isReferenceTargetPickerVisible,
  };
}
