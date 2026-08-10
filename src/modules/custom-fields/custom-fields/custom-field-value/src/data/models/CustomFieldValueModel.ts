/**
 * CustomFieldValueType wire names -- mirrors backend enum member names verbatim
 * (CustomFields.Domain.Enums.CustomFieldValueType). The API's global
 * JsonStringEnumConverter serializes enums as strings, so this is never a
 * number on the wire.
 */
export type CustomFieldValueTypeName = "Text" | "Number" | "Boolean" | "Date" | "Select";

/**
 * CustomFieldValue wire shape — one entity type's active definition merged with
 * its stored value (if any) for a specific owner record. Value's runtime type
 * follows valueType: string (Text/Select), number (Number), boolean (Boolean),
 * ISO-8601 UTC string (Date), or null.
 */
export interface EntityCustomFieldValueData {
  customFieldId: string;
  key: string;
  labelEn: string;
  labelAr?: string | null;
  valueType: CustomFieldValueTypeName;
  isRequired: boolean;
  options?: string[] | null;
  sortOrder: number;
  value: string | number | boolean | null;
}
