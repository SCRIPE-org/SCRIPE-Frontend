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

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemContainer } from '@modules/system/di';
import { MenuOverrideScope, type SaveMenuOverrideRequest } from '../../domain/entities/MenuItemRequests';
import type { MenuTreeNode } from '../../domain/entities/MenuItem';
import { useEnhancedToast } from '@core/hooks/use-enhanced-toast';
import { useI18n } from '@core/providers/i18n-provider';

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

      // Actions
      saveRename: (nameEn: string, nameAr: string) => void;
      toggleHideItem: (node: MenuTreeNode) => void;
      isSaving: boolean;
}

export function useMenuOverrideViewModel(): UseMenuOverrideViewModelResult {
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { menuRepository } = systemContainer;
      const { t } = useI18n();

      // ── State ──────────────────────────────────────────────────────────
      const [overrideDialog, setOverrideDialog] = useState<OverrideDialogState>({
            open: false,
            node: null,
            mode: null,
      });
      const [scope, setScope] = useState<MenuOverrideScope>(MenuOverrideScope.User);

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
                  success({ title: t('menus.overrideSaved') });
                  setOverrideDialog({ open: false, node: null, mode: null });
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
      }, []);

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

      // ── Toggle Hide ────────────────────────────────────────────────────
      const toggleHideItem = useCallback(
            (node: MenuTreeNode) => {
                  const request = buildRequest(node.id, { isHidden: true });
                  saveMutation.mutate(request);
            },
            [buildRequest, saveMutation]
      );

      return {
            overrideDialog,
            openRenameDialog,
            closeOverrideDialog,
            scope,
            setScope,
            saveRename,
            toggleHideItem,
            isSaving: saveMutation.isPending,
      };
}
