/**
* StaffAssignment List View
*
* Pure UI component for displaying StaffAssignment list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useStaffAssignmentViewModel } from "../viewmodels/useStaffAssignmentViewModel";
import type { StaffAssignment } from "../../domain/entities/StaffAssignment";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffAssignmentListView = React.memo(function StaffAssignmentListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
const { vm } = useStaffAssignmentViewModel();

const config: CrudConfig<StaffAssignment> = {
      titleKey: "staffAssignment.title",
      subtitleKey: "staffAssignment.description",
      resource: "staff-assignments",
      columns: [
      {
      key: "staffMemberId",
      label: "StaffMemberId",
      sortable: true,
      },
      {
      key: "organizationUnitId",
      label: "OrganizationUnitId",
      sortable: true,
      },
      {
      key: "assignmentType",
      label: "AssignmentType",
      sortable: true,
      },
      {
      key: "validFrom",
      label: "ValidFrom",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
      sortable: true,
      },
      {
      key: "validTo",
      label: "ValidTo",
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
      name: "organizationUnitId",
      label: "OrganizationUnitId",
      type: "text" as const,
      placeholder: "Enter organizationUnitId",
      required: true,
      },
      {
      name: "assignmentType",
      label: "AssignmentType",
      type: "text" as const,
      placeholder: "Enter assignmentType",
      required: true,
      },
      {
      name: "validFrom",
      label: "ValidFrom",
      type: "date" as const,
      placeholder: "Enter validFrom",
      required: true,
      },
      {
      name: "validTo",
      label: "ValidTo",
      type: "date" as const,
      placeholder: "Enter validTo",
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
      name: "organizationUnitId",
      label: "OrganizationUnitId",
      type: "text" as const,
      placeholder: "Enter organizationUnitId",
      required: true,
      },
      {
      name: "assignmentType",
      label: "AssignmentType",
      type: "text" as const,
      placeholder: "Enter assignmentType",
      required: true,
      },
      {
      name: "validFrom",
      label: "ValidFrom",
      type: "date" as const,
      placeholder: "Enter validFrom",
      required: true,
      },
      {
      name: "validTo",
      label: "ValidTo",
      type: "date" as const,
      placeholder: "Enter validTo",
      },
      ],
      createInitialValues: {
      staffMemberId: "",
      organizationUnitId: "",
      assignmentType: "",
      validFrom: "",
            validTo: "",
            },
      editInitialValues: (item: StaffAssignment) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      organizationUnitId: item.organizationUnitId,
      assignmentType: item.assignmentType,
      validFrom: item.validFrom,
      validTo: item.validTo,
      }),
      getItemDisplayName: (item: StaffAssignment) => item.staffMemberId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });