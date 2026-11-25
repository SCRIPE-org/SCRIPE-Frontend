/**
 * Tenant Roles Tab Component
 *
 * Pure View component for managing roles within a tenant.
 * Follows SOLID - View is ~60 lines, all logic in ViewModel.
 *
 * Architecture: View (pure UI) → ViewModel (all logic)
 *
 * @module tenants/presentation/components
 */
"use client";

import { useState, useCallback } from "react";
import { Shield, Trash2, Pencil, Eye, Users, RefreshCw, Lock } from "lucide-react";

// Generic CRUD imports
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { formatUtc } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useSudoStore } from "@core/store/useSudoStore";

// Role imports
import {
  Role,
  RolePermissionsDialog,
  RoleDeleteDialog,
  AssignToGroupDialog,
} from "@modules/identity/core";
import { useTenantRolesViewModel } from "../../viewmodels/useTenantRolesViewModel";

// ViewModel - all logic lives here

interface TenantRolesTabProps {
  tenantId: string;
  tenantName: string;
}

/**
 * TenantRolesTab - Pure View Component
 *
 * This component contains ZERO business logic.
 * All state, operations, and data transformations are in useTenantRolesViewModel.
 */
export function TenantRolesTab({ tenantId, tenantName }: TenantRolesTabProps) {
  const { t, language } = useI18n();
  const canResyncPermissions = usePermission(SYSTEM_PERMISSIONS.SUBSCRIPTIONS_ASSIGN);

  // All logic delegated to ViewModel
  const vm = useTenantRolesViewModel({ tenantId, tenantName });

  // Assign to Group dialog state
  const [selectedRoleForGroup, setSelectedRoleForGroup] = useState<Role | null>(null);
  const [assignToGroupOpen, setAssignToGroupOpen] = useState(false);

  // Bulk Assign to Group dialog state
  const [selectedBulkRoleIds, setSelectedBulkRoleIds] = useState<string[]>([]);
  const [bulkAssignToGroupOpen, setBulkAssignToGroupOpen] = useState(false);

  // Delete dialog state — mirrors RolesView's admin-count-aware RoleDeleteDialog
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenAssignToGroup = useCallback((role: Role) => {
    setSelectedRoleForGroup(role);
    setAssignToGroupOpen(true);
  }, []);

  const handleOpenDelete = useCallback((role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  }, []);

  // Build CrudConfig from ViewModel data
  const config: CrudConfig<Role> = {
    titleKey: "",
    subtitleKey: "",
    columns: vm.columns.map((col) => ({
      ...col,
      render:
        col.key === "code"
          ? (value: string) => (
              <code className="rounded-nx-sm bg-nx-raised px-2 py-0.5 text-xs">
                <bdi dir="ltr">{value}</bdi>
              </code>
            )
          : col.key === "name"
            ? (_: unknown, role: Role) => (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">{role.getLocalizedName(language)}</span>
                  {role.isPermissionLocked && (
                    <Badge
                      variant="secondary"
                      data-testid="role-locked-badge"
                      className="gap-1 shrink-0 text-[11px]"
                    >
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      {t("roles.lockedBadge")}
                    </Badge>
                  )}
                </div>
              )
            : col.key === "description"
              ? (_: unknown, role: Role) => (
                  <span className="block max-w-[200px] truncate text-sm text-nx-ink-2">
                    {role.getLocalizedDescription(language)}
                  </span>
                )
              : col.key === "priority"
                ? (value: number) => <Badge variant="outline">{value}</Badge>
                : col.key === "groups"
                  ? (_: unknown, role: Role) => {
                      const groups = role.getLocalizedGroups(language);
                      return (
                        <div className="flex flex-wrap gap-1">
                          {groups.length > 0 ? (
                            groups.map((groupName, index) => (
                              <Badge
                                key={`${index}-${groupName}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {groupName}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-nx-ink-2">-</span>
                          )}
                        </div>
                      );
                    }
                  : col.key === "createdAt"
                    ? (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-")
                    : undefined,
    })),
    createFields: vm.createFields,
    editFields: vm.editFields,
    createInitialValues: vm.createInitialValues,
    editInitialValues: vm.getEditInitialValues,
    getItemDisplayName: (item: Role) => item.getLocalizedName(language),
    permissions: {
      canView: SYSTEM_PERMISSIONS.ROLES_VIEW,
      canCreate: SYSTEM_PERMISSIONS.ROLES_CREATE,
      canUpdate: SYSTEM_PERMISSIONS.ROLES_UPDATE,
      canDelete: SYSTEM_PERMISSIONS.ROLES_DELETE,
    },
    enableBulkActions: true,
    bulkActions: [
      {
        label: t("userGroups.assignToGroup"),
        icon: <Users className="h-4 w-4" aria-hidden="true" />,
        onClick: async (ids: string[]) => {
          setSelectedBulkRoleIds(ids);
          setBulkAssignToGroupOpen(true);
        },
        variant: "outline" as const,
        requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_UPDATE,
      },
    ],
    getActions: (vmInstance, tFn): CrudAction<Role>[] => [
      {
        label: tFn("common.view"),
        onClick: (item: Role) => vmInstance.openViewModal(item),
        variant: "ghost",
        icon: <Eye className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: tFn("common.edit"),
        onClick: (item: Role) => vmInstance.openEditModal(item),
        variant: "ghost",
        icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_UPDATE,
      },
      {
        label: tFn("role.managePermissions"),
        onClick: (item: Role) => vm.openPermissionsDialog(item),
        variant: "ghost",
        icon: <Shield className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS,
      },
      {
        label: tFn("userGroups.assignToGroup"),
        onClick: (item: Role) => handleOpenAssignToGroup(item),
        variant: "ghost",
        icon: <Users className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_UPDATE,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: Role) => handleOpenDelete(item),
        variant: "ghost",
        className: "text-destructive hover:text-destructive/90",
        icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_DELETE,
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-nx-ink">{vm.title}</h3>
          <p className="text-sm text-nx-ink-2">{vm.subtitle}</p>
        </div>
        {canResyncPermissions && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.resyncPermissions()}
            loading={vm.isResyncing}
          >
            {!vm.isResyncing && <RefreshCw className="me-2 h-4 w-4" aria-hidden="true" />}
            {t("tenant.resyncPermissions")}
          </Button>
        )}
      </div>

      {/* Roles Table */}
      <div className="overflow-hidden rounded-nx-lg border border-nx-line">
        <GenericCrudView viewModel={vm.rolesVm} config={config} />
      </div>

      {/* Permissions Dialog */}
      <RolePermissionsDialog
        open={vm.permissionsDialogOpen}
        onOpenChange={(open) => {
          if (!open && useSudoStore.getState().modalOpen) return;
          if (!open) vm.closePermissionsDialog();
        }}
        role={vm.selectedRoleForPermissions}
        tenantId={vm.tenantId}
      />

      {/* Bulk Assign to Group Dialog */}
      {bulkAssignToGroupOpen && (
        <AssignToGroupDialog
          open={bulkAssignToGroupOpen}
          onOpenChange={(open) => {
            if (!open && useSudoStore.getState().modalOpen) return;
            if (!open) {
              setBulkAssignToGroupOpen(false);
              setSelectedBulkRoleIds([]);
            }
          }}
          mode="role"
          roleIds={selectedBulkRoleIds}
          tenantId={tenantId}
        />
      )}

      {/* Single Assign to Group Dialog */}
      <AssignToGroupDialog
        open={assignToGroupOpen}
        onOpenChange={(open) => {
          if (!open && useSudoStore.getState().modalOpen) return;
          setAssignToGroupOpen(open);
        }}
        mode="role"
        roleId={selectedRoleForGroup?.id}
        roleName={selectedRoleForGroup?.getLocalizedName(language)}
        tenantId={tenantId}
      />

      {/* Delete Dialog — admin-count-aware fallback role selector */}
      <RoleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && useSudoStore.getState().modalOpen) return;
          setDeleteDialogOpen(open);
          if (!open) setRoleToDelete(null);
        }}
        role={roleToDelete}
        tenantId={roleToDelete?.tenantId ?? tenantId}
        onConfirm={async (fallbackRoleId) => {
          if (!roleToDelete) return;
          // Propagate rejection so RoleDeleteDialog stays open with roleToDelete intact on failure/Sudo cancel;
          // deleteRoleMutation.onError already surfaces localized feedback.
          await vm.rolesVm.deleteRole(roleToDelete.id, fallbackRoleId);
          setDeleteDialogOpen(false);
          setRoleToDelete(null);
        }}
        isDeleting={vm.rolesVm.isDeletingRole}
      />
    </div>
  );
}
