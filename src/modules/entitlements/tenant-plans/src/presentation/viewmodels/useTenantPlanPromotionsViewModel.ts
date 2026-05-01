/**
 * useTenantPlanPromotionsViewModel — Elevated Tier 2
 *
 * Full CRUD ViewModel for plan-scoped promotions.
 * Mirrors the Editions pattern for clean tab integration.
 */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { TenantPlanPromotion } from "../../domain/entities/TenantPlan";
import type {
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../../domain/entities/TenantPlanRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useTenantPlanPromotionsViewModel(planId: string) {
  const { success, error: showError } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState<TenantPlanPromotion | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const queryKey = ["entitlements", "tenant-plan-promotions", planId, page, pageSize, search];

  // ── List ──
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      tenantPlanRepository.getPromotions({ page, pageSize, search: search || undefined, planId }),
    staleTime: 30_000,
  });

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: (req: CreatePromotionRequest) => tenantPlanRepository.createPromotion(req),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "tenant-plan-promotions", planId],
      });
      setIsCreateOpen(false);
      success({
        title: t("common.created") || "Promotion Created",
        description:
          t("entitlements.promotions.createSuccess") || "Promotion code has been created.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.promotions.createFailed") || "Failed to create promotion.",
      });
    },
  });

  // ── Update ──
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionRequest }) =>
      tenantPlanRepository.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "tenant-plan-promotions", planId],
      });
      setIsEditOpen(false);
      setSelectedPromotion(null);
      success({
        title: t("common.updated") || "Promotion Updated",
        description: t("entitlements.promotions.updateSuccess") || "Promotion has been updated.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.promotions.updateFailed") || "Failed to update promotion.",
      });
    },
  });

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantPlanRepository.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "tenant-plan-promotions", planId],
      });
      success({
        title: t("common.deleted") || "Promotion Deleted",
        description: t("entitlements.promotions.deleteSuccess") || "Promotion has been removed.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.promotions.deleteFailed") || "Failed to delete promotion.",
      });
    },
  });

  const openEdit = (promo: TenantPlanPromotion) => {
    setSelectedPromotion(promo);
    setIsEditOpen(true);
  };

  return {
    // Data
    promotions: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,

    // Pagination / search
    page,
    pageSize,
    totalPages: data?.totalPages ?? 1,
    setPage,
    search,
    setSearch,

    // Dialog state
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    selectedPromotion,
    setSelectedPromotion,
    openEdit,

    // Actions
    createPromotion: createMutation.mutate,
    updatePromotion: updateMutation.mutate,
    deletePromotion: deleteMutation.mutate,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
