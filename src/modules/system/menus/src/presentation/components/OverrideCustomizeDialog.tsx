/**
 * Override Customize Dialog
 *
 * Premium dialog for customizing menu items per scope.
 * Replaces the old OverrideRenameDialog with full support for:
 *   - Name overrides (English/Arabic)
 *   - Order override
 *   - Parent override (reparenting)
 *   - Visibility (show/hide)
 *   - Scope selection (Personal / Organization) via segmented tabs
 *
 * Pre-fills with existing override values from the node's embedded
 * userOverride/tenantOverride data for the selected scope.
 */
'use client';

import { useMemo, useCallback } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { GenericModal } from '@core/crud/components/generic-modal';
import { GenericForm, type FieldConfig } from '@core/ui/forms/generic-form';
import { MenuOverrideScope } from '../../domain/entities/MenuItemRequests';
import type { OverrideDialogState, OverrideFormData } from '../viewmodels/useMenuOverrideViewModel';
import type { MenuTreeNode } from '../../domain/entities/MenuItem';

interface OverrideCustomizeDialogProps {
      dialog: OverrideDialogState;
      scope: MenuOverrideScope;
      onScopeChange: (scope: MenuOverrideScope) => void;
      availableScopes: MenuOverrideScope[];
      onSave: (data: OverrideFormData) => void;
      onClose: () => void;
      isSaving: boolean;
      /** Flat list of all menu items for the parent picker */
      flatMenuItems: Array<{ id: string; nameEn: string; nameAr: string; depth: number }>;
}

/** Map enum values to human-friendly translation keys */
const SCOPE_LABEL_KEYS: Record<MenuOverrideScope, string> = {
      [MenuOverrideScope.User]: 'menus.scopePersonal',
      [MenuOverrideScope.Tenant]: 'menus.scopeOrganization',
};

export function OverrideCustomizeDialog({
      dialog,
      scope,
      onScopeChange,
      availableScopes,
      onSave,
      onClose,
      isSaving,
      flatMenuItems,
}: OverrideCustomizeDialogProps) {
      const { t, language } = useI18n();

      const isOpen = dialog.open && dialog.mode === 'customize';
      const node = dialog.node;

      // ── Get existing override for current scope from the node ────────────
      const existingOverride = useMemo(() => {
            if (!node) return null;
            return scope === MenuOverrideScope.User
                  ? node.userOverride ?? null
                  : node.tenantOverride ?? null;
      }, [node, scope]);

      // ── Build scope options ────────────────────────────────────────────
      const scopeOptions = useMemo(
            () =>
                  availableScopes.map((s) => ({
                        value: s,
                        label: t(SCOPE_LABEL_KEYS[s]),
                  })),
            [availableScopes, t]
      );

      // Defer scope change to avoid setState-in-render
      const deferredScopeChange = useCallback(
            (value: any) => {
                  queueMicrotask(() => onScopeChange(value as MenuOverrideScope));
            },
            [onScopeChange]
      );

      // ── Build parent options (exclude self and descendants) ─────────────
      const parentOptions = useMemo(() => {
            if (!node) return [];
            // Collect self + all descendant IDs to exclude
            const excludeIds = new Set<string>();
            const collectIds = (n: MenuTreeNode) => {
                  excludeIds.add(n.id);
                  n.children.forEach(collectIds);
            };
            collectIds(node);

            const rootOption = { value: '', label: `— ${t('menus.rootLevel')} —` };
            const items = flatMenuItems
                  .filter((item) => !excludeIds.has(item.id))
                  .map((item) => ({
                        value: item.id,
                        label: `${'─'.repeat(item.depth)} ${language === 'ar' ? item.nameAr : item.nameEn}`.trim(),
                  }));

            return [rootOption, ...items];
      }, [node, flatMenuItems, language, t]);

      // ── Define form fields ─────────────────────────────────────────────
      const hasSingleScope = availableScopes.length <= 1;

      const fields: FieldConfig[] = useMemo(
            () => [
                  // ── Scope selector ─────────────────────────────────────
                  hasSingleScope
                        ? {
                              name: 'scope',
                              label: t('menus.overrideScope'),
                              type: 'text' as const,
                              disabled: true,
                        }
                        : {
                              name: 'scope',
                              label: t('menus.overrideScope'),
                              type: 'select' as const,
                              options: scopeOptions,
                              required: true,
                              onChange: (value: any) => {
                                    deferredScopeChange(value);
                              },
                        },

                  // ── Display Name ───────────────────────────────────────
                  {
                        name: 'nameEn',
                        label: t('menus.nameEn'),
                        type: 'text' as const,
                        placeholder: node?.nameEn ?? '',
                  },
                  {
                        name: 'nameAr',
                        label: t('menus.nameAr'),
                        type: 'text' as const,
                        placeholder: node?.nameAr ?? '',
                  },

                  // ── Position ───────────────────────────────────────────
                  {
                        name: 'orderOverride',
                        label: t('menus.overrideOrder'),
                        type: 'number' as const,
                        placeholder: String(node?.order ?? 0),
                  },
                  {
                        name: 'parentMenuItemIdOverride',
                        label: t('menus.overrideParent'),
                        type: 'select' as const,
                        options: parentOptions,
                        placeholder: t('menus.keepCurrentParent'),
                  },

                  // ── Visibility ─────────────────────────────────────────
                  {
                        name: 'isHidden',
                        label: t('menus.hideItem'),
                        type: 'switch' as const,
                  },
            ],
            [t, scopeOptions, deferredScopeChange, hasSingleScope, node, parentOptions]
      );

      // ── Initial values ────────────────────────────────────────────────
      const initialValues = useMemo(
            () => ({
                  // Scope
                  scope: hasSingleScope
                        ? (scopeOptions.find((o) => o.value === scope)?.label ?? scope)
                        : scope,
                  // Names — use override if exists, otherwise empty (placeholder shows base)
                  nameEn: existingOverride?.nameEnOverride || '',
                  nameAr: existingOverride?.nameArOverride || '',
                  // Order — use override if exists, otherwise empty
                  orderOverride: existingOverride?.orderOverride ?? '',
                  // Parent — use override if exists
                  parentMenuItemIdOverride: existingOverride?.parentMenuItemIdOverride || '',
                  // Visibility
                  isHidden: existingOverride?.isHidden ?? false,
            }),
            [scope, node, hasSingleScope, scopeOptions, existingOverride]
      );

      // ── Build dialog description ──────────────────────────────────────
      const dialogDescription = useMemo(() => {
            if (!node) return '';
            const displayName = language === 'ar' ? node.nameAr : node.nameEn;
            return `${t('menus.customizeDesc')} "${displayName}"`;
      }, [node, language, t]);

      return (
            <GenericModal
                  open={isOpen}
                  onOpenChange={(open) => !open && onClose()}
                  title={t('menus.customizeItem')}
                  description={dialogDescription}
                  size="md"
                  formKey={`override-customize-${node?.id ?? 'none'}-${scope}`}
            >
                  {node && (
                        <GenericForm
                              key={`${node.id}-${scope}`}
                              fields={fields}
                              initialValues={initialValues}
                              onSubmit={async (data) => {
                                    onSave({
                                          nameEn: data.nameEn?.trim() || undefined,
                                          nameAr: data.nameAr?.trim() || undefined,
                                          orderOverride: data.orderOverride !== '' && data.orderOverride != null
                                                ? Number(data.orderOverride)
                                                : undefined,
                                          parentMenuItemIdOverride: data.parentMenuItemIdOverride || undefined,
                                          isHidden: !!data.isHidden,
                                    });
                              }}
                              onCancel={onClose}
                        />
                  )}
            </GenericModal>
      );
}
