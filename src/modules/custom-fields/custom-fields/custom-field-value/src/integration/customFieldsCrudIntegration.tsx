import type { FieldConfig } from "@core/ui/forms/generic-form";
import {
  registerCustomFieldsExtension,
  type BulkColumnValuesResult,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { customFieldsContainer } from "../../../di";
import { InlineAddCustomFieldDialog } from "../presentation/components/InlineAddCustomFieldDialog";
import {
  CustomFieldsSection,
  formatCustomFieldValue,
  GenericFormCustomFieldControl,
  useRestrictableCustomFieldKeys, assertSelectCustomFieldValuesValid,
} from "../../../custom-field";
import { mapValueToFieldConfig } from "./mapValueToFieldConfig";

export { mapValueToFieldConfig };

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
    // The sibling fallback reads each field's SERVER-SIDE value, so a rule on an edit form evaluates
    // correctly before the user has touched anything. Built once over the fetched list rather than
    // per field, so it is one closure over a map instead of a scan per lookup per keystroke.
    .map((d, _index, all) =>
      mapValueToFieldConfig(d, "en", (fieldKey) =>
        all.find((candidate) => candidate.key.toLowerCase() === fieldKey.toLowerCase())?.value ?? null
      )
    );
}

/**
 * THE ONE CHOKE POINT every custom-field save passes through, which is why what
 * it does NOT do matters more than what it does.
 *
 * Every custom-field save in the product funnels through this function:
 * `getCustomFieldsExtension()?.saveValues(...)` is what generic-crud-view.tsx
 * and all nine consumer-site save flows call (verified by reading every
 * `saveValues` call site, not assumed).
 *
 * IT DELIBERATELY PERFORMS NO PER-TYPE TRANSLATION, and that is worth stating
 * because a previous revision of this file did. A reference value reads and
 * writes under the SAME property names (`entityTypeKey` + `entityId`) -- see the
 * verified backend trace on `isEntityReferenceValue` in CustomFieldValueModel.ts
 * for why the C# record's `EncryptedEntityId` parameter name is not a wire name.
 * RENAMING EITHER PROPERTY HERE IS A DATA-LOSS BUG, not a cosmetic one: the last
 * revision that renamed `entityId` made every fully-picked reference fail with
 * the 422 meant for a half-filled one, and on a create it failed only after the
 * owner record had already been written -- a saved row with none of its custom
 * field values.
 *
 * So: values go to the repository exactly as the form holds them. No coercion,
 * no `""`-to-null defaulting (that already happened in each caller), no
 * per-value-type branches. If a value type ever does need a wire translation,
 * it belongs in that type's own model module with a test that submits the real
 * shape, not in a loop here.
 */
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

async function revealValue(
  entityTypeKey: string,
  ownerId: string,
  fieldKey: string
): Promise<unknown> {
  return customFieldsContainer.customFieldValueRepository.revealValue(
    entityTypeKey,
    ownerId,
    fieldKey
  );
}

const customFieldsCrudIntegration: CustomFieldsExtensionApi = {
  getFormFields,
  saveValues,
  getBulkColumnValues,
  revealValue,
  InlineAddTrigger: InlineAddCustomFieldDialog,
  // EDIT-side counterpart of formatValueForDisplay below: the control a host form
  // draws for a custom-field type `core` declares but cannot render itself
  // (today, "entity-reference"). Registered here rather than imported by
  // generic-form.tsx because that import direction is the one the Dependency Rule
  // forbids -- see GenericFormCustomFieldControl.tsx's own header, and the
  // FieldControl member's doc comment in core/crud/customFieldsExtension.tsx.
  //
  // Without this line every generic CRUD screen with custom fields (30
  // CrudConfig sites declare `entityTypeKey:`, against 8 that call
  // renderCustomFieldControl directly) renders a reference field as core's
  // explicit "this section could not be loaded" state -- correct, but inert. The
  // registration is what makes the picker actually appear there.
  FieldControl: GenericFormCustomFieldControl,
  // Wave 2 Step 2.2 Task 5: read-side counterpart of getFormFields above --
  // formatCustomFieldValue owns the Number/Boolean/Date/Text-and-Select
  // per-type table-cell formatting buildCustomFieldColumn used to inline
  // directly in `core`.
  formatValueForDisplay: formatCustomFieldValue,
  Section: CustomFieldsSection,
  useRestrictableCustomFieldKeys,
  assertValuesValid: assertSelectCustomFieldValuesValid,
};

registerCustomFieldsExtension(customFieldsCrudIntegration);

export { customFieldsCrudIntegration };
