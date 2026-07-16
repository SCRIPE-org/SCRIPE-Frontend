/**
* PartyRelationship List View
*
* Pure UI component for displaying PartyRelationship list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { usePartyRelationshipViewModel } from "../viewmodels/usePartyRelationshipViewModel";
import type { PartyRelationship } from "../../domain/entities/PartyRelationship";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const PartyRelationshipListView = React.memo(function PartyRelationshipListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
const { vm } = usePartyRelationshipViewModel();

const config: CrudConfig<PartyRelationship> = {
      titleKey: "partyRelationship.title",
      subtitleKey: "partyRelationship.description",
      resource: "party-relationships",
      columns: [
      {
      key: "sourcePartyId",
      label: "SourcePartyId",
      sortable: true,
      },
      {
      key: "targetPartyId",
      label: "TargetPartyId",
      sortable: true,
      },
      {
      key: "relationshipType",
      label: "RelationshipType",
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
      name: "sourcePartyId",
      label: "SourcePartyId",
      type: "text" as const,
      placeholder: "Enter sourcePartyId",
      required: true,
      },
      {
      name: "targetPartyId",
      label: "TargetPartyId",
      type: "text" as const,
      placeholder: "Enter targetPartyId",
      required: true,
      },
      {
      name: "relationshipType",
      label: "RelationshipType",
      type: "text" as const,
      placeholder: "Enter relationshipType",
      required: true,
      },
      ],
      editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
      name: "sourcePartyId",
      label: "SourcePartyId",
      type: "text" as const,
      placeholder: "Enter sourcePartyId",
      required: true,
      },
      {
      name: "targetPartyId",
      label: "TargetPartyId",
      type: "text" as const,
      placeholder: "Enter targetPartyId",
      required: true,
      },
      {
      name: "relationshipType",
      label: "RelationshipType",
      type: "text" as const,
      placeholder: "Enter relationshipType",
      required: true,
      },
      ],
      createInitialValues: {
      sourcePartyId: "",
      targetPartyId: "",
      relationshipType: "",
      },
      editInitialValues: (item: PartyRelationship) => ({
      id: item.id,
      sourcePartyId: item.sourcePartyId,
      targetPartyId: item.targetPartyId,
      relationshipType: item.relationshipType,
      }),
      getItemDisplayName: (item: PartyRelationship) => item.sourcePartyId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });