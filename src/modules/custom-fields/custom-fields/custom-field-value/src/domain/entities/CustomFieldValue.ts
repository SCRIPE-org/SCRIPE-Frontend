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

export interface CustomFieldDateTimeValue {
  value: string;
  timeZoneId: string;
}

export interface CustomFieldCurrencyValue {
  amount: number | string;
  currencyCode: string | null;
}

export interface CustomFieldEntityReferenceValue {
  entityTypeKey: string;
  entityId: string;
}

export interface CustomFieldRichTextValue {
  html: string;
}

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
}

export interface CustomFieldColumnData {
  customFieldId: string;
  key: string;
  labelEn: string;
  labelAr: string | null;
  valueType: CustomFieldValueTypeName;
  options: string[] | null;
  sortOrder: number;
}

export interface BulkEntityCustomFieldValuesData {
  columns: CustomFieldColumnData[];
  valuesByOwnerId: Record<string, Record<string, string | number | boolean | null>>;
  hiddenKeysByOwnerId?: Record<string, string[]> | null;
}
