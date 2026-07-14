/**
 * WorkItem List View — CRUD table for generic work items (tasks).
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useWorkItemViewModel } from "../viewmodels/useWorkItemViewModel";
import type { WorkItem } from "../../domain/entities/WorkItem";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// Enums mirror the backend WorkItemStatus / WorkItemPriority.
const STATUS_OPTIONS = [
  { value: "0", label: "To Do" },
  { value: "1", label: "In Progress" },
  { value: "2", label: "Blocked" },
  { value: "3", label: "Done" },
  { value: "4", label: "Cancelled" },
];
const STATUS_LABELS: Record<number, string> = {
  0: "To Do",
  1: "In Progress",
  2: "Blocked",
  3: "Done",
  4: "Cancelled",
};
const PRIORITY_OPTIONS = [
  { value: "0", label: "Low" },
  { value: "1", label: "Normal" },
  { value: "2", label: "High" },
  { value: "3", label: "Critical" },
];
const PRIORITY_LABELS: Record<number, string> = {
  0: "Low",
  1: "Normal",
  2: "High",
  3: "Critical",
};

export const WorkItemListView = React.memo(function WorkItemListView() {
  useModuleLocales(() => import("../../../locales"), "workManagement");
  const { vm } = useWorkItemViewModel();

  const config: CrudConfig<WorkItem> = {
    titleKey: "workItem.title",
    subtitleKey: "workItem.description",
    resource: "work-items",
    columns: [
      { key: "title", label: "Title", sortable: true },
      {
        key: "status",
        label: "Status",
        render: (value: number) => STATUS_LABELS[value] ?? String(value),
      },
      {
        key: "priority",
        label: "Priority",
        render: (value: number) => PRIORITY_LABELS[value] ?? String(value),
      },
      { key: "ownerEntityTypeKey", label: "Owner Type" },
      {
        key: "dueAt",
        label: "Due",
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : "-"),
      },
      {
        key: "isActive",
        label: "Active",
        render: (value: boolean) => (value ? "Yes" : "No"),
      },
    ],
    createFields: [
      { name: "title", label: "Title", type: "text" as const, required: true },
      { name: "description", label: "Description", type: "textarea" as const, rows: 3 },
      { name: "status", label: "Status", type: "select" as const, options: STATUS_OPTIONS, required: true },
      { name: "priority", label: "Priority", type: "select" as const, options: PRIORITY_OPTIONS, required: true },
      { name: "dueAt", label: "Due Date", type: "datetime-local" as const },
      { name: "ownerEntityTypeKey", label: "Owner Entity Type Key", type: "text" as const, placeholder: "e.g. party.person" },
    ],
    // ownerEntityTypeKey/ownerEntityId are set-once at create (immutable owner binding).
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      { name: "title", label: "Title", type: "text" as const, required: true },
      { name: "description", label: "Description", type: "textarea" as const, rows: 3 },
      { name: "status", label: "Status", type: "select" as const, options: STATUS_OPTIONS, required: true },
      { name: "priority", label: "Priority", type: "select" as const, options: PRIORITY_OPTIONS, required: true },
      { name: "dueAt", label: "Due Date", type: "datetime-local" as const },
      { name: "isActive", label: "Active", type: "switch" as const },
    ],
    createInitialValues: {
      title: "",
      description: "",
      status: "0",
      priority: "1",
      dueAt: "",
      ownerEntityTypeKey: "",
    },
    editInitialValues: (item: WorkItem) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      status: String(item.status),
      priority: String(item.priority),
      dueAt: item.dueAt ?? "",
      isActive: item.isActive,
    }),
    getItemDisplayName: (item: WorkItem) => item.title,
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
