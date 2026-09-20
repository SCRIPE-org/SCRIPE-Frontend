import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import { encodeCustomFieldName } from "@core/crud/customFieldsExtension";
import { VALUE_TYPE_CATALOG } from "../../../custom-field";
import type { EntityCustomFieldValueData } from "../data/models/CustomFieldValueModel";
import { isFieldVisible } from "../domain/fieldVisibility";

/**
 * Maps an entity custom field value definition into a generic form FieldConfig.
 * Exported for unit tests and CRUD integration.
 */
export function mapValueToFieldConfig(
  data: EntityCustomFieldValueData,
  language: string,
  /** Reads a sibling field's SERVER-SIDE value, for rules evaluated before the user touches the form. */
  siblingFallback?: (fieldKey: string) => unknown
): FieldConfig {
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
    // Guarded, not a direct index: `data.valueType` is wire data with no
    // runtime validation anywhere upstream (CustomFieldValueService.ts
    // returns raw JSON untouched -- the wire contract is enforced only by a
    // doc comment, never a discriminated union or runtime guard). Every
    // OTHER VALUE_TYPE_CATALOG lookup on externally-sourced data already
    // follows this `?? fallback` discipline (Task 6's own
    // CustomFieldListView.tsx/InlineAddCustomFieldDialog.tsx guards,
    // CustomFieldListView.unsetValueTypeVisibility.test.ts pins it) -- this
    // one was the sole exception, and an un-guarded index throws
    // `TypeError: Cannot read properties of undefined (reading
    // 'fieldConfigType')` for any type this catalog doesn't (yet) know
    // about, e.g. a backend-first Wave 3 deploy of a 6th type before the
    // frontend redeploys. Since this runs inside getFormFields's `.map()`,
    // ONE unknown type would otherwise throw for the WHOLE list and take
    // down the custom-fields section on all 8 consumer sites at once.
    // "text" restores the exact pre-catalog behavior: the old
    // `VALUE_TYPE_TO_FIELD_TYPE[data.valueType]` Record index also returned
    // `undefined` for an unknown key, and renderCustomFieldControl's own
    // final fallthrough already renders an undefined/unrecognized fc.type as
    // a plain text Input -- so `"text"` here is not a new decision, it's the
    // literal value that behavior already resolved to.
    type: VALUE_TYPE_CATALOG[data.valueType]?.fieldConfigType ?? "text",
    required: data.isRequired,
    options,
    section: "Custom Fields",
    defaultValue: data.value ?? undefined,
    // ── Wave 4 follow-up: the definition's pinned reference target ──────────────────────────────
    //
    // Carried straight through, with no ValueType branch, because the SERVER already applied one:
    // `ResolveTargetEntityType` returns null for every non-reference type, so a Text field's wire
    // payload has nothing here to forward. Branching on `data.valueType` again would be a second,
    // frontend-side copy of that rule that could disagree with it after the next value type lands.
    //
    // WHY THIS IS THE ONLY PLUMBING SITE. Every FieldConfig the product renders for a custom field
    // is built here: `useCustomFieldsFormFields` (core/crud/customFieldsExtension.tsx) calls the
    // registered extension's `getFormFields`, which is this file's, which maps through this
    // function — and the nine consumer sites receive the finished `FieldConfig[]` and only hand each
    // entry to `renderCustomFieldControl`. Verified by reading each `customFieldConfigs`/
    // `fieldConfigs` producer, not assumed: none of them constructs a FieldConfig itself.
    //
    // `?? undefined` rather than `?? null`, so a non-reference field's config simply has no opinion
    // here instead of an explicit null on every one of them. Both read identically downstream (the
    // control treats null and undefined as "no target"), so the quieter object wins.
    referenceTargetEntityTypeKey: data.referenceTargetEntityTypeKey ?? undefined,
    // ── Wave 5 row 5.3: visibility rules, evaluated LIVE against the open form ──────────────────
    //
    // Attached only when the field actually has rules, so a field without them keeps a plain
    // undefined `isVisible` and behaves exactly as before.
    //
    // `isVisible` is the right hook rather than a new mechanism: generic-form already consults it
    // both when RENDERING a field and when deciding whether to VALIDATE it, so a hidden required
    // field cannot block submission — which matters because the server refuses that combination at
    // configuration time and this keeps the client agreeing with it.
    //
    // The lookup goes through encodeCustomFieldName because form state is namespaced: a rule names a
    // sibling by its plain custom-field key ("status"), while the form holds it under "__cf__status".
    // Falling back to the sibling's own stored value is deliberate — on an EDIT form a field the user
    // has not touched may not be in form state yet, and treating that as absent would hide a field
    // that should be showing.
    ...(data.visibilityRules && data.visibilityRules.length > 0
      ? {
          isVisible: (formData: Record<string, unknown>) =>
            isFieldVisible(data.visibilityRules, (fieldKey) => {
              const encoded = encodeCustomFieldName(fieldKey);
              return encoded in formData ? formData[encoded] : siblingFallback?.(fieldKey);
            }),
        }
      : {}),
  };
}
