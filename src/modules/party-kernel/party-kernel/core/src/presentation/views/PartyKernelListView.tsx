/**
* PartyKernel List View
*
* Pure UI component for displaying PartyKernel list.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { usePartyKernelViewModel } from "../viewmodels/usePartyKernelViewModel";
import type { PartyKernel } from "../../domain/entities/PartyKernel";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const PartyKernelListView = React.memo(function PartyKernelListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
  const { vm } = usePartyKernelViewModel();

  const config: CrudConfig<PartyKernel> = {
    titleKey: "partyKernel.title",
    subtitleKey: "partyKernel.description",
    resource: "party-kernels",
    columns: [
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "createdAt",
        label: "Created",
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
    ],
    createFields: [
      {
        name: "name",
        label: "Name",
        type: "text" as const,
        placeholder: "Enter name",
        required: true,
      },
    ],
    editFields: [
      {
        name: "name",
        label: "Name",
        type: "text" as const,
        placeholder: "Enter name",
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
  };

  return (
    <GenericCrudView viewModel={vm} config={config} />
  );
});