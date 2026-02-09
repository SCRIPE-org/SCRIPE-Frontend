'use client';

/**
 * Audit View
 *
 * Pure UI composition — audit log listing with filters, table, detail dialog,
 * and real-time SignalR connection status.
 * SOLID: ~70 lines, zero state, zero logic — all delegated to ViewModels.
 */
import { useAuditViewModel } from '../viewmodels/useAuditViewModel';
import { useAuditRealtime } from '../viewmodels/useAuditRealtime';
import { useI18n } from '@core/providers/i18n-provider';
import { AuditFilterPanel } from '../components/AuditFilterPanel';
import { AuditLogTable } from '../components/AuditLogTable';
import { AuditDetailDialog } from '../components/AuditDetailDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Badge } from '@core/ui/badge';
import { FileText, Radio } from 'lucide-react';

const connectionColors = {
      connected: 'bg-emerald-500',
      connecting: 'bg-amber-500 animate-pulse',
      reconnecting: 'bg-amber-500 animate-pulse',
      disconnected: 'bg-red-500',
} as const;

export function AuditView() {
      const vm = useAuditViewModel();
      const realtime = useAuditRealtime();
      const { t } = useI18n();

      return (
            <div className="space-y-6">
                  {/* Page Header */}
                  <div className="flex items-start justify-between">
                        <div>
                              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    <FileText className="h-6 w-6" aria-hidden="true" />
                                    {t('audit.title')}
                              </h1>
                              <p className="text-muted-foreground">{t('audit.subtitle')}</p>
                        </div>

                        {/* Real-time connection status */}
                        <Badge variant="outline" className="flex items-center gap-1.5 text-xs">
                              <span className={`h-2 w-2 rounded-full ${connectionColors[realtime.connectionState]}`} />
                              <Radio className="h-3 w-3" aria-hidden="true" />
                              {t(`audit.realtime.${realtime.connectionState}`)}
                              {realtime.realtimeEventCount > 0 && (
                                    <span className="ml-1 tabular-nums text-muted-foreground">
                                          ({realtime.realtimeEventCount})
                                    </span>
                              )}
                        </Badge>
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
