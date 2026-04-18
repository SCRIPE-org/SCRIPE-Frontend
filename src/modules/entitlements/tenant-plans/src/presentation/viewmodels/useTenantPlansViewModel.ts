/**
 * TenantPlans ViewModel — Elevated Tier 2
 * TenantId is resolved server-side from JWT context.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import type { CreateTenantPlanRequest, UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTenantPlansViewModel() {
  const { success, error: showError } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();

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

  // ── Lifecycle Mutations ──
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      await tenantPlanRepository.publish(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      success({
        title: t("entitlements.tenantPlans.published") || "Plan Published",
        description: t("entitlements.tenantPlans.publishedDesc") || "Plan is now live.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.tenantPlans.publishFailed") || "Failed to publish plan.",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await tenantPlanRepository.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      success({
        title: t("entitlements.tenantPlans.archived") || "Plan Archived",
        description: t("entitlements.tenantPlans.archivedDesc") || "Plan has been archived.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.tenantPlans.archiveFailed") || "Failed to archive plan.",
      });
    },
  });

  return {
    ...vm,
    publishPlan: publishMutation.mutate,
    archivePlan: archiveMutation.mutate,
    isPublishing: publishMutation.isPending,
    isArchiving: archiveMutation.isPending,
  };
}
