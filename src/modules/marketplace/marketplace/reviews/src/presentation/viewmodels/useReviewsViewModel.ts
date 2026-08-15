"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "@modules/marketplace/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * React hook/ViewModel orchestrating state and data flows for reviews view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useReviewsViewModel() {
  const queryClient = useQueryClient();
  const { reviewsRepository, appListingsRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [appListingId, setAppListingId] = useState<string>("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketplace", "reviews"] });

  // Reviews are scoped to a single app listing (backend requires it —
  // GetAppReviewsQuery has no "all listings" mode). The app-listings list
  // below feeds the listing-picker so admins can select which app's reviews
  // to moderate; without a selection the query stays disabled (mirrors the
  // developer-picker pattern in useFinancialsViewModel for payouts).
  const appListingsQuery = useQuery({
    queryKey: ["marketplace", "reviews-listing-options"],
    queryFn: () => appListingsRepository.getAll({ page: 1, pageSize: 100 }),
  });

  const reviewsQuery = useQuery({
    queryKey: ["marketplace", "reviews", appListingId, page],
    queryFn: () => reviewsRepository.getAll({ page, pageSize: 20, appListingId }),
    enabled: !!appListingId,
  });

  const moderateMutation = useMutation({
    mutationFn: (id: string) => reviewsRepository.delete(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.reviews.moderated") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  const data = reviewsQuery.data;
  return {
    reviews: data?.items ?? [],
    pagination: {
      page,
      pageSize: 20,
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 1,
    },
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error,
    setPage,

    // App-listing picker (required — reviews cannot be listed without one)
    appListingId,
    setAppListingId,
    appListingOptions: appListingsQuery.data?.items ?? [],
    isLoadingAppListingOptions: appListingsQuery.isLoading,

    moderate: moderateMutation.mutate,
    isModerating: moderateMutation.isPending,
  };
}
