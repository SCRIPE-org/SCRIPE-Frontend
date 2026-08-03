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
  const { vm, searchIdentityUsers } = useStaffMemberViewModel();
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
        // F-86: the backend returns this pre-encrypted (SecureIdMapper) and
        // the list DTO carries no resolved display name alongside it, so the
        // raw ciphertext is never rendered — it has no meaningful sort order
        // either. The column now only signals whether a link exists; the
        // encrypted id itself stays available on the row for the edit form's
        // picker (editInitialValues below).
        key: "identityUserId",
        label: t("staffMember.fields.identityUserId"),
        render: (value: string | null) => (
          <Badge variant={value ? "active" : "inactive"}>
            {value ? t("staffMember.status.linked") : t("staffMember.status.notLinked")}
          </Badge>
        ),
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
        // F-86: was a bare free-text input asking the admin to hand-type an
        // encrypted id they have no way to obtain correctly. Now a real
        // picker searching Identity Admins + Users (identityUserId may name
        // either — see backend CreateStaffMemberCommandHandler), matching the
        // shared form system's existing server-select pattern.
        name: "identityUserId",
        label: t("staffMember.fields.identityUserId"),
        type: "server-select" as const,
        placeholder: t("staffMember.placeholders.identityUserId"),
        searchPlaceholder: t("staffMember.placeholders.identityUserId"),
        searchType: "server" as const,
        onServerSearch: searchIdentityUsers,
        debounceMs: 300,
        noResultsText: t("common.noResults"),
        searchingText: t("common.searching"),
        description: t("staffMember.descriptions.identityUserId"),
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
        type: "server-select" as const,
        placeholder: t("staffMember.placeholders.identityUserId"),
        searchPlaceholder: t("staffMember.placeholders.identityUserId"),
        searchType: "server" as const,
        onServerSearch: searchIdentityUsers,
        debounceMs: 300,
        noResultsText: t("common.noResults"),
        searchingText: t("common.searching"),
        description: t("staffMember.descriptions.identityUserId"),
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
    // F-85: opts this list into real server-side sort. Unset (the default for
    // every other CRUD view on this shared table), a column click still only
    // reorders the current page client-side — this wiring is what turns a
    // "sortable" column header into a real server refetch.
    customTableProps: {
      sortColumn: vm.sortBy,
      sortDirection: vm.sortDirection,
      onSortChange: vm.handleSortChange,
    },
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
