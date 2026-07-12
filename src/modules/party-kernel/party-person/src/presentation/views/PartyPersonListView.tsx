/**
* PartyPerson List View
*
* Pure UI component for displaying PartyPerson list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { usePartyPersonViewModel } from "../viewmodels/usePartyPersonViewModel";
import type { PartyPerson } from "../../domain/entities/PartyPerson";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const PartyPersonListView = React.memo(function PartyPersonListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
const { vm } = usePartyPersonViewModel();

const config: CrudConfig<PartyPerson> = {
      titleKey: "partyPerson.title",
      subtitleKey: "partyPerson.description",
      resource: "party-people",
      columns: [
      {
      key: "partyId",
      label: "PartyId",
      sortable: true,
      },
      {
      key: "firstName",
      label: "FirstName",
      sortable: true,
      },
      {
      key: "lastName",
      label: "LastName",
      sortable: true,
      },
      {
      key: "isMinor",
      label: "IsMinor",
      render: (value: boolean) => value ? "✓" : "✗",
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
      name: "firstName",
      label: "FirstName",
      type: "text" as const,
      placeholder: "Enter firstName",
      required: true,
      },
      {
      name: "lastName",
      label: "LastName",
      type: "text" as const,
      placeholder: "Enter lastName",
      required: true,
      },
      {
      name: "isMinor",
      label: "IsMinor",
      type: "switch" as const,
      placeholder: "Enter isMinor",
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
      name: "firstName",
      label: "FirstName",
      type: "text" as const,
      placeholder: "Enter firstName",
      required: true,
      },
      {
      name: "lastName",
      label: "LastName",
      type: "text" as const,
      placeholder: "Enter lastName",
      required: true,
      },
      {
      name: "isMinor",
      label: "IsMinor",
      type: "switch" as const,
      placeholder: "Enter isMinor",
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
      getItemDisplayName: (item: PartyPerson) => item.partyId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });