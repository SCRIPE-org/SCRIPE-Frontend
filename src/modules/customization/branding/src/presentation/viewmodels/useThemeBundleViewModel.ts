"use client";

/**
 * useThemeBundleViewModel — ViewModel hook for Theme Bundle marketplace
 *
 * Manages bundle listing, filtering, applying, favoriting, and "Save Current as Bundle".
 * Uses TanStack Query for server state + local filter state.
 *
 * @module customization/presentation
 */
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customizationContainer } from "@modules/customization/di";
import type { ThemeBundle } from "../../domain/entities/ThemeBundle";
import { BUNDLE_TYPE_CONFIG } from "../../domain/entities/ThemeBundle";
import type { SaveBundlePayload } from "../../domain/interfaces/IThemeBundleService";
import { useI18n } from "@core/providers/i18n-provider";

// ═══════════════════════════════════════════════════════════════
//  QUERY KEYS
// ═══════════════════════════════════════════════════════════════

const BUNDLE_KEYS = {
  all: ["theme-bundles"] as const,
  list: (page: number, pageSize: number, search: string, bundleType: string, sortBy: string) =>
    [...BUNDLE_KEYS.all, "list", page, pageSize, search, bundleType, sortBy] as const,
  featured: () => [...BUNDLE_KEYS.all, "featured"] as const,
  detail: (slug: string) => [...BUNDLE_KEYS.all, "detail", slug] as const,
};

// ═══════════════════════════════════════════════════════════════
//  FILTER STATE
// ═══════════════════════════════════════════════════════════════

/**
 * Type declaration definition describing the schema of bundle sort option.
 */
export type BundleSortOption = "popular" | "newest" | "name";

interface BundleFilters {
  search: string;
  bundleType: string; // "" = all
  sortBy: BundleSortOption;
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: BundleFilters = {
  search: "",
  bundleType: "",
  sortBy: "popular",
  page: 1,
  pageSize: 12,
};

// ═══════════════════════════════════════════════════════════════
//  HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * React hook/ViewModel managing logic, state, and repository queries for theme bundle view model.
 */
export function useThemeBundleViewModel() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { themeBundleRepository } = customizationContainer;

  // ── Filter State ──
  const [filters, setFilters] = useState<BundleFilters>(DEFAULT_FILTERS);
  const [selectedBundle, setSelectedBundle] = useState<ThemeBundle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // ── Bundle List Query ──
  const bundlesQuery = useQuery({
    queryKey: BUNDLE_KEYS.list(
      filters.page,
      filters.pageSize,
      filters.search,
      filters.bundleType,
      filters.sortBy
    ),
    queryFn: () =>
      themeBundleRepository.getBundles({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        bundleType: filters.bundleType || undefined,
        sortBy: filters.sortBy,
      }),
  });

  // ── Featured Query ──
  const featuredQuery = useQuery({
    queryKey: BUNDLE_KEYS.featured(),
    queryFn: () => themeBundleRepository.getFeatured(),
  });

  // ── Apply Mutation ──
  const applyMutation = useMutation({
    mutationFn: ({ slug, merge }: { slug: string; merge: boolean }) =>
      themeBundleRepository.apply(slug, merge),
    onSuccess: () => {
      toast.success(t("studio.bundles.applySuccess"));
      queryClient.invalidateQueries({ queryKey: BUNDLE_KEYS.all });
      // Also invalidate branding/dashboard theme queries
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-theme"] });
      setIsDetailOpen(false);
    },
    onError: () => {
      toast.error(t("studio.bundles.applyFailed"));
    },
  });

  // ── Favorite Mutation ──
  const favoriteMutation = useMutation({
    mutationFn: (slug: string) => themeBundleRepository.toggleFavorite(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUNDLE_KEYS.all });
    },
  });

  // ── Save Current as Bundle Mutation ──
  const saveBundleMutation = useMutation({
    mutationFn: (data: SaveBundlePayload) => themeBundleRepository.saveCurrentAsBundle(data),
    onSuccess: () => {
      toast.success(t("studio.bundles.saveSuccess"));
      queryClient.invalidateQueries({ queryKey: BUNDLE_KEYS.all });
      setIsSaveDialogOpen(false);
    },
    onError: () => {
      toast.error(t("studio.bundles.saveFailed"));
    },
  });

  // ── Filter Actions ──
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setBundleType = useCallback((bundleType: string) => {
    setFilters((prev) => ({ ...prev, bundleType, page: 1 }));
  }, []);

  const setSortBy = useCallback((sortBy: BundleSortOption) => {
    setFilters((prev) => ({ ...prev, sortBy, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // ── Detail Actions ──
  const openDetail = useCallback((bundle: ThemeBundle) => {
    setSelectedBundle(bundle);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedBundle(null);
  }, []);

  // ── Bundle Type Filter Options ──
  const bundleTypeOptions = useMemo(() => {
    const allOption = {
      value: "",
      label: t("studio.bundles.typeAll"),
    };
    const typeOptions = Object.values(BUNDLE_TYPE_CONFIG).map((config) => ({
      value: config.type,
      label: t(config.labelKey),
    }));
    return [allOption, ...typeOptions];
  }, [t]);

  // ── Pagination ──
  const pagination = useMemo(() => {
    if (!bundlesQuery.data) return null;
    const { totalCount, page, pageSize } = bundlesQuery.data;
    return {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNext: page * pageSize < totalCount,
      hasPrev: page > 1,
    };
  }, [bundlesQuery.data]);

  return {
    // Data
    bundles: bundlesQuery.data?.items ?? [],
    featured: featuredQuery.data ?? [],
    selectedBundle,
    pagination,

    // Loading States
    isLoading: bundlesQuery.isLoading,
    isFeaturedLoading: featuredQuery.isLoading,
    isApplying: applyMutation.isPending,
    isSaving: saveBundleMutation.isPending,

    // Filters
    filters,
    bundleTypeOptions,
    setSearch,
    setBundleType,
    setSortBy,
    setPage,

    // Actions
    applyBundle: (slug: string, merge: boolean) => applyMutation.mutate({ slug, merge }),
    toggleFavorite: (slug: string) => favoriteMutation.mutate(slug),
    saveCurrentAsBundle: (data: SaveBundlePayload) => saveBundleMutation.mutate(data),

    // Detail Modal
    isDetailOpen,
    openDetail,
    closeDetail,

    // Save Dialog
    isSaveDialogOpen,
    openSaveDialog: () => setIsSaveDialogOpen(true),
    closeSaveDialog: () => setIsSaveDialogOpen(false),
  };
}

/**
 * Type declaration definition describing the schema of theme bundle view model.
 */
export type ThemeBundleViewModel = ReturnType<typeof useThemeBundleViewModel>;
