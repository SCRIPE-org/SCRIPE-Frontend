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
 *
 * @param t Localizer function.
 * @param handleRoleSearch Async search function for roles.
 * @param handleGroupSearch Async search function for user groups.
 * @returns An object containing create/edit fields and initial values.
 */
export function useAdminFieldsConfig(
  t: (key: string) => string,
  handleRoleSearch: (query: string) => Promise<FieldOption[]>,
  handleGroupSearch: (query: string) => Promise<FieldOption[]>
) {
  const createFields = [
    {
      name: "roleIds",
      label: t("admin.roles") || "Roles",
      type: "multi-select" as const,
      placeholder: t("admin.role.selectRolesPlaceholder") || "Select roles...",
      searchPlaceholder: t("admin.role.searchRoles") || "Search roles...",
      required: false,
      onServerSearch: handleRoleSearch,
      searchType: "server" as const,
      noResultsText: t("roles.noRolesFound") || "No roles found",
      requiredPermission: SYSTEM_PERMISSIONS.ADMINS_ASSIGN_ROLES,
    },
    {
      name: "userGroupIds",
      label: t("admin.groups") || "Groups",
      type: "multi-select" as const,
      placeholder: t("userGroups.selectPlaceholder") || "Select groups...",
      searchPlaceholder: t("userGroups.search") || "Search groups...",
      required: false,
      onServerSearch: handleGroupSearch,
      searchType: "server" as const,
      noResultsText: t("userGroups.emptyStateTitle") || "No groups found",
      requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_VIEW,
    },
    {
      name: "username",
      label: t("admin.username") || "Username",
      type: "text" as const,
      placeholder: t("admin.usernamePlaceholder") || "Enter username",
      required: true,
    },
    {
      name: "sendSetupEmail",
      label: t("admin.sendSetupEmail") || "Send setup email to the admin",
      type: "switch" as const,
      description:
        t("admin.sendSetupEmailDescription") ||
        "When enabled, an email invitation will be sent to set up the account. When disabled, you can set the password manually.",
    },
    {
      name: "password",
      label: t("admin.password") || "Password",
      type: "password" as const,
      placeholder: t("admin.passwordPlaceholder") || "Enter password",
      required: true,
      isVisible: (values: Record<string, unknown>) => values.sendSetupEmail === false,
    },
    {
      name: "mustChangePassword",
      label: t("admin.mustChangePassword") || "Require password change on first login",
      type: "switch" as const,
      description:
        t("admin.mustChangePasswordDescription") ||
        "The admin will be forced to change their password after their first login.",
      isVisible: (values: Record<string, unknown>) => values.sendSetupEmail === false,
    },
    {
      name: "firstName",
      label: t("admin.firstName") || "First Name",
      type: "text" as const,
      placeholder: t("admin.firstNamePlaceholder") || "Enter first name",
    },
    {
      name: "lastName",
      label: t("admin.lastName") || "Last Name",
      type: "text" as const,
      placeholder: t("admin.lastNamePlaceholder") || "Enter last name",
    },
    {
      name: "phoneNumber",
      label: t("admin.phoneNumber") || "Phone Number",
      type: "text" as const,
      placeholder: t("admin.phoneNumberPlaceholder") || "+1 234 567 8900",
    },
    {
      name: "email",
      label: t("admin.email") || "Email",
      type: "text" as const,
      placeholder: t("admin.emailPlaceholder") || "admin@example.com",
    },
    {
      name: "notes",
      label: t("admin.notes") || "Notes",
      type: "textarea" as const,
      placeholder: t("admin.notesPlaceholder") || "Optional notes...",
    },
  ];

  const editFields = [
    {
      name: "firstName",
      label: t("admin.firstName") || "First Name",
      type: "text" as const,
      placeholder: t("admin.firstNamePlaceholder") || "Enter first name",
    },
    {
      name: "lastName",
      label: t("admin.lastName") || "Last Name",
      type: "text" as const,
      placeholder: t("admin.lastNamePlaceholder") || "Enter last name",
    },
    {
      name: "phoneNumber",
      label: t("admin.phoneNumber") || "Phone Number",
      type: "text" as const,
      placeholder: t("admin.phoneNumberPlaceholder") || "+1 234 567 8900",
    },
    {
      name: "email",
      label: t("admin.email") || "Email",
      type: "text" as const,
      placeholder: t("admin.emailPlaceholder") || "admin@example.com",
    },
    {
      name: "notes",
      label: t("admin.notes") || "Notes",
      type: "textarea" as const,
      placeholder: t("admin.notesPlaceholder") || "Optional notes...",
    },
    {
      name: "isActive",
      label: t("admin.isActive") || "Active",
      type: "switch" as const,
      requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
    },
    { name: "id", type: "hidden" as const, required: true },
  ];

  const createInitialValues = {
    roleIds: [] as string[],
    userGroupIds: [] as string[],
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    notes: "",
    sendSetupEmail: true,
    mustChangePassword: false,
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
