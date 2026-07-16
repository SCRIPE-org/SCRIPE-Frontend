/**
* PartyRole List View
*
* Pure UI component for displaying PartyRole list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { usePartyRoleViewModel } from "../viewmodels/usePartyRoleViewModel";
import type { PartyRole } from "../../domain/entities/PartyRole";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const PartyRoleListView = React.memo(function PartyRoleListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
const { vm } = usePartyRoleViewModel();

const config: CrudConfig<PartyRole> = {
      titleKey: "partyRole.title",
      subtitleKey: "partyRole.description",
      resource: "party-roles",
      columns: [
      {
      key: "partyId",
      label: "PartyId",
      sortable: true,
      },
      {
      key: "roleType",
      label: "RoleType",
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
      name: "roleType",
      label: "RoleType",
      type: "text" as const,
      placeholder: "Enter roleType",
      required: true,
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
      name: "roleType",
      label: "RoleType",
      type: "text" as const,
      placeholder: "Enter roleType",
      required: true,
      },
      ],
      createInitialValues: {
      partyId: "",
      roleType: "",
      },
      editInitialValues: (item: PartyRole) => ({
      id: item.id,
      partyId: item.partyId,
      roleType: item.roleType,
      }),
      getItemDisplayName: (item: PartyRole) => item.partyId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });