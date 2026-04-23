/**
 * TenantPlan Detail ViewModel — Elevated Tier 2
 *
 * Fetches a single plan by ID with its features, prices, and versions.
 * Provides lifecycle mutations (publish/archive) and sub-entity CRUD.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { TenantPlan, TenantFeatureDefinition } from "../../domain/entities/TenantPlan";
import type { UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useTenantPlanDetailViewModel(planId: string) {
  const { success, error: showError } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const queryKey = ["entitlements", "tenant-plans", planId];

  // ── Fetch Plan Detail ──
  const {
    data: plan,
    isLoading,
    error,
    refetch,
  } = useQuery<TenantPlan>({
    queryKey,
    queryFn: () => tenantPlanRepository.getById(planId),
    enabled: !!planId,
  });

  // ── Fetch Feature Catalog (for the features tab dropdown) ──
  const { data: featureCatalog = [] } = useQuery<TenantFeatureDefinition[]>({
    queryKey: ["entitlements", "feature-definitions", "active"],
    queryFn: () => tenantPlanRepository.getActiveFeatureDefinitions(),
    staleTime: 5 * 60 * 1000,
  });

  // ── Lifecycle Mutations ──
  const publishMutation = useMutation({
    mutationFn: (changeNotes?: string) => tenantPlanRepository.publish(planId, changeNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
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
    mutationFn: () => tenantPlanRepository.archive(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
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

  // ── Update Plan (typed — no `any`) ──
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTenantPlanRequest) =>
      tenantPlanRepository.update(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({
        title: t("entitlements.tenantPlans.updated") || "Plan Updated",
        description: t("entitlements.tenantPlans.updatedDesc") || "Plan details updated.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("common.updateFailed") || "Failed to update.",
      });
    },
  });

  return {
    plan,
    isLoading,
    error,
    refetch,
    featureCatalog,
    publishPlan: publishMutation.mutate,
    archivePlan: archiveMutation.mutate,
    updatePlan: updateMutation.mutate,
    isPublishing: publishMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
