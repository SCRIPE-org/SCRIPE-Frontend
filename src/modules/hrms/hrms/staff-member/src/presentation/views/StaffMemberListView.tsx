/**
 * StaffMember List View
 *
 * Pure UI component for displaying StaffMember list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Pencil, Trash2 } from "lucide-react";
import { useStaffMemberViewModel } from "../viewmodels/useStaffMemberViewModel";
import type { StaffMember } from "../../domain/entities/StaffMember";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";

// P5.4: React.memo prevents unnecessary re-renders
export const StaffMemberListView = React.memo(function StaffMemberListView() {
  useModuleLocales(() => import("../../../locales"), "hrms");
  const { vm } = useStaffMemberViewModel();
  const { t, language } = useI18n();

  const config: CrudConfig<StaffMember> = {
    titleKey: "staffMember.title",
    subtitleKey: "staffMember.description",
    resource: "staff-members",
    columns: [
      {
        key: "firstName",
        label: t("staffMember.fields.firstName"),
        sortable: true,
      },
      {
        key: "lastName",
        label: t("staffMember.fields.lastName"),
        sortable: true,
      },
      {
        key: "email",
        label: t("staffMember.fields.email"),
        sortable: true,
      },
      {
        key: "jobTitle",
        label: t("staffMember.fields.jobTitle"),
        sortable: true,
      },
      {
        key: "isActive",
        label: t("staffMember.fields.isActive"),
        render: (value: boolean) => (
          <Badge variant={value ? "active" : "inactive"}>
            {value ? t("common.active") : t("common.inactive")}
          </Badge>
        ),
      },
      {
        key: "identityUserId",
        label: t("staffMember.fields.identityUserId"),
        sortable: true,
      },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "identityUserId",
        label: t("staffMember.fields.identityUserId"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.identityUserId"),
      },
      {
        name: "firstName",
        label: t("staffMember.fields.firstName"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.firstName"),
        required: true,
      },
      {
        name: "lastName",
        label: t("staffMember.fields.lastName"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.lastName"),
        required: true,
      },
      {
        name: "email",
        label: t("staffMember.fields.email"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.email"),
      },
      {
        name: "jobTitle",
        label: t("staffMember.fields.jobTitle"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.jobTitle"),
      },
      {
        name: "isActive",
        label: t("staffMember.fields.isActive"),
        type: "switch" as const,
        description: t("staffMember.descriptions.isActive"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "identityUserId",
        label: t("staffMember.fields.identityUserId"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.identityUserId"),
      },
      {
        name: "firstName",
        label: t("staffMember.fields.firstName"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.firstName"),
        required: true,
      },
      {
        name: "lastName",
        label: t("staffMember.fields.lastName"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.lastName"),
        required: true,
      },
      {
        name: "email",
        label: t("staffMember.fields.email"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.email"),
      },
      {
        name: "jobTitle",
        label: t("staffMember.fields.jobTitle"),
        type: "text" as const,
        placeholder: t("staffMember.placeholders.jobTitle"),
      },
      {
        name: "isActive",
        label: t("staffMember.fields.isActive"),
        type: "switch" as const,
        description: t("staffMember.descriptions.isActive"),
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
    getItemDisplayName: (item: StaffMember) => `${item.firstName} ${item.lastName}`.trim(),
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<StaffMember>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: StaffMember) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: StaffMember) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
