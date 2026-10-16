/**
 * Custom Field Value Type Registry
 *
 * Provides safe access to custom field value type definitions, capability checks,
 * constraint constants, and the complete catalog of supported value types.
 */

import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import {
  VALUE_TYPE_CATALOG,
  type ValueTypeCatalogEntry,
  type ValueTypeBadgeVariant,
} from "./valueTypeCatalogData";

/**
 * Documentation for "../../../../custom-field-value/src/data/models/CustomFieldValueModel"
 */
export type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
/**
 * Documentation for module export
 */
export type { ValueTypeBadgeVariant, ValueTypeCatalogEntry };
export { VALUE_TYPE_CATALOG };

/**
 * Bounds for Rating custom field values (1 to 5 inclusive).
 */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/**
 * Maximum character length allowed for RichText custom field markup (50,000 characters).
 */
export const RICH_TEXT_MAX_CHARACTERS = 50_000;

/**
 * Safely looks up the catalog entry for a given value type name string.
 * Returns `undefined` if the type is unrecognized, allowing callers to handle fallbacks safely.
 *
 * @param type The raw value type name string.
 */
export function getValueTypeCatalogEntry(type: string): ValueTypeCatalogEntry | undefined {
  return VALUE_TYPE_CATALOG[type as CustomFieldValueTypeName];
}

/**
 * Determines whether a custom field value type utilizes a configured options list.
 *
 * @param type The value type name string.
 */
export function hasOptionsList(type: string): boolean {
  return getValueTypeCatalogEntry(type)?.hasOptions ?? false;
}

/**
 * Complete list of all supported custom field value type names in declaration order.
 */
export const ALL_VALUE_TYPES: readonly CustomFieldValueTypeName[] = [
  "Text",
  "Number",
  "Boolean",
  "Date",
  "Select",
  "LongText",
  "DateTime",
  "MultiSelect",
  "Email",
  "Url",
  "Phone",
  "Percent",
  "Rating",
  "Currency",
  "Duration",
  "Time",
  "Color",
  "EntityReference",
  "UserReference",
  "File",
  "Image",
  "RichText",
];
