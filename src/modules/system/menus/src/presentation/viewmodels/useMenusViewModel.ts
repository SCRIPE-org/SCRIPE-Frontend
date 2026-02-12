/**
 * Menus ViewModel (Orchestrator)
 *
 * Single source of truth for the menu management page.
 * Handles CRUD mutations, dialog state, native HTML5 DnD with
 * 3-zone detection (before/inside/after), expand/collapse, and
 * permission checks.
 */
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import {
      type CreateMenuItemRequest,
      type UpdateMenuItemRequest,
      type ReorderMenuItemsRequest,
      type SetRoleMenuVisibilityRequest,
} from "../../domain/entities/MenuItemRequests";
import { systemContainer } from "@modules/system/di";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type DropPosition = "before" | "inside" | "after";

export interface DropTarget {
      nodeId: string;
      position: DropPosition;
}

/* -------------------------------------------------------------------------- */
/*  Module-level cache for expanded state                                      */
/*  Survives component remounts caused by navigation/provider re-renders       */
/* -------------------------------------------------------------------------- */

let _cachedExpandedNodes: Set<string> | null = null;
let _hasInitialExpand = false;

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
      const canCreate = hasPermission(SYSTEM_PERMISSIONS.MENUS_CREATE);
      const canEdit = hasPermission(SYSTEM_PERMISSIONS.MENUS_UPDATE);
      const canDelete = hasPermission(SYSTEM_PERMISSIONS.MENUS_DELETE);
      const canCustomize = hasPermission(SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE);
      const canReorder = hasPermission(SYSTEM_PERMISSIONS.MENUS_UPDATE);
      // True if user has ANY action permission (to show/hide the actions column)
      const hasAnyAction = canCreate || canEdit || canDelete || canCustomize;

      // ── Dialog state ───────────────────────────────────────────────────
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedNode, setSelectedNode] = useState<MenuTreeNode | null>(null);
      const [parentForNew, setParentForNew] = useState<MenuTreeNode | null>(null);

      // ── DnD state ──────────────────────────────────────────────────────
      const [draggedNode, setDraggedNode] = useState<MenuTreeNode | null>(null);
      const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
      // Initialize from module-level cache so state survives remounts
      const [expandedNodes, _setExpandedNodes] = useState<Set<string>>(
            () => _cachedExpandedNodes ?? new Set()
      );
      const expandedBeforeDragRef = useRef<Set<string>>(new Set());

      // Wrap setExpandedNodes to sync module-level cache
      const setExpandedNodes = useCallback((valOrFn: Set<string> | ((prev: Set<string>) => Set<string>)) => {
            _setExpandedNodes((prev) => {
                  const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
                  _cachedExpandedNodes = next;
                  return next;
            });
      }, []);

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

      // Auto-expand all on first load only (module-level flag survives remounts)
      if (safeMenuTree.length > 0 && !_hasInitialExpand) {
            _hasInitialExpand = true;
            const allIds = new Set<string>();
            const collect = (nodes: MenuTreeNode[]) => {
                  for (const n of nodes) {
                        if (n.children.length > 0) {
                              allIds.add(n.id);
                              collect(n.children);
                        }
                  }
            };
            collect(safeMenuTree);
            _cachedExpandedNodes = allIds;
            _setExpandedNodes(allIds);
      }

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

      /** Get all descendant IDs of a node (to prevent dropping parent into child) */
      const getDescendantIds = useCallback(
            (nodeId: string, nodes: MenuTreeNode[]): Set<string> => {
                  const ids = new Set<string>();
                  const collect = (parentId: string, treeNodes: MenuTreeNode[]) => {
                        for (const node of treeNodes) {
                              if (node.id === parentId) {
                                    const addChildren = (children: MenuTreeNode[]) => {
                                          for (const child of children) {
                                                ids.add(child.id);
                                                addChildren(child.children);
                                          }
                                    };
                                    addChildren(node.children);
                                    return;
                              }
                              collect(parentId, node.children);
                        }
                  };
                  collect(nodeId, nodes);
                  return ids;
            },
            []
      );

      /** Find a node by ID in the tree */
      const findNode = useCallback(
            (nodeId: string, nodes: MenuTreeNode[]): MenuTreeNode | null => {
                  for (const node of nodes) {
                        if (node.id === nodeId) return node;
                        const found = findNode(nodeId, node.children);
                        if (found) return found;
                  }
                  return null;
            },
            []
      );

      /** Find siblings of a node and its parent ID */
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

      /** Build reorder payload from a list of siblings */
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

      // ── Expand / Collapse ──────────────────────────────────────────────

      const toggleExpand = useCallback((nodeId: string) => {
            setExpandedNodes((prev) => {
                  const next = new Set(prev);
                  if (next.has(nodeId)) {
                        next.delete(nodeId);
                  } else {
                        next.add(nodeId);
                  }
                  return next;
            });
      }, []);

      const expandAll = useCallback(() => {
            const allIds = new Set<string>();
            const collect = (nodes: MenuTreeNode[]) => {
                  for (const n of nodes) {
                        if (n.children.length > 0) {
                              allIds.add(n.id);
                              collect(n.children);
                        }
                  }
            };
            collect(safeMenuTree);
            setExpandedNodes(allIds);
      }, [safeMenuTree]);

      const collapseAll = useCallback(() => {
            setExpandedNodes(new Set());
      }, []);

      // ── DnD handlers (native HTML5) ────────────────────────────────────

      const handleDragStart = useCallback(
            (node: MenuTreeNode) => {
                  if (!canReorder) return;
                  setDraggedNode(node);
                  // Save current expanded state and collapse dragged node's children
                  expandedBeforeDragRef.current = new Set(expandedNodes);
                  setExpandedNodes((prev) => {
                        const next = new Set(prev);
                        next.delete(node.id);
                        return next;
                  });
            },
            [canReorder, expandedNodes]
      );

      const handleDragOver = useCallback(
            (nodeId: string, position: DropPosition) => {
                  if (!draggedNode) return;
                  if (draggedNode.id === nodeId) {
                        setDropTarget(null);
                        return;
                  }
                  // Prevent dropping parent into its own children
                  const descendants = getDescendantIds(draggedNode.id, safeMenuTree);
                  if (descendants.has(nodeId)) {
                        setDropTarget(null);
                        return;
                  }
                  setDropTarget({ nodeId, position });
            },
            [draggedNode, safeMenuTree, getDescendantIds]
      );

      const handleDragLeave = useCallback(() => {
            setDropTarget(null);
      }, []);

      const handleDragEnd = useCallback(() => {
            setDraggedNode(null);
            setDropTarget(null);
      }, []);

      const handleDrop = useCallback(
            async (targetNodeId: string, position: DropPosition) => {
                  if (!draggedNode || !canReorder) return;

                  const targetNode = findNode(targetNodeId, safeMenuTree);
                  if (!targetNode) return;

                  // Prevent drop on self
                  if (draggedNode.id === targetNodeId) {
                        handleDragEnd();
                        return;
                  }

                  // Prevent dropping parent into its own descendants
                  const descendants = getDescendantIds(draggedNode.id, safeMenuTree);
                  if (descendants.has(targetNodeId)) {
                        handleDragEnd();
                        return;
                  }

                  try {
                        if (position === "inside") {
                              // ── Drop inside: become child of target ──────────────
                              const existingChildren = [...targetNode.children].sort(
                                    (a, b) => a.order - b.order
                              );

                              // Remove draggedNode from its old parent
                              const oldResult = findSiblingsAndParent(draggedNode.id, safeMenuTree);
                              const oldSiblings = oldResult
                                    ? [...oldResult.siblings]
                                          .sort((a, b) => a.order - b.order)
                                          .filter((n) => n.id !== draggedNode.id)
                                    : [];

                              // Add to new parent's children at end
                              const newChildren = [...existingChildren.filter(c => c.id !== draggedNode.id), draggedNode];

                              // Build payload: old siblings reordered + new children
                              const items = [
                                    ...oldSiblings.map((s, i) => ({
                                          id: s.id,
                                          order: i + 1,
                                          parentMenuItemId: oldResult?.parentId,
                                    })),
                                    ...newChildren.map((s, i) => ({
                                          id: s.id,
                                          order: i + 1,
                                          parentMenuItemId: targetNodeId,
                                    })),
                              ];

                              await reorderMutation.mutateAsync({ items });

                              // Auto-expand the target so dropped item is visible
                              setExpandedNodes((prev) => new Set([...prev, targetNodeId]));
                        } else {
                              // ── Drop before/after: same parent as target ─────────
                              const targetResult = findSiblingsAndParent(targetNodeId, safeMenuTree);
                              if (!targetResult) return;

                              const oldResult = findSiblingsAndParent(draggedNode.id, safeMenuTree);

                              if (oldResult?.parentId === targetResult.parentId) {
                                    // Same parent: simple reorder
                                    const sorted = [...targetResult.siblings]
                                          .sort((a, b) => a.order - b.order)
                                          .filter((n) => n.id !== draggedNode.id);

                                    const targetIdx = sorted.findIndex((n) => n.id === targetNodeId);
                                    const insertAt = position === "before" ? targetIdx : targetIdx + 1;
                                    sorted.splice(insertAt, 0, draggedNode);

                                    await reorderMutation.mutateAsync(
                                          buildReorderPayload(sorted, targetResult.parentId)
                                    );
                              } else {
                                    // Cross-parent: remove from old, insert into new
                                    const oldSiblings = oldResult
                                          ? [...oldResult.siblings]
                                                .sort((a, b) => a.order - b.order)
                                                .filter((n) => n.id !== draggedNode.id)
                                          : [];

                                    const newSiblings = [...targetResult.siblings]
                                          .sort((a, b) => a.order - b.order)
                                          .filter((n) => n.id !== draggedNode.id);

                                    const targetIdx = newSiblings.findIndex((n) => n.id === targetNodeId);
                                    const insertAt = position === "before" ? targetIdx : targetIdx + 1;
                                    newSiblings.splice(insertAt, 0, draggedNode);

                                    const items = [
                                          ...oldSiblings.map((s, i) => ({
                                                id: s.id,
                                                order: i + 1,
                                                parentMenuItemId: oldResult?.parentId,
                                          })),
                                          ...newSiblings.map((s, i) => ({
                                                id: s.id,
                                                order: i + 1,
                                                parentMenuItemId: targetResult.parentId,
                                          })),
                                    ];

                                    await reorderMutation.mutateAsync({ items });
                              }
                        }
                  } catch {
                        // Error handled by mutation onError
                  }

                  handleDragEnd();
            },
            [
                  draggedNode,
                  canReorder,
                  safeMenuTree,
                  findNode,
                  findSiblingsAndParent,
                  getDescendantIds,
                  buildReorderPayload,
                  reorderMutation,
                  handleDragEnd,
            ]
      );

      /** Drop at root level — promote item to root */
      const handleDropAtRoot = useCallback(
            async () => {
                  if (!draggedNode || !canReorder) return;

                  try {
                        // Remove from old parent
                        const oldResult = findSiblingsAndParent(draggedNode.id, safeMenuTree);
                        const oldSiblings = oldResult
                              ? [...oldResult.siblings]
                                    .sort((a, b) => a.order - b.order)
                                    .filter((n) => n.id !== draggedNode.id)
                              : [];

                        // Add to root at end
                        const rootItems = [...safeMenuTree]
                              .sort((a, b) => a.order - b.order)
                              .filter((n) => n.id !== draggedNode.id);
                        rootItems.push(draggedNode);

                        const items = [
                              ...oldSiblings.map((s, i) => ({
                                    id: s.id,
                                    order: i + 1,
                                    parentMenuItemId: oldResult?.parentId,
                              })),
                              ...rootItems.map((s, i) => ({
                                    id: s.id,
                                    order: i + 1,
                                    parentMenuItemId: undefined,
                              })),
                        ];

                        await reorderMutation.mutateAsync({ items });
                  } catch {
                        // Error handled by mutation onError
                  }

                  handleDragEnd();
            },
            [draggedNode, canReorder, safeMenuTree, findSiblingsAndParent, reorderMutation, handleDragEnd]
      );

      // ── Move up / down (button-based) ──────────────────────────────────

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

            // State
            isLoading,
            isError,
            error,

            // Localization
            language,

            // Permissions
            canCreate,
            canEdit,
            canDelete,
            canCustomize,
            canReorder,
            hasAnyAction,

            // Expand / Collapse
            expandedNodes,
            toggleExpand,
            expandAll,
            collapseAll,

            // DnD (native HTML5)
            draggedNode,
            dropTarget,
            handleDragStart,
            handleDragOver,
            handleDragLeave,
            handleDragEnd,
            handleDrop,
            handleDropAtRoot,

            // Move up / down
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
