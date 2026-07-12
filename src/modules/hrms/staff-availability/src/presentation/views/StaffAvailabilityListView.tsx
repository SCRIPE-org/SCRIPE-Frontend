/**
* StaffAvailability List View
*
* Pure UI component for displaying StaffAvailability list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useStaffAvailabilityViewModel } from "../viewmodels/useStaffAvailabilityViewModel";
import type { StaffAvailability } from "../../domain/entities/StaffAvailability";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffAvailabilityListView = React.memo(function StaffAvailabilityListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
const { vm } = useStaffAvailabilityViewModel();

const config: CrudConfig<StaffAvailability> = {
      titleKey: "staffAvailability.title",
      subtitleKey: "staffAvailability.description",
      resource: "staff-availabilities",
      columns: [
      {
      key: "staffMemberId",
      label: "StaffMemberId",
      sortable: true,
      },
      {
      key: "dayOfWeek",
      label: "DayOfWeek",
      sortable: true,
      },
      {
      key: "startTime",
      label: "StartTime",
      sortable: true,
      },
      {
      key: "endTime",
      label: "EndTime",
      sortable: true,
      },
      {
      key: "isAvailable",
      label: "IsAvailable",
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
      name: "staffMemberId",
      label: "StaffMemberId",
      type: "text" as const,
      placeholder: "Enter staffMemberId",
      required: true,
      },
      {
      name: "dayOfWeek",
      label: "DayOfWeek",
      type: "number" as const,
      placeholder: "Enter dayOfWeek",
      required: true,
      },
      {
      name: "startTime",
      label: "StartTime",
      type: "text" as const,
      placeholder: "Enter startTime",
      required: true,
      },
      {
      name: "endTime",
      label: "EndTime",
      type: "text" as const,
      placeholder: "Enter endTime",
      required: true,
      },
      {
      name: "isAvailable",
      label: "IsAvailable",
      type: "switch" as const,
      placeholder: "Enter isAvailable",
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
      name: "dayOfWeek",
      label: "DayOfWeek",
      type: "number" as const,
      placeholder: "Enter dayOfWeek",
      required: true,
      },
      {
      name: "startTime",
      label: "StartTime",
      type: "text" as const,
      placeholder: "Enter startTime",
      required: true,
      },
      {
      name: "endTime",
      label: "EndTime",
      type: "text" as const,
      placeholder: "Enter endTime",
      required: true,
      },
      {
      name: "isAvailable",
      label: "IsAvailable",
      type: "switch" as const,
      placeholder: "Enter isAvailable",
      },
      ],
      createInitialValues: {
      staffMemberId: "",
      dayOfWeek: 0,
      startTime: "",
      endTime: "",
      isAvailable: false,
      },
      editInitialValues: (item: StaffAvailability) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      isAvailable: item.isAvailable,
      }),
      getItemDisplayName: (item: StaffAvailability) => item.staffMemberId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });