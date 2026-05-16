/**
* Marketplace List View
*
* Pure UI component for displaying Marketplace list.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMarketplaceViewModel } from "../viewmodels/useMarketplaceViewModel";
import type { Marketplace } from "../../domain/entities/Marketplace";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const MarketplaceListView = React.memo(function MarketplaceListView() {
  useModuleLocales(() => import("../../../locales"), "marketplace");
  const { vm } = useMarketplaceViewModel();

  const config: CrudConfig<Marketplace> = {
    titleKey: "marketplace.title",
    subtitleKey: "marketplace.description",
    resource: "marketplaces",
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
    editInitialValues: (item: Marketplace) => ({
      id: item.id,
      name: item.name,
    }),
    getItemDisplayName: (item: Marketplace) => item.name,
  };

  return (
    <GenericCrudView viewModel={vm} config={config} />
  );
});