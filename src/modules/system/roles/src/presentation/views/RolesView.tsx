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
import { AssignToGroupDialog } from "@modules/system/user-groups/src/presentation/components/AssignToGroupDialog";

export function RolesView() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();

  // Logic: Super Admins see System/Context (Auto-Scoped), Tenant Admins see My Tenant
  const viewModel = useRolesViewModel({ useMyTenant: !isSuperAdmin });
  const { handleBulkDelete } = viewModel;

  // Assign to Group dialog state
  const [selectedRoleForGroup, setSelectedRoleForGroup] = useState<Role | null>(null);
  const [assignToGroupOpen, setAssignToGroupOpen] = useState(false);

  // Bulk Assign to Group dialog state
  const [selectedBulkRoleIds, setSelectedBulkRoleIds] = useState<string[]>([]);
  const [bulkAssignToGroupOpen, setBulkAssignToGroupOpen] = useState(false);

  const handleOpenAssignToGroup = useCallback((role: Role) => {
    setSelectedRoleForGroup(role);
    setAssignToGroupOpen(true);
  }, []);

  const columns: CrudColumn<Role>[] = [
    {
      key: "nameAr",
      label: t("roles.name"),
      sortable: true,
      className: "font-medium",
      render: (value: unknown, role: Role) => role.getLocalizedName(language),
    },
    { key: "code", label: t("roles.code"), sortable: true, className: "font-mono text-xs" },
    {
      key: "description",
      label: t("roles.descriptionCol") || t("roles.description"),
      className: "hidden md:table-cell",
      render: (value: unknown, role: Role) => role.getLocalizedDescription(language),
    },
    {
      key: "priority",
      label: t("roles.priority"),
      sortable: true,
      className: "w-24 text-center",
    },
    {
      key: "groups",
      label: t("roles.groups") || "Groups",
      render: (_val: unknown, role: Role) => {
        const groups = role.getLocalizedGroups(language);
        return (
          <div className="flex flex-wrap gap-1">
            {groups.length > 0 ? (
              groups.map((groupName, index) => (
                <Badge key={`${index}-${groupName}`} variant="secondary" className="text-xs">
                  {groupName}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">-</span>
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
        label: t("roles.nameEn") || "Name (English)",
        type: "text",
        required: true,
        placeholder: t("roles.namePlaceholder"),
      },
      {
        name: "nameAr",
        label: t("roles.nameAr") || "Name (Arabic)",
        type: "text",
        required: true,
        placeholder: t("roles.nameArPlaceholder") || t("roles.namePlaceholder"),
      },
      {
        name: "code",
        label: t("roles.code"),
        type: "text",
        required: true,
        placeholder: t("roles.codePlaceholder"),
      },
      {
        name: "descriptionEn",
        label: t("roles.descriptionEn") || "Description (English)",
        type: "textarea",
        placeholder: t("roles.descriptionPlaceholder"),
      },
      {
        name: "descriptionAr",
        label: t("roles.descriptionAr") || "Description (Arabic)",
        type: "textarea",
        placeholder: t("roles.descriptionArPlaceholder") || t("roles.descriptionPlaceholder"),
      },
      {
        name: "priority",
        label: t("roles.priority"),
        type: "number",
        defaultValue: 100,
      },
    ],
    editFields: [
      {
        name: "nameEn",
        label: t("roles.nameEn") || "Name (English)",
        type: "text",
        required: true,
      },
      {
        name: "nameAr",
        label: t("roles.nameAr") || "Name (Arabic)",
        type: "text",
        required: true,
      },
      {
        name: "descriptionEn",
        label: t("roles.descriptionEn") || "Description (English)",
        type: "textarea",
      },
      {
        name: "descriptionAr",
        label: t("roles.descriptionAr") || "Description (Arabic)",
        type: "textarea",
      },
      {
        name: "priority",
        label: t("roles.priority"),
        type: "number",
      },
    ],
    getActions: (vm, t, handleDelete) => [
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
        label: t("userGroups.assignToGroup") || "Assign to Group",
        icon: <Users className="h-4 w-4" />,
        onClick: (role) => handleOpenAssignToGroup(role),
      },
      // Edit (Standard)
      {
        label: t("common.edit"),
        icon: <Pencil className="h-4 w-4" />,
        onClick: (role) => vm.openEditModal(role),
      },
      // Delete (Standard)
      {
        label: t("common.delete"),
        icon: <Trash className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
      },
    ],
    getItemDisplayName: (role) => role.getLocalizedName(language),
    itemTypeKey: "roles.roleDetails", // Used for delete confirmation ("Delete Role Details" -> "Delete Role")
    enableBulkActions: true,
    bulkActions: [
      {
        label: t("userGroups.assignToGroup") || "Assign to Group",
        icon: <Users className="h-4 w-4" />,
        onClick: async (ids: string[]) => {
          setSelectedBulkRoleIds(ids);
          setBulkAssignToGroupOpen(true);
        },
        variant: "outline" as const,
      },
      {
        label: t("common.delete") || "Delete",
        icon: <Trash className="h-4 w-4" />,
        onClick: async (ids: string[]) => { await handleBulkDelete(ids); },
        variant: "destructive" as const,
        requiresConfirmation: true,
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
          useMyTenant={!isSuperAdmin}
        />
      )}

      {/* Assign to Group Dialog */}
      <AssignToGroupDialog
        open={assignToGroupOpen}
        onOpenChange={setAssignToGroupOpen}
        mode="role"
        roleId={selectedRoleForGroup?.id}
        roleName={selectedRoleForGroup?.getLocalizedName(language)}
        useMyTenant={!isSuperAdmin}
      />
    </>
  );
}
