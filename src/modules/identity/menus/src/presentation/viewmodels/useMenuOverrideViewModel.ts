/**
 * Menu Override ViewModel
 *
 * Handles saving and deleting menu overrides (customize, hide).
 * Follows SOLID pattern — one concern: override operations.
 *
 * The backend auto-populates adminId/tenantId from the JWT token,
 * so the frontend only sends scope + override fields.
 *
 * Supports all 5 override types:
 *   - NameEnOverride / NameArOverride (display name)
 *   - OrderOverride (display order)
 *   - ParentMenuItemIdOverride (reparenting)
 *   - IsHidden (visibility)
 */
"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@core/providers/navigation-provider";
import { systemContainer } from "@/modules/identity/di";
import {
  MenuOverrideScope,
  type SaveMenuOverrideRequest,
} from "../../domain/entities/MenuItemRequests";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { hasPermission, SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

export interface OverrideDialogState {
  open: boolean;
  node: MenuTreeNode | null;
  mode: "customize" | "hide" | null;
}

/** Data shape from the customize dialog form */
export interface OverrideFormData {
  nameEn?: string;
  nameAr?: string;
  orderOverride?: number;
  parentMenuItemIdOverride?: string;
  isHidden: boolean;
}

export interface UseMenuOverrideViewModelResult {
  // Dialog state
  overrideDialog: OverrideDialogState;
  openCustomizeDialog: (node: MenuTreeNode) => void;
  closeOverrideDialog: () => void;

  // Scope
  scope: MenuOverrideScope;
  setScope: (scope: MenuOverrideScope) => void;
  availableScopes: MenuOverrideScope[];

  // Actions
  saveOverride: (data: OverrideFormData) => void;
  toggleHideItem: (node: MenuTreeNode) => void;
  confirmDeleteOverride: (overrideId: string) => void;
  onDeleteOverrideConfirm: () => void;
  closeDeleteOverrideDialog: () => void;
  deleteConfirmOpen: boolean;
  canRemoveOverride: (override: { scope: string }) => boolean;
  isSaving: boolean;
  isDeleting: boolean;

  // Flat menu items for parent picker
  flatMenuItems: Array<{ id: string; nameEn: string; nameAr: string; depth: number }>;
  setMenuTree: (tree: MenuTreeNode[]) => void;

  // Legacy compat - keep openRenameDialog as alias
  openRenameDialog: (node: MenuTreeNode) => void;
  saveRename: (nameEn: string, nameAr: string) => void;
}

export function useMenuOverrideViewModel(): UseMenuOverrideViewModelResult {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { menuRepository } = systemContainer;
  const { t } = useI18n();
  const { refreshNavigation } = useNavigation();

  const permissions = useAppStore((s) => s.permissions);
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const isSuperAdmin = useMemo(() => permissions.includes("*"), [permissions]);

  // ── Available Scopes (permission + tenant gated, 2-scope model) ────
  const availableScopes = useMemo(() => {
    const scopes: MenuOverrideScope[] = [];

    if (isSuperAdmin) {
      scopes.push(MenuOverrideScope.User);
      return scopes;
    }

    if (hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE)) {
      scopes.push(MenuOverrideScope.User);
    }
    if (userTenantId && hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE_TENANT)) {
      scopes.push(MenuOverrideScope.Tenant);
    }

    return scopes;
  }, [permissions, isSuperAdmin, userTenantId]);

  // ── State ──────────────────────────────────────────────────────────
  const [overrideDialog, setOverrideDialog] = useState<OverrideDialogState>({
    open: false,
    node: null,
    mode: null,
  });
  const [scope, setScope] = useState<MenuOverrideScope>(
    availableScopes[0] ?? MenuOverrideScope.User
  );

  // Keep a ref to the current dialog node to avoid stale closures
  const dialogNodeRef = useRef<MenuTreeNode | null>(null);
  dialogNodeRef.current = overrideDialog.node;

  // ── Flat menu items for parent picker ──────────────────────────────
  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);

  const flatMenuItems = useMemo(() => {
    const items: Array<{ id: string; nameEn: string; nameAr: string; depth: number }> = [];
    const flatten = (nodes: MenuTreeNode[], depth: number) => {
      for (const node of nodes.sort((a, b) => a.order - b.order)) {
        items.push({ id: node.id, nameEn: node.nameEn, nameAr: node.nameAr, depth });
        if (node.children.length > 0) {
          flatten(node.children, depth + 1);
        }
      }
    };
    flatten(menuTree, 0);
    return items;
  }, [menuTree]);

  // ── Helpers ────────────────────────────────────────────────────────
  const buildRequest = useCallback(
    (menuItemId: string, overrides: Partial<SaveMenuOverrideRequest>): SaveMenuOverrideRequest => ({
      menuItemId,
      scope,
      isHidden: false,
      ...overrides,
    }),
    [scope]
  );

  // ── Save Override Mutation ─────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (request: SaveMenuOverrideRequest) => menuRepository.saveOverride(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      refreshNavigation(true, true);
      const scopeLabel =
        scope === MenuOverrideScope.User
          ? t("menus.overrideSavedUser")
          : t("menus.overrideSavedTenant");
      success({ title: scopeLabel || t("menus.overrideSaved") });
      setOverrideDialog({ open: false, node: null, mode: null });
      setScope(availableScopes[0] ?? MenuOverrideScope.User);
    },
    onError: () => {
      toastError({ title: t("common.error") });
    },
  });

  // ── Delete Override Mutation ───────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuRepository.deleteOverride(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      refreshNavigation(true, true);
      success({ title: t("menus.overrideDeleted") });
    },
    onError: () => {
      toastError({ title: t("common.error") });
    },
  });

  // ── Dialog Actions ─────────────────────────────────────────────────
  const openCustomizeDialog = useCallback((node: MenuTreeNode) => {
    setOverrideDialog({ open: true, node, mode: "customize" });
  }, []);

  // Legacy alias (context menu still calls onRename)
  const openRenameDialog = openCustomizeDialog;

  const closeOverrideDialog = useCallback(() => {
    setOverrideDialog({ open: false, node: null, mode: null });
    setScope(availableScopes[0] ?? MenuOverrideScope.User);
  }, [availableScopes]);

  // ── Save Override (all fields) ─────────────────────────────────────
  const saveOverride = useCallback(
    (data: OverrideFormData) => {
      const node = dialogNodeRef.current;
      if (!node) return;
      const request = buildRequest(node.id, {
        nameEnOverride: data.nameEn || undefined,
        nameArOverride: data.nameAr || undefined,
        orderOverride: data.orderOverride,
        parentMenuItemIdOverride: data.parentMenuItemIdOverride || undefined,
        isHidden: data.isHidden,
      });
      saveMutation.mutate(request);
    },
    [buildRequest, saveMutation]
  );

  // ── Legacy: Save Rename (backwards compat) ─────────────────────────
  const saveRename = useCallback(
    (nameEn: string, nameAr: string) => {
      saveOverride({ nameEn, nameAr, isHidden: false });
    },
    [saveOverride]
  );

  // ── Permission check for removing overrides ───────────────────────
  const canRemoveOverride = useCallback(
    (override: { scope: string }) => {
      if (isSuperAdmin) return true;
      if (override.scope === "User") {
        return hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE);
      }
      if (override.scope === "Tenant") {
        return hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE_TENANT);
      }
      return false;
    },
    [permissions, isSuperAdmin]
  );

  // ── Hide Item ──────────────────────────────────────────────────────
  const toggleHideItem = useCallback(
    (node: MenuTreeNode) => {
      const request: SaveMenuOverrideRequest = {
        menuItemId: node.id,
        scope: MenuOverrideScope.User,
        isHidden: true,
      };
      saveMutation.mutate(request);
    },
    [saveMutation]
  );

  // ── Delete Override (with confirmation) ────────────────────────────
  const [deleteConfirmOverrideId, setDeleteConfirmOverrideId] = useState<string | null>(null);

  const confirmDeleteOverride = useCallback((overrideId: string) => {
    setDeleteConfirmOverrideId(overrideId);
  }, []);

  const onDeleteOverrideConfirm = useCallback(() => {
    if (!deleteConfirmOverrideId) return;
    deleteMutation.mutate(deleteConfirmOverrideId, {
      onSettled: () => setDeleteConfirmOverrideId(null),
    });
  }, [deleteConfirmOverrideId, deleteMutation]);

  const closeDeleteOverrideDialog = useCallback(() => {
    setDeleteConfirmOverrideId(null);
  }, []);

  return {
    overrideDialog,
    openCustomizeDialog,
    openRenameDialog,
    closeOverrideDialog,
    scope,
    setScope,
    availableScopes,

    saveOverride,
    saveRename,
    toggleHideItem,
    confirmDeleteOverride,
    onDeleteOverrideConfirm,
    closeDeleteOverrideDialog,
    deleteConfirmOpen: deleteConfirmOverrideId !== null,
    canRemoveOverride,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,

    flatMenuItems,
    setMenuTree,
  };
}
