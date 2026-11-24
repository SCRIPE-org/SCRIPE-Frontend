/**
 * Roles View
 *
 * Main view component for role management.
 * Uses GenericCrudView for standardized UI.
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useRolesViewModel } from "../viewmodels/useRolesViewModel";
import { GenericCrudView, type CrudConfig } from "@core/crud/components/generic-crud-view";
import { Shield, Pencil, Trash, Copy, Users } from "lucide-react";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAdminContext } from "@core/hooks/useAdminContext";
import type { LandingTargetScopeMode } from "@core/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { usePermissions } from "@core/providers/permission-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import type { Role } from "../../domain/entities/Role";
import { AssignToGroupDialog } from "@modules/identity/core";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { RoleDeleteDialog } from "../components/RoleDeleteDialog";
import { useRoleLandingCatalogViewModel } from "../viewmodels/useRoleLandingCatalogViewModel";
import { getRolesCrudColumns } from "./rolesCrudColumns";
import {
  getRoleCreateFields,
  getRoleEditFields,
  getRoleEditInitialValues,
} from "./rolesFormFields";

/**
 * Presentation UI component rendering the roles view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RolesView() {
  useModuleLocales(() => import("../../../locales"), "roles");

  const router = useRouter();
  const { t, language } = useI18n();
  const { isPlatformSuperAdmin } = usePermissions();
  const { activeTenantId, isTenant } = useAdminContext();
  const { workspaceGroups } = useWorkspace();
  const cachedWorkspaces = useNavigationStore((s) => s.workspaces);
  const storeContextKey = useNavigationStore((s) => s.contextKey);
  const isTenantContext = Boolean(activeTenantId || isTenant || !isPlatformSuperAdmin);
  const primaryScopeMode: LandingTargetScopeMode = isTenantContext
    ? "tenant_role"
    : "platform_role";
  const resolvedContextKey =
    storeContextKey ||
    (activeTenantId ? `tenant:${activeTenantId}` : isTenantContext ? "tenant" : "platform");

  // Logic: Platform Super Admins outside drill-down see System roles; Tenant Admins see My Tenant roles
  const viewModel = useRolesViewModel({ useMyTenant: !isPlatformSuperAdmin });
  const { handleBulkDelete, deleteRole, isDeletingRole } = viewModel;

  const primaryCatalogQuery = useRoleLandingCatalogViewModel(
    primaryScopeMode,
    resolvedContextKey,
    true
  );
  const editingScopeMode: LandingTargetScopeMode = viewModel.editingItem?.tenantId
    ? "tenant_role"
    : "platform_role";
  const needsSecondaryCatalog =
    Boolean(viewModel.editingItem) && editingScopeMode !== primaryScopeMode;
  const secondaryCatalogQuery = useRoleLandingCatalogViewModel(
    editingScopeMode,
    resolvedContextKey,
    needsSecondaryCatalog
  );

  // Assign to Group dialog state
  const [selectedRoleForGroup, setSelectedRoleForGroup] = useState<Role | null>(null);
  const [assignToGroupOpen, setAssignToGroupOpen] = useState(false);

  // Bulk Assign to Group dialog state
  const [selectedBulkRoleIds, setSelectedBulkRoleIds] = useState<string[]>([]);
  const [bulkAssignToGroupOpen, setBulkAssignToGroupOpen] = useState(false);

  // Delete dialog state — replaces GenericCrudView's generic "are you sure"
  // confirm with RoleDeleteDialog, which blocks the delete until a fallback
  // role is chosen when admins are still assigned to this role.
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

  const columns = getRolesCrudColumns(t, language);

  const config: CrudConfig<Role> = {
    titleKey: "roles.title",
    subtitleKey: "roles.description",
    resource: "roles", // Checks permissions (roles.view, roles.create, etc.)
    columns,
    createFields: getRoleCreateFields(t, {
      language,
      workspaceGroups,
      cachedWorkspaces,
      catalog: primaryCatalogQuery.catalog,
      isCatalogLoading: primaryCatalogQuery.isLoading,
      isTenantRole: isTenantContext,
    }),
    editFields: (role) => {
      const roleScopeMode: LandingTargetScopeMode = role.tenantId
        ? "tenant_role"
        : "platform_role";
      const matchedCatalogQuery =
        roleScopeMode === primaryScopeMode ? primaryCatalogQuery : secondaryCatalogQuery;
      return getRoleEditFields(t, {
        language,
        workspaceGroups,
        cachedWorkspaces,
        catalog: matchedCatalogQuery.catalog,
        isCatalogLoading: matchedCatalogQuery.isLoading,
        isTenantRole: Boolean(role.tenantId),
        isSystemRole: role.isSystem,
        currentTarget: role.defaultLandingTarget,
      });
    },
    editInitialValues: getRoleEditInitialValues,

    getActions: (vm, t, _handleDelete) => [
      // Manage Permissions (Custom Action)
      {
        label: t("roles.managePermissions"),
        icon: <Shield className="h-4 w-4" />,
        onClick: (role) => router.push(`/roles/${role.id}`),
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS,
      },
      // Clone Role
      {
        label: t("roles.cloneRole"),
        icon: <Copy className="h-4 w-4" />,
        onClick: (role) => {
          const cloneName = `${role.getLocalizedName("en")} (Copy)`;
          const cloneNameAr = `${role.getLocalizedName("ar")} (نسخة)`;
          if (vm.clone) {
            vm.clone(
              {
                nameEn: cloneName,
                nameAr: cloneNameAr,
              },
              role.id
            );
          }
        },
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_CREATE,
      },
      // Assign to Group
      {
        label: t("userGroups.assignToGroup"),
        icon: <Users className="h-4 w-4" />,
        onClick: (role) => handleOpenAssignToGroup(role),
        requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_UPDATE,
      },
      // Edit (Standard)
      {
        label: t("common.edit"),
        icon: <Pencil className="h-4 w-4" />,
        onClick: (role) => vm.openEditModal(role),
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_UPDATE,
      },
      // Delete (Standard) — opens RoleDeleteDialog instead of the generic
      // bare confirm; that dialog owns its own confirmation step.
      {
        label: t("common.delete"),
        icon: <Trash className="h-4 w-4" />,
        onClick: (role) => handleOpenDelete(role),
        variant: "destructive",
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_DELETE,
      },
    ],
    getItemDisplayName: (role) => role.getLocalizedName(language),
    itemTypeKey: "roles.singular",
    enableBulkActions: true,
    bulkActions: [
      {
        label: t("userGroups.assignToGroup"),
        icon: <Users className="h-4 w-4" />,
        onClick: async (ids: string[]) => {
          setSelectedBulkRoleIds(ids);
          setBulkAssignToGroupOpen(true);
        },
        variant: "outline" as const,
        requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_UPDATE,
      },
      {
        label: t("common.delete"),
        icon: <Trash className="h-4 w-4" />,
        onClick: async (ids: string[]) => {
          await handleBulkDelete(ids);
        },
        variant: "destructive" as const,
        requiresConfirmation: true,
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_DELETE,
      },
    ],
  };

  return (
    <>
      <GenericCrudView viewModel={viewModel} config={config} />

      {/* Bulk Assign to Group Dialog */}
      {bulkAssignToGroupOpen && (
        <AssignToGroupDialog
          open={bulkAssignToGroupOpen}
          onOpenChange={(open) => {
            if (!open) {
              setBulkAssignToGroupOpen(false);
              setSelectedBulkRoleIds([]);
            }
          }}
          mode="role"
          roleIds={selectedBulkRoleIds}
          useMyTenant={true}
        />
      )}

      {/* Assign to Group Dialog */}
      <AssignToGroupDialog
        open={assignToGroupOpen}
        onOpenChange={setAssignToGroupOpen}
        mode="role"
        roleId={selectedRoleForGroup?.id}
        roleName={selectedRoleForGroup?.getLocalizedName(language)}
        useMyTenant={true}
      />

      {/* Delete Dialog — admin-count-aware, forces a fallback role pick before deleting */}
      <RoleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setRoleToDelete(null);
        }}
        role={roleToDelete}
        tenantId={roleToDelete?.tenantId}
        onConfirm={async (fallbackRoleId) => {
          if (!roleToDelete) return;
          await deleteRole(roleToDelete.id, fallbackRoleId);
          setRoleToDelete(null);
        }}
        isDeleting={isDeletingRole}
      />
    </>
  );
}
