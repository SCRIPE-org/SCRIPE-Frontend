"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "@modules/marketplace/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * useAppDetailViewModel
 *
 * ViewModel hook for the App Detail page (/marketplace/[id]).
 * Fetches a single AppListing by ID + its reviews (for the Reviews tab).
 *
 * Dependency flow:
 *   useAppDetailViewModel → IAppListingsRepository, IReviewsRepository (via di.ts)
 *   NEVER imports any service or API utility directly.
 */
export function useAppDetailViewModel(id: string) {
  const queryClient = useQueryClient();
  const { appListingsRepository, reviewsRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  // ── App listing detail ──────────────────────────────────────────────────
  const listingQuery = useQuery({
    queryKey: ["marketplace", "listings", id],
    queryFn: () => appListingsRepository.getById(id),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  // ── Reviews for this listing ────────────────────────────────────────────
  const reviewsQuery = useQuery({
    queryKey: ["marketplace", "reviews", id],
    queryFn: () => reviewsRepository.getAll({ page: 1, pageSize: 10, appListingId: id }),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });

  // ── Helpers ─────────────────────────────────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketplace", "listings"] });

  // ── Mutations ───────────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: () => appListingsRepository.publish(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.listings.published") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => appListingsRepository.unpublish(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.listings.unpublished") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: () => appListingsRepository.toggleFeatured(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.listings.featuredToggled") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsRepository.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace", "reviews", id] });
      success({ title: t("marketplace.reviews.deleted") });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error"), description: err.message });
    },
  });

  return {
    listing: listingQuery.data ?? null,
    isLoading: listingQuery.isLoading,
    isError: listingQuery.isError,

    reviews: reviewsQuery.data?.items ?? [],
    reviewsTotalCount: reviewsQuery.data?.totalCount ?? 0,
    isLoadingReviews: reviewsQuery.isLoading,

    // Screenshot carousel state
    screenshotIndex,
    setScreenshotIndex,
    nextScreenshot: () =>
      setScreenshotIndex((i) =>
        Math.min(i + 1, (listingQuery.data?.screenshotUrls.length ?? 1) - 1)
      ),
    prevScreenshot: () => setScreenshotIndex((i) => Math.max(i - 1, 0)),

    // Actions
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    deleteReview: deleteReviewMutation.mutate,

    isPublishing: publishMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
    isDeletingReview: deleteReviewMutation.isPending,
  };
}
