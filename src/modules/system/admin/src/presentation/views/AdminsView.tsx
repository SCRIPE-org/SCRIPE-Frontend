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
import { usePermissions } from "@core/providers/permission-provider";
import { useAppStore } from "@core/store/useAppStore";

import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Badge } from "@core/ui/badge";
import {
  UserCheck,
  Shield,
  ShieldCheck,
  Trash2,
  Pencil,
  Eye,
  Settings,
  ArrowRightLeft,
  ShieldAlert,
  Crown,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { ResetPasswordDialog } from "../components/AdminRoleDialogs";
import { ManageRolesDialog } from "../components/ManageRolesDialog";
import { AdminTransferDialog } from "../components/AdminTransferDialog";
import { AssignToGroupDialog } from "@modules/system/user-groups/src/presentation/components/AssignToGroupDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";

interface AdminsViewProps {
  /** Optional tenant ID to show admins for a specific tenant */
  tenantId?: string;
}

export function AdminsView({ tenantId }: AdminsViewProps = {}) {
  const { t, language } = useI18n();
  const { isSuperAdmin } = usePermissions();
  const currentUser = useAppStore((state) => state.user);

  // Use myTenantAdmins if not super admin (Tenant Admin mode)
  // Super Admins use the standard endpoint, which is now Context-Aware on the backend
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
    handleTransfer,
    isTransferring,
    handleTransferProtection,
    isTransferringProtection,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,
  } = useAdminsViewModel({ useMyTenant: !isSuperAdmin, tenantId });

  const configBase = getConfigBase();

  // Role/Password dialog state
  const [selectedAdminForAction, setSelectedAdminForAction] = useState<Admin | null>(null);
  const [manageRolesDialogOpen, setManageRolesDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [assignToGroupDialogOpen, setAssignToGroupDialogOpen] = useState(false);

  // Bulk state
  const [selectedBulkAdminIds, setSelectedBulkAdminIds] = useState<string[]>([]);
  const [bulkAssignToGroupDialogOpen, setBulkAssignToGroupDialogOpen] = useState(false);

  // Dialog handlers
  const handleOpenManageRoles = useCallback((admin: Admin) => {
    setSelectedAdminForAction(admin);
    setManageRolesDialogOpen(true);
  }, []);

  const handleOpenResetPassword = useCallback((admin: Admin) => {
    setSelectedAdminForAction(admin);
    setResetPasswordDialogOpen(true);
  }, []);

  const handleOpenAssignToGroup = useCallback((admin: Admin) => {
    setSelectedAdminForAction(admin);
    setAssignToGroupDialogOpen(true);
  }, []);

  const onResetPasswordSubmit = useCallback(
    async (newPassword: string) => {
      if (!selectedAdminForAction) return;
      await handleResetPassword(selectedAdminForAction.id, newPassword);
    },
    [handleResetPassword, selectedAdminForAction]
  );

  // Configuration for the generic view
  const handleOpenTransfer = useCallback((admin: Admin) => {
    setSelectedAdminForAction(admin);
    setTransferDialogOpen(true);
  }, []);

  const onTransferSubmit = useCallback(
    async (
      adminId: string,
      request: import("../../domain/entities/AdminRequests").TransferAdminRequest
    ) => {
      await handleTransfer(adminId, request);
      setTransferDialogOpen(false);
    },
    [handleTransfer]
  );

  // Configuration for the generic view
  const config: CrudConfig<Admin> = useMemo(
    () => ({
      titleKey: "admin.title",
      subtitleKey: "admin.description",
      resource: "admins", // Checks permissions (admins.view, admins.create, etc.)
      columns: [
        {
          key: "username",
          label: t("admin.username") || "Username",
          sortable: true,
          render: (_val: unknown, admin: Admin) => (
            <div className="flex items-center gap-2">
              <span>{admin.username}</span>
              {admin.hasGuardianProtection && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        {admin.isSuperAdmin ? (
                          <Crown className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{t("guardian.protectedAdminTooltip")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ),
        },
        {
          key: "name",
          label: t("admin.name") || "Name",
          render: (_val: unknown, admin: Admin) => <span>{admin.displayName}</span>,
        },
        {
          key: "email",
          label: t("admin.email") || "Email",
          render: (_val: unknown, admin: Admin) =>
            admin.email ? (
              <a href={`mailto:${admin.email}`} className="text-primary hover:underline text-sm">
                {admin.email}
              </a>
            ) : (
              <span className="text-muted-foreground">-</span>
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
                    <Badge key={`${index}-${roleName}`} variant="outline" className="text-xs">
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
          key: "groups",
          label: t("admin.groups") || "Groups",
          render: (_val: unknown, admin: Admin) => {
            const groups = admin.getLocalizedGroups(language);
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
          render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "-"),
        },
      ],
      // Spread configBase with defaults to satisfy required fields
      createFields: configBase.createFields || [],
      editFields: configBase.editFields || [],
      createInitialValues: configBase.createInitialValues,
      editInitialValues: configBase.editInitialValues,
      getItemDisplayName: configBase.getItemDisplayName,
      permissions: configBase.permissions,
      deleteService: configBase.deleteService,
      getActions: (vmInstance: any, tFn: any, handleDeleteFn: any): CrudAction<Admin>[] => {
        const isProtectedAdmin = currentUser?.isProtected;

        const actions: CrudAction<Admin>[] = [
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
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
            show: (item: Admin) => !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("admin.impersonate") || "Impersonate",
            onClick: (item: Admin) => handleImpersonate(item.id),
            variant: "ghost" as const,
            icon: <UserCheck className="h-4 w-4" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_IMPERSONATE,
            show: (item: Admin) => !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("admin.transfer") || "Transfer",
            onClick: (item: Admin) => handleOpenTransfer(item),
            variant: "ghost" as const,
            icon: <ArrowRightLeft className="h-4 w-4" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_TRANSFER,
            show: (item: Admin) => !item.hasGuardianProtection || currentUser?.id === item.id,
          },
          // Transfer Protection: shown if the logged in user is the protected admin OR if viewing a specific tenant's admins (upper admin)
          ...(() => {
            if (!isProtectedAdmin && !tenantId) return [];
            return [
              {
                label: tFn("admin.transferProtection") || "Transfer Protection",
                onClick: (item: Admin) => handleTransferProtection(item.id),
                variant: "ghost" as const,
                icon: <ShieldCheck className="h-4 w-4" />,
                requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
                // Only show for admins who are NOT the protected one and are editable
                show: (item: Admin) => item.id !== currentUser?.id && item.canModify,
                confirmTitle: tFn("admin.transferProtection") || "Transfer Protection",
                confirmDescription:
                  tFn("admin.transferProtectionDesc") ||
                  "Are you sure you want to transfer protection to {name}?",
                confirmVariant: "warning" as const,
                confirmButtonText: tFn("common.confirm") || "Confirm",
              },
            ];
          })(),
          {
            label: tFn("admin.toggleStatus") || "Toggle Status",
            onClick: (item: Admin) => handleToggleActive(item.id, !item.isActive),
            variant: "ghost" as const,
            icon: <UserCheck className="h-4 w-4" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
            // Cannot toggle status if they are protected (even upper admin shouldn't deactivate the last super admin)
            show: (item: Admin) => !item.hasGuardianProtection,
          },
          {
            label: tFn("admin.role.manageTitle") || "Manage Roles",
            onClick: (item: Admin) => handleOpenManageRoles(item),
            variant: "ghost" as const,
            icon: <Shield className="h-4 w-4" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_ASSIGN_ROLES,
            show: (item: Admin) => !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("admin.resetPassword") || "Reset Password",
            onClick: (item: Admin) => handleOpenResetPassword(item),
            variant: "ghost" as const,
            className: "text-orange-600 hover:text-orange-700",
            icon: <Settings className="h-4 w-4" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_RESET_PASSWORD,
            show: (item: Admin) => !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("userGroups.assignToGroup") || "Assign to Group",
            onClick: (item: Admin) => handleOpenAssignToGroup(item),
            variant: "ghost" as const,
            icon: <Users className="h-4 w-4" />,
            requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_VIEW,
            show: (item: Admin) => !item.hasGuardianProtection || !!tenantId,
          },
          {
            label: tFn("common.delete") || "Delete",
            onClick: (item: Admin) => handleDeleteFn?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            icon: <Trash2 className="h-4 w-4" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_DELETE,
            // Cannot delete protected admin ever
            show: (item: Admin) => !item.hasGuardianProtection,
          },
        ];

        return actions;
      },
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("common.activate") || "Activate",
          icon: <ShieldCheck className="h-4 w-4" />,
          onClick: async (ids: string[]) => { await handleBulkActivate(ids); },
          variant: "outline" as const,
        },
        {
          label: t("common.deactivate") || "Deactivate",
          icon: <ShieldAlert className="h-4 w-4" />,
          onClick: async (ids: string[]) => { await handleBulkDeactivate(ids); },
          variant: "outline" as const,
        },
        {
          label: t("userGroups.assignToGroup") || "Assign to Group",
          icon: <Users className="h-4 w-4" />,
          onClick: async (ids: string[]) => {
            setSelectedBulkAdminIds(ids);
            setBulkAssignToGroupDialogOpen(true);
          },
          variant: "outline" as const,
          requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_VIEW,
        },
        {
          label: t("common.delete") || "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: async (ids: string[]) => { await handleBulkDelete(ids); },
          variant: "destructive" as const,
          requiresConfirmation: true,
        },
      ],
    }),
    [
      t,
      vm,
      handleDelete,
      configBase,
      handleToggleActive,
      handleOpenManageRoles,
      handleOpenResetPassword,
      handleOpenAssignToGroup,
      handleImpersonate,
      handleOpenTransfer,
      handleTransferProtection,
      language,
      handleBulkActivate,
      handleBulkDeactivate,
      handleBulkDelete,
    ]
  );

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />

      {/* Bulk Assign to Group Dialog */}
      {bulkAssignToGroupDialogOpen && (
        <AssignToGroupDialog
          open={bulkAssignToGroupDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setBulkAssignToGroupDialogOpen(false);
              setSelectedBulkAdminIds([]);
            }
          }}
          adminIds={selectedBulkAdminIds}
          mode="admin"
          tenantId={tenantId}
          useMyTenant={true}
        />
      )}

      {/* Role Management Dialog */}
      <ManageRolesDialog
        open={manageRolesDialogOpen}
        onOpenChange={setManageRolesDialogOpen}
        admin={selectedAdminForAction}
        tenantId={tenantId}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        admin={selectedAdminForAction}
        onResetPassword={onResetPasswordSubmit}
        isLoading={isResettingPassword}
      />

      <AdminTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        admin={selectedAdminForAction}
        onTransfer={onTransferSubmit}
        isTransferring={isTransferring}
      />

      {/* Assign to Group Dialog */}
      <AssignToGroupDialog
        open={assignToGroupDialogOpen}
        onOpenChange={setAssignToGroupDialogOpen}
        mode="admin"
        adminId={selectedAdminForAction?.id}
        adminName={selectedAdminForAction?.displayName}
        tenantId={selectedAdminForAction?.tenantId || tenantId}
        useMyTenant={true}
      />
    </>
  );
}
