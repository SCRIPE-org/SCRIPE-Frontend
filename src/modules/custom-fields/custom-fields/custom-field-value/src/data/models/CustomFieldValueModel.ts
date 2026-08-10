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
  valueType: number;
  isRequired: boolean;
  options?: string[] | null;
  sortOrder: number;
  value: string | number | boolean | null;
}
