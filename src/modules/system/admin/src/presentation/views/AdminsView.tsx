/**
 * Admins View
 *
 * Main view component for admin management using GenericCrudView.
 * Clean implementation following the ProductView pattern.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Admin } from "../../domain/entities/Admin";
import type { AssignRoleRequest } from "../../domain/entities/AdminRequests";
import { useAdminsViewModel } from "../viewmodels/useAdminsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { UserCheck, Shield, Trash2, Pencil, Eye } from "lucide-react";
import { format } from "date-fns";
import { AssignRoleDialog, ViewRolesDialog } from "../components/AdminRoleDialogs";

export function AdminsView() {
      const { t } = useI18n();
      // Use myTenantAdmins endpoint for the main admins page
      const {
            vm,
            getConfigBase,
            handleDelete,
            handleToggleActive,
            handleAssignRole,
            handleRemoveRole,
            isAssigningRole,
            isRemovingRole,
      } = useAdminsViewModel({ useMyTenant: true });

      const configBase = getConfigBase();

      // Role dialog state
      const [selectedAdminForRole, setSelectedAdminForRole] = useState<Admin | null>(null);
      const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
      const [viewRolesDialogOpen, setViewRolesDialogOpen] = useState(false);

      // Role dialog handlers
      const handleOpenAssignRole = useCallback((admin: Admin) => {
            setSelectedAdminForRole(admin);
            setAssignRoleDialogOpen(true);
      }, []);

      const handleOpenViewRoles = useCallback((admin: Admin) => {
            setSelectedAdminForRole(admin);
            setViewRolesDialogOpen(true);
      }, []);

      const onAssignRoleSubmit = useCallback(async (request: AssignRoleRequest) => {
            if (!selectedAdminForRole) return;
            await handleAssignRole(selectedAdminForRole.id, request);
            setAssignRoleDialogOpen(false);
      }, [handleAssignRole, selectedAdminForRole]);

      const onRemoveRole = useCallback(async (roleId: string, tenantId?: string) => {
            if (!selectedAdminForRole) return;
            await handleRemoveRole(selectedAdminForRole.id, roleId, tenantId);
      }, [handleRemoveRole, selectedAdminForRole]);

      // Configuration for the generic view
      const config: CrudConfig<Admin> = useMemo(() => ({
            titleKey: "admin.title",
            subtitleKey: "admin.description",
            columns: [
                  {
                        key: "username",
                        label: t("admin.username") || "Username",
                        sortable: true,
                  },
                  {
                        key: "name",
                        label: t("admin.name") || "Name",
                        render: (_val: unknown, admin: Admin) => (
                              <span>{admin.displayName}</span>
                        ),
                  },
                  {
                        key: "roles",
                        label: t("admin.roles") || "Roles",
                        render: (_val: unknown, admin: Admin) => (
                              <span className="text-sm text-muted-foreground">
                                    {admin.roleNames || t("admin.noRoles") || "No roles"}
                              </span>
                        ),
                  },
                  {
                        key: "isActive",
                        label: t("admin.status") || "Status",
                        render: (value: boolean) => (
                              <Badge variant={value ? "active" : "inactive"}>
                                    {value ? t("common.active") || "Active" : t("common.inactive") || "Inactive"}
                              </Badge>
                        ),
                  },
                  {
                        key: "createdAt",
                        label: t("admin.createdAt") || "Created",
                        render: (value: string) =>
                              value ? format(new Date(value), "MMM d, yyyy") : "-",
                  },
            ],
            // Spread configBase with defaults to satisfy required fields
            createFields: configBase.createFields || [],
            editFields: configBase.editFields || [],
            createInitialValues: configBase.createInitialValues,
            editInitialValues: configBase.editInitialValues,
            getItemDisplayName: configBase.getItemDisplayName,
            enableBulkActions: configBase.enableBulkActions,
            permissions: configBase.permissions,
            getActions: (vmInstance: any, tFn: any, handleDeleteFn: any): CrudAction<Admin>[] => [
                  {
                        label: tFn("common.view") || "View",
                        onClick: (item: Admin) => vmInstance.openViewModal(item),
                        variant: "ghost" as const,
                        icon: <Eye className="h-4 w-4" />,
                  },
                  {
                        label: tFn("common.edit") || "Edit",
                        onClick: (item: Admin) => vmInstance.openEditModal(item),
                        variant: "ghost" as const,
                        icon: <Pencil className="h-4 w-4" />,
                  },
                  {
                        label: tFn("admin.toggleStatus") || "Toggle Status",
                        onClick: (item: Admin) => handleToggleActive(item.id, !item.isActive),
                        variant: "ghost" as const,
                        icon: <UserCheck className="h-4 w-4" />,
                  },
                  {
                        label: tFn("admin.role.viewTitle") || "View Roles",
                        onClick: (item: Admin) => handleOpenViewRoles(item),
                        variant: "ghost" as const,
                        icon: <Shield className="h-4 w-4" />,
                  },
                  {
                        label: tFn("admin.role.assign") || "Assign Role",
                        onClick: (item: Admin) => handleOpenAssignRole(item),
                        variant: "ghost" as const,
                        icon: <Shield className="h-4 w-4" />,
                  },
                  {
                        label: tFn("common.delete") || "Delete",
                        onClick: (item: Admin) => handleDeleteFn?.(item),
                        variant: "ghost" as const,
                        className: "text-red-600 hover:text-red-700",
                        icon: <Trash2 className="h-4 w-4" />,
                  },
            ],
      }), [t, vm, handleDelete, configBase, handleToggleActive, handleOpenViewRoles, handleOpenAssignRole]);

      return (
            <>
                  <GenericCrudView viewModel={vm} config={config} />

                  {/* Role Management Dialogs */}
                  <AssignRoleDialog
                        open={assignRoleDialogOpen}
                        onOpenChange={setAssignRoleDialogOpen}
                        admin={selectedAdminForRole}
                        onAssign={onAssignRoleSubmit}
                        isLoading={isAssigningRole}
                  />

                  <ViewRolesDialog
                        open={viewRolesDialogOpen}
                        onOpenChange={setViewRolesDialogOpen}
                        admin={selectedAdminForRole}
                        onRemoveRole={onRemoveRole}
                        isRemoving={isRemovingRole}
                  />
            </>
      );
}
