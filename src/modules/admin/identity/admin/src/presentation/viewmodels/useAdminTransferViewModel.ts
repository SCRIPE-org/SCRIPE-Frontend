"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";
import { appLogger } from "@/core/common/logger";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { resolveBilingualLabel } from "@core/common/utils";

const SYSTEM_TENANT_VALUE = "__SYSTEM__";

/**
 * React hook/ViewModel orchestrating state and data flows for admin transfer view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useAdminTransferViewModel() {
  const { t, language } = useI18n();

  const handleTenantSearch = async (query: string): Promise<GenericSelectOption[]> => {
    try {
      const result = await identityContainer.tenantRepository.getCurrentTenantHierarchy(query);
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
      if (!hasTenantSelected) return [];

      const result = isSystemTenantSelected
        ? await identityContainer.roleRepository.getAll({
            search: query,
            page: 1,
            pageSize: 20,
            strict: true,
          })
        : targetTenantId
          ? await identityContainer.roleRepository.getAll({
              search: query,
              page: 1,
              pageSize: 20,
              tenantId: targetTenantId,
              strict: true,
            })
          : await identityContainer.roleRepository.getCurrentTenantRoles({
              search: query,
              page: 1,
              pageSize: 20,
            });

      return result.items.map((role) => ({
        value: role.id,
        label: resolveBilingualLabel(role.nameEn, role.nameAr, language),
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
