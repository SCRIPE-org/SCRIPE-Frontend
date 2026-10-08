/**
 * EmploymentRecord List View
 *
 * Pure UI component for displaying EmploymentRecord list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { useEmploymentRecordViewModel } from "../viewmodels/useEmploymentRecordViewModel";
import type { EmploymentRecord } from "../../domain/entities/EmploymentRecord";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { HRMS_PERMISSIONS } from "@modules/hrms/permission-constants";

// P5.4: React.memo prevents unnecessary re-renders
/**
 * Documentation for module export
 */
export const EmploymentRecordListView = React.memo(function EmploymentRecordListView() {
  useModuleLocales(() => import("../../../locales"), "hrms-employment-record");
  const { vm } = useEmploymentRecordViewModel();
  const { t, language } = useI18n();
  const locale = resolveIntlLocale(language);

  const config: CrudConfig<EmploymentRecord> = {
    titleKey: "employmentRecord.title",
    subtitleKey: "employmentRecord.description",
    resource: "employment-records",
    entityTypeKey: "hrms.employment-record",
    columns: [
      {
        key: "staffMemberId",
        label: t("employmentRecord.fields.staffMemberId"),
        sortable: true,
      },
      {
        key: "employmentType",
        label: t("employmentRecord.fields.employmentType"),
        sortable: true,
        render: (value: string) => <Badge variant="secondary">{value}</Badge>,
      },
      {
        key: "startDate",
        label: t("employmentRecord.fields.startDate"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
        sortable: true,
      },
      {
        key: "endDate",
        label: t("employmentRecord.fields.endDate"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
        sortable: true,
      },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
      },
    ],
    createFields: [
      {
        name: "staffMemberId",
        label: t("employmentRecord.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("employmentRecord.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "employmentType",
        label: t("employmentRecord.fields.employmentType"),
        type: "text" as const,
        placeholder: t("employmentRecord.placeholders.employmentType"),
        required: true,
      },
      {
        name: "startDate",
        label: t("employmentRecord.fields.startDate"),
        type: "date" as const,
        placeholder: t("employmentRecord.placeholders.startDate"),
        required: true,
      },
      {
        name: "endDate",
        label: t("employmentRecord.fields.endDate"),
        type: "date" as const,
        placeholder: t("employmentRecord.placeholders.endDate"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "staffMemberId",
        label: t("employmentRecord.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("employmentRecord.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "employmentType",
        label: t("employmentRecord.fields.employmentType"),
        type: "text" as const,
        placeholder: t("employmentRecord.placeholders.employmentType"),
        required: true,
      },
      {
        name: "startDate",
        label: t("employmentRecord.fields.startDate"),
        type: "date" as const,
        placeholder: t("employmentRecord.placeholders.startDate"),
        required: true,
      },
      {
        name: "endDate",
        label: t("employmentRecord.fields.endDate"),
        type: "date" as const,
        placeholder: t("employmentRecord.placeholders.endDate"),
      },
    ],
    createInitialValues: {
      staffMemberId: "",
      employmentType: "",
      startDate: "",
      endDate: "",
    },
    editInitialValues: (item: EmploymentRecord) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      employmentType: item.employmentType,
      startDate: item.startDate,
      endDate: item.endDate,
    }),
    // EmploymentRecord is a pure join between a staff member and a time period —
    // it has no name-shaped field of its own, so the FK remains the most
    // identifying value available.
    getItemDisplayName: (item: EmploymentRecord) => item.staffMemberId,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<EmploymentRecord>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: EmploymentRecord) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
        requiredPermission: HRMS_PERMISSIONS.EMPLOYMENT_RECORD_UPDATE,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: EmploymentRecord) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
        requiredPermission: HRMS_PERMISSIONS.EMPLOYMENT_RECORD_DELETE,
      },
    ],
    // F-85: opts this list into real server-side sort (see StaffMemberListView
    // for the full rationale). Unset, a column click stays client-side-only.
    customTableProps: {
      sortColumn: vm.sortBy,
      sortDirection: vm.sortDirection,
      onSortChange: vm.handleSortChange,
    },
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
