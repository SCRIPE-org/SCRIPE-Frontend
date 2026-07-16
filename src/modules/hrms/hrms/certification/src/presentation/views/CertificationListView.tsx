/**
* Certification List View
*
* Pure UI component for displaying Certification list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useCertificationViewModel } from "../viewmodels/useCertificationViewModel";
import type { Certification } from "../../domain/entities/Certification";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const CertificationListView = React.memo(function CertificationListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
const { vm } = useCertificationViewModel();

const config: CrudConfig<Certification> = {
      titleKey: "certification.title",
      subtitleKey: "certification.description",
      resource: "certifications",
      columns: [
      {
      key: "staffMemberId",
      label: "StaffMemberId",
      sortable: true,
      },
      {
      key: "name",
      label: "Name",
      sortable: true,
      },
      {
      key: "issuer",
      label: "Issuer",
      sortable: true,
      },
      {
      key: "issuedOn",
      label: "IssuedOn",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
      sortable: true,
      },
      {
      key: "expiresOn",
      label: "ExpiresOn",
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
      name: "name",
      label: "Name",
      type: "text" as const,
      placeholder: "Enter name",
      required: true,
      },
      {
      name: "issuer",
      label: "Issuer",
      type: "text" as const,
      placeholder: "Enter issuer",
      },
      {
      name: "issuedOn",
      label: "IssuedOn",
      type: "date" as const,
      placeholder: "Enter issuedOn",
      required: true,
      },
      {
      name: "expiresOn",
      label: "ExpiresOn",
      type: "date" as const,
      placeholder: "Enter expiresOn",
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
      name: "name",
      label: "Name",
      type: "text" as const,
      placeholder: "Enter name",
      required: true,
      },
      {
      name: "issuer",
      label: "Issuer",
      type: "text" as const,
      placeholder: "Enter issuer",
      },
      {
      name: "issuedOn",
      label: "IssuedOn",
      type: "date" as const,
      placeholder: "Enter issuedOn",
      required: true,
      },
      {
      name: "expiresOn",
      label: "ExpiresOn",
      type: "date" as const,
      placeholder: "Enter expiresOn",
      },
      ],
      createInitialValues: {
      staffMemberId: "",
      name: "",
      issuer: "",
      issuedOn: "",
            expiresOn: "",
            },
      editInitialValues: (item: Certification) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      name: item.name,
      issuer: item.issuer,
      issuedOn: item.issuedOn,
      expiresOn: item.expiresOn,
      }),
      getItemDisplayName: (item: Certification) => item.staffMemberId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });