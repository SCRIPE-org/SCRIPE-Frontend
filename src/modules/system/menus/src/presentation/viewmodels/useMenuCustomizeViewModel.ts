/**
 * Menu Customize ViewModel (Orchestrator)
 *
 * Manages the dedicated customization page state:
 * - Fetches menu tree and computes effective (overridden) tree
 * - Manages selected item, scope, and inline editing
 * - Handles save/delete mutations for overrides
 * - Provides active overrides list
 */
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@core/providers/i18n-provider';
import { usePermissions } from '@core/hooks/use-permissions';
import { useEnhancedToast } from '@core/hooks/use-enhanced-toast';
import { SYSTEM_PERMISSIONS } from '@core/common/types/permissions';
import type { MenuTreeNode, MenuItemOverrideInfo } from '../../domain/entities/MenuItem';
import {
      MenuOverrideScope,
      type SaveMenuOverrideRequest,
} from '../../domain/entities/MenuItemRequests';
import { systemContainer } from '@modules/system/di';

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

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useMenuCustomizeViewModel() {
      const queryClient = useQueryClient();
      const { menuRepository } = systemContainer;
      const { t, language } = useI18n();
      const { hasPermission } = usePermissions();
      const { success, error: toastError } = useEnhancedToast();

      // ── Permissions ─────────────────────────────────────────────────────
      const canCustomize = hasPermission(SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE);
      const canCustomizeTenant = hasPermission(SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE_TENANT);

      // ── Scope management ────────────────────────────────────────────────
      const availableScopes = useMemo(() => {
            const scopes: MenuOverrideScope[] = [];
            if (canCustomize) scopes.push(MenuOverrideScope.User);
            if (canCustomizeTenant) scopes.push(MenuOverrideScope.Tenant);
            return scopes;
      }, [canCustomize, canCustomizeTenant]);

      const [scope, setScope] = useState<MenuOverrideScope>(
            canCustomizeTenant ? MenuOverrideScope.Tenant : MenuOverrideScope.User
      );

      // ── Selected item ───────────────────────────────────────────────────
      const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

      // ── Expanded nodes (for the preview tree) ───────────────────────────
      const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

      // ── Query: Full menu tree ───────────────────────────────────────────
      const {
            data: menuTree = [],
            isLoading,
            refetch,
      } = useQuery({
            queryKey: ['menus', 'tree'],
            queryFn: () => menuRepository.getAll(),
      });

      // Auto-expand all on first load
      useEffect(() => {
            if (menuTree.length > 0 && expandedNodes.size === 0) {
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
                  setExpandedNodes(allIds);
            }
      }, [menuTree]);

      // ── Toggle expand/collapse ──────────────────────────────────────────
      const toggleExpand = useCallback((nodeId: string) => {
            setExpandedNodes(prev => {
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
            setExpandedNodes(allIds);
      }, [menuTree]);

      const collapseAll = useCallback(() => {
            setExpandedNodes(new Set());
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
      const findNode = useCallback((id: string, nodes: MenuTreeNode[] = menuTree): MenuTreeNode | null => {
            for (const node of nodes) {
                  if (node.id === id) return node;
                  const found = findNode(id, node.children);
                  if (found) return found;
            }
            return null;
      }, [menuTree]);

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
                  nameEn: ovr?.nameEnOverride ?? '',
                  nameAr: ovr?.nameArOverride ?? '',
                  orderOverride: ovr?.orderOverride ?? null,
                  parentMenuItemIdOverride: ovr?.parentMenuItemIdOverride ?? null,
                  isHidden: ovr?.isHidden ?? false,
            };
      }, [selectedNode, selectedOverride]);

      // ── Get descendant IDs (to exclude from parent picker) ──────────────
      const getDescendantIds = useCallback((nodeId: string): Set<string> => {
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
      }, [menuTree]);

      // ── Parent picker options (excluding self + descendants) ────────────
      const parentOptions = useMemo(() => {
            if (!selectedItemId) return [];
            const excludeIds = getDescendantIds(selectedItemId);
            excludeIds.add(selectedItemId);
            return flatMenuItems.filter(item => !excludeIds.has(item.id));
      }, [selectedItemId, flatMenuItems, getDescendantIds]);

      // ── Save override mutation ──────────────────────────────────────────
      const saveMutation = useMutation({
            mutationFn: (request: SaveMenuOverrideRequest) => menuRepository.saveOverride(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['menus', 'tree'] });
                  const scopeLabel = scope === MenuOverrideScope.User
                        ? t('menus.overrideSavedUser')
                        : t('menus.overrideSavedTenant');
                  success({ title: scopeLabel });
            },
            onError: (err: any) => {
                  toastError({ title: err?.message ?? t('common.error') });
            },
      });

      const saveOverride = useCallback((data: OverrideFormData) => {
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
      }, [selectedItemId, scope, saveMutation]);

      // ── Delete override mutation ────────────────────────────────────────
      const deleteMutation = useMutation({
            mutationFn: (overrideId: string) => menuRepository.deleteOverride(overrideId),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['menus', 'tree'] });
                  success({ title: t('menus.overrideRemoved') || 'Override removed' });
            },
            onError: (err: any) => {
                  toastError({ title: err?.message ?? t('common.error') });
            },
      });

      const removeOverride = useCallback((overrideId: string) => {
            deleteMutation.mutate(overrideId);
      }, [deleteMutation]);

      // ── Active overrides list ───────────────────────────────────────────
      const activeOverrides = useMemo((): ActiveOverrideEntry[] => {
            const entries: ActiveOverrideEntry[] = [];
            const collect = (nodes: MenuTreeNode[]) => {
                  for (const node of nodes) {
                        const ovr = scope === MenuOverrideScope.User
                              ? node.userOverride
                              : node.tenantOverride;
                        if (ovr) {
                              const changes: string[] = [];
                              if (ovr.nameEnOverride) changes.push(t('menus.badgeRenamed'));
                              if (ovr.nameArOverride) changes.push(t('menus.badgeRenamed') + ' (AR)');
                              if (ovr.orderOverride != null) changes.push(t('menus.badgeReordered'));
                              if (ovr.parentMenuItemIdOverride) changes.push(t('menus.badgeMoved'));
                              if (ovr.isHidden) changes.push(t('menus.badgeHidden'));
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
                  queryClient.invalidateQueries({ queryKey: ['menus', 'tree'] });
                  success({ title: t('menus.allOverridesReset') || 'All customizations removed' });
            } catch (err: any) {
                  toastError({ title: err?.message ?? t('common.error') });
            } finally {
                  setIsResettingAll(false);
            }
      }, [activeOverrides, menuRepository, queryClient, success, toastError, t]);

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
            isLoading,
            language,

            // Tree controls
            expandedNodes,
            toggleExpand,
            expandAll,
            collapseAll,

            // Actions
            selectItem,
            clearSelection,
            saveOverride,
            removeOverride,
            resetAllOverrides,
            refetch,

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
