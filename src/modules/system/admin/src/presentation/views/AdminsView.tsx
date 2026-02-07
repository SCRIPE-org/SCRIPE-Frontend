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
import { UserCheck, Shield, Trash2, Pencil, Eye, Settings } from "lucide-react";
import { format } from "date-fns";
import { AssignRoleDialog, ViewRolesDialog, ResetPasswordDialog } from "../components/AdminRoleDialogs";

interface AdminsViewProps {
      /** Optional tenant ID to show admins for a specific tenant */
      tenantId?: string;
}

export function AdminsView({ tenantId }: AdminsViewProps = {}) {
      const { t, language } = useI18n();
      // Use myTenantAdmins by default, or specific tenant if provided
      const {
            vm,
            getConfigBase,
            handleDelete,
            handleToggleActive,
            handleAssignRole,
            handleRemoveRole,
            handleResetPassword,
            handleImpersonate,
            isAssigningRole,
            isRemovingRole,
            isResettingPassword,
            isImpersonating,
      } = useAdminsViewModel({ useMyTenant: !tenantId, tenantId });

      const configBase = getConfigBase();

      // Role/Password dialog state
      const [selectedAdminForAction, setSelectedAdminForAction] = useState<Admin | null>(null);
      const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
      const [viewRolesDialogOpen, setViewRolesDialogOpen] = useState(false);
      const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

      // Dialog handlers
      const handleOpenAssignRole = useCallback((admin: Admin) => {
            setSelectedAdminForAction(admin);
            setAssignRoleDialogOpen(true);
      }, []);

      const handleOpenViewRoles = useCallback((admin: Admin) => {
            setSelectedAdminForAction(admin);
            setViewRolesDialogOpen(true);
      }, []);

      const handleOpenResetPassword = useCallback((admin: Admin) => {
            setSelectedAdminForAction(admin);
            setResetPasswordDialogOpen(true);
      }, []);

      const onAssignRoleSubmit = useCallback(async (request: AssignRoleRequest) => {
            if (!selectedAdminForAction) return;
            await handleAssignRole(selectedAdminForAction.id, request);
            setAssignRoleDialogOpen(false);
      }, [handleAssignRole, selectedAdminForAction]);

      const onRemoveRole = useCallback(async (roleId: string, tenantId?: string) => {
            if (!selectedAdminForAction) return;
            await handleRemoveRole(selectedAdminForAction.id, roleId, tenantId);
      }, [handleRemoveRole, selectedAdminForAction]);

      const onResetPasswordSubmit = useCallback(async (newPassword: string) => {
            if (!selectedAdminForAction) return;
            await handleResetPassword(selectedAdminForAction.id, newPassword);
      }, [handleResetPassword, selectedAdminForAction]);

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
                        render: (_val: unknown, admin: Admin) => {
                              const roles = admin.getLocalizedRoles(language);
                              return (
                                    <div className="flex flex-wrap gap-1">
                                          {roles.length > 0 ? (
                                                roles.map((roleName, index) => (
                                                      <Badge
                                                            key={`${index}-${roleName}`}
                                                            variant="outline"
                                                            className="text-xs"
                                                      >
                                                            {roleName}
                                                      </Badge>
                                                ))
                                          ) : (
                                                <span className="text-muted-foreground">-</span>
                                          )}
                                    </div>
                              );
                        },
                  },
                  {
                        key: "isActive",
                        label: t("admin.status") || "Status",
                        render: (value: boolean) => (
                              <Badge variant={value ? "success" : "secondary"}>
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
                        label: tFn("admin.impersonate") || "Impersonate",
                        onClick: (item: Admin) => handleImpersonate(item.id),
                        variant: "ghost" as const,
                        icon: <UserCheck className="h-4 w-4" />,
                        // Only show if not current user and has permission (handled by backend usually, but UI check is good too)
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
      }), [t, vm, handleDelete, configBase, handleToggleActive, handleOpenViewRoles, handleOpenAssignRole, handleOpenResetPassword, language]);

      return (
            <>
                  <GenericCrudView viewModel={vm} config={config} />

                  {/* Role Management Dialogs */}
                  <AssignRoleDialog
                        open={assignRoleDialogOpen}
                        onOpenChange={setAssignRoleDialogOpen}
                        admin={selectedAdminForAction}
                        onAssign={onAssignRoleSubmit}
                        isLoading={isAssigningRole}
                        tenantId={tenantId}
                  />

                  <ViewRolesDialog
                        open={viewRolesDialogOpen}
                        onOpenChange={setViewRolesDialogOpen}
                        admin={selectedAdminForAction}
                        onRemoveRole={onRemoveRole}
                        isRemoving={isRemovingRole}
                  />

                  <ResetPasswordDialog
                        open={resetPasswordDialogOpen}
                        onOpenChange={setResetPasswordDialogOpen}
                        admin={selectedAdminForAction}
                        onResetPassword={onResetPasswordSubmit}
                        isLoading={isResettingPassword}
                  />
            </>
      );
}
