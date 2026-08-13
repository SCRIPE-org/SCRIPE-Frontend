import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import {
  encodeCustomFieldName,
  registerCustomFieldsExtension,
  type BulkColumnValuesResult,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { customFieldsContainer } from "../../../di";
import type {
  EntityCustomFieldValueData,
  CustomFieldValueTypeName,
} from "../data/models/CustomFieldValueModel";
import { InlineAddCustomFieldDialog } from "../presentation/components/InlineAddCustomFieldDialog";

const VALUE_TYPE_TO_FIELD_TYPE: Record<CustomFieldValueTypeName, FieldConfig["type"]> = {
  Text: "text",
  Number: "number",
  Boolean: "switch",
  Date: "date",
  Select: "select",
};

/** Exported for the unit test above; not part of CustomFieldsExtensionApi itself. */
export function mapValueToFieldConfig(data: EntityCustomFieldValueData, language: string): FieldConfig {
  const label = language === "ar" && data.labelAr ? data.labelAr : data.labelEn;
  const options: FieldOption[] | undefined = data.options?.map((o) => ({ value: o, label: o }));

  return {
    name: encodeCustomFieldName(data.key),
    label,
    type: VALUE_TYPE_TO_FIELD_TYPE[data.valueType],
    required: data.isRequired,
    options,
    section: "Custom Fields",
    defaultValue: data.value ?? undefined,
  };
}

async function getFormFields(entityTypeKey: string, ownerId?: string): Promise<FieldConfig[]> {
  // Language isn't available outside a component here; the i18n provider's
  // resolved language is read at render time by whatever consumes these
  // labels today (every other CrudConfig in the app hard-codes English labels
  // built at config-construction time the same way — see CustomFieldListView.tsx
  // itself, which builds its own labels from `t()` synchronously). English is
  // the safe default; Arabic labelling for dynamically-fetched custom fields
  // is tracked as a follow-up, not a regression — no screen renders Arabic
  // custom-field labels today because no screen renders custom fields at all.
  const results = ownerId
    ? await customFieldsContainer.customFieldValueRepository.getValues(entityTypeKey, ownerId)
    : await customFieldsContainer.customFieldValueRepository.getDefinitions(entityTypeKey);
  return results
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => mapValueToFieldConfig(d, "en"));
}

async function saveValues(
  entityTypeKey: string,
  ownerId: string,
  valuesByCustomFieldKey: Record<string, unknown>
): Promise<void> {
  await customFieldsContainer.customFieldValueRepository.saveValues(
    entityTypeKey,
    ownerId,
    valuesByCustomFieldKey
  );
}

async function getBulkColumnValues(
  entityTypeKey: string,
  ownerIds: string[]
): Promise<BulkColumnValuesResult> {
  return customFieldsContainer.customFieldValueRepository.getBulkValues(entityTypeKey, ownerIds);
}

const customFieldsCrudIntegration: CustomFieldsExtensionApi = {
  getFormFields,
  saveValues,
  getBulkColumnValues,
  InlineAddTrigger: InlineAddCustomFieldDialog,
};

registerCustomFieldsExtension(customFieldsCrudIntegration);

export { customFieldsCrudIntegration };
