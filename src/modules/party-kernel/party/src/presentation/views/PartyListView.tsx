/**
* Party List View
*
* Pure UI component for displaying Party list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { usePartyViewModel } from "../viewmodels/usePartyViewModel";
import type { Party } from "../../domain/entities/Party";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const PartyListView = React.memo(function PartyListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
const { vm } = usePartyViewModel();

const config: CrudConfig<Party> = {
      titleKey: "party.title",
      subtitleKey: "party.description",
      resource: "parties",
      columns: [
      {
      key: "type",
      label: "Type",
      sortable: true,
      },
      {
      key: "displayName",
      label: "DisplayName",
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
      name: "type",
      label: "Type",
      type: "text" as const,
      placeholder: "Enter type",
      required: true,
      },
      {
      name: "displayName",
      label: "DisplayName",
      type: "text" as const,
      placeholder: "Enter displayName",
      required: true,
      },
      ],
      editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
      name: "type",
      label: "Type",
      type: "text" as const,
      placeholder: "Enter type",
      required: true,
      },
      {
      name: "displayName",
      label: "DisplayName",
      type: "text" as const,
      placeholder: "Enter displayName",
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
      getItemDisplayName: (item: Party) => item.type,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });