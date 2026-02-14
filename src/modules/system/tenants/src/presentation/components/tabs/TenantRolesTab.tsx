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

import { Shield, Trash2, Pencil, Eye } from "lucide-react";
import { format } from "date-fns";

// Generic CRUD imports
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

// Role imports
import { Role } from "@modules/system/roles/src/domain/entities/Role";
import { RolePermissionsDialog } from "@modules/system/roles/src/presentation/components/RolePermissionsDialog";
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

  // All logic delegated to ViewModel
  const vm = useTenantRolesViewModel({ tenantId, tenantName });

  // Build CrudConfig from ViewModel data
  const config: CrudConfig<Role> = {
    titleKey: "",
    subtitleKey: "",
    columns: vm.columns.map((col) => ({
      ...col,
      render:
        col.key === "code"
          ? (value: string) => <code className="rounded bg-muted px-2 py-0.5 text-xs">{value}</code>
          : col.key === "name"
            ? (_: unknown, role: Role) => (
                <span className="font-medium">{role.getLocalizedName(language)}</span>
              )
            : col.key === "description"
              ? (_: unknown, role: Role) => (
                  <span className="block max-w-[200px] truncate text-sm text-muted-foreground">
                    {role.getLocalizedDescription(language)}
                  </span>
                )
              : col.key === "priority"
                ? (value: number) => <Badge variant="outline">{value}</Badge>
                : col.key === "createdAt"
                  ? (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "-")
                  : undefined,
    })),
    createFields: vm.createFields,
    editFields: vm.editFields,
    createInitialValues: vm.createInitialValues,
    editInitialValues: vm.getEditInitialValues,
    getItemDisplayName: (item: Role) => item.getLocalizedName(language),
    permissions: {
      canView: "roles.view",
      canCreate: "roles.create",
      canUpdate: "roles.update",
      canDelete: "roles.delete",
    },
    getActions: (vmInstance, tFn, handleDeleteFn): CrudAction<Role>[] => [
      {
        label: tFn("common.view") || "View",
        onClick: (item: Role) => vmInstance.openViewModal(item),
        variant: "ghost",
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: tFn("common.edit") || "Edit",
        onClick: (item: Role) => vmInstance.openEditModal(item),
        variant: "ghost",
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("role.managePermissions") || "Permissions",
        onClick: (item: Role) => vm.openPermissionsDialog(item),
        variant: "ghost",
        icon: <Shield className="h-4 w-4" />,
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_UPDATE,
      },
      {
        label: tFn("common.delete") || "Delete",
        onClick: (item: Role) => handleDeleteFn?.(item),
        variant: "ghost",
        className: "text-red-600 hover:text-red-700",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{vm.title}</h3>
          <p className="text-sm text-muted-foreground">{vm.subtitle}</p>
        </div>
      </div>

      {/* Roles Table */}
      <div className="overflow-hidden rounded-lg border">
        <GenericCrudView viewModel={vm.rolesVm} config={config} />
      </div>

      {/* Permissions Dialog */}
      <RolePermissionsDialog
        open={vm.permissionsDialogOpen}
        onOpenChange={(open) => !open && vm.closePermissionsDialog()}
        role={vm.selectedRoleForPermissions}
        tenantId={vm.tenantId}
      />
    </div>
  );
}
