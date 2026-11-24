/**
 * @file useAdminsViewModel.ts
 * @description State management and CRUD orchestration for the Administrator view.
 * Utilizes useCrudViewModel for standard operations, and delegates forms and mutations
 * to useAdminFieldsConfig and useAdminOperations respectively to keep code clean and modular.
 */

"use client";

import { useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { Admin } from "../../domain/entities/Admin";
import type { CreateAdminRequest, UpdateAdminRequest } from "../../domain/entities/AdminRequests";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { isSudoCancelledError } from "@core/store/useSudoStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { qk } from "@core/common/query-keys";
import { useAdminFieldsConfig } from "./useAdminFieldsConfig";
import { useAdminOperations } from "./useAdminOperations";

/**
 * Hook options for the Admins ViewModel.
 */
interface AdminsViewModelOptions {
  /** Optional tenant ID to filter admins for a specific tenant */
  tenantId?: string;
  /** If true, uses /admins/current-tenant endpoint */
  useMyTenant?: boolean;
  /** Optional target admin tenant ID for scoped reset/setup password policy resolution */
  actionTenantId?: string | null;
}

/**
 * Custom React hook for the Admins ViewModel.
 * Orchestrates querying, creation, updating, deletion, impersonation,
 * and permission assignment for administrators in system and tenant-scoped contexts.
 *
 * @param options Configuration options specifying tenant filters or scope.
 * @returns State properties, mutation handles, and dialog configurations.
 */
export function useAdminsViewModel(options: AdminsViewModelOptions = {}) {
  const { tenantId: propTenantId, useMyTenant, actionTenantId } = options;
  const contextTenantId = useCurrentTenantId();

  // Priority: propTenantId -> useMyTenant (undefined triggers current-tenant) -> contextTenantId
  const rawTenantId = propTenantId ?? (useMyTenant ? undefined : contextTenantId);
  const tenantId = rawTenantId ?? undefined;

  const { adminRepository } = identityContainer;
  const { t } = useI18n();
  const { success: toastSuccess, info: toastInfo } = useEnhancedToast();
  const lastCreatedFeedbackRef = useRef<{ sendSetupEmail: boolean; email?: string } | null>(null);

  const queryKey: string[] = useMemo(() => {
    return tenantId
      ? [...qk.admins.active(tenantId)]
      : useMyTenant
        ? [...qk.admins.all, "currentTenant"]
        : [...qk.admins.all];
  }, [tenantId, useMyTenant]);

  // deferSuccessEffects holds toast/close until GenericCrudView finishes custom-field save (W0-1)
  const baseVm = useCrudViewModel<Admin, CreateAdminRequest, UpdateAdminRequest>(
    queryKey,
    {
      getAll: async (params) => {
        const listParams = { page: params.page, pageSize: params.pageSize, search: params.search };
        const res = tenantId
          ? await adminRepository.getByTenantId(tenantId, listParams)
          : useMyTenant
            ? await adminRepository.getCurrentTenantAdmins(listParams)
            : await adminRepository.getAll(listParams);
        return {
          items: res.items || [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: res.totalPages,
          },
        };
      },
      create: async (data) => {
        try {
          const id = tenantId
            ? await adminRepository.create({ ...data, tenantId })
            : useMyTenant
              ? await adminRepository.createInCurrentTenant(data)
              : await adminRepository.create(data);
          lastCreatedFeedbackRef.current = {
            sendSetupEmail: data.sendSetupEmail !== false,
            email: data.email?.trim() || undefined,
          };
          return { id } as unknown as Admin;
        } catch (err) {
          if (isSudoCancelledError(err)) {
            toastInfo?.({
              title: t("profile.sudo.cancelledTitle"),
              description: t("profile.sudo.cancelledDescription"),
            });
          }
          throw err;
        }
      },
      update: async (id, data) => {
        try {
          await adminRepository.update(id, data);
          return { id } as unknown as Admin;
        } catch (err) {
          if (isSudoCancelledError(err)) {
            toastInfo?.({
              title: t("profile.sudo.cancelledTitle"),
              description: t("profile.sudo.cancelledDescription"),
            });
          }
          throw err;
        }
      },
      delete: async (id) => {
        try {
          await adminRepository.delete(id);
          // useCrudViewModel/useGenericMutations handles the single localized delete toast.
        } catch (err) {
          if (isSudoCancelledError(err)) {
            toastInfo?.({
              title: t("profile.sudo.cancelledTitle"),
              description: t("profile.sudo.cancelledDescription"),
            });
          }
          throw err;
        }
      },
    },
    { deferSuccessEffects: true }
  );

  const confirmCreateSuccess = useCallback(() => {
    baseVm.setIsCreateModalOpen(false);
    const feedback = lastCreatedFeedbackRef.current;
    lastCreatedFeedbackRef.current = null;
    if (feedback?.sendSetupEmail) {
      toastSuccess({
        title: t("admin.created"),
        description: feedback.email
          ? t("admin.createdSetupEmailSentDesc", { email: feedback.email })
          : t("admin.createdDesc"),
      });
      return;
    }
    toastSuccess({
      title: t("admin.created"),
      description: t("admin.createdManualSetupDesc"),
    });
  }, [baseVm, toastSuccess, t]);

  const vm = useMemo(
    () => ({
      ...baseVm,
      confirmCreateSuccess,
    }),
    [baseVm, confirmCreateSuccess]
  );

  // ============ Admin Operations & Custom Mutations ============
  const operations = useAdminOperations({
    tenantId,
    contextTenantId: contextTenantId ?? undefined,
    useMyTenant,
    queryKey,
    refreshItems: vm.refreshItems,
  });

  // ============ Effective Password Policy ============
  const {
    data: passwordPolicy = null,
    isLoading: isPasswordPolicyLoading,
    isError: isPasswordPolicyError,
    refetch: refetchPasswordPolicy,
  } = useQuery({
    queryKey: ["admins", "password-policy", tenantId ?? (useMyTenant ? "current" : "system")],
    queryFn: () => adminRepository.getPasswordPolicy(tenantId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const passwordPolicyError = isPasswordPolicyError
    ? t("common.passwordPolicy.loadFailed")
    : null;
  const retryPasswordPolicy = useCallback(() => {
    void refetchPasswordPolicy();
  }, [refetchPasswordPolicy]);

  const resolvedActionTenantId = actionTenantId ?? tenantId;
  const needsDistinctActionPolicy = Boolean(
    resolvedActionTenantId && resolvedActionTenantId !== tenantId
  );

  const {
    data: distinctActionPolicy = null,
    isLoading: isDistinctActionPolicyLoading,
    isError: isDistinctActionPolicyError,
    refetch: refetchDistinctActionPolicy,
  } = useQuery({
    queryKey: ["admins", "password-policy", resolvedActionTenantId ?? "system"],
    queryFn: () => adminRepository.getPasswordPolicy(resolvedActionTenantId),
    enabled: needsDistinctActionPolicy,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const dialogPasswordPolicy = needsDistinctActionPolicy ? distinctActionPolicy : passwordPolicy;
  const isDialogPasswordPolicyLoading = needsDistinctActionPolicy
    ? isDistinctActionPolicyLoading
    : isPasswordPolicyLoading;
  const dialogPasswordPolicyError = needsDistinctActionPolicy
    ? isDistinctActionPolicyError
      ? t("common.passwordPolicy.loadFailed")
      : null
    : passwordPolicyError;
  const retryDialogPasswordPolicy = useCallback(() => {
    if (needsDistinctActionPolicy) {
      void refetchDistinctActionPolicy();
      return;
    }
    void refetchPasswordPolicy();
  }, [needsDistinctActionPolicy, refetchDistinctActionPolicy, refetchPasswordPolicy]);

  // ============ Config Fields & Values ============
  const fieldsConfig = useAdminFieldsConfig(
    t,
    operations.handleRoleSearch,
    operations.handleGroupSearch,
    {
      passwordPolicy,
      isLoading: isPasswordPolicyLoading,
      error: passwordPolicyError,
      onRetry: retryPasswordPolicy,
    }
  );

  // ============ Config Base ============
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<Admin>> => ({
      createFields: fieldsConfig.createFields,
      editFields: fieldsConfig.editFields,
      createInitialValues: fieldsConfig.createInitialValues,
      editInitialValues: fieldsConfig.editInitialValues,
      getItemDisplayName: (admin: Admin) => admin.displayName || admin.username,
      enableBulkActions: false,
      deleteService: async (id: string) => {
        await adminRepository.delete(id);
      },
      permissions: {
        canCreate: SYSTEM_PERMISSIONS.ADMINS_CREATE,
        canUpdate: SYSTEM_PERMISSIONS.ADMINS_UPDATE,
        canDelete: SYSTEM_PERMISSIONS.ADMINS_DELETE,
      },
    }),
    [fieldsConfig, adminRepository]
  );

  return {
    vm,
    getConfigBase,
    passwordPolicy,
    isPasswordPolicyLoading,
    passwordPolicyError,
    retryPasswordPolicy,
    dialogPasswordPolicy,
    isDialogPasswordPolicyLoading,
    dialogPasswordPolicyError,
    retryDialogPasswordPolicy,
    ...operations,
  };
}
