/**
 * WorkItem List View — CRUD table for generic work items (tasks).
 */
"use client";

import React, { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useWorkItemViewModel } from "../viewmodels/useWorkItemViewModel";
import type { WorkItem } from "../../domain/entities/WorkItem";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { Pencil, Trash2 } from "lucide-react";

// WorkItemStatus (0..4) mapped onto the nx Badge semantic tones.
const STATUS_VARIANTS: Record<number, "secondary" | "info" | "warning" | "success" | "inactive"> = {
  0: "secondary", // To Do
  1: "info", // In Progress
  2: "warning", // Blocked
  3: "success", // Done
  4: "inactive", // Cancelled
};

// WorkItemPriority (0..3) mapped onto the nx Badge semantic tones.
const PRIORITY_VARIANTS: Record<number, "secondary" | "info" | "warning" | "destructive"> = {
  0: "secondary", // Low
  1: "info", // Normal
  2: "warning", // High
  3: "destructive", // Critical
};

// Soft client-side format hint for the raw-GUID ownerEntityId field (native
// HTML5 pattern validation only fires on a non-empty value, so this never
// blocks leaving the optional field empty). The backend is the real gate:
// OwnerEntityId's type key is validated against the cross-module registry
// server-side. assignedToId used to be a raw-GUID text field too, but is now
// a server-searched admin picker (below) -- AssignedToId is still
// existence/tenant-validated server-side (F-29), the picker just removes the
// need to already know and type the GUID by hand.
const GUID_PATTERN = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";

export const WorkItemListView = React.memo(function WorkItemListView() {
  useModuleLocales(() => import("../../../locales"), "workManagement");
  const { t, language } = useI18n();
  const { vm, searchAssignableAdmins } = useWorkItemViewModel();

  const statusOptions = useMemo(
    () => [
      { value: "0", label: t("workItem.statuses.toDo") },
      { value: "1", label: t("workItem.statuses.inProgress") },
      { value: "2", label: t("workItem.statuses.blocked") },
      { value: "3", label: t("workItem.statuses.done") },
      { value: "4", label: t("workItem.statuses.cancelled") },
    ],
    [t]
  );
  const statusLabels = useMemo<Record<number, string>>(
    () => ({
      0: t("workItem.statuses.toDo"),
      1: t("workItem.statuses.inProgress"),
      2: t("workItem.statuses.blocked"),
      3: t("workItem.statuses.done"),
      4: t("workItem.statuses.cancelled"),
    }),
    [t]
  );

  const priorityOptions = useMemo(
    () => [
      { value: "0", label: t("workItem.priorities.low") },
      { value: "1", label: t("workItem.priorities.normal") },
      { value: "2", label: t("workItem.priorities.high") },
      { value: "3", label: t("workItem.priorities.critical") },
    ],
    [t]
  );
  const priorityLabels = useMemo<Record<number, string>>(
    () => ({
      0: t("workItem.priorities.low"),
      1: t("workItem.priorities.normal"),
      2: t("workItem.priorities.high"),
      3: t("workItem.priorities.critical"),
    }),
    [t]
  );

  const config: CrudConfig<WorkItem> = useMemo(
    () => ({
      titleKey: "workItem.title",
      subtitleKey: "workItem.description",
      resource: "work-items",
      entityTypeKey: "workmanagement.work-item",
      columns: [
        { key: "title", label: t("workItem.fields.title"), sortable: true },
        {
          key: "status",
          label: t("workItem.fields.status"),
          render: (value: number) => (
            <Badge variant={STATUS_VARIANTS[value] ?? "secondary"}>
              {statusLabels[value] ?? String(value)}
            </Badge>
          ),
        },
        {
          key: "priority",
          label: t("workItem.fields.priority"),
          render: (value: number) => (
            <Badge variant={PRIORITY_VARIANTS[value] ?? "secondary"}>
              {priorityLabels[value] ?? String(value)}
            </Badge>
          ),
        },
        { key: "ownerEntityTypeKey", label: t("workItem.fields.ownerEntityTypeKey") },
        {
          key: "assignedToId",
          label: t("workItem.fields.assignedToId"),
          render: (value: string | null | undefined) => value ?? "-",
        },
        {
          key: "dueAt",
          label: t("workItem.fields.dueAt"),
          render: (value: string) =>
            value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
        },
        {
          key: "isActive",
          label: t("workItem.fields.isActive"),
          render: (value: boolean) => (
            <Badge variant={value ? "active" : "inactive"}>
              {value ? t("common.yes") : t("common.no")}
            </Badge>
          ),
        },
      ],
      createFields: [
        { name: "title", label: t("workItem.fields.title"), type: "text" as const, required: true },
        {
          name: "description",
          label: t("workItem.fields.description"),
          type: "textarea" as const,
          rows: 3,
        },
        {
          name: "status",
          label: t("workItem.fields.status"),
          type: "select" as const,
          options: statusOptions,
          required: true,
        },
        {
          name: "priority",
          label: t("workItem.fields.priority"),
          type: "select" as const,
          options: priorityOptions,
          required: true,
        },
        { name: "dueAt", label: t("workItem.fields.dueAt"), type: "datetime-local" as const },
        {
          name: "ownerEntityTypeKey",
          label: t("workItem.fields.ownerEntityTypeKey"),
          type: "text" as const,
          placeholder: t("workItem.placeholders.ownerEntityTypeKey"),
          // Disambiguates Owner (what the task is about) from Assigned To
          // (who does it) — see the matching caption on assignedToId below.
          description: t("workItem.help.owner"),
        },
        {
          name: "ownerEntityId",
          label: t("workItem.fields.ownerEntityId"),
          type: "text" as const,
          placeholder: t("workItem.placeholders.ownerEntityId"),
          pattern: GUID_PATTERN,
        },
        {
          name: "assignedToId",
          label: t("workItem.fields.assignedToId"),
          // Server-searched admin picker instead of a raw-GUID text field —
          // reuses the same GET /api/v1/Admins search the Leads module's
          // assignable-admins picker calls (see useWorkItemViewModel
          // .searchAssignableAdmins / WorkItemService.searchAssignableAdmins).
          type: "server-select" as const,
          searchType: "server" as const,
          onServerSearch: searchAssignableAdmins,
          placeholder: t("workItem.placeholders.assignedToId"),
          searchPlaceholder: t("workItem.placeholders.assignedToSearch"),
          noResultsText: t("workItem.search.noAdminsFound"),
          searchingText: t("workItem.search.searchingAdmins"),
          description: t("workItem.help.assignedTo"),
        },
      ],
      // ownerEntityTypeKey/ownerEntityId are set-once at create (immutable owner
      // binding, matching backend UpdateWorkItemCommand not accepting either) —
      // assignedToId, unlike the owner binding, IS mutable post-create.
      editFields: [
        { name: "id", type: "hidden" as const, required: true },
        { name: "title", label: t("workItem.fields.title"), type: "text" as const, required: true },
        {
          name: "description",
          label: t("workItem.fields.description"),
          type: "textarea" as const,
          rows: 3,
        },
        {
          name: "status",
          label: t("workItem.fields.status"),
          type: "select" as const,
          options: statusOptions,
          required: true,
        },
        {
          name: "priority",
          label: t("workItem.fields.priority"),
          type: "select" as const,
          options: priorityOptions,
          required: true,
        },
        { name: "dueAt", label: t("workItem.fields.dueAt"), type: "datetime-local" as const },
        {
          name: "assignedToId",
          label: t("workItem.fields.assignedToId"),
          type: "server-select" as const,
          searchType: "server" as const,
          onServerSearch: searchAssignableAdmins,
          placeholder: t("workItem.placeholders.assignedToId"),
          searchPlaceholder: t("workItem.placeholders.assignedToSearch"),
          noResultsText: t("workItem.search.noAdminsFound"),
          searchingText: t("workItem.search.searchingAdmins"),
          description: t("workItem.help.assignedTo"),
        },
        { name: "isActive", label: t("workItem.fields.isActive"), type: "switch" as const },
      ],
      createInitialValues: {
        title: "",
        description: "",
        status: "0",
        priority: "1",
        dueAt: "",
        ownerEntityTypeKey: "",
        ownerEntityId: "",
        assignedToId: "",
      },
      editInitialValues: (item: WorkItem) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        status: String(item.status),
        priority: String(item.priority),
        dueAt: item.dueAt ?? "",
        assignedToId: item.assignedToId ?? "",
        isActive: item.isActive,
      }),
      getItemDisplayName: (item: WorkItem) => item.title,
      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<WorkItem>[] => [
        {
          label: tFn("common.edit"),
          onClick: (item: WorkItem) => vm.openEditModal(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: tFn("common.delete"),
          onClick: (item: WorkItem) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/80",
          icon: <Trash2 className="h-4 w-4" />,
        },
      ],
    }),
    [t, language, statusOptions, statusLabels, priorityOptions, priorityLabels, vm, searchAssignableAdmins]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
});
