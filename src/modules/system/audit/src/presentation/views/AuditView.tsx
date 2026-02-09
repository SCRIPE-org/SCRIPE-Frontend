'use client';

/**
 * Audit View
 *
 * Pure UI composition — audit log listing with filters, table, pagination, and detail dialog.
 */
import { useAuditViewModel } from '../viewmodels/useAuditViewModel';
import { useI18n } from '@core/providers/i18n-provider';
import { AuditFilterPanel } from '../components/AuditFilterPanel';
import { AuditDetailDialog } from '../components/AuditDetailDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Badge } from '@core/ui/badge';
import { Button } from '@core/ui/button';
import { Skeleton } from '@core/ui/skeleton';
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from '@core/ui/table';
import {
      ChevronLeft,
      ChevronRight,
      FileText,
      CheckCircle2,
      XCircle,
      Eye,
} from 'lucide-react';

export function AuditView() {
      const vm = useAuditViewModel();
      const { t } = useI18n();

      const data = vm.logs.data;

      return (
            <div className="space-y-6">
                  {/* Page Header */}
                  <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                              <FileText className="h-6 w-6" />
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

                  {/* Results */}
                  <Card>
                        <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{t('audit.results.title')}</CardTitle>
                                    {data && (
                                          <span className="text-sm text-muted-foreground tabular-nums">
                                                {t('audit.results.totalCount', { count: data.totalCount })}
                                          </span>
                                    )}
                              </div>
                        </CardHeader>
                        <CardContent>
                              {vm.logs.isLoading ? (
                                    <div className="space-y-3" role="status" aria-label={t('common.loading')}>
                                          {Array.from({ length: 8 }).map((_, i) => (
                                                <Skeleton key={i} className="h-12 w-full" />
                                          ))}
                                    </div>
                              ) : vm.logs.error ? (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-3">
                                          <p className="text-sm">{t('common.error')}</p>
                                          <Button variant="ghost" size="sm" onClick={() => vm.logs.refetch()}>
                                                {t('common.retry')}
                                          </Button>
                                    </div>
                              ) : !data || data.items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                                          <FileText className="h-8 w-8 opacity-50" />
                                          <span>{t('audit.results.noResults')}</span>
                                    </div>
                              ) : (
                                    <>
                                          <Table>
                                                <TableHeader>
                                                      <TableRow>
                                                            <TableHead className="w-[140px]">{t('audit.table.timestamp')}</TableHead>
                                                            <TableHead>{t('audit.table.eventType')}</TableHead>
                                                            <TableHead>{t('audit.table.user')}</TableHead>
                                                            <TableHead>{t('audit.table.entity')}</TableHead>
                                                            <TableHead className="w-[80px]">{t('audit.table.status')}</TableHead>
                                                            <TableHead className="w-[60px]" />
                                                      </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                      {data.items.map((log) => (
                                                            <TableRow
                                                                  key={log.id}
                                                                  className="cursor-pointer hover:bg-muted/50"
                                                                  onClick={() => vm.openDetail(log.id)}
                                                            >
                                                                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                                                                        {new Date(log.timestamp).toLocaleString()}
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <Badge variant="outline" className="text-xs">
                                                                              {log.eventType}
                                                                        </Badge>
                                                                  </TableCell>
                                                                  <TableCell className="text-sm">
                                                                        <div className="flex items-center gap-1.5">
                                                                              {log.username ?? '—'}
                                                                              {log.isAdmin && (
                                                                                    <Badge variant="secondary" className="text-[9px] py-0 px-1">
                                                                                          Admin
                                                                                    </Badge>
                                                                              )}
                                                                        </div>
                                                                  </TableCell>
                                                                  <TableCell className="text-sm text-muted-foreground">
                                                                        {log.entityType ? `${log.entityType} #${log.entityId?.slice(0, 8) ?? ''}` : '—'}
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        {log.isSuccess ? (
                                                                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                              <XCircle className="h-4 w-4 text-red-500" />
                                                                        )}
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t('common.view')}>
                                                                              <Eye className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                  </TableCell>
                                                            </TableRow>
                                                      ))}
                                                </TableBody>
                                          </Table>

                                          {/* Pagination */}
                                          {data.totalPages > 1 && (
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                                      <span className="text-sm text-muted-foreground tabular-nums">
                                                            {t('common.page')} {data.pageNumber} {t('common.of')} {data.totalPages}
                                                      </span>
                                                      <div className="flex gap-2">
                                                            <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  disabled={!data.hasPreviousPage}
                                                                  onClick={() => vm.setPage(data.pageNumber - 1)}
                                                            >
                                                                  <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  disabled={!data.hasNextPage}
                                                                  onClick={() => vm.setPage(data.pageNumber + 1)}
                                                            >
                                                                  <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                      </div>
                                                </div>
                                          )}
                                    </>
                              )}
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
