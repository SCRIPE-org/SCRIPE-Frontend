'use client';

/**
 * Audit View
 *
 * Pure UI composition — audit log listing with filters, table, and detail dialog.
 * SOLID: ~55 lines, zero state, zero logic — all delegated to ViewModel.
 */
import { useAuditViewModel } from '../viewmodels/useAuditViewModel';
import { useI18n } from '@core/providers/i18n-provider';
import { AuditFilterPanel } from '../components/AuditFilterPanel';
import { AuditLogTable } from '../components/AuditLogTable';
import { AuditDetailDialog } from '../components/AuditDetailDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { FileText } from 'lucide-react';

export function AuditView() {
      const vm = useAuditViewModel();
      const { t } = useI18n();

      return (
            <div className="space-y-6">
                  {/* Page Header */}
                  <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                              <FileText className="h-6 w-6" aria-hidden="true" />
                              {t('audit.title')}
                        </h1>
                        <p className="text-muted-foreground">{t('audit.subtitle')}</p>
                  </div>

                  {/* Filters */}
                  <Card>
                        <CardHeader className="pb-3">
                              <CardTitle className="text-base">{t('audit.filters.title')}</CardTitle>
                              <CardDescription>{t('audit.filters.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <AuditFilterPanel
                                    filters={vm.filters}
                                    updateFilter={vm.updateFilter}
                                    resetFilters={vm.resetFilters}
                                    hasActiveFilters={vm.hasActiveFilters}
                              />
                        </CardContent>
                  </Card>

                  {/* Results Table */}
                  <Card>
                        <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{t('audit.results.title')}</CardTitle>
                                    {vm.logs.data && (
                                          <span className="text-sm text-muted-foreground tabular-nums">
                                                {t('audit.results.totalCount', { count: vm.logs.data.totalCount })}
                                          </span>
                                    )}
                              </div>
                        </CardHeader>
                        <CardContent>
                              <AuditLogTable
                                    data={vm.logs.data}
                                    isLoading={vm.logs.isLoading}
                                    error={vm.logs.error}
                                    onRetry={() => vm.logs.refetch()}
                                    onRowClick={vm.openDetail}
                                    onPageChange={vm.setPage}
                              />
                        </CardContent>
                  </Card>

                  {/* Detail Dialog */}
                  <AuditDetailDialog
                        open={vm.selectedLogId !== null}
                        onClose={vm.closeDetail}
                        data={vm.detail.data}
                        isLoading={vm.detail.isLoading}
                  />
            </div>
      );
}
