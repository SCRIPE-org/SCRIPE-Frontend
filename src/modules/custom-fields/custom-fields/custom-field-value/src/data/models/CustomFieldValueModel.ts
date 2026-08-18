/**
 * CustomFieldValueType wire names -- mirrors backend enum member names verbatim
 * (CustomFields.Domain.Enums.CustomFieldValueType). The API's global
 * JsonStringEnumConverter serializes enums as strings, so this is never a
 * number on the wire. Wave 3.1 Task 10 added LongText/DateTime/MultiSelect --
 * the backend enum's members 5/6/7 (see that file's own doc comment for why
 * Date=3 keeps its existing member rather than being renumbered). Wave 3.2
 * Batch 3 adds Email/Url/Phone/Percent/Rating -- members 8/9/10/11/12,
 * verified against the real backend enum (Email=8, Url=9, Phone=10,
 * Percent=11, Rating=12) rather than assumed from the pre-plan analysis.
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
  | "Rating";

/**
 * DateTime's wire shape (Wave 3.1 Task 7, ruling R7): a UTC instant plus a
 * per-value IANA zone id, both required once either piece is submitted --
 * mirrors the backend's `DateTimeZoneInput`/`DateTimeZoneValue` records
 * exactly (`{ "value": <instant>, "timeZoneId": <IANA id> }` on the wire,
 * property names verbatim, see DateTimeValueTypeHandler.cs). `value` is
 * typed as `string` here (an ISO-8601 UTC instant) rather than mirroring the
 * backend's wider `object?` acceptance (string/number/bool) -- every real
 * value this module ever WRITES is a `datetime-local` input string, and
 * every value it ever READS is a serialized `DateTime`, so `string` is the
 * only shape either direction of this module actually produces or expects.
 */
export interface CustomFieldDateTimeValue {
  value: string;
  timeZoneId: string;
}

/**
 * CustomFieldValue wire shape — one entity type's active definition merged with
 * its stored value (if any) for a specific owner record. Value's runtime type
 * follows valueType: string (Text/Select/LongText/Email/Url/Phone -- Wave 3.2
 * Batch 3's three ValueText scalars need no new shape, they are plain strings
 * exactly like Text), number (Number/Percent/Rating -- Batch 3's two
 * ValueNumber scalars are likewise plain numbers, no new shape), boolean
 * (Boolean), ISO-8601 UTC string (Date), string[] (MultiSelect -- selected
 * option labels, order-preserving per R5), CustomFieldDateTimeValue
 * (DateTime), or null.
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
  value: string | number | boolean | string[] | CustomFieldDateTimeValue | null;
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
