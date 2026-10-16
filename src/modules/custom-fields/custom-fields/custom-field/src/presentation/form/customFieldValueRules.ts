/**
 * Client-Side Custom Field Value Validation Rules
 *
 * Implements validation rules for specific custom field types (Select, MultiSelect,
 * Currency, EntityReference, Media, RichText) prior to submission.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";
import { MULTI_SELECT_MAX_SELECTIONS } from "../controls/MultiSelect/MultiSelectCustomFieldControl";
import { RICH_TEXT_MAX_CHARACTERS } from "../registries/valueTypeRegistry";

/**
 * Signature for localization translation functions.
 */
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Validates scalar Select and MultiSelect field values against allowed options.
 */
export function validateSelectCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type === "multi-select") {
    return validateMultiSelectCustomFieldValue(fc, value, t);
  }
  if (fc.type !== "select") return null;
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  if (text === "") return null;

  const allowedLabels = fc.options?.map((opt) => opt.label) ?? [];

  if (!allowedLabels.includes(text)) {
    return t("customField.values.selectInvalidOption", {
      value: text,
      field: fc.label ?? fc.name,
    });
  }

  return null;
}

/**
 * Validates MultiSelect field values ensuring cardinality, membership, and uniqueness.
 */
function validateMultiSelectCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value) || value.length === 0) return null;

  if (value.length > MULTI_SELECT_MAX_SELECTIONS) {
    return t("customField.values.multiSelectTooManySelections", {
      field: fc.label ?? fc.name,
      max: MULTI_SELECT_MAX_SELECTIONS,
    });
  }

  const allowedLabels = fc.options?.map((opt) => opt.label) ?? [];
  const seen = new Set<string>();

  for (const raw of value) {
    const text = String(raw).trim();

    if (!allowedLabels.includes(text)) {
      return t("customField.values.selectInvalidOption", {
        value: text,
        field: fc.label ?? fc.name,
      });
    }

    if (seen.has(text)) {
      return t("customField.values.multiSelectDuplicateOption", {
        value: text,
        field: fc.label ?? fc.name,
      });
    }
    seen.add(text);
  }

  return null;
}

/**
 * Validates Currency composite values ensuring both amount and currency code are present when partially populated.
 */
export function validateCurrencyCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "currency") return null;
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;

  const { amount, currencyCode } = value as { amount?: unknown; currencyCode?: unknown };
  const amountMissing = amount === undefined || amount === null || amount === "";
  const codeMissing = typeof currencyCode !== "string" || currencyCode.trim() === "";

  if (amountMissing && codeMissing) return null;

  if (amountMissing || codeMissing) {
    return t("customField.values.currencyIncomplete", { field: fc.label ?? fc.name });
  }

  return null;
}

/**
 * Validates EntityReference and UserReference values ensuring valid shape and completeness.
 */
export function validateEntityReferenceCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "entity-reference") return null;

  const candidate =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as { entityTypeKey?: unknown; entityId?: unknown })
      : null;
  const typeKey =
    typeof candidate?.entityTypeKey === "string" ? candidate.entityTypeKey.trim() : "";
  const entityId = typeof candidate?.entityId === "string" ? candidate.entityId.trim() : "";

  if (typeKey === "" && entityId === "") {
    return fc.required ? t("validation.required") : null;
  }

  if (typeKey === "" || entityId === "") {
    return t("customField.entityReference.invalid");
  }

  return null;
}

/**
 * Validates Media file and image references ensuring required completeness.
 */
export function validateMediaReferenceCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "media-file" && fc.type !== "media-image") return null;

  const candidate =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as { entityTypeKey?: unknown; entityId?: unknown })
      : null;
  const typeKey =
    typeof candidate?.entityTypeKey === "string" ? candidate.entityTypeKey.trim() : "";
  const entityId = typeof candidate?.entityId === "string" ? candidate.entityId.trim() : "";

  if (typeKey === "" && entityId === "") {
    return fc.required ? t("validation.required") : null;
  }

  if (typeKey === "" || entityId === "") {
    return t("customField.values.mediaReferenceIncomplete", { field: fc.label ?? fc.name });
  }

  return null;
}

/**
 * Validates RichText values checking envelope shape, content length, and required status.
 */
export function validateRichTextCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "rich-text") return null;

  if (value === null || value === undefined) {
    return fc.required ? t("validation.required") : null;
  }

  const html =
    typeof value === "object" && !Array.isArray(value)
      ? (value as { html?: unknown }).html
      : undefined;

  if (typeof html !== "string") {
    return t("customField.values.richTextInvalidShape", { field: fc.label ?? fc.name });
  }

  if (html.trim() === "") {
    return fc.required ? t("validation.required") : null;
  }

  if (html.length > RICH_TEXT_MAX_CHARACTERS) {
    return t("customField.values.richTextTooLong", {
      field: fc.label ?? fc.name,
      max: RICH_TEXT_MAX_CHARACTERS,
    });
  }

  return null;
}
