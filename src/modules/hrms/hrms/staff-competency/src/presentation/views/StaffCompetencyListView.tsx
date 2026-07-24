/**
 * StaffCompetency List View
 *
 * Pure UI component for displaying StaffCompetency list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useStaffCompetencyViewModel } from "../viewmodels/useStaffCompetencyViewModel";
import type { StaffCompetency } from "../../domain/entities/StaffCompetency";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffCompetencyListView = React.memo(function StaffCompetencyListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useStaffCompetencyViewModel();
  const { t, language } = useI18n();
  const locale = language === "ar" ? "ar-EG" : "en-US";

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
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
