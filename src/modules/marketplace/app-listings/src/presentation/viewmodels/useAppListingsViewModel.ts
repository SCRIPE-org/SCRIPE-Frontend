"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";
import type { AppListing } from "../../domain/entities/AppListing";

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

  // ── Filter State ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>();

  // ── Queries ─────────────────────────────────────────────────────────
  const listingsQuery = useQuery({
    queryKey: ["marketplace", "listings", page, pageSize, search, categoryFilter, publishedFilter],
    queryFn: () =>
      appListingsRepository.getAll({
        page,
        pageSize,
        search: search || undefined,
        categoryId: categoryFilter,
        isPublished: publishedFilter,
      }),
  });

  const featuredQuery = useQuery({
    queryKey: ["marketplace", "listings", "featured"],
    queryFn: () => appListingsRepository.getFeatured(),
    staleTime: 5 * 60 * 1000, // Featured listings are stable — 5 min cache
  });

  // ── Mutations ────────────────────────────────────────────────────────
  const invalidateListings = () =>
    queryClient.invalidateQueries({ queryKey: ["marketplace", "listings"] });

  const publishMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.publish(id),
    onSuccess: invalidateListings,
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.unpublish(id),
    onSuccess: invalidateListings,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.toggleFeatured(id),
    onSuccess: invalidateListings,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => appListingsRepository.delete(id),
    onSuccess: invalidateListings,
  });

  // ── Derived State ────────────────────────────────────────────────────
  const listings = listingsQuery.data?.items ?? [];
  const totalCount = listingsQuery.data?.totalCount ?? 0;
  const totalPages = listingsQuery.data?.totalPages ?? 1;
  const featuredListings = featuredQuery.data ?? [];

  const stats = useMemo(() => ({
    total: totalCount,
    published: listings.filter((l: AppListing) => l.isPublished).length,
    featured: featuredListings.length,
    drafts: listings.filter((l: AppListing) => !l.isPublished).length,
  }), [listings, totalCount, featuredListings]);

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

    // Filter actions
    setPage,
    setSearch,
    setCategoryFilter,
    setPublishedFilter,

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
