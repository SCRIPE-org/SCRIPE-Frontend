/**
 * CustomField List View
 *
 * Pure UI component for displaying the CustomField definition list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useCustomFieldViewModel } from "../viewmodels/useCustomFieldViewModel";
import type { CustomField } from "../../domain/entities/CustomField";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// Value-type enum mirrors the backend CustomFieldValueType (Text=0..Select=4).
const VALUE_TYPE_OPTIONS = [
  { value: "0", label: "Text" },
  { value: "1", label: "Number" },
  { value: "2", label: "Boolean" },
  { value: "3", label: "Date" },
  { value: "4", label: "Select" },
];

const VALUE_TYPE_LABELS: Record<number, string> = {
  0: "Text",
  1: "Number",
  2: "Boolean",
  3: "Date",
  4: "Select",
};

// SELECT value type == 4; Options are only allowed/required for Select fields.
const SELECT_VALUE_TYPE = "4";

export const CustomFieldListView = React.memo(function CustomFieldListView() {
  useModuleLocales(() => import("../../../locales"), "customFields");
  const { vm } = useCustomFieldViewModel();

  const config: CrudConfig<CustomField> = {
    titleKey: "customField.title",
    subtitleKey: "customField.description",
    resource: "custom-fields",
    columns: [
      { key: "entityTypeKey", label: "Entity Type", sortable: true },
      { key: "key", label: "Key", sortable: true },
      { key: "labelEn", label: "Label (EN)", sortable: true },
      {
        key: "valueType",
        label: "Type",
        render: (value: number) => VALUE_TYPE_LABELS[value] ?? String(value),
      },
      {
        key: "isRequired",
        label: "Required",
        render: (value: boolean) => (value ? "Yes" : "No"),
      },
      { key: "sortOrder", label: "Order", sortable: true },
      {
        key: "isActive",
        label: "Active",
        render: (value: boolean) => (value ? "Yes" : "No"),
      },
      {
        key: "createdAt",
        label: "Created",
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : "-"),
      },
    ],
    createFields: [
      {
        name: "entityTypeKey",
        label: "Entity Type Key",
        type: "text" as const,
        placeholder: "e.g. party.person",
        required: true,
      },
      {
        name: "key",
        label: "Key",
        type: "text" as const,
        placeholder: "e.g. shirt_size",
        required: true,
      },
      {
        name: "labelEn",
        label: "Label (English)",
        type: "text" as const,
        placeholder: "Enter English label",
        required: true,
      },
      {
        name: "labelAr",
        label: "Label (Arabic)",
        type: "text" as const,
        placeholder: "Enter Arabic label",
      },
      {
        name: "valueType",
        label: "Value Type",
        type: "select" as const,
        options: VALUE_TYPE_OPTIONS,
        required: true,
      },
      {
        name: "options",
        label: "Options (one per line)",
        type: "textarea" as const,
        placeholder: "One option per line — Select fields only",
        rows: 4,
        isVisible: (form: Record<string, unknown>) => String(form.valueType) === SELECT_VALUE_TYPE,
      },
      {
        name: "isRequired",
        label: "Required",
        type: "switch" as const,
      },
      {
        name: "sortOrder",
        label: "Sort Order",
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
        label: "Label (English)",
        type: "text" as const,
        placeholder: "Enter English label",
        required: true,
      },
      {
        name: "labelAr",
        label: "Label (Arabic)",
        type: "text" as const,
        placeholder: "Enter Arabic label",
      },
      {
        name: "options",
        label: "Options (one per line)",
        type: "textarea" as const,
        placeholder: "One option per line — Select fields only",
        rows: 4,
      },
      {
        name: "isRequired",
        label: "Required",
        type: "switch" as const,
      },
      {
        name: "sortOrder",
        label: "Sort Order",
        type: "number" as const,
        min: 0,
      },
      {
        name: "isActive",
        label: "Active",
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
    getItemDisplayName: (item: CustomField) => item.key,
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
