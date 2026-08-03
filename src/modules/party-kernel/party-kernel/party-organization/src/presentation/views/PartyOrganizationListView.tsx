/**
 * PartyOrganization List View
 *
 * Pure UI component for displaying PartyOrganization list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { usePartyOrganizationViewModel } from "../viewmodels/usePartyOrganizationViewModel";
import type { PartyOrganization } from "../../domain/entities/PartyOrganization";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

// Party ID is a raw GUID with no denormalized name on this entity (or on the backend
// DTO) to fall back to — shorten for table legibility, keep the full value in a tooltip.
function shortId(id: string | undefined): string {
  if (!id) return "-";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

// P5.4: React.memo prevents unnecessary re-renders
export const PartyOrganizationListView = React.memo(function PartyOrganizationListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.partyOrganization");
  const { vm } = usePartyOrganizationViewModel();
  const { t, language } = useI18n();

  const config: CrudConfig<PartyOrganization> = {
    titleKey: "partyOrganization.title",
    subtitleKey: "partyOrganization.description",
    resource: "party-organizations",
    columns: [
      {
        key: "partyId",
        label: t("partyOrganization.columns.partyId"),
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-xs" title={value}>
            {shortId(value)}
          </span>
        ),
      },
      {
        key: "legalName",
        label: t("partyOrganization.columns.legalName"),
        sortable: true,
      },
      {
        key: "taxId",
        label: t("partyOrganization.columns.taxId"),
        sortable: true,
        render: (value: string) => value || "-",
      },
      {
        key: "createdAt",
        label: t("partyOrganization.columns.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "partyId",
        label: t("partyOrganization.form.partyId"),
        type: "text" as const,
        placeholder: t("partyOrganization.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "legalName",
        label: t("partyOrganization.form.legalName"),
        type: "text" as const,
        placeholder: t("partyOrganization.form.legalNamePlaceholder"),
        required: true,
      },
      {
        name: "taxId",
        label: t("partyOrganization.form.taxId"),
        type: "text" as const,
        placeholder: t("partyOrganization.form.taxIdPlaceholder"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "partyId",
        label: t("partyOrganization.form.partyId"),
        type: "text" as const,
        placeholder: t("partyOrganization.form.partyIdPlaceholder"),
        required: true,
      },
      {
        name: "legalName",
        label: t("partyOrganization.form.legalName"),
        type: "text" as const,
        placeholder: t("partyOrganization.form.legalNamePlaceholder"),
        required: true,
      },
      {
        name: "taxId",
        label: t("partyOrganization.form.taxId"),
        type: "text" as const,
        placeholder: t("partyOrganization.form.taxIdPlaceholder"),
      },
    ],
    createInitialValues: {
      partyId: "",
      legalName: "",
      taxId: "",
    },
    editInitialValues: (item: PartyOrganization) => ({
      id: item.id,
      partyId: item.partyId,
      legalName: item.legalName,
      taxId: item.taxId,
    }),
    getItemDisplayName: (item: PartyOrganization) => item.legalName || item.partyId,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<PartyOrganization>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: PartyOrganization) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: PartyOrganization) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
