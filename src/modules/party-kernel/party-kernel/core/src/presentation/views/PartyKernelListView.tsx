/**
 * PartyKernel List View
 *
 * Pure UI component for displaying PartyKernel list.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { usePartyKernelViewModel } from "../viewmodels/usePartyKernelViewModel";
import type { PartyKernel } from "../../domain/entities/PartyKernel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

// P5.4: React.memo prevents unnecessary re-renders
export const PartyKernelListView = React.memo(function PartyKernelListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.core");
  const { vm } = usePartyKernelViewModel();
  const { t, language } = useI18n();

  const config: CrudConfig<PartyKernel> = {
    titleKey: "partyKernel.title",
    subtitleKey: "partyKernel.description",
    resource: "party-kernels",
    columns: [
      {
        key: "name",
        label: t("partyKernel.columns.name"),
        sortable: true,
      },
      {
        key: "createdAt",
        label: t("partyKernel.columns.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "name",
        label: t("partyKernel.form.name"),
        type: "text" as const,
        placeholder: t("partyKernel.form.namePlaceholder"),
        required: true,
      },
    ],
    editFields: [
      {
        name: "name",
        label: t("partyKernel.form.name"),
        type: "text" as const,
        placeholder: t("partyKernel.form.namePlaceholder"),
        required: true,
      },
      { name: "id", type: "hidden" as const, required: true },
    ],
    createInitialValues: {
      name: "",
    },
    editInitialValues: (item: PartyKernel) => ({
      id: item.id,
      name: item.name,
    }),
    getItemDisplayName: (item: PartyKernel) => item.name,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<PartyKernel>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: PartyKernel) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: PartyKernel) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
