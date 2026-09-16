/**
 * Menu Override ViewModel
 *
 * Handles saving and deleting menu overrides (customize, hide).
 * Coordinates user- and tenant-scoped customizations across navigation structures.
 *
 * Supports override dimensions:
 *   - NameEnOverride / NameArOverride (localized display names)
 *   - OrderOverride (sequence ordering)
 *   - ParentMenuItemIdOverride (hierarchical reparenting)
 *   - IsHidden (navigation visibility)
 */
"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@core/providers/navigation-provider";
import { customizationContainer } from "@modules/customization/di";
import {
  MenuOverrideScope,
  type SaveMenuOverrideRequest,
} from "../../domain/entities/MenuItemRequests";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { hasPermission, SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import {
  type OverrideDialogState,
  type OverrideFormData,
  type FlattenedMenuItem,
  type UseMenuOverrideViewModelResult,
  flattenMenuTree,
  buildMenuOverrideRequest,
} from "../types/menuOverrideTypes";

// Re-export contract interfaces for external consumers
export type {
  OverrideDialogState,
  OverrideFormData,
  FlattenedMenuItem,
  UseMenuOverrideViewModelResult,
};

/**
 * React hook/ViewModel orchestrating state and data flows for menu override operations.
 * Coordinates TanStack Query mutations, local dialog state, permissions, and navigation refreshes.
 *
 * @returns Dialog states, available scopes, and mutation triggers for menu overrides.
 */
export function useMenuOverrideViewModel(): UseMenuOverrideViewModelResult {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { menuRepository } = customizationContainer;
  const { t } = useI18n();
  const { refreshNavigation } = useNavigation();

  const permissions = useAppStore((s) => s.permissions);
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const isSuperAdmin = useMemo(() => permissions.includes("*"), [permissions]);

  // Available Scopes (permission and tenant context gated)
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

  // Dialog & Active Scope State
  const [overrideDialog, setOverrideDialog] = useState<OverrideDialogState>({
    open: false,
    node: null,
    mode: null,
  });
  const [scope, setScope] = useState<MenuOverrideScope>(
    availableScopes[0] ?? MenuOverrideScope.User
  );

  // Keep a ref to the current dialog node to avoid stale closures in callbacks
  const dialogNodeRef = useRef<MenuTreeNode | null>(null);
  useEffect(() => {
    dialogNodeRef.current = overrideDialog.node;
  }, [overrideDialog.node]);

  // Flat menu items for parent selector picker
  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);
  const flatMenuItems = useMemo(() => flattenMenuTree(menuTree), [menuTree]);

  // Save Override Mutation
  const saveMutation = useMutation({
    mutationFn: (request: SaveMenuOverrideRequest) => menuRepository.saveOverride(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      refreshNavigation();
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

  // Delete Override Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuRepository.deleteOverride(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      refreshNavigation();
      success({ title: t("menus.overrideDeleted") });
    },
    onError: () => {
      toastError({ title: t("common.error") });
    },
  });

  // Dialog Controls
  const openCustomizeDialog = useCallback((node: MenuTreeNode) => {
    setOverrideDialog({ open: true, node, mode: "customize" });
  }, []);

  const openRenameDialog = openCustomizeDialog;

  const closeOverrideDialog = useCallback(() => {
    setOverrideDialog({ open: false, node: null, mode: null });
    setScope(availableScopes[0] ?? MenuOverrideScope.User);
  }, [availableScopes]);

  // Save Override
  const saveOverride = useCallback(
    (data: OverrideFormData) => {
      const node = dialogNodeRef.current;
      if (!node) return;
      const request = buildMenuOverrideRequest(node.id, scope, {
        nameEnOverride: data.nameEn || undefined,
        nameArOverride: data.nameAr || undefined,
        orderOverride: data.orderOverride,
        parentMenuItemIdOverride: data.parentMenuItemIdOverride || undefined,
        isHidden: data.isHidden,
      });
      saveMutation.mutate(request);
    },
    [scope, saveMutation]
  );

  // Legacy Save Rename
  const saveRename = useCallback(
    (nameEn: string, nameAr: string) => {
      saveOverride({ nameEn, nameAr, isHidden: false });
    },
    [saveOverride]
  );

  // Authorization check for removing overrides
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

  // Quick Hide
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

  // Delete Confirmation State
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
