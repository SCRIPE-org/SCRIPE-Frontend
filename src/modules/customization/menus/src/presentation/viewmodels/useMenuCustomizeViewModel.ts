/**
 * Menu Customize ViewModel (Orchestrator)
 *
 * Manages the dedicated customization page state:
 * - Fetches menu tree and computes effective (overridden) tree
 * - Manages selected item, scope, and inline editing
 * - Handles save/delete mutations for overrides
 * - Provides active overrides list
 */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { useNavigation } from "@core/providers/navigation-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useAppStore } from "@core/store/useAppStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { MenuTreeNode, MenuItemOverrideInfo } from "../../domain/entities/MenuItem";
import {
  MenuOverrideScope,
  type SaveMenuOverrideRequest,
} from "../../domain/entities/MenuItemRequests";
import {
  computeEffectiveTree,
  type EffectiveTreeNode,
} from "../../domain/utils/computeEffectiveTree";
import { customizationContainer } from "@modules/customization/di";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

/** A flat reference to a menu item for the parent picker */
export interface FlatMenuItem {
  id: string;
  nameEn: string;
  nameAr: string;
  depth: number;
  parentId?: string;
}

/** The shape of override data for the inline editing panel */
export interface OverrideFormData {
  nameEn: string;
  nameAr: string;
  orderOverride: number | null;
  parentMenuItemIdOverride: string | null;
  isHidden: boolean;
}

/** An active override entry for the summary list */
export interface ActiveOverrideEntry {
  overrideId: string;
  menuItemId: string;
  itemNameEn: string;
  itemNameAr: string;
  scope: MenuOverrideScope;
  changes: string[]; // human-readable list of changes
  override: MenuItemOverrideInfo;
}

/** DnD types for the customize page */
export type CustomizeDropPosition = "before" | "inside" | "after";
export interface CustomizeDropTarget {
  nodeId: string;
  position: CustomizeDropPosition;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useMenuCustomizeViewModel() {
  const queryClient = useQueryClient();
  const { menuRepository } = customizationContainer;
  const { t, language } = useI18n();
  const { hasPermission } = usePermissions();
  const user = useAppStore((state) => state.user);
  const { success, error: toastError } = useEnhancedToast();
  const { refreshNavigation } = useNavigation();

  // ── Permissions ─────────────────────────────────────────────────────
  const canCustomize = hasPermission(SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE);
  // Tenant customization requires BOTH the permission AND a non-null tenantId
  // System superadmins (tenantId === null) should not see the tenant scope
  const hasTenantId = !!user?.tenantId;
  const canCustomizeTenant =
    hasPermission(SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE_TENANT) && hasTenantId;

  // ── Scope management ────────────────────────────────────────────────
  const availableScopes = useMemo(() => {
    const scopes: MenuOverrideScope[] = [];
    if (canCustomize) scopes.push(MenuOverrideScope.User);
    if (canCustomizeTenant) scopes.push(MenuOverrideScope.Tenant);
    return scopes;
  }, [canCustomize, canCustomizeTenant]);

  const [scope, setScope] = useState<MenuOverrideScope>(
    availableScopes[0] ?? MenuOverrideScope.User
  );

  // ── Selected item ───────────────────────────────────────────────────
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // ── Expanded nodes (separate for Original and Preview trees) ────────
  const [expandedOriginal, setExpandedOriginal] = useState<Set<string>>(new Set());
  const [expandedPreview, setExpandedPreview] = useState<Set<string>>(new Set());

  // ── Query: Full menu tree ───────────────────────────────────────────
  const {
    data: menuTree = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["menus", "tree"],
    queryFn: () => menuRepository.getAll(),
  });

  // ── Effective tree (overrides applied) ──────────────────────────────
  const effectiveTree: EffectiveTreeNode[] = useMemo(
    () => computeEffectiveTree(menuTree, scope),
    [menuTree, scope]
  );

  // ── Auto-expand all on first load (both trees) ────────────────────
  useEffect(() => {
    if (menuTree.length > 0 && expandedOriginal.size === 0) {
      const allIds = new Set<string>();
      const collectIds = (nodes: MenuTreeNode[]) => {
        for (const n of nodes) {
          if (n.children.length > 0) {
            allIds.add(n.id);
            collectIds(n.children);
          }
        }
      };
      collectIds(menuTree);
      setExpandedOriginal(allIds);
      setExpandedPreview(new Set(allIds));
    }
  }, [menuTree]);

  // ── Toggle expand/collapse (Original tree) ─────────────────────────
  const toggleExpandOriginal = useCallback((nodeId: string) => {
    setExpandedOriginal((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  // ── Toggle expand/collapse (Preview tree) ──────────────────────────
  const toggleExpandPreview = useCallback((nodeId: string) => {
    setExpandedPreview((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
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
    collect(menuTree);
    setExpandedOriginal(allIds);
    setExpandedPreview(new Set(allIds));
  }, [menuTree]);

  const collapseAll = useCallback(() => {
    setExpandedOriginal(new Set());
    setExpandedPreview(new Set());
  }, []);

  // ── Flat menu items (for parent picker, excluding self and descendants) ──
  const flatMenuItems = useMemo(() => {
    const items: FlatMenuItem[] = [];
    const flatten = (nodes: MenuTreeNode[], depth: number, parentId?: string) => {
      for (const n of nodes) {
        items.push({
          id: n.id,
          nameEn: n.nameEn,
          nameAr: n.nameAr,
          depth,
          parentId,
        });
        if (n.children.length > 0) {
          flatten(n.children, depth + 1, n.id);
        }
      }
    };
    flatten(menuTree, 0);
    return items;
  }, [menuTree]);

  // ── Find node by ID (recursive) ─────────────────────────────────────
  const findNode = useCallback(
    (id: string, nodes: MenuTreeNode[] = menuTree): MenuTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNode(id, node.children);
        if (found) return found;
      }
      return null;
    },
    [menuTree]
  );

  // ── Selected node ──────────────────────────────────────────────────
  const selectedNode = useMemo(() => {
    if (!selectedItemId) return null;
    return findNode(selectedItemId);
  }, [selectedItemId, findNode]);

  // ── Get override for selected node + current scope ─────────────────
  const selectedOverride = useMemo((): MenuItemOverrideInfo | null => {
    if (!selectedNode) return null;
    if (scope === MenuOverrideScope.User) return selectedNode.userOverride ?? null;
    if (scope === MenuOverrideScope.Tenant) return selectedNode.tenantOverride ?? null;
    return null;
  }, [selectedNode, scope]);

  // ── Form data for the edit panel ────────────────────────────────────
  const formData = useMemo((): OverrideFormData | null => {
    if (!selectedNode) return null;
    const ovr = selectedOverride;
    return {
      nameEn: ovr?.nameEnOverride ?? "",
      nameAr: ovr?.nameArOverride ?? "",
      orderOverride: ovr?.orderOverride ?? null,
      parentMenuItemIdOverride: ovr?.parentMenuItemIdOverride ?? null,
      isHidden: ovr?.isHidden ?? false,
    };
  }, [selectedNode, selectedOverride]);

  // ── Get descendant IDs (to exclude from parent picker) ──────────────
  const getDescendantIds = useCallback(
    (nodeId: string): Set<string> => {
      const ids = new Set<string>();
      const collect = (nodes: MenuTreeNode[]) => {
        for (const n of nodes) {
          if (n.id === nodeId) {
            const addAll = (children: MenuTreeNode[]) => {
              for (const c of children) {
                ids.add(c.id);
                addAll(c.children);
              }
            };
            addAll(n.children);
            return;
          }
          collect(n.children);
        }
      };
      collect(menuTree);
      return ids;
    },
    [menuTree]
  );

  // ── Parent picker options (excluding self + descendants) ────────────
  const parentOptions = useMemo(() => {
    if (!selectedItemId) return [];
    const excludeIds = getDescendantIds(selectedItemId);
    excludeIds.add(selectedItemId);
    return flatMenuItems.filter((item) => !excludeIds.has(item.id));
  }, [selectedItemId, flatMenuItems, getDescendantIds]);

  // ── Save override mutation ──────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (request: SaveMenuOverrideRequest) => menuRepository.saveOverride(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus", "tree"] });
      refreshNavigation();
      const scopeLabel =
        scope === MenuOverrideScope.User
          ? t("menus.overrideSavedUser")
          : t("menus.overrideSavedTenant");
      success({ title: scopeLabel });
    },
    onError: (err: any) => {
      toastError({ title: err?.message ?? t("common.error") });
    },
  });

  const saveOverride = useCallback(
    (data: OverrideFormData) => {
      if (!selectedItemId) return;
      const request: SaveMenuOverrideRequest = {
        menuItemId: selectedItemId,
        scope,
        nameEnOverride: data.nameEn || undefined,
        nameArOverride: data.nameAr || undefined,
        orderOverride: data.orderOverride ?? undefined,
        parentMenuItemIdOverride: data.parentMenuItemIdOverride ?? undefined,
        isHidden: data.isHidden,
      };
      saveMutation.mutate(request);
    },
    [selectedItemId, scope, saveMutation]
  );

  // ── Delete override mutation ────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (overrideId: string) => menuRepository.deleteOverride(overrideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus", "tree"] });
      refreshNavigation();
      success({ title: t("menus.overrideRemoved") || "Override removed" });
    },
    onError: (err: any) => {
      toastError({ title: err?.message ?? t("common.error") });
    },
  });

  const removeOverride = useCallback(
    (overrideId: string) => {
      deleteMutation.mutate(overrideId);
    },
    [deleteMutation]
  );

  // ── Active overrides list ───────────────────────────────────────────
  const activeOverrides = useMemo((): ActiveOverrideEntry[] => {
    const entries: ActiveOverrideEntry[] = [];
    const collect = (nodes: MenuTreeNode[]) => {
      for (const node of nodes) {
        const ovr = scope === MenuOverrideScope.User ? node.userOverride : node.tenantOverride;
        if (ovr) {
          const changes: string[] = [];
          if (ovr.nameEnOverride) changes.push(t("menus.badgeRenamed"));
          if (ovr.nameArOverride) changes.push(t("menus.badgeRenamed") + " (AR)");
          if (ovr.orderOverride != null) changes.push(t("menus.badgeReordered"));
          if (ovr.parentMenuItemIdOverride) changes.push(t("menus.badgeMoved"));
          if (ovr.isHidden) changes.push(t("menus.badgeHidden"));
          entries.push({
            overrideId: ovr.id,
            menuItemId: node.id,
            itemNameEn: node.nameEn,
            itemNameAr: node.nameAr,
            scope,
            changes,
            override: ovr,
          });
        }
        collect(node.children);
      }
    };
    collect(menuTree);
    return entries;
  }, [menuTree, scope, t]);

  // ── Select item ─────────────────────────────────────────────────────
  const selectItem = useCallback((nodeId: string) => {
    setSelectedItemId(nodeId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  // ── Reset all overrides ─────────────────────────────────────────────
  const [isResettingAll, setIsResettingAll] = useState(false);
  const resetAllOverrides = useCallback(async () => {
    if (activeOverrides.length === 0) return;
    setIsResettingAll(true);
    try {
      for (const entry of activeOverrides) {
        await menuRepository.deleteOverride(entry.overrideId);
      }
      queryClient.invalidateQueries({ queryKey: ["menus", "tree"] });
      refreshNavigation();
      success({ title: t("menus.allOverridesReset") || "All customizations removed" });
    } catch (err: any) {
      toastError({ title: err?.message ?? t("common.error") });
    } finally {
      setIsResettingAll(false);
    }
  }, [activeOverrides, menuRepository, queryClient, success, toastError, t]);

  // ── DnD State ─────────────────────────────────────────────────────────
  const [draggedNode, setDraggedNode] = useState<MenuTreeNode | null>(null);
  const [dropTarget, setDropTarget] = useState<CustomizeDropTarget | null>(null);

  /** Find siblings and parent for a node in the tree */
  const findSiblingsAndParent = useCallback(
    (
      nodeId: string,
      nodes: MenuTreeNode[] = menuTree,
      parentId?: string
    ): { siblings: MenuTreeNode[]; parentId?: string } | null => {
      for (const node of nodes) {
        if (node.id === nodeId) return { siblings: nodes, parentId };
        const found = findSiblingsAndParent(nodeId, node.children, node.id);
        if (found) return found;
      }
      return null;
    },
    [menuTree]
  );

  const handleDragStart = useCallback((node: MenuTreeNode) => {
    setDraggedNode(node);
    // Collapse dragged node's children
    setExpandedPreview((prev) => {
      const next = new Set(prev);
      next.delete(node.id);
      return next;
    });
  }, []);

  const handleDragOver = useCallback(
    (nodeId: string, position: CustomizeDropPosition) => {
      if (!draggedNode) return;
      if (draggedNode.id === nodeId) {
        setDropTarget(null);
        return;
      }
      // Prevent dropping parent into its own children
      const descendants = getDescendantIds(draggedNode.id);
      if (descendants.has(nodeId)) {
        setDropTarget(null);
        return;
      }
      setDropTarget({ nodeId, position });
    },
    [draggedNode, getDescendantIds]
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
    setDropTarget(null);
  }, []);

  /**
   * DnD Drop handler for the customize page.
   * Uses the EFFECTIVE tree (what the user sees) for sibling/parent lookups.
   * Saves order+parent overrides for the dragged item.
   */
  const handleDrop = useCallback(
    async (targetNodeId: string, position: CustomizeDropPosition) => {
      if (!draggedNode) return;

      // --- Search the EFFECTIVE tree (what user sees), not the base tree ---
      type AnyNode = { id: string; order: number; children: AnyNode[] };
      const findInTree = (id: string, nodes: AnyNode[]): AnyNode | null => {
        for (const n of nodes) {
          if (n.id === id) return n;
          const found = findInTree(id, n.children);
          if (found) return found;
        }
        return null;
      };
      const findSiblingsInTree = (
        id: string,
        nodes: AnyNode[],
        parentId?: string
      ): { siblings: AnyNode[]; parentId?: string } | null => {
        for (const n of nodes) {
          if (n.id === id) return { siblings: nodes, parentId };
          const found = findSiblingsInTree(id, n.children, n.id);
          if (found) return found;
        }
        return null;
      };
      const collectDescendants = (id: string, nodes: AnyNode[]): Set<string> => {
        const ids = new Set<string>();
        const walk = (list: AnyNode[]) => {
          for (const n of list) {
            if (n.id === id) {
              const addAll = (ch: AnyNode[]) => {
                for (const c of ch) {
                  ids.add(c.id);
                  addAll(c.children);
                }
              };
              addAll(n.children);
              return;
            }
            walk(n.children);
          }
        };
        walk(nodes);
        return ids;
      };

      const targetNode = findInTree(targetNodeId, effectiveTree);
      if (!targetNode) {
        handleDragEnd();
        return;
      }

      // Prevent drop on self or descendants
      if (draggedNode.id === targetNodeId) {
        handleDragEnd();
        return;
      }
      const descendants = collectDescendants(draggedNode.id, effectiveTree);
      if (descendants.has(targetNodeId)) {
        handleDragEnd();
        return;
      }

      let newParentId: string | undefined;
      let newOrder: number;

      if (position === "inside") {
        // Move inside targetNode as last child
        newParentId = targetNodeId;
        newOrder = targetNode.children.length + 1;
        // Auto-expand
        setExpandedPreview((prev) => new Set([...prev, targetNodeId]));
      } else {
        // Move before/after targetNode — same parent as target (in effective tree)
        const targetResult = findSiblingsInTree(targetNodeId, effectiveTree);
        if (!targetResult) {
          handleDragEnd();
          return;
        }

        newParentId = targetResult.parentId;
        const siblings = [...targetResult.siblings]
          .sort((a, b) => a.order - b.order)
          .filter((n) => n.id !== draggedNode.id);
        const targetIdx = siblings.findIndex((n) => n.id === targetNodeId);
        const insertAt = position === "before" ? targetIdx : targetIdx + 1;

        // Calculate order: midpoint between neighbors or offset
        if (insertAt === 0) {
          newOrder = siblings.length > 0 ? siblings[0].order - 1 : 1;
        } else if (insertAt >= siblings.length) {
          newOrder = siblings[siblings.length - 1].order + 1;
        } else {
          // Midpoint between the two neighbors
          newOrder = Math.floor((siblings[insertAt - 1].order + siblings[insertAt].order) / 2);
          // If collision, just use insertAt + 1
          if (newOrder === siblings[insertAt - 1].order) newOrder = insertAt + 1;
        }
      }

      // Build and fire override save
      const request: SaveMenuOverrideRequest = {
        menuItemId: draggedNode.id,
        scope,
        orderOverride: newOrder,
        // Use empty string '' to signal 'move to root (no parent)'
        // vs undefined which means 'don't override parent'
        parentMenuItemIdOverride: newParentId ?? "",
        isHidden: false,
      };

      try {
        await saveMutation.mutateAsync(request);
        // Also select the dropped item
        setSelectedItemId(draggedNode.id);
      } catch {
        // Error handled by mutation onError
      }

      handleDragEnd();
    },
    [draggedNode, effectiveTree, scope, saveMutation, handleDragEnd]
  );

  /** Drop at root level — save override with no parent */
  const handleDropAtRoot = useCallback(async () => {
    if (!draggedNode) return;
    const rootItems = menuTree.filter((n) => n.id !== draggedNode.id);
    const newOrder = rootItems.length > 0 ? Math.max(...rootItems.map((n) => n.order)) + 1 : 1;

    const request: SaveMenuOverrideRequest = {
      menuItemId: draggedNode.id,
      scope,
      orderOverride: newOrder,
      // Empty string signals 'move to root (no parent)'
      parentMenuItemIdOverride: "",
      isHidden: false,
    };

    try {
      await saveMutation.mutateAsync(request);
      setSelectedItemId(draggedNode.id);
    } catch {
      // handled by mutation onError
    }

    handleDragEnd();
  }, [draggedNode, menuTree, scope, saveMutation, handleDragEnd]);

  return {
    // State
    scope,
    setScope,
    availableScopes,
    selectedItemId,
    selectedNode,
    selectedOverride,
    formData,
    menuTree,
    effectiveTree,
    isLoading,
    language,

    // Tree controls — Original
    expandedOriginal,
    toggleExpandOriginal,
    // Tree controls — Preview
    expandedPreview,
    toggleExpandPreview,
    // Tree controls — Both
    expandAll,
    collapseAll,

    // Actions
    selectItem,
    clearSelection,
    saveOverride,
    removeOverride,
    resetAllOverrides,
    refetch,

    // DnD (used by Preview tree)
    draggedNode,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleDropAtRoot,

    // Derived data
    flatMenuItems,
    parentOptions,
    activeOverrides,

    // Loading states
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isResettingAll,

    // Permissions
    canCustomize,
    canCustomizeTenant,
  };
}
