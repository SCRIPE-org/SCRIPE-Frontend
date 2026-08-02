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
import { formatDateUtc } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Unlock, UserCheck, UserX } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/**
 * Presentation UI component rendering the users view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
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
        label: t("users.bulk.activate"),
        icon: <UserCheck className="h-4 w-4" aria-hidden="true" />,
        onClick: async (selectedIds: string[]) => {
          await handleBulkActivate(selectedIds);
        },
        requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
      },
      {
        label: t("users.bulk.deactivate"),
        icon: <UserX className="h-4 w-4" aria-hidden="true" />,
        onClick: async (selectedIds: string[]) => {
          await handleBulkDeactivate(selectedIds);
        },
        requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
      },
      {
        label: t("users.bulk.delete"),
        icon: <UserX className="h-4 w-4" aria-hidden="true" />,
        variant: "destructive" as const,
        onClick: async (selectedIds: string[]) => {
          await handleBulkDelete(selectedIds);
        },
        requiresConfirmation: true,
        confirmTitle: t("users.deleteTitle"),
        confirmDescription: t("users.deleteConfirm"),
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
          label: t("users.columns.username"),
          sortable: true,
          render: (_val: unknown, user: UsersEntity) => (
            <span className="font-medium">{user.username}</span>
          ),
        },
        {
          key: "name",
          label: t("users.columns.name"),
          render: (_val: unknown, user: UsersEntity) => <span>{user.displayName}</span>,
        },
        {
          key: "email",
          label: t("users.columns.email"),
          render: (_val: unknown, user: UsersEntity) =>
            user.email ? (
              <a href={`mailto:${user.email}`} className="text-sm text-nx-accent hover:underline">
                {user.email}
              </a>
            ) : (
              <span className="text-nx-ink-3">—</span>
            ),
        },
        {
          key: "isActive",
          label: t("users.columns.status"),
          render: (_val: unknown, user: UsersEntity) => (
            <Badge variant={user.isActive ? "success" : "secondary"}>
              {user.isActive ? t("users.status.active") : t("users.status.inactive")}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("users.columns.createdAt"),
          render: (_val: unknown, user: UsersEntity) => (
            <span className="text-sm text-nx-ink-2">
              {user.createdAt ? formatDateUtc(user.createdAt) : "—"}
            </span>
          ),
        },
      ],
      // Custom row actions (beyond GenericCrudView's built-in edit/delete)
      getActions: (_vm, _t, handleDelete) => {
        const rowActions: CrudAction<UsersEntity>[] = [
          // Activate (shown when inactive)
          {
            label: t("users.actions.activate"),
            icon: <UserCheck className="h-4 w-4" aria-hidden="true" />,
            onClick: (user: UsersEntity) => handleToggleActive(user.id, true),
            show: (user: UsersEntity) => !user.isActive,
            loading: isTogglingActive,
            requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
          },
          // Deactivate (shown when active)
          {
            label: t("users.actions.deactivate"),
            icon: <UserX className="h-4 w-4" aria-hidden="true" />,
            onClick: (user: UsersEntity) => handleToggleActive(user.id, false),
            show: (user: UsersEntity) => user.isActive,
            confirmTitle: t("users.actions.deactivate"),
            confirmDescription: t("users.deactivatedDesc"),
            loading: isTogglingActive,
            requiredPermission: SYSTEM_PERMISSIONS.USERS_UPDATE,
          },
          // Unlock
          {
            label: t("users.actions.unlock"),
            icon: <Unlock className="h-4 w-4" aria-hidden="true" />,
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
