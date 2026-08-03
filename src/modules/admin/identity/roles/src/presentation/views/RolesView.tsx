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
import {
  GenericCrudView,
  type CrudConfig,
  type CrudColumn,
} from "@core/crud/components/generic-crud-view";
import { Shield, Pencil, Trash, Copy, Users } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { usePermissions } from "@core/providers/permission-provider";
import type { Role } from "../../domain/entities/Role";
import { AssignToGroupDialog } from "@modules/identity/core";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { RoleDeleteDialog } from "../components/RoleDeleteDialog";

/**
 * Presentation UI component rendering the roles view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RolesView() {
  useModuleLocales(() => import("../../../locales"), "roles");

  const { t, language } = useI18n();
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();

  // Logic: Super Admins see System/Context (Auto-Scoped), Tenant Admins see My Tenant
  const viewModel = useRolesViewModel({ useMyTenant: !isSuperAdmin });
  const { handleBulkDelete, deleteRole, isDeletingRole } = viewModel;

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

  const columns: CrudColumn<Role>[] = [
    {
      key: "nameAr",
      label: t("roles.name"),
      sortable: true,
      className: "font-medium",
      render: (value: unknown, role: Role) => role.getLocalizedName(language),
    },
    {
      key: "code",
      label: t("roles.code"),
      sortable: true,
      className: "font-mono text-xs text-nx-ink-3",
    },
    {
      key: "description",
      // roles.description is the PAGE subtitle; the column label is the field one.
      label: t("roles.descriptionField"),
      className: "hidden max-w-[28rem] truncate md:table-cell",
      render: (value: unknown, role: Role) => {
        const text = role.getLocalizedDescription(language);
        return text ? (
          <span className="block truncate text-nx-ink-2" title={text}>
            {text}
          </span>
        ) : (
          <span className="text-nx-ink-3">-</span>
        );
      },
    },
    {
      // Numeric column: right-aligned tabular figures rather than a manual
      // centered fixed width, so priorities read as a clean column of numbers.
      key: "priority",
      label: t("roles.priority"),
      sortable: true,
      className: "text-end tabular-nums",
    },
    {
      key: "groups",
      label: t("roles.groups"),
      render: (_val: unknown, role: Role) => {
        const groups = role.getLocalizedGroups(language);
        if (groups.length === 0) {
          return <span className="text-nx-ink-3">-</span>;
        }
        // Cap at two chips + a "+N" overflow on ONE line — variable group counts
        // no longer ripple into ragged, multi-height rows.
        const shown = groups.slice(0, 2);
        const overflow = groups.length - shown.length;
        return (
          <div className="flex items-center gap-1 truncate">
            {shown.map((groupName, index) => (
              <Badge
                key={`${index}-${groupName}`}
                variant="secondary"
                className="max-w-[10rem] shrink-0 truncate text-xs"
              >
                {groupName}
              </Badge>
            ))}
            {overflow > 0 && (
              <Badge variant="outline" className="shrink-0 text-xs tabular-nums">
                +{overflow}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  const config: CrudConfig<Role> = {
    titleKey: "roles.title",
    subtitleKey: "roles.description",
    resource: "roles", // Checks permissions (roles.view, roles.create, etc.)
    columns,
    createFields: [
      {
        name: "nameEn",
        label: t("roles.nameEn"),
        type: "text",
        required: true,
        placeholder: t("roles.namePlaceholder"),
      },
      {
        name: "nameAr",
        label: t("roles.nameAr"),
        type: "text",
        required: true,
        placeholder: t("roles.nameArPlaceholder"),
      },
      {
        name: "code",
        label: t("roles.code"),
        type: "text",
        required: true,
        placeholder: t("roles.codePlaceholder"),
        description: t("roles.codeHint"),
      },
      {
        name: "descriptionEn",
        label: t("roles.descriptionEn"),
        type: "textarea",
        placeholder: t("roles.descriptionPlaceholder"),
      },
      {
        name: "descriptionAr",
        label: t("roles.descriptionAr"),
        type: "textarea",
        placeholder: t("roles.descriptionArPlaceholder"),
      },
      {
        name: "priority",
        label: t("roles.priority"),
        type: "number",
        defaultValue: 100,
        description: t("roles.priorityHint"),
      },
    ],
    editFields: [
      {
        name: "nameEn",
        label: t("roles.nameEn"),
        type: "text",
        required: true,
      },
      {
        name: "nameAr",
        label: t("roles.nameAr"),
        type: "text",
        required: true,
      },
      {
        name: "descriptionEn",
        label: t("roles.descriptionEn"),
        type: "textarea",
      },
      {
        name: "descriptionAr",
        label: t("roles.descriptionAr"),
        type: "textarea",
      },
      {
        name: "priority",
        label: t("roles.priority"),
        type: "number",
        description: t("roles.priorityHint"),
      },
    ],
    getActions: (vm, t, _handleDelete) => [
      // Manage Permissions (Custom Action)
      {
        label: t("roles.managePermissions"),
        icon: <Shield className="h-4 w-4" />,
        onClick: (role) => router.push(`/roles/${role.id}`),
        requiredPermission: SYSTEM_PERMISSIONS.ROLES_UPDATE,
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
      },
      // Edit (Standard)
      {
        label: t("common.edit"),
        icon: <Pencil className="h-4 w-4" />,
        onClick: (role) => vm.openEditModal(role),
      },
      // Delete (Standard) — opens RoleDeleteDialog instead of the generic
      // bare confirm; that dialog owns its own confirmation step.
      {
        label: t("common.delete"),
        icon: <Trash className="h-4 w-4" />,
        onClick: (role) => handleOpenDelete(role),
        variant: "destructive",
      },
    ],
    getItemDisplayName: (role) => role.getLocalizedName(language),
    itemTypeKey: "roles.roleDetails", // Used for delete confirmation ("Delete Role Details" -> "Delete Role")
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
