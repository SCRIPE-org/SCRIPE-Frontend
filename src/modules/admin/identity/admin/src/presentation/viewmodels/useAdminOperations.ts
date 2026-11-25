/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE-EXCEPTION: file length
/**
 * @file useAdminOperations.ts
 * @description Custom React hook managing operations, mutations, and search logic for the Admins feature.
 * Extracted from useAdminsViewModel to comply with the 300-line warning threshold.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermission } from "@core/hooks/use-permission";
import { useOptionalNavigation } from "@core/providers/navigation-provider";
import { syncCurrentSessionAuthorization } from "@core/hooks/use-authorization-sync";
import { SYSTEM_PERMISSIONS, isPlatformSuperAdminUser } from "@core/common/types/permissions";
import { useAppStore } from "@core/store/useAppStore";
import { isSudoCancelledError } from "@core/store/useSudoStore";
import { identityContainer } from "@modules/identity/di";
import { qk } from "@core/common/query-keys";
import { useCoreImpersonation } from "@core/hooks/use-auth-bridge";
import type { FieldOption } from "@core/ui/forms/generic-form";
import type { AssignRoleRequest, TransferAdminRequest } from "../../domain/entities/AdminRequests";
import type { Admin } from "../../domain/entities/Admin";
import { resolveBilingualLabel } from "@core/common/utils";

/**
 * Parameters for the useAdminOperations hook.
 */
interface AdminOperationsParams {
  tenantId?: string;
  contextTenantId?: string;
  useMyTenant?: boolean;
  queryKey: string[];
  refreshItems: () => Promise<void>;
}

/**
 * Custom hook encapsulating mutations (create, update, toggle active, reset password, impersonate, transfer)
 * and search helpers for roles and groups.
 *
 * @param params Operational parameters including tenant context and data query key.
 * @returns Mutations, handlers, and search callbacks.
 */
export function useAdminOperations(params: AdminOperationsParams) {
  const { tenantId, contextTenantId, useMyTenant, queryKey, refreshItems } = params;

  const { adminRepository, roleRepository, userGroupRepository } = identityContainer;
  const { t, language } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError, info: toastInfo } = useEnhancedToast();
  const { authRepository } = useServices();
  const nav = useOptionalNavigation();
  const user = useAppStore((state) => state.user);
  const userTenantId = user?.tenantId ?? null;
  const isPlatformSuperAdmin = isPlatformSuperAdminUser(user);
  const canViewTenants = usePermission(SYSTEM_PERMISSIONS.TENANTS_VIEW);
  const targetTenantId = tenantId ?? contextTenantId ?? null;

  const handleMutationError = useCallback(
    (err: Error) => {
      if (isSudoCancelledError(err)) {
        toastInfo?.({
          title: t("profile.sudo.cancelledTitle"),
          description: t("profile.sudo.cancelledDescription"),
        });
        return;
      }
      toastError({ title: t("common.error"), description: err.message });
    },
    [toastInfo, toastError, t]
  );

  const syncSessionSafely = useCallback(
    async (forcePrincipalFetch = false) => {
      try {
        await syncCurrentSessionAuthorization({
          queryClient,
          authRepository,
          refreshNavigation: nav?.refreshNavigation,
          targetTenantId,
          ...(forcePrincipalFetch ? { forcePrincipalFetch: true } : {}),
        });
      } catch {
        // Non-fatal: admin operation succeeded even if background session refresh fails
      }
    },
    [queryClient, authRepository, nav, targetTenantId]
  );

  // Toggle active status mutation — optimistic update
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminRepository.setActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: qk.admins.all });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { items?: Array<{ id: string; isActive: boolean }> };
        if (!data.items) return old;
        return {
          ...data,
          items: data.items.map((item) => (item.id === id ? { ...item, isActive } : item)),
        };
      });
      return { previous };
    },
    onError: (err: Error, __, context?: { previous: unknown }) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      handleMutationError(err);
    },
    onSuccess: (_, { isActive }) => {
      success({
        title: isActive ? t("admin.activated") : t("admin.deactivated"),
        description: isActive ? t("admin.activatedDesc") : t("admin.deactivatedDesc"),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ adminId, request }: { adminId: string; request: AssignRoleRequest }) =>
      adminRepository.assignRole(adminId, request),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      await syncSessionSafely();
      success({
        title: t("admin.role.assigned"),
        description: t("admin.role.assignedDesc"),
      });
    },
    onError: handleMutationError,
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: ({
      adminId,
      roleId,
      tenantId: rTenantId,
    }: {
      adminId: string;
      roleId: string;
      tenantId?: string;
    }) => adminRepository.removeRole(adminId, roleId, rTenantId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      await syncSessionSafely();
      success({
        title: t("admin.role.removed"),
        description: t("admin.role.removedDesc"),
      });
    },
    onError: handleMutationError,
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ adminId, newPassword }: { adminId: string; newPassword: string }) =>
      adminRepository.resetPassword(adminId, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      success({
        title: t("admin.passwordReset"),
        description: t("admin.passwordResetDesc"),
      });
    },
    onError: handleMutationError,
  });

  // Manual account setup mutation — sets a password directly for an email-invited admin
  // who hasn't activated yet, as an alternative to resending the setup email.
  const manualSetupMutation = useMutation({
    mutationFn: ({
      adminId,
      newPassword,
      confirmPassword,
      mustChangePassword,
    }: {
      adminId: string;
      newPassword: string;
      confirmPassword: string;
      mustChangePassword: boolean;
    }) => adminRepository.manualSetup(adminId, newPassword, confirmPassword, mustChangePassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      success({
        title: t("admin.manualSetupSuccess"),
        description: t("admin.manualSetupSuccessDesc"),
      });
    },
    onError: handleMutationError,
  });

  // Impersonation — resolved through the core auth bridge. The previous registry lookup fell back
  // to `startImpersonation: () => {}` whenever the `@modules/auth` barrel had not been imported,
  // which silently turned the "impersonate" action into a no-op button.
  const { startImpersonation, isImpersonationLoading } = useCoreImpersonation();

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: TransferAdminRequest }) =>
      adminRepository.transfer(id, request),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      await syncSessionSafely();
      success({
        title: t("admin.transferred"),
        description: t("admin.transferredDesc"),
      });
    },
    onError: handleMutationError,
  });

  // Transfer Protection mutation
  const transferProtectionMutation = useMutation({
    mutationFn: ({ targetAdminId }: { targetAdminId: string }) =>
      adminRepository.transferProtection({ targetAdminId }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      await syncSessionSafely(true);
      success({
        title: t("admin.protectionTransferred"),
        description: t("admin.protectionTransferredDesc"),
      });
    },
    onError: handleMutationError,
  });

  // Resend Setup Email mutation
  const resendSetupEmailMutation = useMutation({
    mutationFn: ({ adminId }: { adminId: string }) => adminRepository.resendSetupEmail(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      success({
        title: t("admin.setupEmailResent"),
        description: t("admin.setupEmailResentDesc"),
      });
    },
    onError: (err: Error) => {
      if (isSudoCancelledError(err)) {
        toastInfo?.({
          title: t("profile.sudo.cancelledTitle"),
          description: t("profile.sudo.cancelledDescription"),
        });
        return;
      }
      const typedErr = err as Error & { code?: string; status?: number; statusCode?: number };
      const errCode = (typedErr.code ?? "").toUpperCase();
      const errStatus = typedErr.status ?? typedErr.statusCode;
      const isCooldownOrRateLimit =
        errCode === "RATE_LIMIT_EXCEEDED" ||
        errStatus === 429 ||
        /wait\s+\d+\s+seconds|maximum resend limit|cooldown|rate[\s_-]?limit/i.test(err.message);
      if (isCooldownOrRateLimit) {
        toastError({
          title: t("admin.setupEmailCooldownTitle"),
          description: err.message,
        });
        return;
      }
      const isDeliveryFailure =
        errCode === "SERVICE_UNAVAILABLE" ||
        errStatus === 503 ||
        /delivery|dispatch|unavailable|smtp|email.*fail/i.test(err.message);
      toastError({
        title: isDeliveryFailure ? t("admin.setupEmailFailedTitle") : t("common.error"),
        description: err.message,
      });
    },
  });

  // Bulk mutations
  const bulkActivateMutation = useMutation({
    mutationFn: (ids: string[]) => adminRepository.bulkActivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      success({
        title: t("admin.bulk.activated"),
        description: t("admin.bulk.activatedDesc", { count }),
      });
    },
    onError: handleMutationError,
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: (ids: string[]) => adminRepository.bulkDeactivate(ids),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      success({
        title: t("admin.bulk.deactivated"),
        description: t("admin.bulk.deactivatedDesc", { count }),
      });
    },
    onError: handleMutationError,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => adminRepository.bulkDelete(ids),
    onSuccess: async (count) => {
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      await syncSessionSafely();
      success({
        title: t("admin.bulk.deleted"),
        description: t("admin.bulk.deletedDesc", { count }),
      });
    },
    onError: handleMutationError,
  });

  // Handlers
  const handleDelete = useCallback(
    async (admin: Admin) => {
      await adminRepository.delete(admin.id);
      queryClient.invalidateQueries({ queryKey: qk.admins.all });
      await syncSessionSafely();
      await refreshItems();
    },
    [adminRepository, queryClient, syncSessionSafely, refreshItems]
  );

  const handleToggleActive = useCallback(
    (id: string, isActive: boolean) => toggleActiveMutation.mutateAsync({ id, isActive }),
    [toggleActiveMutation]
  );

  const handleAssignRole = useCallback(
    (adminId: string, request: AssignRoleRequest) =>
      assignRoleMutation.mutateAsync({ adminId, request }),
    [assignRoleMutation]
  );

  const handleRemoveRole = useCallback(
    (adminId: string, roleId: string, rTenantId?: string) =>
      removeRoleMutation.mutateAsync({ adminId, roleId, tenantId: rTenantId }),
    [removeRoleMutation]
  );

  const handleResetPassword = useCallback(
    (adminId: string, newPassword: string) =>
      resetPasswordMutation.mutateAsync({ adminId, newPassword }),
    [resetPasswordMutation]
  );

  const handleRoleSearch = useCallback(
    async (query: string): Promise<FieldOption[]> => {
      try {
        const roleSearchTenantId = tenantId ?? contextTenantId ?? undefined;
        const isExplicitTenant = !!tenantId;
        const useCrossTenant = Boolean(
          roleSearchTenantId &&
            (isPlatformSuperAdmin || (roleSearchTenantId !== userTenantId && canViewTenants))
        );
        const useCurrentTenant =
          (useMyTenant && !isExplicitTenant) ||
          (!useCrossTenant && (!roleSearchTenantId || roleSearchTenantId === userTenantId));

        const result = useCurrentTenant
          ? await roleRepository.getCurrentTenantRoles({ search: query, page: 1, pageSize: 20 })
          : await roleRepository.getAll({
              search: query,
              page: 1,
              pageSize: 20,
              tenantId: roleSearchTenantId,
              strict: true,
            });

        const sorted = [...(result.items || [])].sort(
          (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
        );
        return sorted.map((role) => ({
          value: role.id,
          label: resolveBilingualLabel(role.nameEn, role.nameAr, language),
        }));
      } catch {
        return [];
      }
    },
    [
      roleRepository,
      tenantId,
      contextTenantId,
      language,
      useMyTenant,
      isPlatformSuperAdmin,
      userTenantId,
      canViewTenants,
    ]
  );

  const handleGroupSearch = useCallback(
    async (query: string): Promise<FieldOption[]> => {
      try {
        const groupSearchTenantId = tenantId ?? contextTenantId ?? undefined;
        const isExplicitTenant = !!tenantId;
        const useCrossTenant = Boolean(
          groupSearchTenantId &&
            (isPlatformSuperAdmin || (groupSearchTenantId !== userTenantId && canViewTenants))
        );
        const useCurrentTenant =
          (useMyTenant && !isExplicitTenant) ||
          (!useCrossTenant && (!groupSearchTenantId || groupSearchTenantId === userTenantId));

        const result = useCurrentTenant
          ? await userGroupRepository.getCurrentTenantGroups({
              search: query,
              page: 1,
              pageSize: 20,
            })
          : await userGroupRepository.getAll({
              search: query,
              page: 1,
              pageSize: 20,
              tenantId: groupSearchTenantId,
            });

        return (result.items || []).map((g) => ({
          value: g.id,
          label: resolveBilingualLabel(g.nameEn, g.nameAr, language),
        }));
      } catch {
        return [];
      }
    },
    [
      userGroupRepository,
      useMyTenant,
      tenantId,
      contextTenantId,
      language,
      isPlatformSuperAdmin,
      userTenantId,
      canViewTenants,
    ]
  );

  return {
    handleDelete,
    handleToggleActive,
    handleAssignRole,
    handleRemoveRole,
    handleResetPassword,
    handleImpersonate: (id: string) => startImpersonation(id),
    handleTransfer: (id: string, request: TransferAdminRequest) =>
      transferMutation.mutateAsync({ id, request }),
    handleTransferProtection: (targetAdminId: string) =>
      transferProtectionMutation.mutateAsync({ targetAdminId }),
    handleResendSetupEmail: (adminId: string) => resendSetupEmailMutation.mutateAsync({ adminId }),
    handleManualSetup: (
      adminId: string,
      newPassword: string,
      confirmPassword: string,
      mustChangePassword: boolean
    ) =>
      manualSetupMutation.mutateAsync({
        adminId,
        newPassword,
        confirmPassword,
        mustChangePassword,
      }),
    handleBulkActivate: (ids: string[]) => bulkActivateMutation.mutateAsync(ids),
    handleBulkDeactivate: (ids: string[]) => bulkDeactivateMutation.mutateAsync(ids),
    handleBulkDelete: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),

    isTogglingActive: toggleActiveMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isImpersonating: isImpersonationLoading,
    isTransferring: transferMutation.isPending,
    isTransferringProtection: transferProtectionMutation.isPending,
    isResendingSetupEmail: resendSetupEmailMutation.isPending,
    isManualSettingUp: manualSetupMutation.isPending,
    handleRoleSearch,
    handleGroupSearch,
    t,
  };
}
