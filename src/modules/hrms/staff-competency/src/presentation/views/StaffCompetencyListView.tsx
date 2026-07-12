/**
* StaffCompetency List View
*
* Pure UI component for displaying StaffCompetency list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useStaffCompetencyViewModel } from "../viewmodels/useStaffCompetencyViewModel";
import type { StaffCompetency } from "../../domain/entities/StaffCompetency";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffCompetencyListView = React.memo(function StaffCompetencyListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
const { vm } = useStaffCompetencyViewModel();

const config: CrudConfig<StaffCompetency> = {
      titleKey: "staffCompetency.title",
      subtitleKey: "staffCompetency.description",
      resource: "staff-competencies",
      columns: [
      {
      key: "staffMemberId",
      label: "StaffMemberId",
      sortable: true,
      },
      {
      key: "competencyName",
      label: "CompetencyName",
      sortable: true,
      },
      {
      key: "level",
      label: "Level",
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
      name: "staffMemberId",
      label: "StaffMemberId",
      type: "text" as const,
      placeholder: "Enter staffMemberId",
      required: true,
      },
      {
      name: "competencyName",
      label: "CompetencyName",
      type: "text" as const,
      placeholder: "Enter competencyName",
      required: true,
      },
      {
      name: "level",
      label: "Level",
      type: "text" as const,
      placeholder: "Enter level",
      required: true,
      },
      ],
      editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
      name: "staffMemberId",
      label: "StaffMemberId",
      type: "text" as const,
      placeholder: "Enter staffMemberId",
      required: true,
      },
      {
      name: "competencyName",
      label: "CompetencyName",
      type: "text" as const,
      placeholder: "Enter competencyName",
      required: true,
      },
      {
      name: "level",
      label: "Level",
      type: "text" as const,
      placeholder: "Enter level",
      required: true,
      },
      ],
      createInitialValues: {
      staffMemberId: "",
      competencyName: "",
      level: "",
      },
      editInitialValues: (item: StaffCompetency) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      competencyName: item.competencyName,
      level: item.level,
      }),
      getItemDisplayName: (item: StaffCompetency) => item.staffMemberId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });