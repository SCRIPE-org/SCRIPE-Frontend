/**
 * CustomField List View
 *
 * Pure UI component for displaying the CustomField definition list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React, { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useCustomFieldViewModel } from "../viewmodels/useCustomFieldViewModel";
import type { CustomField } from "../../domain/entities/CustomField";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// SELECT value type == 4; Options are only allowed/required for Select fields.
const SELECT_VALUE_TYPE = "4";

// CustomFieldValueType (0..4) mapped onto the nx Badge semantic tones — a
// value type is read-only metadata, so the tones are neutral/informational
// rather than success/error.
const VALUE_TYPE_VARIANTS: Record<
  number,
  "default" | "secondary" | "info" | "success" | "warning"
> = {
  0: "secondary", // Text
  1: "info", // Number
  2: "success", // Boolean
  3: "warning", // Date
  4: "default", // Select
};

export const CustomFieldListView = React.memo(function CustomFieldListView() {
  useModuleLocales(() => import("../../../locales"), "customFields");
  const { t, language } = useI18n();
  const { vm } = useCustomFieldViewModel();

  const valueTypeOptions = useMemo(
    () => [
      { value: "0", label: t("customField.valueTypes.text") },
      { value: "1", label: t("customField.valueTypes.number") },
      { value: "2", label: t("customField.valueTypes.boolean") },
      { value: "3", label: t("customField.valueTypes.date") },
      { value: "4", label: t("customField.valueTypes.select") },
    ],
    [t]
  );

  const valueTypeLabels = useMemo<Record<number, string>>(
    () => ({
      0: t("customField.valueTypes.text"),
      1: t("customField.valueTypes.number"),
      2: t("customField.valueTypes.boolean"),
      3: t("customField.valueTypes.date"),
      4: t("customField.valueTypes.select"),
    }),
    [t]
  );

  const config: CrudConfig<CustomField> = useMemo(
    () => ({
      titleKey: "customField.title",
      subtitleKey: "customField.description",
      resource: "custom-fields",
      columns: [
        { key: "entityTypeKey", label: t("customField.fields.entityTypeKey"), sortable: true },
        { key: "key", label: t("customField.fields.key"), sortable: true },
        { key: "labelEn", label: t("customField.fields.labelEn"), sortable: true },
        {
          key: "valueType",
          label: t("customField.fields.valueType"),
          render: (value: number) => (
            <Badge variant={VALUE_TYPE_VARIANTS[value] ?? "secondary"}>
              {valueTypeLabels[value] ?? String(value)}
            </Badge>
          ),
        },
        {
          key: "isRequired",
          label: t("customField.fields.isRequired"),
          render: (value: boolean) => (
            <Badge variant={value ? "info" : "secondary"}>
              {value ? t("customField.required") : t("customField.optional")}
            </Badge>
          ),
        },
        { key: "sortOrder", label: t("customField.fields.sortOrder"), sortable: true },
        {
          key: "isActive",
          label: t("customField.fields.isActive"),
          render: (value: boolean) => (
            <Badge variant={value ? "active" : "inactive"}>
              {value ? t("common.yes") : t("common.no")}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) =>
            value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
        },
      ],
      createFields: [
        {
          name: "entityTypeKey",
          label: t("customField.fields.entityTypeKey"),
          type: "text" as const,
          placeholder: t("customField.placeholders.entityTypeKey"),
          required: true,
        },
        {
          name: "key",
          label: t("customField.fields.key"),
          type: "text" as const,
          placeholder: t("customField.placeholders.key"),
          required: true,
        },
        {
          name: "labelEn",
          label: t("customField.fields.labelEn"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelEn"),
          required: true,
        },
        {
          name: "labelAr",
          label: t("customField.fields.labelAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelAr"),
        },
        {
          name: "valueType",
          label: t("customField.fields.valueType"),
          type: "select" as const,
          options: valueTypeOptions,
          required: true,
        },
        {
          name: "options",
          label: t("customField.fields.options"),
          type: "textarea" as const,
          placeholder: t("customField.placeholders.options"),
          rows: 4,
          isVisible: (form: Record<string, unknown>) =>
            String(form.valueType) === SELECT_VALUE_TYPE,
        },
        {
          name: "isRequired",
          label: t("customField.fields.isRequired"),
          type: "switch" as const,
        },
        {
          name: "sortOrder",
          label: t("customField.fields.sortOrder"),
          type: "number" as const,
          min: 0,
        },
      ],
      // entityTypeKey and key are IMMUTABLE after creation (backend rejects changes),
      // so they are omitted from the edit form.
      editFields: [
        { name: "id", type: "hidden" as const, required: true },
        {
          name: "labelEn",
          label: t("customField.fields.labelEn"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelEn"),
          required: true,
        },
        {
          name: "labelAr",
          label: t("customField.fields.labelAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelAr"),
        },
        {
          name: "options",
          label: t("customField.fields.options"),
          type: "textarea" as const,
          placeholder: t("customField.placeholders.options"),
          rows: 4,
        },
        {
          name: "isRequired",
          label: t("customField.fields.isRequired"),
          type: "switch" as const,
        },
        {
          name: "sortOrder",
          label: t("customField.fields.sortOrder"),
          type: "number" as const,
          min: 0,
        },
        {
          name: "isActive",
          label: t("customField.fields.isActive"),
          type: "switch" as const,
        },
      ],
      createInitialValues: {
        entityTypeKey: "",
        key: "",
        labelEn: "",
        labelAr: "",
        valueType: "0",
        options: "",
        isRequired: false,
        sortOrder: 0,
      },
      editInitialValues: (item: CustomField) => ({
        id: item.id,
        labelEn: item.labelEn,
        labelAr: item.labelAr ?? "",
        options: item.options ?? "",
        isRequired: item.isRequired,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      }),
      // labelEn is the genuinely human-readable field; key is the technical
      // fallback for the (rare) record missing a label.
      getItemDisplayName: (item: CustomField) => item.labelEn || item.key,
    }),
    [t, language, valueTypeOptions, valueTypeLabels]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
});
