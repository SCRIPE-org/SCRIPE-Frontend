"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { Save } from "lucide-react";
import { SettingsField } from "./SettingsField";
import {
  type JsonSchemaField,
  type PluginSettingsSchema,
  type SettingsValues,
  type DynamicSettingsFormProps,
  getEmptyDefault,
} from "./dynamicSettingsTypes";

// Re-export public schema types for external module consumers
/**
 * Documentation for module export
 */
export type { JsonSchemaField, PluginSettingsSchema, SettingsValues, DynamicSettingsFormProps };

/**
 * DynamicSettingsForm renders a fully interactive plugin configuration form
 * derived dynamically from a JSON Schema specification. Handles client-side
 * input constraint validation, unsaved change state tracking, and persistence triggers.
 *
 * @param props The form properties containing schema definition and save handler.
 * @returns An accessible settings form view with validation indicators.
 */
export function DynamicSettingsForm({
  schema,
  initialValues = {},
  onSave,
  isSaving = false,
}: DynamicSettingsFormProps): React.JSX.Element {
  const { t } = useI18n();

  // Initialize local form state from provided values or schema defaults
  const schemaFields = schema.fields;
  const defaultValues = useMemo(() => {
    const defaults: SettingsValues = {};
    for (const field of schemaFields) {
      defaults[field.key] =
        initialValues[field.key] ?? field.default ?? getEmptyDefault(field.type);
    }
    return defaults;
  }, [schemaFields, initialValues]);

  const [values, setValues] = useState<SettingsValues>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Updates an individual field value in local state and clears existing validation errors.
   */
  const handleChange = useCallback((key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setIsDirty(true);
  }, []);

  /**
   * Performs client-side schema constraint validation against the current state.
   *
   * @returns True if all fields satisfy schema constraints; otherwise false.
   */
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

  /**
   * Handles form submission and triggers the onSave callback if validation passes.
   */
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
          {schema.title && <h3 className="text-base font-semibold text-nx-ink">{schema.title}</h3>}
          {schema.description && (
            <p className="mt-0.5 text-sm text-nx-ink-2">{schema.description}</p>
          )}
        </div>
      )}

      {/* Settings fields container */}
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

      {/* Form action footer */}
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
