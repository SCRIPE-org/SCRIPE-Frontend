/**
 * Client-Side Custom Field Value Validation
 *
 * Provides client-side validation for custom field values prior to form submission,
 * enforcing value-type constraints, required fields, and option membership.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";
import {
  validateSelectCustomFieldValue,
  validateCurrencyCustomFieldValue,
  validateEntityReferenceCustomFieldValue,
  validateMediaReferenceCustomFieldValue,
  validateRichTextCustomFieldValue,
  type TranslateFn,
} from "./customFieldValueRules";

export {
  validateSelectCustomFieldValue,
  validateCurrencyCustomFieldValue,
  validateEntityReferenceCustomFieldValue,
  validateMediaReferenceCustomFieldValue,
  validateRichTextCustomFieldValue,
  type TranslateFn,
};

import { CustomFieldValidationError } from "@core/crud/customFieldsExtension";

export { CustomFieldValidationError };

/**
 * Validates all custom field values against their corresponding field configurations.
 * Iterates through configured fields, applying type-specific validation rules
 * (Select, MultiSelect, Currency, EntityReference, MediaReference, RichText).
 *
 * Throws a `CustomFieldValidationError` on the first invalid field encountered.
 *
 * @param fieldConfigs List of field configurations defining the expected types and constraints.
 * @param values Map of field values being submitted.
 * @param t Translation function for localized error messages.
 */
export function assertSelectCustomFieldValuesValid(
  fieldConfigs: FieldConfig[],
  values: Record<string, unknown>,
  t: TranslateFn
): void {
  for (const fc of fieldConfigs) {
    if (fc.type === "currency") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateCurrencyCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type === "entity-reference") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateEntityReferenceCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type === "media-file" || fc.type === "media-image") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateMediaReferenceCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type === "rich-text") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateRichTextCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type !== "select" && fc.type !== "multi-select") continue;
    const raw = values[fc.name] ?? fc.defaultValue ?? "";
    const error = validateSelectCustomFieldValue(fc, raw, t);
    if (error) {
      throw new CustomFieldValidationError(error);
    }
  }
}
