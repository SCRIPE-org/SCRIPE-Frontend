/**
* MergeCandidate List View
*
* Pure UI component for displaying MergeCandidate list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMergeCandidateViewModel } from "../viewmodels/useMergeCandidateViewModel";
import type { MergeCandidate } from "../../domain/entities/MergeCandidate";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const MergeCandidateListView = React.memo(function MergeCandidateListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
const { vm } = useMergeCandidateViewModel();

const config: CrudConfig<MergeCandidate> = {
      titleKey: "mergeCandidate.title",
      subtitleKey: "mergeCandidate.description",
      resource: "merge-candidates",
      columns: [
      {
      key: "primaryPartyId",
      label: "PrimaryPartyId",
      sortable: true,
      },
      {
      key: "duplicatePartyId",
      label: "DuplicatePartyId",
      sortable: true,
      },
      {
      key: "status",
      label: "Status",
      sortable: true,
      },
      {
      key: "reason",
      label: "Reason",
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
      name: "primaryPartyId",
      label: "PrimaryPartyId",
      type: "text" as const,
      placeholder: "Enter primaryPartyId",
      required: true,
      },
      {
      name: "duplicatePartyId",
      label: "DuplicatePartyId",
      type: "text" as const,
      placeholder: "Enter duplicatePartyId",
      required: true,
      },
      {
      name: "status",
      label: "Status",
      type: "text" as const,
      placeholder: "Enter status",
      required: true,
      },
      {
      name: "reason",
      label: "Reason",
      type: "text" as const,
      placeholder: "Enter reason",
      },
      ],
      editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
      name: "primaryPartyId",
      label: "PrimaryPartyId",
      type: "text" as const,
      placeholder: "Enter primaryPartyId",
      required: true,
      },
      {
      name: "duplicatePartyId",
      label: "DuplicatePartyId",
      type: "text" as const,
      placeholder: "Enter duplicatePartyId",
      required: true,
      },
      {
      name: "status",
      label: "Status",
      type: "text" as const,
      placeholder: "Enter status",
      required: true,
      },
      {
      name: "reason",
      label: "Reason",
      type: "text" as const,
      placeholder: "Enter reason",
      },
      ],
      createInitialValues: {
      primaryPartyId: "",
      duplicatePartyId: "",
      status: "",
      reason: "",
      },
      editInitialValues: (item: MergeCandidate) => ({
      id: item.id,
      primaryPartyId: item.primaryPartyId,
      duplicatePartyId: item.duplicatePartyId,
      status: item.status,
      reason: item.reason,
      }),
      getItemDisplayName: (item: MergeCandidate) => item.primaryPartyId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });