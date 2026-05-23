"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useReviewsViewModel() {
  const queryClient = useQueryClient();
  const { reviewsRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketplace", "reviews"] });

  const reviewsQuery = useQuery({
    queryKey: ["marketplace", "reviews", page],
    queryFn: () => reviewsRepository.getAll({ page, pageSize: 20 }),
  });

  const moderateMutation = useMutation({
    mutationFn: (id: string) => reviewsRepository.delete(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.reviews.moderated") || "Review removed" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const data = reviewsQuery.data;
  return {
    reviews: data?.items ?? [],
    pagination: { page, pageSize: 20, totalCount: data?.totalCount ?? 0, totalPages: data?.totalPages ?? 1 },
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error,
    setPage,
    moderate: moderateMutation.mutate,
    isModerating: moderateMutation.isPending,
  };
}
