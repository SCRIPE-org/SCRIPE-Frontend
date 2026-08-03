/**
 * Qualification List View
 *
 * Pure UI component for displaying Qualification list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { useQualificationViewModel } from "../viewmodels/useQualificationViewModel";
import type { Qualification } from "../../domain/entities/Qualification";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

// P5.4: React.memo prevents unnecessary re-renders
export const QualificationListView = React.memo(function QualificationListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useQualificationViewModel();
  const { t, language } = useI18n();
  const locale = resolveIntlLocale(language);

  const config: CrudConfig<Qualification> = {
    titleKey: "qualification.title",
    subtitleKey: "qualification.description",
    resource: "qualifications",
    columns: [
      {
        key: "title",
        label: t("qualification.fields.title"),
        sortable: true,
      },
      {
        key: "institution",
        label: t("qualification.fields.institution"),
        sortable: true,
      },
      {
        key: "staffMemberId",
        label: t("qualification.fields.staffMemberId"),
        sortable: true,
      },
      {
        key: "awardedOn",
        label: t("qualification.fields.awardedOn"),
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
        label: t("qualification.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("qualification.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "title",
        label: t("qualification.fields.title"),
        type: "text" as const,
        placeholder: t("qualification.placeholders.title"),
        required: true,
      },
      {
        name: "institution",
        label: t("qualification.fields.institution"),
        type: "text" as const,
        placeholder: t("qualification.placeholders.institution"),
      },
      {
        name: "awardedOn",
        label: t("qualification.fields.awardedOn"),
        type: "date" as const,
        placeholder: t("qualification.placeholders.awardedOn"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "staffMemberId",
        label: t("qualification.fields.staffMemberId"),
        type: "text" as const,
        placeholder: t("qualification.placeholders.staffMemberId"),
        required: true,
      },
      {
        name: "title",
        label: t("qualification.fields.title"),
        type: "text" as const,
        placeholder: t("qualification.placeholders.title"),
        required: true,
      },
      {
        name: "institution",
        label: t("qualification.fields.institution"),
        type: "text" as const,
        placeholder: t("qualification.placeholders.institution"),
      },
      {
        name: "awardedOn",
        label: t("qualification.fields.awardedOn"),
        type: "date" as const,
        placeholder: t("qualification.placeholders.awardedOn"),
      },
    ],
    createInitialValues: {
      staffMemberId: "",
      title: "",
      institution: "",
      awardedOn: "",
    },
    editInitialValues: (item: Qualification) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      title: item.title,
      institution: item.institution,
      awardedOn: item.awardedOn,
    }),
    getItemDisplayName: (item: Qualification) => item.title,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<Qualification>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: Qualification) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: Qualification) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
