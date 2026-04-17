/**
 * TenantPlans ViewModel
 * TenantId is resolved server-side from JWT context.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import type { CreateTenantPlanRequest, UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useTenantPlansViewModel() {
  const { success } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const { t } = useI18n();

  const vm = useCrudViewModel<TenantPlan, CreateTenantPlanRequest, UpdateTenantPlanRequest>(
    ["entitlements", "tenant-plans"],
    {
      getAll: async (params) => {
        const res = await tenantPlanRepository.getAll({
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
        const id = await tenantPlanRepository.create(data);
        success({
          title: t("entitlements.tenantPlans.created"),
          description: t("entitlements.tenantPlans.createdDesc"),
        });
        return { id } as unknown as TenantPlan;
      },
      update: async (id, data) => {
        await tenantPlanRepository.update(id, data);
        success({
          title: t("entitlements.tenantPlans.updated"),
          description: t("entitlements.tenantPlans.updatedDesc"),
        });
        return {} as TenantPlan;
      },
      delete: async (id) => {
        await tenantPlanRepository.delete(id);
        success({
          title: t("entitlements.tenantPlans.deleted"),
          description: t("entitlements.tenantPlans.deletedDesc"),
        });
      },
    }
  );

  return {
    ...vm,
  };
}
