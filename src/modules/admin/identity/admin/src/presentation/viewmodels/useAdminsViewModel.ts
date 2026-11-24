/**
 * @file useAdminsViewModel.ts
 * @description State management and CRUD orchestration for the Administrator view.
 * Utilizes useCrudViewModel for standard operations, and delegates forms and mutations
 * to useAdminFieldsConfig and useAdminOperations respectively to keep code clean and modular.
 */

"use client";

import { useCallback, useMemo } from "react";
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

  // Use prop tenantId if provided (Priority 1)
  // Otherwise if useMyTenant is true, use undefined (to trigger current-tenant endpoint)
  // Otherwise use context tenantId (System Admin browsing context)
  const rawTenantId = propTenantId ?? (useMyTenant ? undefined : contextTenantId);
  const tenantId = rawTenantId ?? undefined; // Normalize null to undefined

  const { adminRepository } = identityContainer;
  const { t } = useI18n();
  const { info: toastInfo } = useEnhancedToast();

  // Build query key using the factory — memoized for reference stability
  const queryKey: string[] = useMemo(() => {
    return tenantId
      ? [...qk.admins.active(tenantId)]
      : useMyTenant
        ? [...qk.admins.all, "currentTenant"]
        : [...qk.admins.all];
  }, [tenantId, useMyTenant]);

  // ============ Core CRUD ViewModel (React Query Engine) ============
  // deferSuccessEffects: true -- this screen sets entityTypeKey (see
  // getConfigBase below), so GenericCrudView also saves custom-field values
  // after the admin itself is created/updated. Without this option,
  // useCrudViewModel's onCreateSuccess/onUpdateSuccess fired the toast and
  // closed the modal the instant createItem's own promise resolved -- before
  // the custom-field save even started -- and a subsequent save failure had
  // nowhere left to surface (design doc W0-1). Same pattern as
  // useUsersViewModel/useWorkItemViewModel/useUserSubscriptionsViewModel.
  const vm = useCrudViewModel<Admin, CreateAdminRequest, UpdateAdminRequest>(
    queryKey,
    {
      getAll: async (params) => {
        let res;
        if (tenantId) {
          res = await adminRepository.getByTenantId(tenantId, {
            page: params.page,
            pageSize: params.pageSize,
            search: params.search,
          });
        } else if (useMyTenant) {
          res = await adminRepository.getCurrentTenantAdmins({
            page: params.page,
            pageSize: params.pageSize,
            search: params.search,
          });
        } else {
          res = await adminRepository.getAll({
            page: params.page,
            pageSize: params.pageSize,
            search: params.search,
          });
        }
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
          let id: string;
          if (tenantId) {
            id = await adminRepository.create({ ...data, tenantId });
          } else if (useMyTenant) {
            id = await adminRepository.createInCurrentTenant(data);
          } else {
            id = await adminRepository.create(data);
          }
          // No manual success() here on purpose -- deferSuccessEffects (above)
          // holds the toast until GenericCrudView confirms the custom-field
          // save (if any) also succeeded; firing it here unconditionally would
          // defeat that (same reasoning as useUsersViewModel's update).
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
