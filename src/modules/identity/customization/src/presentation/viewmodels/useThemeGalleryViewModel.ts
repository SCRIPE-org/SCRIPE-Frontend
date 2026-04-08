/**
 * Theme Gallery ViewModel
 *
 * Orchestrates the full-page theme gallery for end-users (tenant admins).
 * Handles browsing, filtering, sorting, previewing, applying, and comparing themes.
 *
 * Uses the same data layer as ThemeMarketplacePanel but with
 * full-page gallery UX (hero, tabs, rich filters, comparison).
 *
 * @module customization/presentation
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { systemContainer } from "@/modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { ThemeCard } from "../../domain/entities/ThemeCard";

// ── Constants ──
const GALLERY_CATEGORIES = [
  "all", "corporate", "creative", "minimal", "industry", "dark", "colorful",
] as const;

type GalleryCategory = typeof GALLERY_CATEGORIES[number];

type GallerySortKey = "popular" | "newest" | "trending" | "nameAsc" | "nameDesc";

type GalleryTab = "browse" | "featured" | "favorites" | "bundles";

export interface GalleryFilters {
  search: string;
  category: GalleryCategory;
  sortBy: GallerySortKey;
  isFree?: boolean;
  hasDarkMode?: boolean;
  hasAccessibility?: boolean;
  hasContentBlocks?: boolean;
}

const DEFAULT_FILTERS: GalleryFilters = {
  search: "",
  category: "all",
  sortBy: "popular",
};

export const galleryKeys = {
  all: ["theme-gallery"] as const,
  browse: (filters: GalleryFilters, page: number) =>
    [...galleryKeys.all, "browse", filters, page] as const,
  featured: () => [...galleryKeys.all, "featured"] as const,
  favorites: (page: number) => [...galleryKeys.all, "favorites", page] as const,
};

export function useThemeGalleryViewModel() {
  const { themeMarketplaceRepository } = systemContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  // ─── State ───
  const [activeTab, setActiveTab] = useState<GalleryTab>("browse");
  const [filters, setFiltersState] = useState<GalleryFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [compareSlug1, setCompareSlug1] = useState<string | null>(null);
  const [compareSlug2, setCompareSlug2] = useState<string | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const pageSize = 12;

  // ─── Derived sort key ───
  const apiSortBy = useMemo(() => {
    switch (filters.sortBy) {
      case "popular": return "usageCount";
      case "newest": return "publishedAt";
      case "trending": return "likeCount";
      case "nameAsc": return "name";
      case "nameDesc": return "name_desc";
      default: return "name";
    }
  }, [filters.sortBy]);

  // ─── Browse Query ───
  const browseQuery = useQuery({
    queryKey: galleryKeys.browse(filters, page),
    queryFn: async () => {
      const res = await themeMarketplaceRepository.getThemes({
        page,
        pageSize,
        filters: {
          search: filters.search,
          category: filters.category === "all" ? "" : filters.category,
          sortBy: apiSortBy,
          isFree: filters.isFree,
          hasDarkMode: filters.hasDarkMode,
          hasAccessibility: filters.hasAccessibility,
        },
      });
      return res;
    },
    enabled: activeTab === "browse",
  });

  // ─── Featured Query ───
  const featuredQuery = useQuery({
    queryKey: galleryKeys.featured(),
    queryFn: async () => {
      const res = await themeMarketplaceRepository.getThemes({
        page: 1,
        pageSize: 6,
        filters: { search: "", category: "", sortBy: "name", isFeatured: true },
      });
      return res.items;
    },
    enabled: activeTab === "browse" || activeTab === "featured",
  });

  // ─── Favorites Query ───
  const favoritesQuery = useQuery({
    queryKey: galleryKeys.favorites(page),
    queryFn: async () => {
      const res = await themeMarketplaceRepository.getThemes({
        page,
        pageSize,
        filters: { search: "", category: "", sortBy: "name" },
      });
      // Favorites are pre-filtered server-side — for now we filter client-side
      return {
        items: res.items.filter((t: ThemeCard) => t.isFavorited),
        totalCount: res.items.filter((t: ThemeCard) => t.isFavorited).length,
      };
    },
    enabled: activeTab === "favorites",
  });

  // ─── Theme Detail Query (for modal) ───
  const detailQuery = useQuery({
    queryKey: [...galleryKeys.all, "detail", detailSlug],
    queryFn: async () => {
      if (!detailSlug) return null;
      return themeMarketplaceRepository.getBySlug(detailSlug);
    },
    enabled: !!detailSlug,
  });

  // ─── Toggle Favorite ───
  const favoriteMutation = useMutation({
    mutationFn: (slug: string) => themeMarketplaceRepository.toggleFavorite(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // ─── Apply Theme ───
  const applyMutation = useMutation({
    mutationFn: (params: { slug: string; merge: boolean }) =>
      themeMarketplaceRepository.apply(params.slug, params.merge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      success({
        title: t("studio.marketplace.apply") || "Theme Applied",
        description: t("studio.marketplace.applied") || "Theme applied to your draft.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // ─── Active data ───
  const activeData = useMemo(() => {
    switch (activeTab) {
      case "browse":
        return {
          items: browseQuery.data?.items || [],
          totalCount: browseQuery.data?.totalCount || 0,
          isLoading: browseQuery.isLoading,
        };
      case "featured":
        return {
          items: featuredQuery.data || [],
          totalCount: featuredQuery.data?.length || 0,
          isLoading: featuredQuery.isLoading,
        };
      case "favorites":
        return {
          items: favoritesQuery.data?.items || [],
          totalCount: favoritesQuery.data?.totalCount || 0,
          isLoading: favoritesQuery.isLoading,
        };
      case "bundles":
      default:
        return {
          items: [] as ThemeCard[],
          totalCount: 0,
          isLoading: false,
        };
    }
  }, [activeTab, browseQuery, featuredQuery, favoritesQuery]);

  const totalPages = Math.ceil(activeData.totalCount / pageSize);

  // ─── Actions ───
  const setFilters = useCallback((partial: Partial<GalleryFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.category !== "all" ||
      filters.isFree === true ||
      filters.hasDarkMode === true ||
      filters.hasAccessibility === true ||
      filters.hasContentBlocks === true
    );
  }, [filters]);

  const toggleCompareTheme = useCallback((slug: string) => {
    if (compareSlug1 === slug) {
      setCompareSlug1(null);
    } else if (compareSlug2 === slug) {
      setCompareSlug2(null);
    } else if (!compareSlug1) {
      setCompareSlug1(slug);
    } else if (!compareSlug2) {
      setCompareSlug2(slug);
    }
  }, [compareSlug1, compareSlug2]);

  return {
    // Tab
    activeTab,
    setActiveTab,
    // Data
    themes: activeData.items,
    totalCount: activeData.totalCount,
    isLoading: activeData.isLoading,
    featuredThemes: featuredQuery.data || [],
    // Pagination
    page,
    setPage,
    pageSize,
    totalPages,
    // Filters
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    categories: GALLERY_CATEGORIES,
    // Preview
    previewSlug,
    setPreviewSlug,
    // Detail modal
    detailSlug,
    openDetail: setDetailSlug,
    closeDetail: () => setDetailSlug(null),
    selectedDetail: detailQuery.data ?? null,
    isDetailLoading: detailQuery.isLoading,
    // Compare
    isCompareMode,
    setIsCompareMode,
    compareSlug1,
    compareSlug2,
    toggleCompareTheme,
    // Actions
    toggleFavorite: (slug: string) => favoriteMutation.mutate(slug),
    isTogglingFavorite: favoriteMutation.isPending,
    applyTheme: (slug: string, merge: boolean) =>
      applyMutation.mutate({ slug, merge }),
    isApplying: applyMutation.isPending,
    // i18n
    t,
  };
}
