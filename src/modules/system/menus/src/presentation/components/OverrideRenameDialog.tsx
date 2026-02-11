/**
 * Override Rename Dialog
 *
 * Modal for customizing menu item names per scope.
 * Uses the override ViewModel for save operations.
 */
'use client';

import { useState } from 'react';
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
} from '@core/ui/dialog';
import { Button } from '@core/ui/button';
import { Input } from '@core/ui/input';
import { Label } from '@core/ui/label';
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from '@core/ui/select';
import { useI18n } from '@core/providers/i18n-provider';
import { MenuOverrideScope } from '../../domain/entities/MenuItemRequests';
import type { OverrideDialogState } from '../viewmodels/useMenuOverrideViewModel';

interface OverrideRenameDialogProps {
      dialog: OverrideDialogState;
      scope: MenuOverrideScope;
      onScopeChange: (scope: MenuOverrideScope) => void;
      onSave: (nameEn: string, nameAr: string) => void;
      onClose: () => void;
      isSaving: boolean;
}

/**
 * Inner form component — uses key={node.id} to reset state when node changes.
 * This avoids the useEffect sync-state-to-props anti-pattern.
 */
function RenameForm({
      initialNameEn,
      initialNameAr,
      onSave,
      onClose,
      isSaving,
      scope,
      onScopeChange,
}: {
      initialNameEn: string;
      initialNameAr: string;
      onSave: (nameEn: string, nameAr: string) => void;
      onClose: () => void;
      isSaving: boolean;
      scope: MenuOverrideScope;
      onScopeChange: (scope: MenuOverrideScope) => void;
}) {
      const { t } = useI18n();
      const [nameEn, setNameEn] = useState(initialNameEn);
      const [nameAr, setNameAr] = useState(initialNameAr);

      const handleSubmit = () => {
            if (!nameEn.trim()) return;
            onSave(nameEn.trim(), nameAr.trim());
      };

      return (
            <>
                  {/* Scope selector */}
                  <div className="space-y-2">
                        <Label>{t('menus.overrideScope')}</Label>
                        <Select value={scope} onValueChange={(v) => onScopeChange(v as MenuOverrideScope)}>
                              <SelectTrigger>
                                    <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value={MenuOverrideScope.User}>
                                          {t('menus.scopeUser')}
                                    </SelectItem>
                                    <SelectItem value={MenuOverrideScope.Tenant}>
                                          {t('menus.scopeTenant')}
                                    </SelectItem>
                                    <SelectItem value={MenuOverrideScope.TenantAndChildren}>
                                          {t('menus.scopeGlobal')}
                                    </SelectItem>
                              </SelectContent>
                        </Select>
                  </div>

                  {/* English name */}
                  <div className="space-y-2">
                        <Label htmlFor="override-name-en">{t('menus.nameEn')}</Label>
                        <Input
                              id="override-name-en"
                              value={nameEn}
                              onChange={(e) => setNameEn(e.target.value)}
                              dir="ltr"
                        />
                  </div>

                  {/* Arabic name */}
                  <div className="space-y-2">
                        <Label htmlFor="override-name-ar">{t('menus.nameAr')}</Label>
                        <Input
                              id="override-name-ar"
                              value={nameAr}
                              onChange={(e) => setNameAr(e.target.value)}
                              dir="rtl"
                        />
                  </div>

                  <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>
                              {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSaving || !nameEn.trim()}>
                              {isSaving ? t('menus.saving') : t('common.save')}
                        </Button>
                  </DialogFooter>
            </>
      );
}

/**
 * Wrapper that controls open/close and uses key={node.id} to reset RenameForm
 * state when switching between different menu items.
 */
export function OverrideRenameDialog({
      dialog,
      scope,
      onScopeChange,
      onSave,
      onClose,
      isSaving,
}: OverrideRenameDialogProps) {
      const { t } = useI18n();

      return (
            <Dialog open={dialog.open && dialog.mode === 'rename'} onOpenChange={(open) => !open && onClose()}>
                  <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                              <DialogTitle>{t('menus.overrideRename')}</DialogTitle>
                              <DialogDescription>
                                    {t('menus.overrideRenameDesc')}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              {dialog.node && (
                                    <RenameForm
                                          key={dialog.node.id}
                                          initialNameEn={dialog.node.nameEn ?? ''}
                                          initialNameAr={dialog.node.nameAr ?? ''}
                                          onSave={onSave}
                                          onClose={onClose}
                                          isSaving={isSaving}
                                          scope={scope}
                                          onScopeChange={onScopeChange}
                                    />
                              )}
                        </div>
                  </DialogContent>
            </Dialog>
      );
}
