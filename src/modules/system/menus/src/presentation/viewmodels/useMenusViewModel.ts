/**
 * Menus ViewModel (Orchestrator)
 *
 * Single source of truth for the menu management page.
 * Handles CRUD mutations, dialog state, DnD reorder logic,
 * and permission checks. The view destructures this and renders.
 */
"use client";

import { useState, useMemo, useCallback } from "react";
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
import { usePermissions } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { flattenIds } from "../components/MenuTreeItem";
import type { DragEndEvent } from "@dnd-kit/core";

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useMenusViewModel() {
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { menuRepository } = systemContainer;
      const { t, language } = useI18n();
      const { hasPermission } = usePermissions();

      // ── Permission ─────────────────────────────────────────────────────
      const canReorder = hasPermission(SYSTEM_PERMISSIONS.MENUS_UPDATE);

      // ── Dialog state ───────────────────────────────────────────────────
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedNode, setSelectedNode] = useState<MenuTreeNode | null>(null);
      const [parentForNew, setParentForNew] = useState<MenuTreeNode | null>(null);

      // ── Query ──────────────────────────────────────────────────────────
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

      const safeMenuTree = useMemo(() => menuTree ?? [], [menuTree]);

      // ── Computed ───────────────────────────────────────────────────────
      const totalItems = useMemo(() => {
            const countNodes = (nodes: MenuTreeNode[]): number => {
                  if (!Array.isArray(nodes)) return 0;
                  return nodes.reduce(
                        (sum, node) => sum + 1 + countNodes(node.children || []),
                        0
                  );
            };
            return countNodes(safeMenuTree);
      }, [safeMenuTree]);

      const sortableIds = useMemo(
            () => (Array.isArray(safeMenuTree) ? flattenIds(safeMenuTree) : []),
            [safeMenuTree]
      );

      const deleteNodeName = useMemo(() => {
            if (!selectedNode) return "";
            return language === "ar" ? selectedNode.nameAr : selectedNode.nameEn;
      }, [selectedNode, language]);

      // ── Mutations ──────────────────────────────────────────────────────
      const createMutation = useMutation({
            mutationFn: (request: CreateMenuItemRequest) => menuRepository.create(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["menus"] });
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

      // ── DnD helpers ────────────────────────────────────────────────────
      const buildReorderPayload = useCallback(
            (siblings: MenuTreeNode[], parentId?: string) => ({
                  items: siblings.map((s, i) => ({
                        id: s.id,
                        order: i + 1,
                        parentMenuItemId: parentId,
                  })),
            }),
            []
      );

      const findSiblingsAndParent = useCallback(
            (nodeId: string, nodes: MenuTreeNode[], parentId?: string): { siblings: MenuTreeNode[]; parentId?: string } | null => {
                  const idx = nodes.findIndex((n) => n.id === nodeId);
                  if (idx >= 0) return { siblings: nodes, parentId };
                  for (const node of nodes) {
                        if (node.children.length > 0) {
                              const result = findSiblingsAndParent(nodeId, node.children, node.id);
                              if (result) return result;
                        }
                  }
                  return null;
            },
            []
      );

      const handleMoveUp = useCallback(
            (nodeId: string) => {
                  const result = findSiblingsAndParent(nodeId, safeMenuTree);
                  if (!result) return;
                  const { siblings, parentId } = result;
                  const sorted = [...siblings].sort((a, b) => a.order - b.order);
                  const idx = sorted.findIndex((n) => n.id === nodeId);
                  if (idx <= 0) return;
                  [sorted[idx], sorted[idx - 1]] = [sorted[idx - 1], sorted[idx]];
                  reorderMutation.mutateAsync(buildReorderPayload(sorted, parentId));
            },
            [safeMenuTree, findSiblingsAndParent, reorderMutation, buildReorderPayload]
      );

      const handleMoveDown = useCallback(
            (nodeId: string) => {
                  const result = findSiblingsAndParent(nodeId, safeMenuTree);
                  if (!result) return;
                  const { siblings, parentId } = result;
                  const sorted = [...siblings].sort((a, b) => a.order - b.order);
                  const idx = sorted.findIndex((n) => n.id === nodeId);
                  if (idx < 0 || idx >= sorted.length - 1) return;
                  [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
                  reorderMutation.mutateAsync(buildReorderPayload(sorted, parentId));
            },
            [safeMenuTree, findSiblingsAndParent, reorderMutation, buildReorderPayload]
      );

      const handleDragEnd = useCallback(
            (event: DragEndEvent) => {
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;

                  const activeId = String(active.id);
                  const overId = String(over.id);

                  const activeResult = findSiblingsAndParent(activeId, safeMenuTree);
                  const overResult = findSiblingsAndParent(overId, safeMenuTree);

                  if (!activeResult || !overResult) return;

                  // ── Same parent: simple reorder ──────────────────────────
                  if (activeResult.parentId === overResult.parentId) {
                        const sorted = [...activeResult.siblings].sort((a, b) => a.order - b.order);
                        const activeIdx = sorted.findIndex((n) => n.id === activeId);
                        const overIdx = sorted.findIndex((n) => n.id === overId);
                        if (activeIdx < 0 || overIdx < 0) return;

                        const [moved] = sorted.splice(activeIdx, 1);
                        sorted.splice(overIdx, 0, moved);

                        reorderMutation.mutateAsync(buildReorderPayload(sorted, activeResult.parentId));
                        return;
                  }

                  // ── Cross-parent: reparent item ──────────────────────────
                  // 1. Remove from old parent's children
                  const oldSiblings = [...activeResult.siblings]
                        .sort((a, b) => a.order - b.order)
                        .filter((n) => n.id !== activeId);

                  // 2. Find the dragged node
                  const draggedNode = activeResult.siblings.find((n) => n.id === activeId);
                  if (!draggedNode) return;

                  // 3. Insert into new parent's children at drop position
                  const newSiblings = [...overResult.siblings].sort((a, b) => a.order - b.order);
                  const overIdx = newSiblings.findIndex((n) => n.id === overId);
                  newSiblings.splice(overIdx >= 0 ? overIdx + 1 : newSiblings.length, 0, draggedNode);

                  // 4. Build combined reorder payload (old + new parent siblings)
                  const oldItems = oldSiblings.map((s, i) => ({
                        id: s.id,
                        order: i + 1,
                        parentMenuItemId: activeResult.parentId,
                  }));
                  const newItems = newSiblings.map((s, i) => ({
                        id: s.id,
                        order: i + 1,
                        parentMenuItemId: overResult.parentId,
                  }));

                  reorderMutation.mutateAsync({ items: [...oldItems, ...newItems] });
            },
            [safeMenuTree, findSiblingsAndParent, reorderMutation, buildReorderPayload]
      );

      // ── Dialog handlers ────────────────────────────────────────────────
      const openCreateDialog = useCallback((parent?: MenuTreeNode) => {
            setParentForNew(parent || null);
            setCreateDialogOpen(true);
      }, []);

      const openEditDialog = useCallback((node: MenuTreeNode) => {
            setSelectedNode(node);
            setEditDialogOpen(true);
      }, []);

      const openDeleteDialog = useCallback((node: MenuTreeNode) => {
            setSelectedNode(node);
            setDeleteDialogOpen(true);
      }, []);

      const onCreateSubmit = useCallback(
            async (data: CreateMenuItemRequest | { id: string; request: UpdateMenuItemRequest }) => {
                  await createMutation.mutateAsync(data as CreateMenuItemRequest);
            },
            [createMutation]
      );

      const onEditSubmit = useCallback(
            async (data: CreateMenuItemRequest | { id: string; request: UpdateMenuItemRequest }) => {
                  const editData = data as { id: string; request: UpdateMenuItemRequest };
                  await updateMutation.mutateAsync({ id: editData.id, request: editData.request });
            },
            [updateMutation]
      );

      const onDeleteConfirm = useCallback(async () => {
            if (!selectedNode) return;
            await deleteMutation.mutateAsync(selectedNode.id);
            setDeleteDialogOpen(false);
            setSelectedNode(null);
      }, [deleteMutation, selectedNode]);

      // ── Return ─────────────────────────────────────────────────────────
      return {
            // Data
            menuTree: safeMenuTree,
            totalItems,
            sortableIds,

            // State
            isLoading,
            isError,
            error,

            // Localization
            language,

            // Permission
            canReorder,

            // DnD
            handleDragEnd: canReorder ? handleDragEnd : undefined,
            handleMoveUp,
            handleMoveDown,

            // Dialog state
            createDialogOpen,
            setCreateDialogOpen,
            editDialogOpen,
            setEditDialogOpen,
            deleteDialogOpen,
            setDeleteDialogOpen,
            selectedNode,
            parentForNew,
            deleteNodeName,

            // Dialog handlers
            openCreateDialog,
            openEditDialog,
            openDeleteDialog,
            onCreateSubmit,
            onEditSubmit,
            onDeleteConfirm,

            // Mutation states
            isCreating: createMutation.isPending,
            isUpdating: updateMutation.isPending,
            isDeleting: deleteMutation.isPending,
            isReordering: reorderMutation.isPending,

            // Actions
            refetch: () => refetch(),
      };
}
