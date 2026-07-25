"use client";

import { useMemo, useState, useCallback } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Textarea } from "@core/ui/textarea";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { AlertTriangle, Save } from "lucide-react";

// ── JSON Schema Types ────────────────────────────────────────────────────────

/** JSON Schema type for a single settings field. */
export interface JsonSchemaField {
  /** Unique key for this field (used as the settings key). */
  key: string;
  /** Human-readable label. */
  label: string;
  /** Optional description shown below the field. */
  description?: string;
  /** The data type for this field. */
  type: "string" | "number" | "boolean" | "select" | "textarea";
  /** Required validation — shows error if blank. */
  required?: boolean;
  /** Default value. */
  default?: string | number | boolean;
  /** Options list — only used when type === "select". */
  options?: Array<{ value: string; label: string }>;
  /** Minimum value constraint (for type === "number"). */
  min?: number;
  /** Maximum value constraint (for type === "number"). */
  max?: number;
}

/** The full schema for a plugin's settings form. */
export interface PluginSettingsSchema {
  /** Optional title for the settings section. */
  title?: string;
  /** Optional description. */
  description?: string;
  /** Ordered list of settings fields. */
  fields: JsonSchemaField[];
}

/** Current values map: key → value */
export type SettingsValues = Record<string, string | number | boolean>;

// ── Props ────────────────────────────────────────────────────────────────────

interface DynamicSettingsFormProps {
  /** JSON schema describing the form fields and validation. */
  schema: PluginSettingsSchema;
  /** Current saved values (fetched from the plugin host or API). */
  initialValues?: SettingsValues;
  /** Called with the new values when the user submits. */
  onSave: (values: SettingsValues) => Promise<void>;
  /** True while the parent is saving. */
  isSaving?: boolean;
}

/**
 * DynamicSettingsForm (Phase 5.2)
 *
 * Renders a plugin settings form dynamically from a JSON Schema definition.
 * Supports: string, number, boolean (switch), select (dropdown), textarea.
 *
 * Architecture: This is a pure presentational component.
 *   - All HTTP logic lives in the ViewModel.
 *   - The schema is loaded from the plugin manifest.
 *   - Validation is done client-side before calling onSave.
 */
export function DynamicSettingsForm({
  schema,
  initialValues = {},
  onSave,
  isSaving = false,
}: DynamicSettingsFormProps) {
  const { t } = useI18n();

  // Initialize local form state from provided values + defaults
  const defaultValues = useMemo(() => {
    const defaults: SettingsValues = {};
    for (const field of schema.fields) {
      defaults[field.key] =
        initialValues[field.key] ?? field.default ?? getEmptyDefault(field.type);
    }
    return defaults;
  }, [schema.fields, initialValues]);

  const [values, setValues] = useState<SettingsValues>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  /** Update a single field value. */
  const handleChange = useCallback((key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" })); // Clear field error on change
    setIsDirty(true);
  }, []);

  /** Run client-side validation. Returns true if valid. */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of schema.fields) {
      const value = values[field.key];
      if (field.required && (value === "" || value === undefined || value === null)) {
        newErrors[field.key] = t("plugins.settingsFieldRequired", { label: field.label });
      }
      if (field.type === "number" && typeof value === "number") {
        if (field.min !== undefined && value < field.min) {
          newErrors[field.key] = t("plugins.settingsFieldMin", {
            label: field.label,
            min: field.min,
          });
        }
        if (field.max !== undefined && value > field.max) {
          newErrors[field.key] = t("plugins.settingsFieldMax", {
            label: field.label,
            max: field.max,
          });
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Handle form submission. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(values);
    setIsDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Schema section header */}
      {(schema.title || schema.description) && (
        <div>
          {schema.title && (
            <h3 className="text-base font-semibold text-nx-ink">{schema.title}</h3>
          )}
          {schema.description && (
            <p className="mt-0.5 text-sm text-nx-ink-2">{schema.description}</p>
          )}
        </div>
      )}

      {/* Settings fields */}
      <Card>
        <CardContent className="flex flex-col gap-5 pt-4">
          {schema.fields.map((field) => (
            <SettingsField
              key={field.key}
              field={field}
              value={values[field.key]}
              error={errors[field.key]}
              onChange={handleChange}
              selectPlaceholder={t("plugins.settingsFieldSelectPlaceholder", {
                label: field.label,
              })}
            />
          ))}
        </CardContent>
      </Card>

      {/* Form footer */}
      <div className="flex items-center justify-between">
        {isDirty ? (
          <Badge variant="warning" className="text-xs">
            {t("common.unsavedChanges")}
          </Badge>
        ) : (
          <span />
        )}
        <Button type="submit" size="sm" className="gap-1.5" disabled={isSaving || !isDirty}>
          <Save className="size-3.5" aria-hidden="true" />
          {isSaving ? t("common.saving") : t("common.saveChanges")}
        </Button>
      </div>
    </form>
  );
}

// ── Field renderer ──────────────────────────────────────────────────────────

interface SettingsFieldProps {
  field: JsonSchemaField;
  value: string | number | boolean;
  error?: string;
  onChange: (key: string, value: string | number | boolean) => void;
  /** Pre-localised "Select {label}" placeholder — the label itself is plugin
      schema data, not app copy, so the interpolation happens at the caller. */
  selectPlaceholder: string;
}

/**
 * SettingsField
 *
 * Renders the correct control for a JSON Schema field type. Mirrors the shared
 * Form anatomy's visual language (label/control/hint/error, danger-ink label
 * and message on error) directly rather than composing FormField/FormControl —
 * this form is schema-driven from local state, not react-hook-form, so there is
 * no field context for those primitives to read.
 * Pure presentational — all state is managed by DynamicSettingsForm.
 */
function SettingsField({ field, value, error, onChange, selectPlaceholder }: SettingsFieldProps) {
  const id = `settings-field-${field.key}`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label (not shown for boolean — the switch has its own inline label) */}
      {field.type !== "boolean" && (
        <Label htmlFor={id} className={cn("text-sm font-medium", error && "text-destructive")}>
          {field.label}
          {field.required && <span className="ms-0.5 text-destructive">*</span>}
        </Label>
      )}

      {/* Field control */}
      {field.type === "string" && (
        <Input
          id={id}
          value={String(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.description}
          aria-invalid={!!error}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          id={id}
          value={String(value)}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.description}
          rows={4}
          aria-invalid={!!error}
          className="resize-y"
        />
      )}

      {field.type === "number" && (
        <Input
          id={id}
          type="number"
          value={Number(value)}
          min={field.min}
          max={field.max}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
          aria-invalid={!!error}
        />
      )}

      {field.type === "boolean" && (
        <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
          <div>
            <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
              {field.label}
            </Label>
            {field.description && (
              <p className="text-xs text-nx-ink-3">{field.description}</p>
            )}
          </div>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(field.key, checked)}
          />
        </div>
      )}

      {field.type === "select" && (
        <Select value={String(value)} onValueChange={(v) => onChange(field.key, v)}>
          <SelectTrigger id={id} aria-invalid={!!error}>
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Description */}
      {field.type !== "boolean" && field.description && (
        <p className="text-xs leading-relaxed text-nx-ink-3">{field.description}</p>
      )}

      {/* Validation error */}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium leading-relaxed text-destructive">
          <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getEmptyDefault(type: JsonSchemaField["type"]): string | number | boolean {
  switch (type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    default:
      return "";
  }
}
