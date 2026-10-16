/**
 * Custom Field Value Data Models
 *
 * Defines API payload structures for entity custom field values, table column
 * metadata, and bulk value response envelopes.
 */

import type { FieldVisibilityRuleData } from "../../domain/fieldVisibility";
import type { CustomFieldValueTypeName } from "../../domain/entities/CustomFieldValue";
import type {
  CustomFieldDateTimeValue,
  CustomFieldCurrencyValue,
  CustomFieldEntityReferenceValue,
  CustomFieldRichTextValue,
} from "./CustomFieldCompositeValues";

/**
 * Documentation for module export
 */
export type { CustomFieldValueTypeName };

export type {
  CustomFieldDateTimeValue,
  CustomFieldCurrencyValue,
  CustomFieldEntityReferenceValue,
  CustomFieldRichTextValue,
};

export { isEntityReferenceValue, isRichTextValue } from "./CustomFieldCompositeValues";

/**
 * CustomFieldValue wire shape — an entity type's active definition merged with
 * its stored value (if any) for a specific owner record.
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
  /**
   * True when a visibility rule hides this field for this record's current state.
   */
  isHidden?: boolean;
  /**
   * Active visibility rules governing this field, enabling live client-side re-evaluation.
   */
  visibilityRules?: FieldVisibilityRuleData[] | null;
  /**
   * Target entity type key for EntityReference and UserReference fields.
   */
  referenceTargetEntityTypeKey?: string | null;
  sensitivity?: number;
  isMasked?: boolean;
}

/**
 * Column definition for custom field values displayed in data tables.
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
 * Envelope for bulk entity custom field values retrieved by owner records.
 */
export interface BulkEntityCustomFieldValuesData {
  columns: CustomFieldColumnData[];
  valuesByOwnerId: Record<string, Record<string, string | number | boolean | null>>;
  /**
   * Field keys hidden by visibility rules per owner ID.
   */
  hiddenKeysByOwnerId?: Record<string, string[]> | null;
}
