/**
 * Users View
 *
 * Main view component for user management using GenericCrudView.
 * No "Add User" button — users self-register.
 * Supports: Edit, Delete, Toggle Active, Unlock, Bulk Operations.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction, BulkAction } from "@core/crud/components/generic-crud-view";
import type { UsersEntity } from "../../domain/entities/UsersEntity";
import { useUsersViewModel } from "../viewmodels/useUsersViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Badge } from "@core/ui/badge";
import { Unlock, UserCheck, UserX } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/**
 * React presentation component representing the users view UI element.
 */
export function UsersView() {
  useModuleLocales(() => import("../../../locales"), "users");
  const { t } = useI18n();

  const {
    vm,
    getConfigBase,
    handleToggleActive,
    handleUnlock,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,
    isTogglingActive,
  } = useUsersViewModel();

  const configBase = getConfigBase();

  // ============ Bulk Actions ============
  const bulkActions: BulkAction[] = useMemo(
    () => [
      {
        label: t("users.bulk.activate") || "Activate Selected",
        icon: <UserCheck className="h-4 w-4" />,
        onClick: async (selectedIds: string[]) => {
          await handleBulkActivate(selectedIds);
        },
        requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
      },
      {
        label: t("users.bulk.deactivate") || "Deactivate Selected",
        icon: <UserX className="h-4 w-4" />,
        onClick: async (selectedIds: string[]) => {
          await handleBulkDeactivate(selectedIds);
        },
        requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
      },
      {
        label: t("users.bulk.delete") || "Delete Selected",
        icon: <UserX className="h-4 w-4" />,
        variant: "destructive" as const,
        onClick: async (selectedIds: string[]) => {
          await handleBulkDelete(selectedIds);
        },
        requiresConfirmation: true,
        confirmTitle: t("users.deleteTitle") || "Delete Users",
        confirmDescription:
          t("users.deleteConfirm") || "Are you sure you want to delete the selected users?",
        requiredPermission: SYSTEM_PERMISSIONS.USERS_DELETE,
      },
    ],
    [t, handleBulkActivate, handleBulkDeactivate, handleBulkDelete]
  );

  // ============ Config ============
  const config: CrudConfig<UsersEntity> = useMemo(
    () => ({
      titleKey: "users.title",
      subtitleKey: "users.description",
      resource: "users",
      columns: [
        {
          key: "username",
          label: t("users.columns.username") || "Username",
          sortable: true,
          render: (_val: unknown, user: UsersEntity) => (
            <span className="font-medium">{user.username}</span>
          ),
        },
        {
          key: "name",
          label: t("users.columns.name") || "Name",
          render: (_val: unknown, user: UsersEntity) => <span>{user.displayName}</span>,
        },
        {
          key: "email",
          label: t("users.columns.email") || "Email",
          render: (_val: unknown, user: UsersEntity) =>
            user.email ? (
              <a href={`mailto:${user.email}`} className="text-sm text-primary hover:underline">
                {user.email}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: "isActive",
          label: t("users.columns.status") || "Status",
          render: (_val: unknown, user: UsersEntity) => (
            <Badge variant={user.isActive ? "success" : "secondary"}>
              {user.isActive
                ? t("users.status.active") || "Active"
                : t("users.status.inactive") || "Inactive"}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("users.columns.createdAt") || "Joined",
          render: (_val: unknown, user: UsersEntity) => (
            <span className="text-sm text-muted-foreground">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </span>
          ),
        },
      ],
      // Custom row actions (beyond GenericCrudView's built-in edit/delete)
      getActions: (_vm, _t, handleDelete) => {
        const rowActions: CrudAction<UsersEntity>[] = [
          // Activate (shown when inactive)
          {
            label: t("users.actions.activate") || "Activate",
            icon: <UserCheck className="h-4 w-4" />,
            onClick: (user: UsersEntity) => handleToggleActive(user.id, true),
            show: (user: UsersEntity) => !user.isActive,
            loading: isTogglingActive,
            requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
          },
          // Deactivate (shown when active)
          {
            label: t("users.actions.deactivate") || "Deactivate",
            icon: <UserX className="h-4 w-4" />,
            onClick: (user: UsersEntity) => handleToggleActive(user.id, false),
            show: (user: UsersEntity) => user.isActive,
            confirmTitle: t("users.actions.deactivate") || "Deactivate User",
            confirmDescription: t("users.deactivatedDesc") || "This user will lose access.",
            loading: isTogglingActive,
            requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
          },
          // Unlock
          {
            label: t("users.actions.unlock") || "Unlock Account",
            icon: <Unlock className="h-4 w-4" />,
            onClick: (user: UsersEntity) => handleUnlock(user.id),
            requiredPermission: SYSTEM_PERMISSIONS.USERS_UNLOCK,
          },
        ];
        return rowActions;
      },
      bulkActions,
      ...configBase,
      // No create endpoint — users self-register
      hideAddButton: true,
    }),
    [t, configBase, bulkActions, handleToggleActive, handleUnlock, isTogglingActive]
  );

  return <GenericCrudView<UsersEntity> config={config} viewModel={vm} />;
}
