/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, unused-imports/no-unused-vars */
// FILE-EXCEPTION: file length
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
import { useAdminsViewModel } from "../viewmodels/useAdminsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useAppStore } from "@core/store/useAppStore";

import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { cn } from "@core/common/utils";
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
  Mail,
  KeyRound,
} from "lucide-react";
import { formatUtc } from "@core/common/utils";
import { ResetPasswordDialog, ManualSetupDialog } from "../components/AdminRoleDialogs";
import { ManageRolesDialog } from "../components/ManageRolesDialog";
import { AdminTransferDialog } from "../components/AdminTransferDialog";
import { AssignToGroupDialog } from "@modules/identity/core";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useModuleLocales } from "@core/hooks/use-module-locales";

interface AdminsViewProps {
  /** Optional tenant ID to show admins for a specific tenant */
  tenantId?: string;
}

/**
 * Presentation UI component rendering the admins view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AdminsView({ tenantId }: AdminsViewProps = {}) {
  useModuleLocales(() => import("../../../locales"), "admin");
  const { t, language } = useI18n();
  const { isPlatformSuperAdmin } = usePermissions();
  const currentUser = useAppStore((state) => state.user);

  // Use myTenantAdmins if not platform super admin (Tenant Admin mode)
  // Platform Super Admins outside drill-down use the standard endpoint
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
    handleResendSetupEmail,
    isResendingSetupEmail,
    handleManualSetup,
    isManualSettingUp,
  } = useAdminsViewModel({ useMyTenant: !isPlatformSuperAdmin, tenantId });

  const configBase = getConfigBase();

  // Role/Password dialog state
  const [selectedAdminForAction, setSelectedAdminForAction] = useState<Admin | null>(null);
  const [manageRolesDialogOpen, setManageRolesDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [manualSetupDialogOpen, setManualSetupDialogOpen] = useState(false);
  const [assignToGroupDialogOpen, setAssignToGroupDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

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

  const handleOpenManualSetup = useCallback((admin: Admin) => {
    setSelectedAdminForAction(admin);
    setManualSetupDialogOpen(true);
  }, []);

  const onResetPasswordSubmit = useCallback(
    async (newPassword: string) => {
      if (!selectedAdminForAction) return;
      await handleResetPassword(selectedAdminForAction.id, newPassword);
    },
    [handleResetPassword, selectedAdminForAction]
  );

  const onManualSetupSubmit = useCallback(
    async (newPassword: string, confirmPassword: string, mustChangePassword: boolean) => {
      if (!selectedAdminForAction) return;
      await handleManualSetup(
        selectedAdminForAction.id,
        newPassword,
        confirmPassword,
        mustChangePassword
      );
    },
    [handleManualSetup, selectedAdminForAction]
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
          label: t("admin.username"),
          sortable: true,
          render: (_val: unknown, admin: Admin) => (
            <div className="flex items-center gap-2">
              <span className={cn(!admin.username && "text-nx-ink-3")}>{admin.username || "—"}</span>
              {admin.hasGuardianProtection && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        {admin.isSuperAdmin ? (
                          <Crown className="h-4 w-4 text-warning" aria-hidden="true" />
                        ) : (
                          <Shield className="h-4 w-4 text-info" aria-hidden="true" />
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
          label: t("admin.name"),
          render: (_val: unknown, admin: Admin) => (
            <span className={cn(!admin.displayName && "text-nx-ink-3")}>{admin.displayName || "—"}</span>
          ),
        },
        {
          key: "email",
          label: t("admin.email"),
          render: (_val: unknown, admin: Admin) =>
            admin.email ? (
              <a href={`mailto:${admin.email}`} className="text-sm text-nx-accent hover:underline">
                {admin.email}
              </a>
            ) : (
              <span className="text-nx-ink-2">-</span>
            ),
        },
        {
          key: "roles",
          label: t("admin.roles"),
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
                  <span className="text-nx-ink-2">-</span>
                )}
              </div>
            );
          },
        },
        {
          key: "groups",
          label: t("admin.groups"),
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
                  <span className="text-nx-ink-2">-</span>
                )}
              </div>
            );
          },
        },
        {
          key: "isActive",
          label: t("admin.status"),
          render: (value: boolean) => (
            <Badge variant={value ? "success" : "secondary"}>
              {value ? t("common.active") : t("common.inactive")}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("admin.createdAt"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-"),
        },
      ],
      // Spread configBase with defaults to satisfy required fields
      entityTypeKey: "identity.admin",
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
            label: tFn("common.view"),
            onClick: (item: Admin) => vmInstance.openViewModal(item),
            variant: "ghost" as const,
            icon: <Eye className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: tFn("common.edit"),
            onClick: (item: Admin) => vmInstance.openEditModal(item),
            variant: "ghost" as const,
            icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
            show: (item: Admin) =>
              !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("admin.impersonate"),
            onClick: (item: Admin) => handleImpersonate(item.id),
            variant: "ghost" as const,
            icon: <UserCheck className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_IMPERSONATE,
            show: (item: Admin) =>
              !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("admin.transfer"),
            onClick: (item: Admin) => handleOpenTransfer(item),
            variant: "ghost" as const,
            icon: <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_TRANSFER,
            show: (item: Admin) => !item.hasGuardianProtection || currentUser?.id === item.id,
          },
          // Transfer Protection: shown if the logged in user is the protected admin OR if viewing a specific tenant's admins (upper admin)
          ...(() => {
            if (!isProtectedAdmin && !tenantId) return [];
            return [
              {
                label: tFn("admin.transferProtection"),
                onClick: (item: Admin) => handleTransferProtection(item.id),
                variant: "ghost" as const,
                icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
                requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
                // Only show for admins who are NOT the protected one and are editable
                show: (item: Admin) => item.id !== currentUser?.id && item.canModify,
                confirmTitle: tFn("admin.transferProtection"),
                confirmDescription: tFn("admin.transferProtectionDesc"),
                confirmVariant: "warning" as const,
                confirmButtonText: tFn("common.confirm"),
              },
            ];
          })(),
          {
            label: tFn("admin.toggleStatus"),
            onClick: (item: Admin) => handleToggleActive(item.id, !item.isActive),
            variant: "ghost" as const,
            icon: <UserCheck className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
            // Cannot toggle status if they are protected (even upper admin shouldn't deactivate the last super admin)
            show: (item: Admin) => !item.hasGuardianProtection,
          },
          {
            label: tFn("admin.role.manageTitle"),
            onClick: (item: Admin) => handleOpenManageRoles(item),
            variant: "ghost" as const,
            icon: <Shield className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_ASSIGN_ROLES,
            show: (item: Admin) =>
              !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("admin.resetPassword"),
            onClick: (item: Admin) => handleOpenResetPassword(item),
            variant: "ghost" as const,
            className: "text-warning hover:text-warning/90",
            icon: <Settings className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_RESET_PASSWORD,
            show: (item: Admin) =>
              !item.hasGuardianProtection || currentUser?.id === item.id || !!tenantId,
          },
          {
            label: tFn("userGroups.assignToGroup"),
            onClick: (item: Admin) => handleOpenAssignToGroup(item),
            variant: "ghost" as const,
            icon: <Users className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_VIEW,
            show: (item: Admin) => !item.hasGuardianProtection || !!tenantId,
          },
          {
            label: tFn("admin.resendSetupEmail"),
            onClick: (item: Admin) => handleResendSetupEmail(item.id),
            variant: "ghost" as const,
            icon: <Mail className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
            // Only show for protected admins who haven't activated their account yet
            show: (item: Admin) => item.needsAccountSetup,
            confirmTitle: tFn("admin.resendSetupEmail"),
            confirmDescription: tFn("admin.resendSetupEmailDesc"),
            confirmVariant: "default" as const,
            confirmButtonText: tFn("common.send"),
          },
          {
            label: tFn("admin.manualSetup"),
            onClick: (item: Admin) => handleOpenManualSetup(item),
            variant: "ghost" as const,
            icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
            requiredPermission: SYSTEM_PERMISSIONS.ADMINS_RESET_PASSWORD,
            // Only for admins who haven't activated their account yet — an alternative
            // to resending the setup email.
            show: (item: Admin) => item.needsAccountSetup,
          },
          {
            label: tFn("common.delete"),
            onClick: (item: Admin) => handleDeleteFn?.(item),
            variant: "ghost" as const,
            className: "text-destructive hover:text-destructive/90",
            icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
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
          label: t("common.activate"),
          icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
          onClick: async (ids: string[]) => {
            await handleBulkActivate(ids);
          },
          variant: "outline" as const,
        },
        {
          label: t("common.deactivate"),
          icon: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
          onClick: async (ids: string[]) => {
            await handleBulkDeactivate(ids);
          },
          variant: "outline" as const,
        },
        {
          label: t("userGroups.assignToGroup"),
          icon: <Users className="h-4 w-4" aria-hidden="true" />,
          onClick: async (ids: string[]) => {
            setSelectedBulkAdminIds(ids);
            setBulkAssignToGroupDialogOpen(true);
          },
          variant: "outline" as const,
          requiredPermission: SYSTEM_PERMISSIONS.USER_GROUPS_VIEW,
        },
        {
          label: t("common.delete"),
          icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
          onClick: async (ids: string[]) => {
            await handleBulkDelete(ids);
          },
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
      handleOpenManualSetup,
      handleImpersonate,
      handleOpenTransfer,
      handleTransferProtection,
      language,
      handleBulkActivate,
      handleBulkDeactivate,
      handleBulkDelete,
    ]
  );

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

      <ManualSetupDialog
        open={manualSetupDialogOpen}
        onOpenChange={setManualSetupDialogOpen}
        admin={selectedAdminForAction}
        onManualSetup={onManualSetupSubmit}
        isLoading={isManualSettingUp}
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
