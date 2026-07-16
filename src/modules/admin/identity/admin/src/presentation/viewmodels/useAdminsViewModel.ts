/**
 * @file useAdminsViewModel.ts
 * @description State management and CRUD orchestration for the Administrator view.
 * Utilizes useCrudViewModel for standard operations, and delegates forms and mutations
 * to useAdminFieldsConfig and useAdminOperations respectively to keep code clean and modular.
 */

"use client";

import { useCallback } from "react";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { Admin } from "../../domain/entities/Admin";
import type { CreateAdminRequest, UpdateAdminRequest } from "../../domain/entities/AdminRequests";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
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
  /** If true, uses /myTenantAdmins endpoint */
  useMyTenant?: boolean;
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
  const { tenantId: propTenantId, useMyTenant } = options;
  const contextTenantId = useCurrentTenantId();

  // Use prop tenantId if provided (Priority 1)
  // Otherwise if useMyTenant is true, use undefined (to trigger myTenant endpoint)
  // Otherwise use context tenantId (System Admin browsing context)
  const rawTenantId = propTenantId ?? (useMyTenant ? undefined : contextTenantId);
  const tenantId = rawTenantId ?? undefined; // Normalize null to undefined

  const { adminRepository } = identityContainer;
  const { t } = useI18n();
  const { success } = useEnhancedToast();

  // Build query key using the factory — consistent with invalidation
  const queryKey: string[] = tenantId
    ? [...qk.admins.active(tenantId)]
    : useMyTenant
      ? [...qk.admins.all, "myTenant"]
      : [...qk.admins.all];

  // ============ Core CRUD ViewModel (React Query Engine) ============
  const vm = useCrudViewModel<Admin, CreateAdminRequest, UpdateAdminRequest>(queryKey, {
    getAll: async (params) => {
      let res;
      if (tenantId) {
        res = await adminRepository.getByTenantId(tenantId, {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        });
      } else if (useMyTenant) {
        res = await adminRepository.getMyTenantAdmins({
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
      if (tenantId) {
        await adminRepository.create({ ...data, tenantId });
      } else if (useMyTenant) {
        await adminRepository.createForMyTenant(data);
      } else {
        await adminRepository.create(data);
      }
      success({
        title: t("admin.created") || "Admin Created",
        description: t("admin.createdDesc") || "Administrator created successfully.",
      });
      return {} as Admin;
    },
    update: async (id, data) => {
      await adminRepository.update(id, data);
      success({
        title: t("admin.updated") || "Admin Updated",
        description: t("admin.updatedDesc") || "Administrator updated successfully.",
      });
      return {} as Admin;
    },
    delete: async (id) => {
      await adminRepository.delete(id);
      success({
        title: t("admin.deleted") || "Admin Deleted",
        description: t("admin.deletedDesc") || "Administrator deleted successfully.",
      });
    },
  });

  // ============ Admin Operations & Custom Mutations ============
  const operations = useAdminOperations({
    tenantId,
    contextTenantId: contextTenantId ?? undefined,
    useMyTenant,
    queryKey,
    refreshItems: vm.refreshItems,
  });

  // ============ Config Fields & Values ============
  const fieldsConfig = useAdminFieldsConfig(
    t,
    operations.handleRoleSearch,
    operations.handleGroupSearch
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
    ...operations,
  };
}
