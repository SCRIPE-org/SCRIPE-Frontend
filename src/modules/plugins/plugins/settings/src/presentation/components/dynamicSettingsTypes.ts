/**
 * @file dynamicSettingsTypes.ts
 * @description Type contracts and schema models for dynamic plugin settings forms.
 * Provides schema validation types, field definitions, and default value helpers.
 */

/**
 * Supported primitive and composite data types for plugin settings fields.
 */
export type SettingsFieldType = "string" | "number" | "boolean" | "select" | "textarea";

/**
 * Option entry for selection-based settings fields.
 */
export interface SettingsSelectOption {
  /** Machine-readable value stored in the configuration payload. */
  value: string;
  /** Human-readable display label. */
  label: string;
}

/**
 * JSON Schema definition for an individual configurable plugin settings field.
 */
export interface JsonSchemaField {
  /** Unique configuration property key. */
  key: string;
  /** Human-readable display label for the field. */
  label: string;
  /** Optional descriptive explanation or placeholder text. */
  description?: string;
  /** The data input type for rendering the appropriate control. */
  type: SettingsFieldType;
  /** Whether this field is mandatory before form submission. */
  required?: boolean;
  /** Initial fallback value when no user configuration exists. */
  default?: string | number | boolean;
  /** Available choices when type is configured as 'select'. */
  options?: SettingsSelectOption[];
  /** Minimum allowable numeric threshold when type is 'number'. */
  min?: number;
  /** Maximum allowable numeric threshold when type is 'number'. */
  max?: number;
}

/**
 * Complete settings schema definition representing a plugin configuration form.
 */
export interface PluginSettingsSchema {
  /** Optional heading title for the settings section. */
  title?: string;
  /** Optional narrative description for the section. */
  description?: string;
  /** Ordered collection of settings field specifications. */
  fields: JsonSchemaField[];
}

/**
 * Key-value mapping representing the current configured settings state.
 */
export type SettingsValues = Record<string, string | number | boolean>;

/**
 * Props for the root dynamic settings form container.
 */
export interface DynamicSettingsFormProps {
  /** JSON schema describing the form fields, layouts, and constraints. */
  schema: PluginSettingsSchema;
  /** Initial or existing saved configuration values. */
  initialValues?: SettingsValues;
  /** Asynchronous persistence handler invoked upon successful submission. */
  onSave: (values: SettingsValues) => Promise<void>;
  /** Indicates whether an active persistence operation is in progress. */
  isSaving?: boolean;
}

/**
 * Props for individual settings field renderer controls.
 */
export interface SettingsFieldProps {
  /** Field schema specification and metadata. */
  field: JsonSchemaField;
  /** Current value bound to the field. */
  value: string | number | boolean;
  /** Optional validation error message for display. */
  error?: string;
  /** Change callback triggered when the field value mutates. */
  onChange: (key: string, value: string | number | boolean) => void;
  /** Localized placeholder text for select dropdowns. */
  selectPlaceholder: string;
}

/**
 * Resolves an initial empty or default value based on the field type.
 *
 * @param type The schema field type.
 * @returns The primitive fallback value.
 */
export function getEmptyDefault(type: SettingsFieldType): string | number | boolean {
  switch (type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    default:
      return "";
  }
}
