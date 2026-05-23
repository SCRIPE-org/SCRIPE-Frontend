"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useCategoriesViewModel() {
  const queryClient = useQueryClient();
  const { categoriesRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketplace", "categories"] });

  const categoriesQuery = useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: () => categoriesRepository.getAll(),
    staleTime: 10 * 60 * 1000, // categories are stable
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesRepository.delete(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.categories.deleted") || "Category deleted" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const categories = categoriesQuery.data ?? [];

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    stats: { total: categories.length, active: categories.filter((c) => c.isActive).length },
  };
}
