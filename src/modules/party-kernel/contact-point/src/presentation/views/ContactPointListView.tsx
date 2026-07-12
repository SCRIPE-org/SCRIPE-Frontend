/**
* ContactPoint List View
*
* Pure UI component for displaying ContactPoint list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useContactPointViewModel } from "../viewmodels/useContactPointViewModel";
import type { ContactPoint } from "../../domain/entities/ContactPoint";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const ContactPointListView = React.memo(function ContactPointListView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel");
const { vm } = useContactPointViewModel();

const config: CrudConfig<ContactPoint> = {
      titleKey: "contactPoint.title",
      subtitleKey: "contactPoint.description",
      resource: "contact-points",
      columns: [
      {
      key: "partyId",
      label: "PartyId",
      sortable: true,
      },
      {
      key: "type",
      label: "Type",
      sortable: true,
      },
      {
      key: "value",
      label: "Value",
      sortable: true,
      },
      {
      key: "isPrimary",
      label: "IsPrimary",
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
      name: "partyId",
      label: "PartyId",
      type: "text" as const,
      placeholder: "Enter partyId",
      required: true,
      },
      {
      name: "type",
      label: "Type",
      type: "text" as const,
      placeholder: "Enter type",
      required: true,
      },
      {
      name: "value",
      label: "Value",
      type: "text" as const,
      placeholder: "Enter value",
      required: true,
      },
      {
      name: "isPrimary",
      label: "IsPrimary",
      type: "switch" as const,
      placeholder: "Enter isPrimary",
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
      name: "type",
      label: "Type",
      type: "text" as const,
      placeholder: "Enter type",
      required: true,
      },
      {
      name: "value",
      label: "Value",
      type: "text" as const,
      placeholder: "Enter value",
      required: true,
      },
      {
      name: "isPrimary",
      label: "IsPrimary",
      type: "switch" as const,
      placeholder: "Enter isPrimary",
      },
      ],
      createInitialValues: {
      partyId: "",
      type: "",
      value: "",
      isPrimary: false,
      },
      editInitialValues: (item: ContactPoint) => ({
      id: item.id,
      partyId: item.partyId,
      type: item.type,
      value: item.value,
      isPrimary: item.isPrimary,
      }),
      getItemDisplayName: (item: ContactPoint) => item.partyId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });