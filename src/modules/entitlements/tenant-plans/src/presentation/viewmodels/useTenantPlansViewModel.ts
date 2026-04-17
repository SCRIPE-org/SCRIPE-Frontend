/**
 * TenantPlans ViewModel
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import type { CreateTenantPlanRequest, UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";

export function useTenantPlansViewModel() {
  const { success } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const { t } = useI18n();
  const tenantId = useAppStore((s) => s.user?.tenantId) ?? "";

  const vm = useCrudViewModel<TenantPlan, CreateTenantPlanRequest, UpdateTenantPlanRequest>(
    ["entitlements", "tenant-plans", tenantId],
    {
      getAll: async (params) => {
        const res = await tenantPlanRepository.getAll(tenantId, {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        });
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
        const id = await tenantPlanRepository.create(tenantId, data);
        success({
          title: t("entitlements.tenantPlans.created"),
          description: t("entitlements.tenantPlans.createdDesc"),
        });
        return { id } as unknown as TenantPlan;
      },
      update: async (id, data) => {
        await tenantPlanRepository.update(id, tenantId, data);
        success({
          title: t("entitlements.tenantPlans.updated"),
          description: t("entitlements.tenantPlans.updatedDesc"),
        });
        return {} as TenantPlan;
      },
      delete: async (id) => {
        await tenantPlanRepository.delete(id, tenantId);
        success({
          title: t("entitlements.tenantPlans.deleted"),
          description: t("entitlements.tenantPlans.deletedDesc"),
        });
      },
    }
  );

  return {
    ...vm,
    tenantId,
    hasTenantContext: !!tenantId,
  };
}
