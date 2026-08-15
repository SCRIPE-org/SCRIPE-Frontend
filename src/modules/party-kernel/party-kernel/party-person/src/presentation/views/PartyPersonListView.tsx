/**
 * PartyPerson List View
 *
 * Pure UI component for displaying PartyPerson list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { usePartyPersonViewModel } from "../viewmodels/usePartyPersonViewModel";
import type { PartyPerson } from "../../domain/entities/PartyPerson";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// Party ID is a raw GUID with no denormalized name on this entity (or on the backend
// DTO) to fall back to — shorten for table legibility, keep the full value in a tooltip.
function shortId(id: string | undefined): string {
  if (!id) return "-";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

// P5.4: React.memo prevents unnecessary re-renders
export const PartyPersonListView = React.memo(function PartyPersonListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.partyPerson");
  const { vm } = usePartyPersonViewModel();
  const { t, language } = useI18n();

  const config: CrudConfig<PartyPerson> = {
    titleKey: "partyPerson.title",
    subtitleKey: "partyPerson.description",
    resource: "party-people",
    entityTypeKey: "party.person",
    columns: [
      {
        key: "partyId",
        label: t("partyPerson.columns.partyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "firstName",
        label: t("partyPerson.columns.firstName"),
        sortable: true,
      },
      {
        key: "lastName",
        label: t("partyPerson.columns.lastName"),
        sortable: true,
      },
      {
        key: "isMinor",
        label: t("partyPerson.columns.isMinor"),
        sortable: true,
        render: (value: boolean) => (
          <Badge variant={value ? "warning" : "secondary"}>
            {value ? t("partyPerson.badges.minor") : t("partyPerson.badges.adult")}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("partyPerson.columns.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "partyId",
        label: t("partyPerson.form.partyId"),
        type: "text" as const,
        placeholder: t("partyPerson.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "firstName",
        label: t("partyPerson.form.firstName"),
        type: "text" as const,
        placeholder: t("partyPerson.form.firstNamePlaceholder"),
        required: true,
      },
      {
        name: "lastName",
        label: t("partyPerson.form.lastName"),
        type: "text" as const,
        placeholder: t("partyPerson.form.lastNamePlaceholder"),
        required: true,
      },
      {
        name: "isMinor",
        label: t("partyPerson.form.isMinor"),
        type: "switch" as const,
        placeholder: t("partyPerson.form.isMinorPlaceholder"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "partyId",
        label: t("partyPerson.form.partyId"),
        type: "text" as const,
        placeholder: t("partyPerson.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "firstName",
        label: t("partyPerson.form.firstName"),
        type: "text" as const,
        placeholder: t("partyPerson.form.firstNamePlaceholder"),
        required: true,
      },
      {
        name: "lastName",
        label: t("partyPerson.form.lastName"),
        type: "text" as const,
        placeholder: t("partyPerson.form.lastNamePlaceholder"),
        required: true,
      },
      {
        name: "isMinor",
        label: t("partyPerson.form.isMinor"),
        type: "switch" as const,
        placeholder: t("partyPerson.form.isMinorPlaceholder"),
      },
    ],
    createInitialValues: {
      partyId: "",
      firstName: "",
      lastName: "",
      isMinor: false,
    },
    editInitialValues: (item: PartyPerson) => ({
      id: item.id,
      partyId: item.partyId,
      firstName: item.firstName,
      lastName: item.lastName,
      isMinor: item.isMinor,
    }),
    getItemDisplayName: (item: PartyPerson) =>
      [item.firstName, item.lastName].filter(Boolean).join(" ") || item.partyId,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<PartyPerson>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: PartyPerson) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: PartyPerson) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
