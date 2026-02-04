/**
 * Tenant Admins Tab Component
 *
 * Manages administrators for a specific tenant using GenericCrudView.
 *
 * @module tenants
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Shield, UserCheck, Trash2, Pencil, Eye, Settings } from "lucide-react";
import { format } from "date-fns";

// Generic CRUD imports
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";

// Admin imports
import { Admin } from "@modules/system/admin/src/domain/entities/Admin";
import { useAdminsViewModel } from "@modules/system/admin/src/presentation/viewmodels/useAdminsViewModel";
import { AssignRoleDialog, ViewRolesDialog, ResetPasswordDialog } from "@modules/system/admin/src/presentation/components/AdminRoleDialogs";
import type { AssignRoleRequest } from "@modules/system/admin/src/domain/entities/AdminRequests";

interface TenantAdminsTabProps {
      tenantId: string;
      tenantName: string;
}

export function TenantAdminsTab({ tenantId, tenantName }: TenantAdminsTabProps) {
      const { t } = useI18n();
      // Pass tenantId to filter admins for this specific tenant
      const {
            vm,
            getConfigBase,
            handleDelete,
            handleToggleActive,
            handleAssignRole,
            handleRemoveRole,
            handleResetPassword,
            isAssigningRole,
            isRemovingRole,
            isResettingPassword,
      } = useAdminsViewModel({ tenantId });

      const configBase = getConfigBase();

      // Role dialog state
      const [selectedAdminForRole, setSelectedAdminForRole] = useState<Admin | null>(null);
      const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
      const [viewRolesDialogOpen, setViewRolesDialogOpen] = useState(false);
      const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

      // Role dialog handlers
      const handleOpenAssignRole = useCallback((admin: Admin) => {
            setSelectedAdminForRole(admin);
            setAssignRoleDialogOpen(true);
      }, []);

      const handleOpenViewRoles = useCallback((admin: Admin) => {
            setSelectedAdminForRole(admin);
            setViewRolesDialogOpen(true);
      }, []);

      const handleOpenResetPassword = useCallback((admin: Admin) => {
            setSelectedAdminForRole(admin);
            setResetPasswordDialogOpen(true);
      }, []);

      const onAssignRoleSubmit = useCallback(
            async (request: AssignRoleRequest) => {
                  if (!selectedAdminForRole) return;
                  await handleAssignRole(selectedAdminForRole.id, request);
                  setAssignRoleDialogOpen(false);
            },
            [handleAssignRole, selectedAdminForRole]
      );

      const onRemoveRole = useCallback(
            async (roleId: string, tenantId?: string) => {
                  if (!selectedAdminForRole) return;
                  await handleRemoveRole(selectedAdminForRole.id, roleId, tenantId);
            },
            [handleRemoveRole, selectedAdminForRole]
      );

      const onResetPasswordSubmit = useCallback(
            async (newPassword: string) => {
                  if (!selectedAdminForRole) return;
                  await handleResetPassword(selectedAdminForRole.id, newPassword);
            },
            [handleResetPassword, selectedAdminForRole]
      );

      // Configuration for the generic view
      const config: CrudConfig<Admin> = useMemo(
            () => ({
                  titleKey: "",
                  subtitleKey: "",
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
                                          {value
                                                ? t("common.active") || "Active"
                                                : t("common.inactive") || "Inactive"}
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
                  createFields: configBase.createFields || [],
                  editFields: configBase.editFields || [],
                  createInitialValues: configBase.createInitialValues,
                  editInitialValues: configBase.editInitialValues,
                  getItemDisplayName: configBase.getItemDisplayName,
                  enableBulkActions: configBase.enableBulkActions,
                  permissions: configBase.permissions,
                  getActions: (
                        vmInstance: any,
                        tFn: any,
                        handleDeleteFn: any
                  ): CrudAction<Admin>[] => [
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
                                    onClick: (item: Admin) =>
                                          handleToggleActive(item.id, !item.isActive),
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
                                    label: tFn("admin.resetPassword") || "Reset Password",
                                    onClick: (item: Admin) => handleOpenResetPassword(item),
                                    variant: "ghost" as const,
                                    className: "text-orange-600 hover:text-orange-700",
                                    icon: <Settings className="h-4 w-4" />,
                              },
                              {
                                    label: tFn("common.delete") || "Delete",
                                    onClick: (item: Admin) => handleDeleteFn?.(item),
                                    variant: "ghost" as const,
                                    className: "text-red-600 hover:text-red-700",
                                    icon: <Trash2 className="h-4 w-4" />,
                              },
                        ],
            }),
            [
                  t,
                  vm,
                  handleDelete,
                  configBase,
                  handleToggleActive,
                  handleOpenViewRoles,
                  handleOpenAssignRole,
                  handleOpenResetPassword,
            ]
      );

      return (
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                        <div>
                              <h3 className="text-lg font-semibold">{t("tenant.manageAdmins")}</h3>
                              <p className="text-sm text-muted-foreground">
                                    {t("tenant.adminsDescription") ||
                                          `Manage administrators for ${tenantName}`}
                              </p>
                        </div>
                  </div>

                  {/* GenericCrudView for Admins */}
                  <div className="border rounded-lg overflow-hidden">
                        <GenericCrudView viewModel={vm} config={config} />
                  </div>

                  {/* Role Management Dialogs */}
                  <AssignRoleDialog
                        open={assignRoleDialogOpen}
                        onOpenChange={setAssignRoleDialogOpen}
                        admin={selectedAdminForRole}
                        onAssign={onAssignRoleSubmit}
                        isLoading={isAssigningRole}
                        tenantId={tenantId}
                  />

                  <ViewRolesDialog
                        open={viewRolesDialogOpen}
                        onOpenChange={setViewRolesDialogOpen}
                        admin={selectedAdminForRole}
                        onRemoveRole={onRemoveRole}
                        isRemoving={isRemovingRole}
                  />

                  <ResetPasswordDialog
                        open={resetPasswordDialogOpen}
                        onOpenChange={setResetPasswordDialogOpen}
                        admin={selectedAdminForRole}
                        onResetPassword={onResetPasswordSubmit}
                        isLoading={isResettingPassword}
                  />
            </div>
      );
}
