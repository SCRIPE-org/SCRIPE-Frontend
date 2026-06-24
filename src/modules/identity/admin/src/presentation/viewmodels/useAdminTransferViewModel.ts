"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";
import { appLogger } from "@/core/common/logger";
import { SYSTEM_TENANT_ID } from "@modules/identity/core";
import type { GenericSelectOption } from "@core/crud/components/generic-select";

const SYSTEM_TENANT_VALUE = SYSTEM_TENANT_ID;

/**
 * React hook/ViewModel managing logic, state, and repository queries for admin transfer view model.
 */
export function useAdminTransferViewModel() {
  const { t, language } = useI18n();

  const handleTenantSearch = async (query: string): Promise<GenericSelectOption[]> => {
    try {
      const result = await identityContainer.tenantRepository.getMyTenantAndChildren(query);
      return result.map((tenant) => ({
        value: tenant.id ?? SYSTEM_TENANT_VALUE,
        label: `${tenant.name} (${tenant.code})`,
      }));
    } catch (e) {
      appLogger.error("[AdminTransferDialog] Tenant search failed:", e);
      return [];
    }
  };

  const handleRoleSearch = async (
    query: string,
    targetTenantId: string,
    isSystemTenantSelected: boolean,
    hasTenantSelected: boolean
  ): Promise<GenericSelectOption[]> => {
    try {
      const searchTenantId = isSystemTenantSelected ? undefined : targetTenantId;
      if (!hasTenantSelected) return [];

      const result = searchTenantId
        ? await identityContainer.roleRepository.getAll({
            search: query,
            page: 1,
            pageSize: 20,
            tenantId: searchTenantId,
            strict: true,
          })
        : await identityContainer.roleRepository.getMyTenantRoles({
            search: query,
            page: 1,
            pageSize: 20,
          });

      return result.items.map((role) => ({
        value: role.id,
        label: language === "ar" ? role.nameAr : role.nameEn,
      }));
    } catch (e) {
      appLogger.error("[AdminTransferDialog] Role search failed:", e);
      return [];
    }
  };

  return {
    t,
    handleTenantSearch,
    handleRoleSearch,
  };
}
