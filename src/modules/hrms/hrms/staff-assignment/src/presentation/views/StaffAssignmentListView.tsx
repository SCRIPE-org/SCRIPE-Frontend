/**
 * StaffAssignment List View
 *
 * Pure UI component for displaying StaffAssignment list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { useStaffAssignmentViewModel } from "../viewmodels/useStaffAssignmentViewModel";
import type { StaffAssignment } from "../../domain/entities/StaffAssignment";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { HRMS_PERMISSIONS } from "@modules/hrms/permission-constants";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffAssignmentListView = React.memo(function StaffAssignmentListView() {
  useModuleLocales(() => import("../../../locales"), "hrms-staff-assignment");
  const { vm } = useStaffAssignmentViewModel();
  const { t, language } = useI18n();
  const locale = resolveIntlLocale(language);

  const config: CrudConfig<StaffAssignment> = {
    titleKey: "staffAssignment.title",
    subtitleKey: "staffAssignment.description",
    resource: "staff-assignments",
    columns: [
      {
        key: "staffMemberId",
        label: t("staffAssignment.fields.staffMemberId"),
        sortable: true,
      },
      {
        key: "organizationUnitId",
        label: t("staffAssignment.fields.organizationUnitId"),
        sortable: true,
      },
      {
        key: "assignmentType",
        label: t("staffAssignment.fields.assignmentType"),
        sortable: true,
        render: (value: string) => <Badge variant="secondary">{value}</Badge>,
      },
      {
        key: "validFrom",
        label: t("staffAssignment.fields.validFrom"),
        render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-"),
        sortable: true,
      },
      {
        key: "validTo",
        label: t("staffAssignment.fields.validTo"),
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
        label: t("staffAssignment.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("staffAssignment.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "organizationUnitId",
        label: t("staffAssignment.fields.organizationUnitId"),
        type: "text" as const,
        placeholder: t("staffAssignment.placeholders.organizationUnitId"),
        required: true,
      },
      {
        name: "assignmentType",
        label: t("staffAssignment.fields.assignmentType"),
        type: "text" as const,
        placeholder: t("staffAssignment.placeholders.assignmentType"),
        required: true,
      },
      {
        name: "validFrom",
        label: t("staffAssignment.fields.validFrom"),
        type: "date" as const,
        placeholder: t("staffAssignment.placeholders.validFrom"),
        required: true,
      },
      {
        name: "validTo",
        label: t("staffAssignment.fields.validTo"),
        type: "date" as const,
        placeholder: t("staffAssignment.placeholders.validTo"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "staffMemberId",
        label: t("staffAssignment.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("staffAssignment.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "organizationUnitId",
        label: t("staffAssignment.fields.organizationUnitId"),
        type: "text" as const,
        placeholder: t("staffAssignment.placeholders.organizationUnitId"),
        required: true,
      },
      {
        name: "assignmentType",
        label: t("staffAssignment.fields.assignmentType"),
        type: "text" as const,
        placeholder: t("staffAssignment.placeholders.assignmentType"),
        required: true,
      },
      {
        name: "validFrom",
        label: t("staffAssignment.fields.validFrom"),
        type: "date" as const,
        placeholder: t("staffAssignment.placeholders.validFrom"),
        required: true,
      },
      {
        name: "validTo",
        label: t("staffAssignment.fields.validTo"),
        type: "date" as const,
        placeholder: t("staffAssignment.placeholders.validTo"),
      },
    ],
    createInitialValues: {
      staffMemberId: "",
      organizationUnitId: "",
      assignmentType: "",
      validFrom: "",
      validTo: "",
    },
    editInitialValues: (item: StaffAssignment) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      organizationUnitId: item.organizationUnitId,
      assignmentType: item.assignmentType,
      validFrom: item.validFrom,
      validTo: item.validTo,
    }),
    // StaffAssignment is a pure join between a staff member and an org unit —
    // it has no name-shaped field of its own, so the FK remains the most
    // identifying value available.
    getItemDisplayName: (item: StaffAssignment) => item.staffMemberId,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<StaffAssignment>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: StaffAssignment) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
        requiredPermission: HRMS_PERMISSIONS.STAFF_ASSIGNMENT_UPDATE,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: StaffAssignment) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
        requiredPermission: HRMS_PERMISSIONS.STAFF_ASSIGNMENT_DELETE,
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
