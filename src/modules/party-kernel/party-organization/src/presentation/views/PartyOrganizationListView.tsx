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

// P5.4: React.memo prevents unnecessary re-renders
export const PartyOrganizationListView = React.memo(function PartyOrganizationListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
const { vm } = usePartyOrganizationViewModel();

const config: CrudConfig<PartyOrganization> = {
      titleKey: "partyOrganization.title",
      subtitleKey: "partyOrganization.description",
      resource: "party-organizations",
      columns: [
      {
      key: "partyId",
      label: "PartyId",
      sortable: true,
      },
      {
      key: "legalName",
      label: "LegalName",
      sortable: true,
      },
      {
      key: "taxId",
      label: "TaxId",
      sortable: true,
      },
      {
      key: "createdAt",
      label: "Created",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
      },
      ],
      createFields: [
      {
      name: "partyId",
      label: "PartyId",
      type: "text" as const,
      placeholder: "Enter partyId",
      required: true,
      },
      {
      name: "legalName",
      label: "LegalName",
      type: "text" as const,
      placeholder: "Enter legalName",
      required: true,
      },
      {
      name: "taxId",
      label: "TaxId",
      type: "text" as const,
      placeholder: "Enter taxId",
      },
      ],
      editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
      name: "partyId",
      label: "PartyId",
      type: "text" as const,
      placeholder: "Enter partyId",
      required: true,
      },
      {
      name: "legalName",
      label: "LegalName",
      type: "text" as const,
      placeholder: "Enter legalName",
      required: true,
      },
      {
      name: "taxId",
      label: "TaxId",
      type: "text" as const,
      placeholder: "Enter taxId",
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
      getItemDisplayName: (item: PartyOrganization) => item.partyId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });