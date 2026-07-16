"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "@modules/marketplace/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { AppListing } from "../../domain/entities/AppListing";
import type { SortByOption, PricingModelFilter } from "../components/AppListingsToolbar";

/**
 * useAppListingsViewModel
 *
 * ViewModel hook for the App Listings sub-module.
 * Owns all server state via TanStack Query.
 * Exposes only stable actions to the view layer.
 *
 * Dependency flow:
 *   useAppListingsViewModel → IAppListingsRepository (via di.ts)
 *   NEVER imports any service or API utility directly.
 */
export function useAppListingsViewModel() {
  const queryClient = useQueryClient();
  const { appListingsRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  // ── Filter & Sort State ──────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>();
  const [sortBy, setSortBy] = useState<SortByOption | undefined>();
  const [pricingModel, setPricingModel] = useState<PricingModelFilter>();

  // ── Queries ──────────────────────────────────────────────────────────────
  const listingsQuery = useQuery({
    queryKey: [
      "marketplace",
      "listings",
      page,
      pageSize,
      search,
      categoryFilter,
      publishedFilter,
      sortBy,
      pricingModel,
    ],
    queryFn: () =>
      appListingsRepository.getAll({
        page,
        pageSize,
        search: search || undefined,
        categoryId: categoryFilter,
        isPublished: publishedFilter,
        sortBy,
        pricingModel,
      }),
  });

  const featuredQuery = useQuery({
    queryKey: ["marketplace", "listings", "featured"],
    queryFn: () => appListingsRepository.getFeatured(),
    staleTime: 5 * 60 * 1000, // Featured listings are stable — 5 min cache
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const invalidateListings = () =>
    queryClient.invalidateQueries({ queryKey: ["marketplace", "listings"] });

  // Phase 8: prefetch listing detail on row hover for instant navigation
  const prefetchListing = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ["marketplace", "listings", id],
        queryFn: () => appListingsRepository.getById(id),
        staleTime: 5 * 60_000,
      });
    },
    [queryClient, appListingsRepository]
  );

  // ── Mutations ────────────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.publish(id),
    onSuccess: () => {
      invalidateListings();
      success({ title: t("marketplace.listings.published") || "App published" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.unpublish(id),
    onSuccess: () => {
      invalidateListings();
      success({ title: t("marketplace.listings.unpublished") || "App unpublished" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.toggleFeatured(id),
    onSuccess: () => {
      invalidateListings();
      success({ title: t("marketplace.listings.featuredToggled") || "Featured status updated" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.delete(id),
    onSuccess: () => {
      invalidateListings();
      success({ title: t("marketplace.listings.deleted") || "App listing deleted" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  // ── Derived State ─────────────────────────────────────────────────────────
  const listings = listingsQuery.data?.items ?? [];
  const totalCount = listingsQuery.data?.totalCount ?? 0;
  const totalPages = listingsQuery.data?.totalPages ?? 1;
  const featuredListings = featuredQuery.data ?? [];

  const stats = useMemo(
    () => ({
      total: totalCount,
      published: listings.filter((l: AppListing) => l.isPublished).length,
      featured: featuredListings.length,
      drafts: listings.filter((l: AppListing) => !l.isPublished).length,
    }),
    [listings, totalCount, featuredListings]
  );

  return {
    // Data
    listings,
    featuredListings,
    stats,
    pagination: { page, pageSize, totalCount, totalPages },

    // Loading states
    isLoading: listingsQuery.isLoading,
    isFeaturedLoading: featuredQuery.isLoading,

    // Errors
    error: listingsQuery.error,

    // Filter & sort actions
    sortBy,
    pricingModel,
    setPage,
    setSearch,
    setCategoryFilter,
    setPublishedFilter,
    setSortBy,
    setPricingModel,

    // Phase 8: prefetch detail on row hover
    prefetchListing,

    // Mutation actions
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    delete: deleteMutation.mutate,

    // Mutation states
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
