/**
 * Party List View
 *
 * Pure UI component for displaying Party list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { usePartyViewModel } from "../viewmodels/usePartyViewModel";
import type { Party } from "../../domain/entities/Party";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// PartyType (backend enum, serialized as its string name): Person, Organization.
const TYPE_BADGE_VARIANT: Record<string, "info" | "success"> = {
  Person: "info",
  Organization: "success",
};

// P5.4: React.memo prevents unnecessary re-renders
export const PartyListView = React.memo(function PartyListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.party");
  const { vm } = usePartyViewModel();
  const { t, language } = useI18n();

  const TYPE_OPTIONS = [
    { value: "Person", label: t("party.types.Person") },
    { value: "Organization", label: t("party.types.Organization") },
  ];

  const config: CrudConfig<Party> = {
    titleKey: "party.title",
    subtitleKey: "party.description",
    resource: "parties",
    entityTypeKey: "party.party",
    columns: [
      {
        key: "type",
        label: t("party.columns.type"),
        sortable: true,
        render: (value: string) => (
          <Badge variant={TYPE_BADGE_VARIANT[value] ?? "secondary"}>
            {t(`party.types.${value}`) || value}
          </Badge>
        ),
      },
      {
        key: "displayName",
        label: t("party.columns.displayName"),
        sortable: true,
      },
      {
        key: "createdAt",
        label: t("party.columns.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "type",
        label: t("party.form.type"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("party.form.typePlaceholder"),
        required: true,
      },
      {
        name: "displayName",
        label: t("party.form.displayName"),
        type: "text" as const,
        placeholder: t("party.form.displayNamePlaceholder"),
        required: true,
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "type",
        label: t("party.form.type"),
        type: "select" as const,
        options: TYPE_OPTIONS,
        placeholder: t("party.form.typePlaceholder"),
        required: true,
      },
      {
        name: "displayName",
        label: t("party.form.displayName"),
        type: "text" as const,
        placeholder: t("party.form.displayNamePlaceholder"),
        required: true,
      },
    ],
    createInitialValues: {
      type: "",
      displayName: "",
    },
    editInitialValues: (item: Party) => ({
      id: item.id,
      type: item.type,
      displayName: item.displayName,
    }),
    getItemDisplayName: (item: Party) => item.displayName || item.type,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<Party>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: Party) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: Party) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
