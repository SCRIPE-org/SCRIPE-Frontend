/**
 * Custom Field Value Type Catalog Data
 *
 * Provides presentation catalog entries and metadata for each supported custom field value type,
 * mapping value types to their corresponding UI input controls, badge styles, and capabilities.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

/**
 * Badge style tone for representing value types in administrative and read-only views.
 */
export type ValueTypeBadgeVariant = "default" | "secondary" | "info" | "success" | "warning";

/**
 * Configuration descriptor for a custom field value type.
 */
export interface ValueTypeCatalogEntry {
  /** The input control type used when editing values of this type. */
  fieldConfigType: FieldConfig["type"];
  /** Visual badge style variant for definitions and list displays. */
  badgeVariant: ValueTypeBadgeVariant;
  /** Indicates whether the field type supports a placeholder prompt. */
  hasPlaceholder: boolean;
  /** Indicates whether the field type utilizes an options list (e.g. Select, MultiSelect). */
  hasOptions: boolean;
  /** Localization key for rendering the human-readable type label. */
  labelKey: string;
}

/**
 * Registry mapping each custom field value type to its presentation and editing characteristics.
 */
export const VALUE_TYPE_CATALOG: Record<CustomFieldValueTypeName, ValueTypeCatalogEntry> = {
  Text: {
    fieldConfigType: "text",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.text",
  },
  Number: {
    fieldConfigType: "number",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.number",
  },
  Boolean: {
    fieldConfigType: "switch",
    badgeVariant: "success",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.boolean",
  },
  Date: {
    fieldConfigType: "date",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.date",
  },
  Select: {
    fieldConfigType: "select",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: true,
    labelKey: "customField.valueTypes.select",
  },
  LongText: {
    fieldConfigType: "textarea",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.longText",
  },
  DateTime: {
    fieldConfigType: "datetime",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.dateTime",
  },
  MultiSelect: {
    fieldConfigType: "multi-select",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: true,
    labelKey: "customField.valueTypes.multiSelect",
  },
  Email: {
    fieldConfigType: "email",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.email",
  },
  Url: {
    fieldConfigType: "url",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.url",
  },
  Phone: {
    fieldConfigType: "tel",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.phone",
  },
  Percent: {
    fieldConfigType: "number",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.percent",
  },
  Rating: {
    fieldConfigType: "slider",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.rating",
  },
  Currency: {
    fieldConfigType: "currency",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.currency",
  },
  Duration: {
    fieldConfigType: "duration",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.duration",
  },
  Time: {
    fieldConfigType: "time",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.time",
  },
  Color: {
    fieldConfigType: "color",
    badgeVariant: "secondary",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.color",
  },
  EntityReference: {
    fieldConfigType: "entity-reference",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.entityReference",
  },
  UserReference: {
    fieldConfigType: "entity-reference",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.userReference",
  },
  File: {
    fieldConfigType: "media-file",
    badgeVariant: "default",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.file",
  },
  Image: {
    fieldConfigType: "media-image",
    badgeVariant: "default",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.image",
  },
  RichText: {
    fieldConfigType: "rich-text",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.richText",
  },
};
