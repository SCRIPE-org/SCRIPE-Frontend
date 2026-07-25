/**
 * EmploymentRecord List View
 *
 * Pure UI component for displaying EmploymentRecord list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useEmploymentRecordViewModel } from "../viewmodels/useEmploymentRecordViewModel";
import type { EmploymentRecord } from "../../domain/entities/EmploymentRecord";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// P5.4: React.memo prevents unnecessary re-renders
export const EmploymentRecordListView = React.memo(function EmploymentRecordListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useEmploymentRecordViewModel();
  const { t, language } = useI18n();
  const locale = resolveIntlLocale(language);

  const config: CrudConfig<EmploymentRecord> = {
    titleKey: "employmentRecord.title",
    subtitleKey: "employmentRecord.description",
    resource: "employment-records",
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
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
