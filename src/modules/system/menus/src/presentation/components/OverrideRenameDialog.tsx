/**
 * Override Rename Dialog
 *
 * Modal for customizing menu item names per scope.
 * Uses GenericModal + GenericForm for consistent form handling and working selects.
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
import type { OverrideDialogState } from '../viewmodels/useMenuOverrideViewModel';

interface OverrideRenameDialogProps {
      dialog: OverrideDialogState;
      scope: MenuOverrideScope;
      onScopeChange: (scope: MenuOverrideScope) => void;
      availableScopes: MenuOverrideScope[];
      onSave: (nameEn: string, nameAr: string) => void;
      onClose: () => void;
      isSaving: boolean;
}

/** Map enum values to human-friendly labels */
const SCOPE_LABEL_KEYS: Record<MenuOverrideScope, string> = {
      [MenuOverrideScope.User]: 'menus.scopePersonal',
      [MenuOverrideScope.Tenant]: 'menus.scopeOrganization',
};

export function OverrideRenameDialog({
      dialog,
      scope,
      onScopeChange,
      availableScopes,
      onSave,
      onClose,
      isSaving,
}: OverrideRenameDialogProps) {
      const { t } = useI18n();

      const isOpen = dialog.open && dialog.mode === 'rename';
      const node = dialog.node;

      // ── Get existing override for current scope from the node itself ────
      const existingOverride = useMemo(() => {
            if (!node) return null;
            return scope === MenuOverrideScope.User
                  ? node.userOverride ?? null
                  : node.tenantOverride ?? null;
      }, [node, scope]);

      // ── Build scope options from availableScopes ───────────────────────
      const scopeOptions = useMemo(
            () =>
                  availableScopes.map((s) => ({
                        value: s,
                        label: t(SCOPE_LABEL_KEYS[s]),
                  })),
            [availableScopes, t]
      );

      // Defer scope change to avoid setState-in-render
      // GenericForm calls field.onChange inside setFormData, which is synchronous.
      // Calling onScopeChange directly triggers a parent setState during child render.
      const deferredScopeChange = useCallback(
            (value: any) => {
                  queueMicrotask(() => onScopeChange(value as MenuOverrideScope));
            },
            [onScopeChange]
      );

      // ── Define form fields ─────────────────────────────────────────────
      const hasSingleScope = availableScopes.length <= 1;

      const fields: FieldConfig[] = useMemo(
            () => [
                  // Single scope → disabled text field showing the label
                  // Multiple scopes → select dropdown
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
                  {
                        name: 'nameEn',
                        label: t('menus.nameEn'),
                        type: 'text' as const,
                        required: true,
                  },
                  {
                        name: 'nameAr',
                        label: t('menus.nameAr'),
                        type: 'text' as const,
                  },
            ],
            [t, scopeOptions, deferredScopeChange, hasSingleScope]
      );

      // ── Initial values: use override values if they exist for this scope ─
      const initialValues = useMemo(
            () => ({
                  // When disabled text, show the translated label; when select, use the enum value
                  scope: hasSingleScope
                        ? (scopeOptions.find(o => o.value === scope)?.label ?? scope)
                        : scope,
                  // Pre-fill with existing override values, fallback to defaults
                  nameEn: existingOverride?.nameEnOverride || node?.nameEn || '',
                  nameAr: existingOverride?.nameArOverride || node?.nameAr || '',
            }),
            [scope, node, hasSingleScope, scopeOptions, existingOverride]
      );

      return (
            <GenericModal
                  open={isOpen}
                  onOpenChange={(open) => !open && onClose()}
                  title={t('menus.overrideRename')}
                  description={t('menus.overrideRenameDesc')}
                  size="sm"
                  formKey={`override-rename-${node?.id ?? 'none'}-${scope}`}
            >
                  {node && (
                        <GenericForm
                              key={`${node.id}-${scope}`}
                              fields={fields}
                              initialValues={initialValues}
                              onSubmit={async (data) => {
                                    onSave(data.nameEn?.trim() ?? '', data.nameAr?.trim() ?? '');
                              }}
                              onCancel={onClose}
                        />
                  )}
            </GenericModal>
      );
}

