/**
 * Generic Form Component
 *
 * A highly flexible and customizable form builder that dynamically renders various input types
 * based on field configuration. Supports internationalization, dynamic styling, and conditional
 * field visibility.
 *
 * @example
 * ```tsx
 * const fields: FieldConfig[] = [
 *   {
 *     name: "username",
 *     label: "Username",
 *     type: "text",
 *     required: true,
 *     placeholder: "Enter your username"
 *   },
 *   {
 *     name: "email",
 *     label: "Email",
 *     type: "email",
 *     required: true,
 *     placeholder: "Enter your email"
 *   }
 * ];
 *
 * <GenericForm
 *   fields={fields}
 *   initialValues={{ username: "john", email: "john@example.com" }}
 *   onSubmit={async (data) => appLogger.ui(data)}
 *   onCancel={() => appLogger.ui("Cancelled")}
 * />
 * ```
 *
 * @author Seif
 * @version 2.0.0
 * @since 1.0.0
 */
"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import GenericSelect from "@core/crud/components/generic-select";
import { Switch } from "@core/ui/switch";
import { Separator } from "@core/ui/separator";
import { Slider } from "@core/ui/slider";
import { Checkbox } from "@core/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, toDateInputValue, fromDateInputValue } from "@core/common/utils";
import { DatePicker } from "@core/ui/date-picker";
import { RichTextEditor } from "@core/ui/rich-text-editor";
import { ImageUploader } from "@core/ui/image-uploader";
import { PasswordInput } from "@core/ui/password-input";
import { usePermissions } from "@core/providers/permission-provider";
import type { PermissionCode } from "@core/common/types/permissions";

/**
 * Field option for select, radio, and other choice-based inputs
 */
export interface FieldOption {
  /** The value of the option (submitted to backend) */
  value: string;
  /** The display label for the option */
  label: string;
  /** Nested options for hierarchical structures (e.g., tree selects) */
  children?: FieldOption[];
  /** Unique key for deduplication when value may change between API calls */
  uniqueKey?: string;
}

/**
 * Configuration object for form fields
 *
 * Defines the structure and behavior of individual form fields,
 * including validation, styling, and conditional logic.
 */
export interface FieldConfig {
  name: string;
  label?: string; // Optional for hidden fields
  type:
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "textarea"
    | "richtext"
    | "select"
    | "searchable-select"
    | "server-select"
    | "multi-select"
    | "tree"
    | "switch"
    | "checkbox"
    | "radio"
    | "slider"
    | "range"
    | "hidden"
    | "date"
    | "datetime"
    | "datetime-local"
    | "time"
    | "month"
    | "week"
    | "color"
    | "file"
    | "image";
  placeholder?: string;
  searchPlaceholder?: string; // For searchable selects
  required?: boolean;
  options?: FieldOption[];
  treeData?: FieldOption[]; // For tree select type
  defaultValue?: any;
  // Input specific options
  min?: number | string; // For number, date, range inputs
  max?: number | string; // For number, date, range inputs
  step?: number | string; // For number, range inputs
  rows?: number; // For textarea
  cols?: number; // For textarea
  accept?: string; // For file inputs and image uploader
  multiple?: boolean; // For file inputs and multi-select
  // Image uploader specific options
  maxSize?: number; // Max file size in bytes (default: 5MB)
  showPreview?: boolean; // Whether to show image preview (default: true)
  aspectRatio?: string; // e.g., "16/9", "1/1"
  // Searchable select specific options
  searchType?: "client" | "server";
  onServerSearch?: (query: string) => Promise<FieldOption[]>;
  searchEndpoint?: string;
  debounceMs?: number;
  allowClear?: boolean;
  noResultsText?: string;
  searchingText?: string;
  // Dynamic field behavior
  dependsOn?: string; // Field name this field depends on
  isVisible?: (formData: Record<string, any>) => boolean; // Function to determine visibility
  onChange?: (value: any, formData: Record<string, any>) => void | Record<string, any>; // Callback when field value changes, can return object to update multiple fields
  loading?: boolean; // Show loading state
  disabled?: boolean; // Disable field
  // Validation
  pattern?: string; // For text inputs
  minLength?: number; // For text inputs
  maxLength?: number; // For text inputs
  // Permissions
  requiredPermission?: PermissionCode;
  requiredPermissions?: PermissionCode[];
  // Helper/description text (shown below the field)
  description?: string;
  // Section layout (absent on every field = current flat single-column behaviour)
  section?: string; // Title of the hairline-ruled group; consecutive fields with the same section are grouped
  colSpan?: 1 | 2; // Width in the two-column section grid; any colSpan in a group switches it to sm:grid-cols-2
}

/**
 * Wave K collapse: formStyle used to re-skin the FIELDS — cyan-on-black
 * "neon", slate "elegant", green "organic", orange "retro", a glass wash and a
 * gradient card, all in raw colour literals with dark: forks. Field skin has
 * exactly one owner now (Settings inputStyle, applied inside Input / Textarea
 * / Select), so formStyle keeps only what it can honestly control: the
 * CONTAINER and the DENSITY. Retired decorative values resolve onto the
 * nearest survivor; the stored-value migration itself is Wave C's job.
 */
const FORM_CONTAINER: Record<string, "flat" | "card" | "minimal"> = {
  card: "card",
  modern: "card",
  glass: "card",
  minimal: "minimal",
};

/**
 * Props for the GenericForm component
 */
interface GenericFormProps {
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean; // New prop for read-only mode
}

/**
 * Generic Form Component
 *
 * Renders a dynamic form based on field configuration with support for:
 * - Multiple input types (text, select, date, file, etc.)
 * - Conditional field visibility
 * - Internationalization
 * - Dynamic styling based on settings
 * - Form validation
 * - Read-only mode
 *
 * @param props - The component props
 * @param props.fields - Array of field configurations
 * @param props.initialValues - Initial form values
 * @param props.onSubmit - Callback when form is submitted
 * @param props.onCancel - Callback when form is cancelled
 * @param props.readOnly - Whether the form is in read-only mode
 * @returns JSX element representing the form
 */
export function GenericForm({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  readOnly = false,
}: GenericFormProps) {
  const settings = useSettings();
  const { t, direction } = useI18n();
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Helper function to initialize form data with default values
  const initializeFormData = React.useCallback(
    (currentFields: FieldConfig[], currentInitialValues: Record<string, any>) => {
      const data = { ...currentInitialValues };
      // Set default values for fields that have them and convert dates for HTML inputs
      currentFields.forEach((field) => {
        if (field.defaultValue !== undefined && data[field.name] === undefined) {
          data[field.name] = field.defaultValue;
        }
        // Convert date fields from API format to HTML input format
        if (
          (field.type === "date" ||
            field.type === "datetime" ||
            field.type === "datetime-local" ||
            field.type === "time" ||
            field.type === "month" ||
            field.type === "week") &&
          data[field.name]
        ) {
          data[field.name] = toDateInputValue(data[field.name]);
        }
      });
      return data;
    },
    []
  );

  const [formData, setFormData] = useState<Record<string, any>>(() =>
    initializeFormData(fields, initialValues)
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-initialize form data when fields change (for dynamic forms)
  // IMPORTANT: Only populate values for NEW fields that don't exist in the current
  // form data. Never overwrite existing user-typed values with initialValues.
  React.useEffect(() => {
    setFormData((prevData) => {
      const preservedData = { ...prevData };
      fields.forEach((field) => {
        // Only set default/initial value if this field has NO value yet
        if (preservedData[field.name] === undefined) {
          if (field.defaultValue !== undefined) {
            preservedData[field.name] = field.defaultValue;
          } else if (initialValues[field.name] !== undefined) {
            preservedData[field.name] = initialValues[field.name];
          }
        }
      });
      return preservedData;
    });
  }, [fields, initializeFormData, initialValues]);

  const handleChange = (name: string, value: any) => {
    // Clear error when user changes the field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Find the field that changed and call its onChange callback if it exists
      const field = fields.find((f) => f.name === name);
      if (field?.onChange) {
        const result = field.onChange(value, newData);
        // If onChange returns an object, merge it into newData to update multiple fields
        if (result && typeof result === "object" && !Array.isArray(result)) {
          return { ...newData, ...result };
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields for custom components (select, searchable-select, etc.)
    // Native HTML inputs handle required validation via browser, but custom components need manual checks
    const customTypes = new Set([
      "select",
      "searchable-select",
      "server-select",
      "multi-select",
      "tree",
      "switch",
      "checkbox",
      "radio",
      "slider",
      "range",
      "date",
      "datetime",
      "datetime-local",
      "time",
      "month",
      "week",
      "image",
      "richtext",
    ]);

    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      // Skip fields that aren't visible
      if (field.isVisible && !field.isVisible(formData)) return;
      // Skip fields that don't require validation
      if (!field.required) return;
      // Only validate custom component types (native inputs are validated by browser)
      if (!customTypes.has(field.type)) return;

      const val = formData[field.name];
      const isEmpty =
        val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);

      if (isEmpty) {
        newErrors[field.name] = t("validation.required") || "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      // Convert date fields back to ISO format for API
      const submitData = { ...formData };
      fields.forEach((field) => {
        if (
          field.type === "date" ||
          field.type === "datetime" ||
          field.type === "datetime-local" ||
          field.type === "time" ||
          field.type === "month" ||
          field.type === "week"
        ) {
          // Only convert if value exists and is not empty
          if (submitData[field.name] && submitData[field.name].trim() !== "") {
            const converted = fromDateInputValue(submitData[field.name]);
            // Only set if conversion was successful (not empty string)
            if (converted && converted.trim() !== "") {
              submitData[field.name] = converted;
            } else {
              // Remove if conversion failed or resulted in empty
              delete submitData[field.name];
            }
          } else {
            // Remove empty strings or undefined values for date fields
            delete submitData[field.name];
          }
        }
      });
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const getFormSpacing = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "space-y-3";
      case "comfortable":
        return "space-y-6";
      case "spacious":
        return "space-y-8";
      default:
        return "space-y-4";
    }
  };

  const getFieldSpacing = () => {
    // Use formStyle for spacing if available, otherwise fallback to spacingSize
    const style = settings.formStyle || settings.spacingSize;
    switch (style) {
      case "compact":
        return "space-y-1";
      case "spacious":
        return "space-y-4";
      case "inline":
        return "flex items-center gap-4";
      case "modern":
        return "space-y-3";
      case "glass":
        return "space-y-3";
      case "minimal":
        return "space-y-2";
      case "card":
        return "space-y-3";
      default:
        // Handle spacingSize fallback for comfortable
        if (settings.spacingSize === "comfortable") {
          return "space-y-3";
        }
        return "space-y-2";
    }
  };

  const getGridGap = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "gap-3";
      case "comfortable":
        return "gap-6";
      case "spacious":
        return "gap-8";
      default:
        return "gap-4";
    }
  };

  const getInputHeight = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "h-9";
      case "comfortable":
        return "h-12";
      case "spacious":
        return "h-14";
      default:
        return "h-10";
    }
  };

  const getButtonSize = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "sm";
      case "comfortable":
      case "spacious":
        return "lg";
      default:
        return "default";
    }
  };

  const getSeparatorSpacing = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "pt-4 mt-4";
      case "comfortable":
        return "pt-8 mt-8";
      case "spacious":
        return "pt-10 mt-10";
      default:
        return "pt-6 mt-6";
    }
  };

  const getFormContainerClasses = () => {
    const baseClasses = "w-full max-h-[70vh] overflow-y-auto";

    switch (FORM_CONTAINER[settings.formStyle] ?? "flat") {
      case "card":
        // a real slab: hairline frame, surface fill, one radius step off the
        // ladder — no gradient, no blur, no coloured shadow
        return cn(baseClasses, "rounded-nx-lg border border-nx-line bg-nx-surface p-6");
      case "minimal":
        return cn(baseClasses, "p-4");
      default:
        return cn(baseClasses, "p-6");
    }
  };

  // Label styling belongs to the Label primitive (ink step, size ladder,
  // disabled ink). The form only decides whether a run of fields is a section.
  const getLabelClasses = () => "";

  // The field surface is Input/Textarea/Select's own business; the form only
  // hands down the height its density asks for.
  const getInputClasses = (baseInputClasses: string) => baseInputClasses;

  // Visibility and permission rules are unchanged; they run before section grouping
  const visibleFields = fields.filter((field) => {
    // Check visibility function
    if (field.isVisible && !field.isVisible(formData)) return false;
    // Check permissions
    if (field.requiredPermission && !hasPermission(field.requiredPermission)) return false;
    if (
      field.requiredPermissions &&
      field.requiredPermissions.length > 0 &&
      !hasAnyPermission(field.requiredPermissions)
    )
      return false;
    return true;
  });

  // Consecutive fields sharing a `section` render as one titled, hairline-ruled group.
  // Runs with neither section nor colSpan keep the flat single-column flow untouched.
  const fieldGroups: { section?: string; fields: FieldConfig[] }[] = [];
  visibleFields.forEach((field) => {
    const last = fieldGroups[fieldGroups.length - 1];
    if (last && last.section === field.section) {
      last.fields.push(field);
    } else {
      fieldGroups.push({ section: field.section, fields: [field] });
    }
  });

  return (
    <div className={cn(getFormContainerClasses(), "text-start")} dir={direction}>
      <form onSubmit={handleSubmit} className={getFormSpacing()}>
        {fieldGroups.map((group, groupIndex) => {
          // The two-column grid engages only when a grouped field opts in via colSpan
          const gridded = group.fields.some((f) => f.colSpan !== undefined && f.type !== "hidden");
          const renderedFields = group.fields.map((field) => {
            // Field anatomy, one shape for every type: label → control →
            // hint/error. The ids wire the control to whichever of the two it
            // actually has, so a screen reader reads the hint and the error in
            // that order and never announces an empty node.
            const hintId = field.description ? `${field.name}-hint` : undefined;
            const errorId = errors[field.name] ? `${field.name}-error` : undefined;
            // The error REPLACES the hint in the row below, so the description
            // points at whichever one is actually on screen — a dangling
            // aria-describedby is worse than none.
            const describedBy = errorId ?? hintId;
            const invalid = Boolean(errors[field.name]);
            // Read-only is NOT disabled: text fields stay focusable and
            // selectable so a value can be copied out of a view dialog, while
            // pickers and toggles (which have nothing to copy) go inert.
            const inert = field.disabled || readOnly;
            // Boolean, not the number itself — a bare `maxLength &&` would
            // render a literal 0 into the form when a caller passes 0.
            const counted = Boolean(
              field.maxLength &&
                (!field.type || field.type === "text" || field.type === "textarea")
            );

            return field.type === "hidden" ? (
              <input
                key={field.name}
                type="hidden"
                name={field.name}
                value={formData[field.name] || ""}
              />
            ) : (
              <div
                key={field.name}
                className={cn(
                  getFieldSpacing(),
                  gridded && field.colSpan === 2 && "sm:col-span-2"
                )}
              >
                {field.type !== "switch" && field.type !== "checkbox" && (
                  <Label htmlFor={field.name} className={cn(getLabelClasses(), "text-start")}>
                    {field.label}
                  </Label>
                )}
                {field.type === "select" ? (
                  <GenericSelect
                    type="single"
                    options={
                      field.options?.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      })) || []
                    }
                    value={formData[field.name] || ""}
                    onValueChange={(value: string | string[]) =>
                      handleChange(field.name, typeof value === "string" ? value : value[0])
                    }
                    placeholder={field.placeholder}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                  />
                ) : field.type === "searchable-select" || field.type === "server-select" ? (
                  <GenericSelect
                    type="searchable"
                    options={
                      field.options?.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      })) || []
                    }
                    value={formData[field.name] || ""}
                    onValueChange={(value: string | string[]) =>
                      handleChange(field.name, typeof value === "string" ? value : value[0])
                    }
                    placeholder={field.placeholder}
                    searchPlaceholder={field.searchPlaceholder}
                    searchType={field.searchType || "client"}
                    onServerSearch={
                      field.onServerSearch
                        ? async (query: string) => {
                            const results = await field.onServerSearch!(query);
                            return results.map((r) => ({
                              value: r.value,
                              label: r.label,
                            }));
                          }
                        : undefined
                    }
                    searchEndpoint={field.searchEndpoint}
                    debounceMs={field.debounceMs}
                    loading={field.loading}
                    noResultsText={field.noResultsText}
                    searchingText={field.searchingText}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                    // Stable key to avoid remounting (which closes dropdown) on each selection
                    key={`searchable-select-${field.name}`}
                  />
                ) : field.type === "multi-select" ? (
                  <GenericSelect
                    type="multi"
                    options={
                      field.options?.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        uniqueKey: opt.uniqueKey,
                      })) || []
                    }
                    value={formData[field.name] || []}
                    onValueChange={(value: string | string[]) => handleChange(field.name, value)}
                    placeholder={field.placeholder}
                    searchPlaceholder={field.searchPlaceholder}
                    searchType={field.searchType}
                    onServerSearch={
                      field.onServerSearch
                        ? async (query: string) => {
                            const results = await field.onServerSearch!(query);
                            return results.map((r) => ({
                              value: r.value,
                              label: r.label,
                              uniqueKey: r.uniqueKey,
                            }));
                          }
                        : undefined
                    }
                    searchEndpoint={field.searchEndpoint}
                    debounceMs={field.debounceMs}
                    allowClear={field.allowClear}
                    noResultsText={field.noResultsText}
                    searchingText={field.searchingText}
                    maxSelectedDisplay={3}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                    // Stable key to avoid remounting (which closes dropdown) on each selection
                    key={`multi-select-${field.name}`}
                  />
                ) : field.type === "tree" ? (
                  <GenericSelect
                    type="tree"
                    treeData={field.treeData || []}
                    value={formData[field.name] || ""}
                    onValueChange={(value: string | string[]) =>
                      handleChange(field.name, typeof value === "string" ? value : value[0])
                    }
                    placeholder={field.placeholder}
                    searchPlaceholder={field.searchPlaceholder}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                  />
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className={cn(getInputClasses("min-h-20"), "text-start")}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    disabled={field.disabled}
                    readOnly={readOnly}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    dir={direction}
                  />
                ) : field.type === "richtext" ? (
                  <RichTextEditor
                    value={formData[field.name] || ""}
                    onChange={(value) => handleChange(field.name, value)}
                    placeholder={field.placeholder}
                    // TipTap editor exposes readOnly (not disabled); honour both the
                    // per-field flag and the form-level read-only mode
                    readOnly={field.disabled || readOnly}
                    // px string — the editor feeds this into a CSS custom property
                    minHeight={field.rows ? `${field.rows * 20}px` : "200px"}
                    className="text-start"
                  />
                ) : field.type === "switch" ? (
                  // A switch labels itself on the row; the hint lands in the
                  // shared row below, like every other field type.
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor={field.name} className="text-start">
                      {field.label}
                    </Label>
                    <Switch
                      id={field.name}
                      checked={formData[field.name] || false}
                      onCheckedChange={(checked) => handleChange(field.name, checked)}
                      disabled={inert}
                      aria-describedby={describedBy}
                    />
                  </div>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={formData[field.name] || false}
                      onCheckedChange={(checked) => handleChange(field.name, checked)}
                      disabled={inert}
                      design={settings.checkboxStyle}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                    />
                    <Label htmlFor={field.name} className="cursor-pointer text-start">
                      {field.label}
                    </Label>
                  </div>
                ) : field.type === "radio" ? (
                  <RadioGroup
                    value={formData[field.name] || ""}
                    onValueChange={(value) => handleChange(field.name, value)}
                    disabled={inert}
                    design={settings.radioStyle}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                  >
                    {field.options?.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={option.value}
                          id={`${field.name}-${option.value}`}
                          design={settings.radioStyle}
                        />
                        <Label
                          htmlFor={`${field.name}-${option.value}`}
                          className="cursor-pointer text-start"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : field.type === "slider" || field.type === "range" ? (
                  <div className="space-y-2">
                    <Slider
                      value={[formData[field.name] || field.min || 0]}
                      onValueChange={(value) => handleChange(field.name, value[0])}
                      min={Number(field.min) || 0}
                      max={Number(field.max) || 100}
                      step={Number(field.step) || 1}
                      disabled={inert}
                      className="w-full"
                      aria-describedby={describedBy}
                    />
                    {/* the read-out is data: tertiary ink, tabular figures so
                        the number stops jittering as it counts */}
                    <div className="flex items-baseline justify-between text-xs text-nx-ink-3">
                      <span>{t("common.value")}</span>
                      <span className="font-medium tabular-nums text-nx-ink-2">
                        {formData[field.name] || field.min || 0}
                      </span>
                    </div>
                  </div>
                ) : field.type === "date" ||
                  field.type === "datetime" ||
                  field.type === "datetime-local" ||
                  field.type === "time" ||
                  field.type === "month" ||
                  field.type === "week" ? (
                  <DatePicker
                    id={field.name}
                    type={field.type === "datetime" ? "datetime-local" : (field.type as any)}
                    value={formData[field.name] || ""}
                    onChange={(value) => handleChange(field.name, value)}
                    required={field.required}
                    className={getInputClasses(getInputHeight())}
                    placeholder={field.placeholder}
                    disabled={inert}
                  />
                ) : field.type === "image" ? (
                  <ImageUploader
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(base64) => handleChange(field.name, base64)}
                    onRemove={() => handleChange(field.name, "")}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                    accept={field.accept || "image/*"}
                    maxSize={field.maxSize}
                    showPreview={field.showPreview !== false}
                    aspectRatio={field.aspectRatio}
                  />
                ) : field.type === "file" ? (
                  <Input
                    id={field.name}
                    type="file"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (field.multiple) {
                        handleChange(field.name, files ? Array.from(files) : []);
                      } else {
                        handleChange(field.name, files?.[0] || null);
                      }
                    }}
                    required={field.required}
                    className={cn(getInputClasses(getInputHeight()), "text-start")}
                    accept={field.accept}
                    multiple={field.multiple}
                    disabled={inert}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    dir={direction}
                  />
                ) : field.type === "password" ? (
                  <PasswordInput
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className={cn(getInputClasses(getInputHeight()), "text-start")}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    readOnly={readOnly}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    showStrengthIndicator={true} // Enable for admin forms
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className={cn(getInputClasses(getInputHeight()), "text-start")}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    pattern={field.pattern}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    disabled={field.disabled}
                    readOnly={readOnly}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    dir={direction}
                  />
                )}

                {/* Hint and error share one row with the character counter, so
                    the block never jumps as messages come and go. The hint is
                    always available (it used to render for switches only); the
                    error replaces it when the field goes invalid. */}
                {(field.description || errors[field.name] || counted) && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {errors[field.name] ? (
                        <p id={errorId} className="text-xs font-medium text-nx-danger">
                          {errors[field.name]}
                        </p>
                      ) : field.description ? (
                        <p id={hintId} className="text-xs leading-relaxed text-nx-ink-3">
                          {field.description}
                        </p>
                      ) : null}
                    </div>
                    {counted && (
                      <span className="shrink-0 text-xs tabular-nums text-nx-ink-3">
                        {(formData[field.name] || "").length}/{field.maxLength}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          });

          // Position-based key: a legacy flat form is always one group ("flat:0"),
          // so reconciliation stays identical to the pre-section render
          const groupKey = `${group.section ?? "flat"}:${groupIndex}`;

          // Absent section and colSpan = exactly the legacy flat single-column flow
          if (!group.section && !gridded) {
            return <React.Fragment key={groupKey}>{renderedFields}</React.Fragment>;
          }

          return (
            <section key={groupKey} className="space-y-3">
              {group.section && (
                <h3 className="border-b border-nx-line pb-2 text-sm font-medium text-nx-ink">
                  {group.section}
                </h3>
              )}
              <div
                className={
                  gridded
                    ? cn("grid grid-cols-1 items-start sm:grid-cols-2", getGridGap())
                    : getFormSpacing()
                }
              >
                {renderedFields}
              </div>
            </section>
          );
        })}

        <Separator />

        {/* Actions read in DOM order (cancel, then save) and the row is
            reversed once so the primary always lands on the inline END — no
            per-direction order forks, and no gradient on the submit: Button
            owns its own paint. */}
        {!readOnly && (
          <div
            className={cn(
              "flex flex-col-reverse sm:flex-row sm:justify-end",
              getGridGap(),
              getSeparatorSpacing()
            )}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={getInputHeight()}
              disabled={loading}
              size={getButtonSize()}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              loading={loading}
              className={getInputHeight()}
              size={getButtonSize()}
            >
              {t("common.save")}
            </Button>
          </div>
        )}
        {readOnly && (
          <div className={cn("flex justify-center", getSeparatorSpacing())}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={getInputHeight()}
              size={getButtonSize()}
            >
              {t("common.close")}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
