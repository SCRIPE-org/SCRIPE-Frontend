/**
 * Menus ViewModel
 *
 * Provides data and operations for the menu management view.
 */
"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type {
      CreateMenuItemRequest,
      UpdateMenuItemRequest,
} from "../../domain/entities/MenuItemRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

export function useMenusViewModel() {
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { menuRepository } = systemContainer;

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
                  success({
                        title: "Menu Item Created",
                        description: "The menu item has been created successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Create Failed",
                        description: err.message || "Failed to create menu item.",
                  });
            },
      });

      // Update menu item mutation
      const updateMutation = useMutation({
            mutationFn: ({ id, request }: { id: string; request: UpdateMenuItemRequest }) =>
                  menuRepository.update(id, request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
                  success({
                        title: "Menu Item Updated",
                        description: "The menu item has been updated successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Update Failed",
                        description: err.message || "Failed to update menu item.",
                  });
            },
      });

      // Delete menu item mutation
      const deleteMutation = useMutation({
            mutationFn: (id: string) => menuRepository.delete(id),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
                  success({
                        title: "Menu Item Deleted",
                        description: "The menu item has been deleted successfully.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: "Delete Failed",
                        description: err.message || "Failed to delete menu item.",
                  });
            },
      });

      // Calculate total items
      const totalItems = useMemo(() => {
            const countNodes = (nodes: MenuTreeNode[]): number => {
                  return nodes.reduce(
                        (sum, node) => sum + 1 + countNodes(node.children || []),
                        0
                  );
            };
            return menuTree ? countNodes(menuTree) : 0;
      }, [menuTree]);

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

      return {
            // Data
            menuTree: menuTree ?? [],
            totalItems,

            // State
            isLoading,
            isError,
            error,

            // Handlers
            handleCreate,
            handleUpdate,
            handleDelete,
            refetch: () => refetch(),

            // Mutation states
            isCreating: createMutation.isPending,
            isUpdating: updateMutation.isPending,
            isDeleting: deleteMutation.isPending,
      };
}
