/**
 * Theme Management ViewModel
 *
 * Orchestrates the theme management admin page (CRUD table).
 * System admin only — for creating, editing, duplicating,
 * deprecating, and deleting themes in the marketplace.
 *
 * All user-facing strings use i18n via t().
 *
 * @module customization/presentation
 */
"use client";

import { useCallback, useMemo } from "react";
import { customizationContainer } from "@modules/customization/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { ThemeCard } from "../../domain/entities/ThemeCard";

/**
 * Exported constant defining parameters and fields for theme keys configurations.
 */
export const themeKeys = {
  all: ["themes-management"] as const,
  list: (filters: Record<string, unknown>) => [...themeKeys.all, "list", filters] as const,
  detail: (slug: string) => [...themeKeys.all, "detail", slug] as const,
};

/**
 * React hook/ViewModel orchestrating state and data flows for theme management view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useThemeManagementViewModel() {
  const { themeMarketplaceRepository } = customizationContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  // ============ Core CRUD ViewModel ============
  const vm = useCrudViewModel<ThemeCard, any, any>([...themeKeys.all], {
    getAll: async (params) => {
      const res = await themeMarketplaceRepository.getThemes({
        page: params.page,
        pageSize: params.pageSize,
        filters: {
          search: params.search || "",
          category: "",
          sortBy: "name",
        },
      });
      return {
        items: res.items || [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.ceil(res.totalCount / params.pageSize),
        },
      };
    },
    delete: async (id: string) => {
      const theme = vm.items.find((t) => t.id === id);
      if (theme) {
        await themeMarketplaceRepository.delete(theme.slug);
        success({
          title: t("studio.themeManagement.toast.deleted"),
          description: t("studio.themeManagement.toast.deletedDesc"),
        });
      }
    },
  });

  // ============ Duplicate Mutation ============
  const duplicateMutation = useMutation({
    mutationFn: (params: { slug: string; newSlug: string; newName: string }) =>
      themeMarketplaceRepository.duplicate(params.slug, params.newSlug, params.newName),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: themeKeys.all });
      success({
        title: t("studio.themeManagement.toast.duplicated"),
        description: t("studio.themeManagement.toast.duplicatedDesc", {
          name: variables.newName,
        }) as string,
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("studio.themeManagement.toast.duplicateFailed"),
        description: err.message,
      });
    },
  });

  // ============ Deprecate Mutation ============
  const deprecateMutation = useMutation({
    mutationFn: (params: { slug: string; notice?: string; replacedBySlug?: string }) =>
      themeMarketplaceRepository.deprecate(params.slug, params.notice, params.replacedBySlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.all });
      success({
        title: t("studio.themeManagement.toast.deprecated"),
        description: t("studio.themeManagement.toast.deprecatedDesc"),
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("studio.themeManagement.toast.deprecateFailed"),
        description: err.message,
      });
    },
  });

  // ============ Toggle Favorite Mutation ============
  const favoriteMutation = useMutation({
    mutationFn: (slug: string) => themeMarketplaceRepository.toggleFavorite(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.all });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // ============ Actions ============
  const handleDuplicate = useCallback(
    (theme: ThemeCard) => {
      const newSlug = `${theme.slug}-copy-${Date.now().toString(36)}`;
      const copySuffix = t("studio.themeManagement.copySuffix");
      const newName = `${theme.name} ${copySuffix}`;
      duplicateMutation.mutate({ slug: theme.slug, newSlug, newName });
    },
    [duplicateMutation, t]
  );

  const handleDeprecate = useCallback(
    (theme: ThemeCard) => {
      const notice = t("studio.themeManagement.defaultDeprecationNotice");
      deprecateMutation.mutate({
        slug: theme.slug,
        notice,
      });
    },
    [deprecateMutation, t]
  );

  const handleToggleFavorite = useCallback(
    (theme: ThemeCard) => {
      favoriteMutation.mutate(theme.slug);
    },
    [favoriteMutation]
  );

  // ============ Config ============
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<ThemeCard>> => ({
      getItemDisplayName: (item: ThemeCard) => item.name,
      deleteService: async (id: string) => {
        const theme = vm.items.find((t) => t.id === id);
        if (theme) {
          await themeMarketplaceRepository.delete(theme.slug);
        }
      },
    }),
    [themeMarketplaceRepository, vm.items]
  );

  // ============ Statistics ============
  const statistics = useMemo(() => {
    const items = vm.items;
    return {
      total: vm.pagination.itemsCount || items.length,
      free: items.filter((t) => t.isFree).length,
      featured: items.filter((t) => t.isFeatured).length,
      system: items.filter((t) => t.isSystem).length,
      deprecated: items.filter((t) => t.isDeprecated).length,
    };
  }, [vm.items, vm.pagination.itemsCount]);

  return {
    vm,
    getConfigBase,
    handleDuplicate,
    handleDeprecate,
    handleToggleFavorite,
    isDuplicating: duplicateMutation.isPending,
    isDeprecating: deprecateMutation.isPending,
    statistics,
    t,
  };
}
