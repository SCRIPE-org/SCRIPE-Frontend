/**
 * Menu Override ViewModel
 *
 * Handles saving and deleting menu overrides (rename, hide, reorder).
 * Follows SOLID pattern — one concern: override operations.
 *
 * The backend auto-populates adminId/tenantId from the JWT token,
 * so the frontend only sends scope + override fields.
 */
'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@core/providers/navigation-provider';
import { systemContainer } from '@modules/system/di';
import { MenuOverrideScope, type SaveMenuOverrideRequest } from '../../domain/entities/MenuItemRequests';
import type { MenuTreeNode } from '../../domain/entities/MenuItem';
import { useEnhancedToast } from '@core/hooks/use-enhanced-toast';
import { useI18n } from '@core/providers/i18n-provider';
import { useAppStore } from '@core/store/useAppStore';
import { hasPermission, SYSTEM_PERMISSIONS } from '@core/common/types/permissions';

export interface OverrideDialogState {
      open: boolean;
      node: MenuTreeNode | null;
      mode: 'rename' | 'hide' | null;
}

export interface UseMenuOverrideViewModelResult {
      // Dialog state
      overrideDialog: OverrideDialogState;
      openRenameDialog: (node: MenuTreeNode) => void;
      closeOverrideDialog: () => void;

      // Scope
      scope: MenuOverrideScope;
      setScope: (scope: MenuOverrideScope) => void;
      availableScopes: MenuOverrideScope[];

      // Actions
      saveRename: (nameEn: string, nameAr: string) => void;
      toggleHideItem: (node: MenuTreeNode) => void;
      confirmDeleteOverride: (overrideId: string) => void;
      onDeleteOverrideConfirm: () => void;
      closeDeleteOverrideDialog: () => void;
      deleteConfirmOpen: boolean;
      canRemoveOverride: (override: { scope: string }) => boolean;
      isSaving: boolean;
      isDeleting: boolean;
}

export function useMenuOverrideViewModel(): UseMenuOverrideViewModelResult {
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { menuRepository } = systemContainer;
      const { t } = useI18n();
      const { refreshNavigation } = useNavigation();


      const permissions = useAppStore((s) => s.permissions);
      const userTenantId = useAppStore((s) => s.user?.tenantId);
      const isSuperAdmin = useMemo(
            () => permissions.includes('*'),
            [permissions]
      );

      // ── Available Scopes (permission + tenant gated, 2-scope model) ────
      // Rule: Tenant scope requires BOTH the permission AND a non-null tenantId.
      // Super admins (no tenant) can only have personal overrides — they
      // edit the base menu directly to affect everyone.
      const availableScopes = useMemo(() => {
            const scopes: MenuOverrideScope[] = [];

            if (isSuperAdmin) {
                  // Super admin: personal only (edit base menu for org-wide changes)
                  scopes.push(MenuOverrideScope.User);
                  return scopes;
            }

            // Regular/tenant admin: check permissions
            if (hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE)) {
                  scopes.push(MenuOverrideScope.User);
            }
            // Tenant scope requires BOTH the permission AND an actual tenant
            if (
                  userTenantId &&
                  hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE_TENANT)
            ) {
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

      // ── Helpers ────────────────────────────────────────────────────────
      const buildRequest = useCallback(
            (
                  menuItemId: string,
                  overrides: Partial<SaveMenuOverrideRequest>
            ): SaveMenuOverrideRequest => ({
                  menuItemId,
                  scope,
                  isHidden: false,
                  ...overrides,
            }),
            [scope]
      );

      // ── Save Override Mutation ─────────────────────────────────────────
      const saveMutation = useMutation({
            mutationFn: (request: SaveMenuOverrideRequest) =>
                  menuRepository.saveOverride(request),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['menus'] });
                  // Refresh sidebar navigation so overrides appear immediately
                  refreshNavigation(true, true);
                  success({ title: t('menus.overrideSaved') });
                  setOverrideDialog({ open: false, node: null, mode: null });
                  setScope(availableScopes[0] ?? MenuOverrideScope.User);
            },
            onError: () => {
                  toastError({ title: t('common.error') });
            },
      });

      // ── Delete Override Mutation ─────────────────────────────────────────
      const deleteMutation = useMutation({
            mutationFn: (id: string) => menuRepository.deleteOverride(id),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['menus'] });
                  // Refresh sidebar navigation so removal of override appears immediately
                  refreshNavigation(true, true);
                  success({ title: t('menus.overrideDeleted') });
            },
            onError: () => {
                  toastError({ title: t('common.error') });
            },
      });

      // ── Dialog Actions ─────────────────────────────────────────────────
      const openRenameDialog = useCallback((node: MenuTreeNode) => {
            setOverrideDialog({ open: true, node, mode: 'rename' });
      }, []);

      const closeOverrideDialog = useCallback(() => {
            setOverrideDialog({ open: false, node: null, mode: null });
            // Reset scope to default (Personal) so stale Tenant selection
            // doesn't carry over to next dialog open or hide action
            setScope(availableScopes[0] ?? MenuOverrideScope.User);
      }, [availableScopes]);

      // ── Save Rename (reads ref to avoid stale closure) ─────────────────
      const saveRename = useCallback(
            (nameEn: string, nameAr: string) => {
                  const node = dialogNodeRef.current;
                  if (!node) return;
                  const request = buildRequest(node.id, {
                        nameEnOverride: nameEn,
                        nameArOverride: nameAr,
                  });
                  saveMutation.mutate(request);
            },
            [buildRequest, saveMutation]
      );

      // ── Permission check for removing overrides ─────────────────────────
      //    Only show "Remove Override" button when the user has the right
      //    permission for that override's scope. Prevents showing buttons
      //    that would result in a 403 from the backend.
      const canRemoveOverride = useCallback(
            (override: { scope: string }) => {
                  if (isSuperAdmin) return true;
                  if (override.scope === 'User') {
                        return hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE);
                  }
                  if (override.scope === 'Tenant') {
                        return hasPermission(permissions, SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE_TENANT);
                  }
                  return false;
            },
            [permissions, isSuperAdmin]
      );

      // ── Hide Item ──────────────────────────────────────────────────────
      //    SAFETY: Always uses User (personal) scope so a quick-hide never
      //    accidentally affects the entire organization.
      //    To UNHIDE: use deleteOverride to remove the hiding override.
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

      // ── Delete Override (with confirmation) ───────────────────────────────
      const [deleteConfirmOverrideId, setDeleteConfirmOverrideId] = useState<string | null>(null);

      /** Open the confirmation dialog — stores the override ID to delete */
      const confirmDeleteOverride = useCallback(
            (overrideId: string) => {
                  setDeleteConfirmOverrideId(overrideId);
            },
            []
      );

      /** Actually delete after user confirms */
      const onDeleteOverrideConfirm = useCallback(() => {
            if (!deleteConfirmOverrideId) return;
            deleteMutation.mutate(deleteConfirmOverrideId, {
                  onSettled: () => setDeleteConfirmOverrideId(null),
            });
      }, [deleteConfirmOverrideId, deleteMutation]);

      /** Close the confirmation dialog without deleting */
      const closeDeleteOverrideDialog = useCallback(() => {
            setDeleteConfirmOverrideId(null);
      }, []);

      return {
            overrideDialog,
            openRenameDialog,
            closeOverrideDialog,
            scope,
            setScope,
            availableScopes,

            saveRename,
            toggleHideItem,
            confirmDeleteOverride,
            onDeleteOverrideConfirm,
            closeDeleteOverrideDialog,
            deleteConfirmOpen: deleteConfirmOverrideId !== null,
            canRemoveOverride,
            isSaving: saveMutation.isPending,
            isDeleting: deleteMutation.isPending,
      };
}
