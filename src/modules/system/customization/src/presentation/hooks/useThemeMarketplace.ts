/**
 * useThemeMarketplace — React hook for theme marketplace state management
 *
 * Handles: listing, featured, detail, apply, favorite, filtering, pagination.
 * All business logic is server-side — this hook is presentation-only.
 *
 * Uses systemContainer.themeMarketplaceRepository (Clean Architecture).
 * NO direct API calls in this hook.
 *
 * @module customization/presentation
 */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { systemContainer } from "@modules/system/di";
import type { ThemeCard } from "../../domain/entities/ThemeCard";
import type { ThemeDetail } from "../../domain/entities/ThemeDetail";
import type { ThemeFilterState } from "../../data/models/ThemeMarketplaceTypes";
import { useToast } from "@core/ui/use-toast";

interface UseThemeMarketplaceReturn {
  // Data
  themes: ThemeCard[];
  featuredThemes: ThemeCard[];
  selectedTheme: ThemeDetail | null;
  totalCount: number;
  page: number;
  pageSize: number;

  // Filter state
  filters: ThemeFilterState;
  setFilters: (filters: Partial<ThemeFilterState>) => void;
  resetFilters: () => void;

  // Pagination
  setPage: (page: number) => void;

  // Loading states
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isDetailLoading: boolean;
  isApplying: boolean;
  isTogglingFavorite: string | null; // slug being toggled

  // Actions
  loadThemes: () => Promise<void>;
  loadFeatured: () => Promise<void>;
  openDetail: (slug: string) => Promise<void>;
  closeDetail: () => void;
  applyTheme: (slug: string, merge?: boolean) => Promise<boolean>;
  toggleFavorite: (slug: string) => Promise<void>;

  // View mode
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Tab
  activeTab: "browse" | "favorites" | "featured";
  setActiveTab: (tab: "browse" | "favorites" | "featured") => void;
}

const DEFAULT_FILTERS: ThemeFilterState = {
  search: "",
  category: "",
  sortBy: "popular",
};

export function useThemeMarketplace(): UseThemeMarketplaceReturn {
  const { themeMarketplaceRepository } = systemContainer;
  const { toast } = useToast();

  // Data
  const [themes, setThemes] = useState<ThemeCard[]>([]);
  const [featuredThemes, setFeaturedThemes] = useState<ThemeCard[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeDetail | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Filter
  const [filters, setFiltersState] = useState<ThemeFilterState>(DEFAULT_FILTERS);

  // Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);

  // UI
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"browse" | "favorites" | "featured">("browse");

  // Prevent duplicate calls
  const loadingRef = useRef(false);

  const setFilters = useCallback((updates: Partial<ThemeFilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
    setPage(1); // Reset to page 1 on filter change
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  // ── Load themes (marketplace or favorites) ──
  const loadThemes = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const result = activeTab === "favorites"
        ? await themeMarketplaceRepository.getFavorites({ page, pageSize })
        : await themeMarketplaceRepository.getThemes({ page, pageSize, filters });

      setThemes(result.items);
      setTotalCount(result.totalCount);
    } catch (err) {
      toast({ title: "Failed to load themes", variant: "destructive" });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [themeMarketplaceRepository, page, pageSize, filters, activeTab, toast]);

  // ── Load featured ──
  const loadFeatured = useCallback(async () => {
    setIsFeaturedLoading(true);
    try {
      const result = await themeMarketplaceRepository.getFeatured();
      setFeaturedThemes(result);
    } catch {
      // Silent — featured is non-critical
    } finally {
      setIsFeaturedLoading(false);
    }
  }, [themeMarketplaceRepository]);

  // ── Open detail ──
  const openDetail = useCallback(async (slug: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await themeMarketplaceRepository.getBySlug(slug);
      setSelectedTheme(detail);
    } catch {
      toast({ title: "Failed to load theme details", variant: "destructive" });
    } finally {
      setIsDetailLoading(false);
    }
  }, [themeMarketplaceRepository, toast]);

  const closeDetail = useCallback(() => {
    setSelectedTheme(null);
  }, []);

  // ── Apply theme ──
  const applyTheme = useCallback(async (slug: string, merge: boolean = false): Promise<boolean> => {
    setIsApplying(true);
    try {
      await themeMarketplaceRepository.apply(slug, merge);
      toast({
        title: "Theme applied to draft",
        description: "Open the customizer to preview and publish.",
      });

      // Refresh themes to update isApplied state
      await loadThemes();
      return true;
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.error || "Failed to apply theme";
      // Detect system admin without tenant context
      if (message.includes("System admins") || message.includes("target tenant") || message.includes("drilldown")) {
        toast({
          title: "No tenant selected",
          description: "System admins must enter a tenant (via Tenant World) before applying themes. Go to Tenants → Enter Tenant → then open the Customizer.",
          variant: "destructive",
        });
      } else {
        toast({ title: message, variant: "destructive" });
      }
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [themeMarketplaceRepository, toast, loadThemes]);

  // ── Toggle favorite ──
  const toggleFavorite = useCallback(async (slug: string) => {
    setIsTogglingFavorite(slug);
    try {
      await themeMarketplaceRepository.toggleFavorite(slug);

      // Optimistic update: toggle isFavorited and likeCount in local state
      setThemes((prev) =>
        prev.map((t) =>
          t.slug === slug
            ? t.copyWith({
                isFavorited: !t.isFavorited,
                likeCount: t.isFavorited ? t.likeCount - 1 : t.likeCount + 1,
              })
            : t
        )
      );
      setFeaturedThemes((prev) =>
        prev.map((t) =>
          t.slug === slug
            ? t.copyWith({
                isFavorited: !t.isFavorited,
                likeCount: t.isFavorited ? t.likeCount - 1 : t.likeCount + 1,
              })
            : t
        )
      );
      if (selectedTheme?.slug === slug) {
        // Detail is a ThemeDetail (extends ThemeCard), reload from server for clean state
        await openDetail(slug);
      }
    } catch {
      toast({ title: "Failed to update favorite", variant: "destructive" });
    } finally {
      setIsTogglingFavorite(null);
    }
  }, [themeMarketplaceRepository, selectedTheme, toast, openDetail]);

  // ── Auto-load on filter/page/tab change ──
  useEffect(() => {
    loadThemes();
  }, [page, filters, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load featured on mount ──
  useEffect(() => {
    loadFeatured();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    themes,
    featuredThemes,
    selectedTheme,
    totalCount,
    page,
    pageSize,
    filters,
    setFilters,
    resetFilters,
    setPage,
    isLoading,
    isFeaturedLoading,
    isDetailLoading,
    isApplying,
    isTogglingFavorite,
    loadThemes,
    loadFeatured,
    openDetail,
    closeDetail,
    applyTheme,
    toggleFavorite,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
  };
}
