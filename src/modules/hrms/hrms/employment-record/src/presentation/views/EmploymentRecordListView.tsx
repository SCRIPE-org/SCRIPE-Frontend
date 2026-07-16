/**
* EmploymentRecord List View
*
* Pure UI component for displaying EmploymentRecord list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useEmploymentRecordViewModel } from "../viewmodels/useEmploymentRecordViewModel";
import type { EmploymentRecord } from "../../domain/entities/EmploymentRecord";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const EmploymentRecordListView = React.memo(function EmploymentRecordListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
const { vm } = useEmploymentRecordViewModel();

const config: CrudConfig<EmploymentRecord> = {
      titleKey: "employmentRecord.title",
      subtitleKey: "employmentRecord.description",
      resource: "employment-records",
      columns: [
      {
      key: "staffMemberId",
      label: "StaffMemberId",
      sortable: true,
      },
      {
      key: "employmentType",
      label: "EmploymentType",
      sortable: true,
      },
      {
      key: "startDate",
      label: "StartDate",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
      sortable: true,
      },
      {
      key: "endDate",
      label: "EndDate",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
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
      name: "employmentType",
      label: "EmploymentType",
      type: "text" as const,
      placeholder: "Enter employmentType",
      required: true,
      },
      {
      name: "startDate",
      label: "StartDate",
      type: "date" as const,
      placeholder: "Enter startDate",
      required: true,
      },
      {
      name: "endDate",
      label: "EndDate",
      type: "date" as const,
      placeholder: "Enter endDate",
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
      name: "employmentType",
      label: "EmploymentType",
      type: "text" as const,
      placeholder: "Enter employmentType",
      required: true,
      },
      {
      name: "startDate",
      label: "StartDate",
      type: "date" as const,
      placeholder: "Enter startDate",
      required: true,
      },
      {
      name: "endDate",
      label: "EndDate",
      type: "date" as const,
      placeholder: "Enter endDate",
      },
      ],
      createInitialValues: {
      staffMemberId: "",
      employmentType: "",
      startDate: "",
            endDate: "",
            },
      editInitialValues: (item: EmploymentRecord) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      employmentType: item.employmentType,
      startDate: item.startDate,
      endDate: item.endDate,
      }),
      getItemDisplayName: (item: EmploymentRecord) => item.staffMemberId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });