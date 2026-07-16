/**
* StaffMember List View
*
* Pure UI component for displaying StaffMember list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useStaffMemberViewModel } from "../viewmodels/useStaffMemberViewModel";
import type { StaffMember } from "../../domain/entities/StaffMember";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffMemberListView = React.memo(function StaffMemberListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
const { vm } = useStaffMemberViewModel();

const config: CrudConfig<StaffMember> = {
      titleKey: "staffMember.title",
      subtitleKey: "staffMember.description",
      resource: "staff-members",
      columns: [
      {
      key: "identityUserId",
      label: "IdentityUserId",
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
      key: "email",
      label: "Email",
      sortable: true,
      },
      {
      key: "jobTitle",
      label: "JobTitle",
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
      name: "identityUserId",
      label: "IdentityUserId",
      type: "text" as const,
      placeholder: "Enter identityUserId",
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
      name: "email",
      label: "Email",
      type: "text" as const,
      placeholder: "Enter email",
      },
      {
      name: "jobTitle",
      label: "JobTitle",
      type: "text" as const,
      placeholder: "Enter jobTitle",
      },
      {
      name: "isActive",
      label: "IsActive",
      type: "switch" as const,
      placeholder: "Enter isActive",
      },
      ],
      editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
      name: "identityUserId",
      label: "IdentityUserId",
      type: "text" as const,
      placeholder: "Enter identityUserId",
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
      name: "email",
      label: "Email",
      type: "text" as const,
      placeholder: "Enter email",
      },
      {
      name: "jobTitle",
      label: "JobTitle",
      type: "text" as const,
      placeholder: "Enter jobTitle",
      },
      {
      name: "isActive",
      label: "IsActive",
      type: "switch" as const,
      placeholder: "Enter isActive",
      },
      ],
      createInitialValues: {
      identityUserId: "",
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      isActive: false,
      },
      editInitialValues: (item: StaffMember) => ({
      id: item.id,
      identityUserId: item.identityUserId,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      jobTitle: item.jobTitle,
      isActive: item.isActive,
      }),
      getItemDisplayName: (item: StaffMember) => item.identityUserId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });