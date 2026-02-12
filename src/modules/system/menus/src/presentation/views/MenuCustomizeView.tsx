/**
 * Menu Customize View (Pure UI)
 *
 * Dedicated page for menu customization. Split-panel layout:
 * - Left: Live preview tree (click to select)
 * - Right: Inline editing panel
 * - Bottom: Active overrides summary
 *
 * Separated from admin CRUD to provide a focused, premium customization UX.
 */
'use client';

import { useMenuCustomizeViewModel } from '../viewmodels/useMenuCustomizeViewModel';
import { CustomizePreviewTree } from '../components/CustomizePreviewTree';
import { CustomizePanel } from '../components/CustomizePanel';
import { ActiveOverridesList } from '../components/ActiveOverridesList';
import { useI18n } from '@core/providers/i18n-provider';
import { Button } from '@core/ui/button';
import { Badge } from '@core/ui/badge';
import { Card, CardContent } from '@core/ui/card';
import {
      ArrowLeft,
      RefreshCw,
      RotateCcw,
      ChevronDown,
      ChevronRight,
      Menu,
      User,
      Building2,
      Loader2,
} from 'lucide-react';
import { cn } from '@core/common/utils';
import Link from 'next/link';
import { MenuOverrideScope } from '../../domain/entities/MenuItemRequests';

export function MenuCustomizeView() {
      const { t } = useI18n();
      const vm = useMenuCustomizeViewModel();

      return (
            <div className="space-y-6">
                  {/* ── Header ──────────────────────────────────────────── */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                              <Button variant="ghost" size="icon" asChild>
                                    <Link href="/settings/menus">
                                          <ArrowLeft className="h-4 w-4" />
                                    </Link>
                              </Button>
                              <div>
                                    <h1 className="text-2xl font-bold tracking-tight">
                                          {t('menus.customizePage')}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                          {t('menus.customizePageDesc')}
                                    </p>
                              </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                              {/* Scope Tabs */}
                              {vm.availableScopes.length > 1 && (
                                    <div className="inline-flex items-center rounded-lg border bg-background p-0.5">
                                          {vm.availableScopes.map(s => (
                                                <button
                                                      key={s}
                                                      onClick={() => vm.setScope(s)}
                                                      className={cn(
                                                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
                                                            'transition-all duration-200',
                                                            vm.scope === s
                                                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                                      )}
                                                >
                                                      {s === MenuOverrideScope.User ? (
                                                            <User className="h-3.5 w-3.5" />
                                                      ) : (
                                                            <Building2 className="h-3.5 w-3.5" />
                                                      )}
                                                      {s === MenuOverrideScope.User
                                                            ? t('menus.scopePersonal')
                                                            : t('menus.scopeOrganization')}
                                                </button>
                                          ))}
                                    </div>
                              )}

                              {/* Active overrides count */}
                              {vm.activeOverrides.length > 0 && (
                                    <Badge variant="secondary">
                                          {vm.activeOverrides.length} {t('menus.activeOverridesCount') || 'customizations'}
                                    </Badge>
                              )}

                              {/* Reset All */}
                              {vm.activeOverrides.length > 0 && (
                                    <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={vm.resetAllOverrides}
                                          disabled={vm.isResettingAll}
                                          className="text-destructive hover:text-destructive"
                                    >
                                          {vm.isResettingAll ? (
                                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                          ) : (
                                                <RotateCcw className="h-4 w-4 mr-1.5" />
                                          )}
                                          {t('menus.resetAll') || 'Reset All'}
                                    </Button>
                              )}

                              {/* Tree controls */}
                              <Button variant="outline" size="sm" onClick={vm.expandAll}>
                                    <ChevronDown className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                                    {t('common.expandAll') ?? 'Expand All'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={vm.collapseAll}>
                                    <ChevronRight className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                                    {t('common.collapseAll') ?? 'Collapse All'}
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => vm.refetch()} disabled={vm.isLoading}>
                                    <RefreshCw className={cn('h-4 w-4', vm.isLoading && 'animate-spin')} />
                              </Button>
                        </div>
                  </div>

                  {/* ── Loading State ───────────────────────────────────── */}
                  {vm.isLoading ? (
                        <Card>
                              <CardContent className="py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                                    </div>
                              </CardContent>
                        </Card>
                  ) : vm.menuTree.length === 0 ? (
                        /* ── Empty State ────────────────────────────────── */
                        <Card>
                              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                          <Menu className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{t('menus.emptyTitle')}</h3>
                                    <p className="text-muted-foreground text-center mb-4 max-w-sm">
                                          {t('menus.noItemsToCustomize')}
                                    </p>
                                    <Button variant="outline" asChild>
                                          <Link href="/settings/menus">
                                                <ArrowLeft className="h-4 w-4 mr-1.5" />
                                                {t('menus.backToManagement')}
                                          </Link>
                                    </Button>
                              </CardContent>
                        </Card>
                  ) : (
                        <>
                              {/* ── Split Panel ────────────────────────────── */}
                              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    {/* Left: Preview Tree (3/5 width) */}
                                    <div className="lg:col-span-3">
                                          <Card>
                                                <CardContent className="p-4">
                                                      <CustomizePreviewTree
                                                            menuTree={vm.menuTree}
                                                            language={vm.language}
                                                            scope={vm.scope}
                                                            selectedItemId={vm.selectedItemId}
                                                            expandedNodes={vm.expandedNodes}
                                                            onToggleExpand={vm.toggleExpand}
                                                            onSelectItem={vm.selectItem}
                                                      />
                                                </CardContent>
                                          </Card>
                                    </div>

                                    {/* Right: Edit Panel (2/5 width) */}
                                    <div className="lg:col-span-2">
                                          <div className="lg:sticky lg:top-4">
                                                <CustomizePanel
                                                      selectedNode={vm.selectedNode}
                                                      selectedOverride={vm.selectedOverride}
                                                      formData={vm.formData}
                                                      parentOptions={vm.parentOptions}
                                                      language={vm.language}
                                                      onSave={vm.saveOverride}
                                                      isSaving={vm.isSaving}
                                                />
                                          </div>
                                    </div>
                              </div>

                              {/* ── Active Overrides Summary ───────────────── */}
                              <ActiveOverridesList
                                    overrides={vm.activeOverrides}
                                    language={vm.language}
                                    selectedItemId={vm.selectedItemId}
                                    onSelectItem={vm.selectItem}
                                    onRemoveOverride={vm.removeOverride}
                                    isDeleting={vm.isDeleting}
                              />
                        </>
                  )}
            </div>
      );
}
