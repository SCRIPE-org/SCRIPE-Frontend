/**
 * StaffCompetency List View
 *
 * Pure UI component for displaying StaffCompetency list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { useStaffCompetencyViewModel } from "../viewmodels/useStaffCompetencyViewModel";
import type { StaffCompetency } from "../../domain/entities/StaffCompetency";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffCompetencyListView = React.memo(function StaffCompetencyListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useStaffCompetencyViewModel();
  const { t, language } = useI18n();
  const locale = resolveIntlLocale(language);

  const config: CrudConfig<StaffCompetency> = {
    titleKey: "staffCompetency.title",
    subtitleKey: "staffCompetency.description",
    resource: "staff-competencies",
    columns: [
      {
        key: "competencyName",
        label: t("staffCompetency.fields.competencyName"),
        sortable: true,
      },
      {
        key: "level",
        label: t("staffCompetency.fields.level"),
        sortable: true,
        render: (value: string) => <Badge variant="secondary">{value}</Badge>,
      },
      {
        key: "staffMemberId",
        label: t("staffCompetency.fields.staffMemberId"),
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
        label: t("staffCompetency.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("staffCompetency.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "competencyName",
        label: t("staffCompetency.fields.competencyName"),
        type: "text" as const,
        placeholder: t("staffCompetency.placeholders.competencyName"),
        required: true,
      },
      {
        name: "level",
        label: t("staffCompetency.fields.level"),
        type: "text" as const,
        placeholder: t("staffCompetency.placeholders.level"),
        required: true,
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "staffMemberId",
        label: t("staffCompetency.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("staffCompetency.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "competencyName",
        label: t("staffCompetency.fields.competencyName"),
        type: "text" as const,
        placeholder: t("staffCompetency.placeholders.competencyName"),
        required: true,
      },
      {
        name: "level",
        label: t("staffCompetency.fields.level"),
        type: "text" as const,
        placeholder: t("staffCompetency.placeholders.level"),
        required: true,
      },
    ],
    createInitialValues: {
      staffMemberId: "",
      competencyName: "",
      level: "",
    },
    editInitialValues: (item: StaffCompetency) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      competencyName: item.competencyName,
      level: item.level,
    }),
    getItemDisplayName: (item: StaffCompetency) => item.competencyName,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<StaffCompetency>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: StaffCompetency) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: StaffCompetency) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
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
