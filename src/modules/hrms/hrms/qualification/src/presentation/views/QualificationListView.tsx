/**
* Qualification List View
*
* Pure UI component for displaying Qualification list with CRUD.
* Uses GenericCrudView for standard CRUD table UI.
*/
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useQualificationViewModel } from "../viewmodels/useQualificationViewModel";
import type { Qualification } from "../../domain/entities/Qualification";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// P5.4: React.memo prevents unnecessary re-renders
export const QualificationListView = React.memo(function QualificationListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
const { vm } = useQualificationViewModel();

const config: CrudConfig<Qualification> = {
      titleKey: "qualification.title",
      subtitleKey: "qualification.description",
      resource: "qualifications",
      columns: [
      {
      key: "staffMemberId",
      label: "StaffMemberId",
      sortable: true,
      },
      {
      key: "title",
      label: "Title",
      sortable: true,
      },
      {
      key: "institution",
      label: "Institution",
      sortable: true,
      },
      {
      key: "awardedOn",
      label: "AwardedOn",
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
      name: "title",
      label: "Title",
      type: "text" as const,
      placeholder: "Enter title",
      required: true,
      },
      {
      name: "institution",
      label: "Institution",
      type: "text" as const,
      placeholder: "Enter institution",
      },
      {
      name: "awardedOn",
      label: "AwardedOn",
      type: "date" as const,
      placeholder: "Enter awardedOn",
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
      name: "title",
      label: "Title",
      type: "text" as const,
      placeholder: "Enter title",
      required: true,
      },
      {
      name: "institution",
      label: "Institution",
      type: "text" as const,
      placeholder: "Enter institution",
      },
      {
      name: "awardedOn",
      label: "AwardedOn",
      type: "date" as const,
      placeholder: "Enter awardedOn",
      },
      ],
      createInitialValues: {
      staffMemberId: "",
      title: "",
      institution: "",
      awardedOn: "",
            },
      editInitialValues: (item: Qualification) => ({
      id: item.id,
      staffMemberId: item.staffMemberId,
      title: item.title,
      institution: item.institution,
      awardedOn: item.awardedOn,
      }),
      getItemDisplayName: (item: Qualification) => item.staffMemberId,
      };

      return (
      <GenericCrudView viewModel={vm} config={config} />
      );
      });