/**
 * Menus ViewModel
 *
 * Provides data and operations for the menu management view.
 * Handles CRUD, reorder, and role-visibility mutations.
 */
"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type {
      CreateMenuItemRequest,
      UpdateMenuItemRequest,
      ReorderMenuItemsRequest,
      SetRoleMenuVisibilityRequest,
} from "../../domain/entities/MenuItemRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useMenusViewModel() {
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { menuRepository } = systemContainer;
      const { t, language } = useI18n();

      // Fetch menu tree
      const {
            data: menuTree,
            isLoading,
            isError,
            error,
            refetch,
      } = useQuery({
            queryKey: ["menus", "tree"],
            queryFn: () => menuRepository.getAll(),
      });

      // Create menu item mutation
      const createMutation = useMutation({
            mutationFn: (request: CreateMenuItemRequest) => menuRepository.create(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
                  // Also invalidate navigation to reflect new items
                  queryClient.invalidateQueries({ queryKey: ["navigation"] });
                  success({
                        title: t("menus.createSuccess"),
                        description: t("menus.createSuccessDesc"),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("menus.createFailed"),
                        description: err.message || t("menus.createFailedDesc"),
                  });
            },
      });

      // Update menu item mutation
      const updateMutation = useMutation({
            mutationFn: ({ id, request }: { id: string; request: UpdateMenuItemRequest }) =>
                  menuRepository.update(id, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
                  queryClient.invalidateQueries({ queryKey: ["navigation"] });
                  success({
                        title: t("menus.updateSuccess"),
                        description: t("menus.updateSuccessDesc"),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("menus.updateFailed"),
                        description: err.message || t("menus.updateFailedDesc"),
                  });
            },
      });

      // Delete menu item mutation
      const deleteMutation = useMutation({
            mutationFn: (id: string) => menuRepository.delete(id),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
                  queryClient.invalidateQueries({ queryKey: ["navigation"] });
                  success({
                        title: t("menus.deleteSuccess"),
                        description: t("menus.deleteSuccessDesc"),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("menus.deleteFailed"),
                        description: err.message || t("menus.deleteFailedDesc"),
                  });
            },
      });

      // Reorder menu items mutation
      const reorderMutation = useMutation({
            mutationFn: (request: ReorderMenuItemsRequest) => menuRepository.reorder(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
                  queryClient.invalidateQueries({ queryKey: ["navigation"] });
                  success({
                        title: t("menus.reorderSuccess"),
                        description: t("menus.reorderSuccessDesc"),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("menus.reorderFailed"),
                        description: err.message || t("menus.reorderFailedDesc"),
                  });
            },
      });

      // Set role visibility mutation
      const visibilityMutation = useMutation({
            mutationFn: (request: SetRoleMenuVisibilityRequest) => menuRepository.setRoleVisibility(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
                  success({
                        title: t("menus.visibilitySuccess"),
                        description: t("menus.visibilitySuccessDesc"),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("menus.visibilityFailed"),
                        description: err.message || t("menus.visibilityFailedDesc"),
                  });
            },
      });

      // Calculate total items
      const totalItems = useMemo(() => {
            const countNodes = (nodes: MenuTreeNode[]): number => {
                  if (!Array.isArray(nodes)) return 0;
                  return nodes.reduce(
                        (sum, node) => sum + 1 + countNodes(node.children || []),
                        0
                  );
            };
            return Array.isArray(menuTree) ? countNodes(menuTree) : 0;
      }, [menuTree]);

      // Helpers
      const getLocalizedName = useCallback(
            (node: MenuTreeNode) => language === "ar" ? node.nameAr : node.nameEn,
            [language]
      );

      // Handlers
      const handleCreate = useCallback(
            (request: CreateMenuItemRequest) => createMutation.mutateAsync(request),
            [createMutation]
      );

      const handleUpdate = useCallback(
            (id: string, request: UpdateMenuItemRequest) =>
                  updateMutation.mutateAsync({ id, request }),
            [updateMutation]
      );

      const handleDelete = useCallback(
            (id: string) => deleteMutation.mutateAsync(id),
            [deleteMutation]
      );

      const handleReorder = useCallback(
            (request: ReorderMenuItemsRequest) => reorderMutation.mutateAsync(request),
            [reorderMutation]
      );

      const handleSetVisibility = useCallback(
            (request: SetRoleMenuVisibilityRequest) => visibilityMutation.mutateAsync(request),
            [visibilityMutation]
      );

      return {
            // Data
            menuTree: menuTree ?? [],
            totalItems,

            // State
            isLoading,
            isError,
            error,

            // Localization
            language,
            getLocalizedName,

            // Handlers
            handleCreate,
            handleUpdate,
            handleDelete,
            handleReorder,
            handleSetVisibility,
            refetch: () => refetch(),

            // Mutation states
            isCreating: createMutation.isPending,
            isUpdating: updateMutation.isPending,
            isDeleting: deleteMutation.isPending,
            isReordering: reorderMutation.isPending,
            isSettingVisibility: visibilityMutation.isPending,
      };
}
