/**
* Hrms List View
*
* Pure UI component for displaying Hrms list.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useHrmsViewModel } from "../viewmodels/useHrmsViewModel";
import type { Hrms } from "../../domain/entities/Hrms";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const HrmsListView = React.memo(function HrmsListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useHrmsViewModel();

  const config: CrudConfig<Hrms> = {
    titleKey: "hrms.title",
    subtitleKey: "hrms.description",
    resource: "hrms",
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
    editInitialValues: (item: Hrms) => ({
      id: item.id,
      name: item.name,
    }),
    getItemDisplayName: (item: Hrms) => item.name,
  };

  return (
    <GenericCrudView viewModel={vm} config={config} />
  );
});