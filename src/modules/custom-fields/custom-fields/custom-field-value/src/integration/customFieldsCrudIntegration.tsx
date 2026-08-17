import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import {
  encodeCustomFieldName,
  registerCustomFieldsExtension,
  type BulkColumnValuesResult,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { customFieldsContainer } from "../../../di";
import type { EntityCustomFieldValueData } from "../data/models/CustomFieldValueModel";
import { InlineAddCustomFieldDialog } from "../presentation/components/InlineAddCustomFieldDialog";
import { formatCustomFieldValue } from "../../../custom-field/src/presentation/formatCustomFieldValue";
import { VALUE_TYPE_CATALOG } from "../../../custom-field/src/presentation/valueTypeRegistry";

/** Exported for the unit test above; not part of CustomFieldsExtensionApi itself. */
export function mapValueToFieldConfig(data: EntityCustomFieldValueData, language: string): FieldConfig {
  const label = language === "ar" && data.labelAr ? data.labelAr : data.labelEn;
  // Same fallback shape as label: the Arabic placeholder wins only when both
  // the language is "ar" AND one was actually set, otherwise fall back to
  // English, then to no placeholder at all (undefined, not an empty string --
  // Input/GenericSelect/DatePicker all treat "" as "explicitly blank", which
  // would render as a visible empty placeholder instead of none).
  const placeholder =
    (language === "ar" && data.placeholderAr ? data.placeholderAr : data.placeholderEn) || undefined;
  const options: FieldOption[] | undefined = data.options?.map((o) => ({ value: o, label: o }));

  return {
    name: encodeCustomFieldName(data.key),
    label,
    placeholder,
    type: VALUE_TYPE_CATALOG[data.valueType].fieldConfigType,
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
  // Wave 2 Step 2.2 Task 5: read-side counterpart of getFormFields above --
  // formatCustomFieldValue owns the Number/Boolean/Date/Text-and-Select
  // per-type table-cell formatting buildCustomFieldColumn used to inline
  // directly in `core`.
  formatValueForDisplay: formatCustomFieldValue,
};

registerCustomFieldsExtension(customFieldsCrudIntegration);

export { customFieldsCrudIntegration };
