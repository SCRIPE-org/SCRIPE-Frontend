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

/**
 * One active custom-field definition shaped as a table-column header --
 * deliberately thinner than EntityCustomFieldValueData (no isRequired, no
 * per-row value): those don't vary per column, only per cell. Mirrors
 * CustomFields.Application.DTOs.CustomFieldColumnResponse.
 */
export interface CustomFieldColumnData {
  customFieldId: string;
  key: string;
  labelEn: string;
  labelAr: string | null;
  valueType: CustomFieldValueTypeName;
  options: string[] | null;
  sortOrder: number;
}

/**
 * Wire shape of POST /custom-fields/values/{entityTypeKey}/bulk -- active
 * definitions for entityTypeKey (as column headers) plus every requested
 * owner's stored values, keyed first by the exact (encrypted) owner id
 * string the caller sent, then by each definition's machine `key`. An owner
 * id the server couldn't verify (wrong tenant, deleted, malformed) is simply
 * absent from valuesByOwnerId -- render that row's custom-field cells empty,
 * not an error. Mirrors CustomFields.Application.DTOs.BulkEntityCustomFieldValuesResponse.
 */
export interface BulkEntityCustomFieldValuesData {
  columns: CustomFieldColumnData[];
  valuesByOwnerId: Record<string, Record<string, string | number | boolean | null>>;
}
