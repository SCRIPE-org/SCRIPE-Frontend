/**
 * @file useAdminFieldsConfig.ts
 * @description Custom React hook providing form field configurations and initial values for the Admin module forms.
 * Complies with the 'use' prefix naming convention for viewmodels directory.
 */

import type { FieldOption } from "@core/ui/forms/generic-form";
import type { Admin } from "../../domain/entities/Admin";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

/**
 * Hook to retrieve field configurations for admin forms.
 * Admin creation is strictly email-invitation-only; no local password fields are exposed.
 */
export function useAdminFieldsConfig(
  t: (key: string) => string,
  handleRoleSearch: (query: string) => Promise<FieldOption[]>,
  handleGroupSearch: (query: string) => Promise<FieldOption[]>
) {
  const createFields = [
    {
      name: "roleIds",
      label: t("admin.roles"),
      type: "multi-select" as const,
      placeholder: t("admin.role.selectRolesPlaceholder"),
      searchPlaceholder: t("admin.role.searchRoles"),
      required: false,
      onServerSearch: handleRoleSearch,
      searchType: "server" as const,
      noResultsText: t("roles.noRolesFound"),
      requiredPermission: SYSTEM_PERMISSIONS.ADMINS_ASSIGN_ROLES,
    },
    {
      name: "userGroupIds",
      label: t("admin.groups"),
      type: "multi-select" as const,
      placeholder: t("userGroups.selectPlaceholder"),
      searchPlaceholder: t("userGroups.search"),
      required: false,
      onServerSearch: handleGroupSearch,
      searchType: "server" as const,
      noResultsText: t("userGroups.emptyStateTitle"),
      requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_VIEW,
    },
    {
      name: "username",
      label: t("admin.username"),
      type: "text" as const,
      placeholder: t("admin.usernamePlaceholder"),
      required: true,
      autoComplete: "off",
    },
    {
      name: "firstName",
      label: t("admin.firstName"),
      type: "text" as const,
      placeholder: t("admin.firstNamePlaceholder"),
    },
    {
      name: "lastName",
      label: t("admin.lastName"),
      type: "text" as const,
      placeholder: t("admin.lastNamePlaceholder"),
    },
    {
      name: "phoneNumber",
      label: t("admin.phoneNumber"),
      type: "phone" as const,
      placeholder: t("admin.phoneNumberPlaceholder"),
    },
    {
      name: "email",
      label: t("admin.email"),
      type: "email" as const,
      placeholder: t("admin.emailPlaceholder"),
      required: true,
    },
    {
      name: "notes",
      label: t("admin.notes"),
      type: "textarea" as const,
      placeholder: t("admin.notesPlaceholder"),
    },
  ];

  const editFields = [
    {
      name: "firstName",
      label: t("admin.firstName"),
      type: "text" as const,
      placeholder: t("admin.firstNamePlaceholder"),
    },
    {
      name: "lastName",
      label: t("admin.lastName"),
      type: "text" as const,
      placeholder: t("admin.lastNamePlaceholder"),
    },
    {
      name: "phoneNumber",
      label: t("admin.phoneNumber"),
      type: "phone" as const,
      placeholder: t("admin.phoneNumberPlaceholder"),
    },
    {
      name: "email",
      label: t("admin.email"),
      type: "email" as const,
      placeholder: t("admin.emailPlaceholder"),
    },
    {
      name: "notes",
      label: t("admin.notes"),
      type: "textarea" as const,
      placeholder: t("admin.notesPlaceholder"),
    },
    {
      name: "isActive",
      label: t("admin.isActive"),
      type: "switch" as const,
      requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
    },
    { name: "id", type: "hidden" as const, required: true },
  ];

  const createInitialValues = {
    roleIds: [] as string[],
    userGroupIds: [] as string[],
    username: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    notes: "",
  };

  const editInitialValues = (admin: Admin) => ({
    id: admin.id,
    firstName: admin.firstName || "",
    lastName: admin.lastName || "",
    phoneNumber: admin.phoneNumber || "",
    email: admin.email || "",
    notes: admin.notes || "",
    isActive: admin.isActive,
  });

  return {
    createFields,
    editFields,
    createInitialValues,
    editInitialValues,
  };
}
