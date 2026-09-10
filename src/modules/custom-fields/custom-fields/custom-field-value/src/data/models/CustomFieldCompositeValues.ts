/**
 * Composite Custom Field Values and Type Guards
 *
 * Defines the specialized value structures for complex custom field types
 * such as DateTime, Currency, EntityReference, and RichText.
 */

/**
 * Composite date-time value containing an ISO UTC timestamp and an IANA timezone identifier.
 */
export interface CustomFieldDateTimeValue {
  value: string;
  timeZoneId: string;
}

/**
 * Composite currency value containing a numeric/string amount and an ISO 4217 currency code.
 */
export interface CustomFieldCurrencyValue {
  amount: number | string;
  currencyCode: string | null;
}

/**
 * Entity reference value containing the target entity type key and encrypted entity ID.
 */
export interface CustomFieldEntityReferenceValue {
  entityTypeKey: string;
  entityId: string;
}

/**
 * Type guard verifying if a value matches the CustomFieldEntityReferenceValue structure.
 */
export function isEntityReferenceValue(v: unknown): v is CustomFieldEntityReferenceValue {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const candidate = v as { entityTypeKey?: unknown; entityId?: unknown };
  return typeof candidate.entityTypeKey === "string" && typeof candidate.entityId === "string";
}

/**
 * Rich text value containing sanitized HTML content.
 */
export interface CustomFieldRichTextValue {
  html: string;
}

/**
 * Type guard verifying if a value matches the CustomFieldRichTextValue structure.
 */
export function isRichTextValue(v: unknown): v is CustomFieldRichTextValue {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  return typeof (v as { html?: unknown }).html === "string";
}
