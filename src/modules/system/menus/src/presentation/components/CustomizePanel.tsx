/**
 * Customize Panel
 *
 * Right panel: inline editing for the selected menu item's overrides.
 * Shows name EN/AR, order, parent picker, hidden toggle.
 * Includes base values as reference and save/reset buttons.
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Button } from '@core/ui/button';
import { Input } from '@core/ui/input';
import { Label } from '@core/ui/label';
import { Switch } from '@core/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@core/ui/card';
import { Separator } from '@core/ui/separator';
import type { MenuTreeNode, MenuItemOverrideInfo } from '../../domain/entities/MenuItem';
import type { OverrideFormData, FlatMenuItem } from '../viewmodels/useMenuCustomizeViewModel';
import {
      Save,
      RotateCcw,
      FileText,
      FolderOpen,
      EyeOff,
      Eye,
      ArrowRight,
      Loader2,
} from 'lucide-react';
import { cn } from '@core/common/utils';

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface CustomizePanelProps {
      selectedNode: MenuTreeNode | null;
      selectedOverride: MenuItemOverrideInfo | null;
      formData: OverrideFormData | null;
      parentOptions: FlatMenuItem[];
      language: string;
      onSave: (data: OverrideFormData) => void;
      isSaving: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CustomizePanel({
      selectedNode,
      selectedOverride,
      formData,
      parentOptions,
      language,
      onSave,
      isSaving,
}: CustomizePanelProps) {
      const { t } = useI18n();

      // Local form state
      const [nameEn, setNameEn] = useState('');
      const [nameAr, setNameAr] = useState('');
      const [orderOverride, setOrderOverride] = useState<string>('');
      const [parentId, setParentId] = useState<string>('');
      const [isHidden, setIsHidden] = useState(false);

      // Reset form when selection or override data changes
      useEffect(() => {
            if (formData) {
                  setNameEn(formData.nameEn);
                  setNameAr(formData.nameAr);
                  setOrderOverride(formData.orderOverride != null ? String(formData.orderOverride) : '');
                  setParentId(formData.parentMenuItemIdOverride ?? '');
                  setIsHidden(formData.isHidden);
            }
      }, [formData]);

      // Check if form has changes compared to current override
      const hasChanges = useMemo(() => {
            if (!formData) return false;
            return (
                  nameEn !== formData.nameEn ||
                  nameAr !== formData.nameAr ||
                  (orderOverride !== '' ? Number(orderOverride) : null) !== formData.orderOverride ||
                  (parentId || null) !== formData.parentMenuItemIdOverride ||
                  isHidden !== formData.isHidden
            );
      }, [nameEn, nameAr, orderOverride, parentId, isHidden, formData]);

      const handleSave = () => {
            onSave({
                  nameEn,
                  nameAr,
                  orderOverride: orderOverride !== '' ? Number(orderOverride) : null,
                  parentMenuItemIdOverride: parentId || null,
                  isHidden,
            });
      };

      const handleReset = () => {
            if (formData) {
                  setNameEn(formData.nameEn);
                  setNameAr(formData.nameAr);
                  setOrderOverride(formData.orderOverride != null ? String(formData.orderOverride) : '');
                  setParentId(formData.parentMenuItemIdOverride ?? '');
                  setIsHidden(formData.isHidden);
            }
      };

      // ── Empty state ─────────────────────────────────────────────────────
      if (!selectedNode) {
            return (
                  <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                              <div className="rounded-full bg-muted p-4 mb-4">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                    {t('menus.selectItemToCustomize')}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                    {t('menus.selectItemHint')}
                              </p>
                        </CardContent>
                  </Card>
            );
      }

      const displayName = language === 'ar' ? selectedNode.nameAr : selectedNode.nameEn;
      const hasChildren = selectedNode.children.length > 0;

      return (
            <Card>
                  <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                              {hasChildren ? (
                                    <FolderOpen className="h-5 w-5 text-primary shrink-0" />
                              ) : (
                                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                              )}
                              <div className="min-w-0">
                                    <CardTitle className="text-base truncate">{displayName}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                          {t('menus.customizeDesc')}
                                    </p>
                              </div>
                        </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                        {/* ── Display Name Section ──────────────────── */}
                        <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('menus.overrideRename')}
                              </h4>

                              <div className="space-y-2">
                                    <div>
                                          <Label htmlFor="nameEn" className="text-xs">
                                                {t('menus.nameEn')}
                                          </Label>
                                          <Input
                                                id="nameEn"
                                                value={nameEn}
                                                onChange={e => setNameEn(e.target.value)}
                                                placeholder={selectedNode.nameEn}
                                                className="mt-1 h-8 text-sm"
                                          />
                                          {nameEn && nameEn !== selectedNode.nameEn && (
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                                                      <span className="line-through">{selectedNode.nameEn}</span>
                                                      <ArrowRight className="h-2.5 w-2.5" />
                                                      <span className="text-primary font-medium">{nameEn}</span>
                                                </div>
                                          )}
                                    </div>

                                    <div>
                                          <Label htmlFor="nameAr" className="text-xs">
                                                {t('menus.nameAr')}
                                          </Label>
                                          <Input
                                                id="nameAr"
                                                value={nameAr}
                                                onChange={e => setNameAr(e.target.value)}
                                                placeholder={selectedNode.nameAr}
                                                className="mt-1 h-8 text-sm"
                                                dir="rtl"
                                          />
                                          {nameAr && nameAr !== selectedNode.nameAr && (
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                                                      <span className="line-through">{selectedNode.nameAr}</span>
                                                      <ArrowRight className="h-2.5 w-2.5" />
                                                      <span className="text-primary font-medium">{nameAr}</span>
                                                </div>
                                          )}
                                    </div>
                              </div>
                        </div>

                        <Separator />

                        {/* ── Display Order Section ─────────────────── */}
                        <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('menus.overrideOrder')}
                              </h4>
                              <div>
                                    <Input
                                          type="number"
                                          value={orderOverride}
                                          onChange={e => setOrderOverride(e.target.value)}
                                          placeholder={String(selectedNode.order)}
                                          className="h-8 text-sm w-32"
                                          min={0}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                          {t('menus.orderHint') || `Current: ${selectedNode.order}`}
                                    </p>
                              </div>
                        </div>

                        <Separator />

                        {/* ── Parent Override Section ───────────────── */}
                        <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('menus.overrideParent')}
                              </h4>
                              <select
                                    value={parentId}
                                    onChange={e => setParentId(e.target.value)}
                                    className={cn(
                                          'w-full h-8 text-sm rounded-md border border-input bg-background px-3',
                                          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                    )}
                              >
                                    <option value="">{t('menus.keepCurrentParent')}</option>
                                    <option value="__root__">{t('menus.rootLevel')}</option>
                                    {parentOptions.map(item => (
                                          <option key={item.id} value={item.id}>
                                                {'  '.repeat(item.depth)}{language === 'ar' ? item.nameAr : item.nameEn}
                                          </option>
                                    ))}
                              </select>
                        </div>

                        <Separator />

                        {/* ── Visibility Section ───────────────────── */}
                        <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('menus.visibility') || 'Visibility'}
                              </h4>
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-2">
                                          {isHidden ? (
                                                <EyeOff className="h-4 w-4 text-destructive" />
                                          ) : (
                                                <Eye className="h-4 w-4 text-emerald-500" />
                                          )}
                                          <span className="text-sm">
                                                {isHidden
                                                      ? (t('menus.itemHidden') || 'Hidden')
                                                      : (t('menus.itemVisible') || 'Visible')}
                                          </span>
                                    </div>
                                    <Switch
                                          checked={!isHidden}
                                          onCheckedChange={checked => setIsHidden(!checked)}
                                    />
                              </div>
                        </div>

                        <Separator />

                        {/* ── Actions ──────────────────────────────── */}
                        <div className="flex items-center gap-2 pt-1">
                              <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !hasChanges}
                                    className="flex-1"
                                    size="sm"
                              >
                                    {isSaving ? (
                                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    ) : (
                                          <Save className="h-4 w-4 mr-1.5" />
                                    )}
                                    {t('common.save')}
                              </Button>
                              <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={!hasChanges}
                                    size="sm"
                              >
                                    <RotateCcw className="h-4 w-4 mr-1.5" />
                                    {t('common.reset') || 'Reset'}
                              </Button>
                        </div>
                  </CardContent>
            </Card>
      );
}
