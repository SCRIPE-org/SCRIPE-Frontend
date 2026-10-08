/**
 * CustomFieldValue Domain Contracts & Types
 *
 * Clean Architecture domain layer contracts for custom field values.
 */

export type CustomFieldValueTypeName =
  | "Text"
  | "Number"
  | "Boolean"
  | "Date"
  | "Select"
  | "LongText"
  | "DateTime"
  | "MultiSelect"
  | "Email"
  | "Url"
  | "Phone"
  | "Percent"
  | "Rating"
  | "Currency"
  | "Duration"
  | "Time"
  | "Color"
  | "EntityReference"
  | "UserReference"
  | "File"
  | "Image"
  | "RichText";

/**
 * Documentation for module export
 */
export interface CustomFieldDateTimeValue {
  value: string;
  timeZoneId: string;
}

/**
 * Documentation for module export
 */
export interface CustomFieldCurrencyValue {
  amount: number | string;
  currencyCode: string | null;
}

/**
 * Documentation for module export
 */
export interface CustomFieldEntityReferenceValue {
  entityTypeKey: string;
  entityId: string;
}

/**
 * Documentation for module export
 */
export function isEntityReferenceValue(v: unknown): v is CustomFieldEntityReferenceValue {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const candidate = v as { entityTypeKey?: unknown; entityId?: unknown };
  return typeof candidate.entityTypeKey === "string" && typeof candidate.entityId === "string";
}

/**
 * Documentation for module export
 */
export interface CustomFieldRichTextValue {
  html: string;
}

/**
 * Documentation for module export
 */
export function isRichTextValue(v: unknown): v is CustomFieldRichTextValue {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const candidate = v as { html?: unknown };
  return typeof candidate.html === "string";
}

/**
 * Documentation for module export
 */
export interface EntityCustomFieldValueData {
  customFieldId: string;
  key: string;
  labelEn: string;
  labelAr?: string | null;
  placeholderEn?: string | null;
  placeholderAr?: string | null;
  valueType: CustomFieldValueTypeName;
  isRequired: boolean;
  options?: string[] | null;
  sortOrder: number;
  value:
    | string
    | number
    | boolean
    | string[]
    | CustomFieldDateTimeValue
    | CustomFieldCurrencyValue
    | CustomFieldEntityReferenceValue
    | CustomFieldRichTextValue
    | null;
  hiddenByRule?: boolean;
  sensitivity?: number;
  isMasked?: boolean;
}

/**
 * Documentation for module export
 */
export interface CustomFieldColumnData {
  customFieldId: string;
  key: string;
  labelEn: string;
  labelAr: string | null;
  valueType: CustomFieldValueTypeName;
  options: string[] | null;
  sortOrder: number;
  sensitivity?: number;
}

/**
 * Documentation for module export
 */
export interface BulkEntityCustomFieldValuesData {
  columns: CustomFieldColumnData[];
  valuesByOwnerId: Record<string, Record<string, string | number | boolean | null>>;
  hiddenKeysByOwnerId?: Record<string, string[]> | null;
}
