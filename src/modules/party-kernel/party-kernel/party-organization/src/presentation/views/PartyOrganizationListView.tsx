/**
 * PartyOrganization List View
 *
 * Pure UI component for displaying PartyOrganization list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { usePartyOrganizationViewModel } from "../viewmodels/usePartyOrganizationViewModel";
import type { PartyOrganization } from "../../domain/entities/PartyOrganization";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";

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
          value
            ? new Date(value).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
            : "-",
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
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
