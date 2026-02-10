'use client';

/**
 * Audit Log Table
 *
 * Presentational table component for audit log entries with pagination.
 * Extracted from AuditView for SOLID compliance.
 */
import { memo, useCallback } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
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
import type { AuditLogPage } from '@modules/system/dashboard/src/domain/entities/DashboardEntities';

interface Props {
      data: AuditLogPage | undefined;
      isLoading: boolean;
      error: Error | null;
      onRetry: () => void;
      onRowClick: (id: string) => void;
      onPageChange: (page: number) => void;
}

export const AuditLogTable = memo(function AuditLogTable({
      data,
      isLoading,
      error,
      onRetry,
      onRowClick,
      onPageChange,
}: Props) {
      const { t,language } = useI18n();

      const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
            if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRowClick(id);
            }
      }, [onRowClick]);

      if (isLoading) {
            return (
                  <div className="space-y-3" role="status" aria-label={t('common.loading')}>
                        {Array.from({ length: 8 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-md" />
                        ))}
                  </div>
            );
      }

      if (error) {
            return (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-3">
                        <XCircle className="h-8 w-8 opacity-40" aria-hidden="true" />
                        <p className="text-sm">{t('common.error')}</p>
                        <Button variant="outline" size="sm" onClick={onRetry}>
                              {t('common.retry')}
                        </Button>
                  </div>
            );
      }

      if (!data || data.items.length === 0) {
            return (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                        <FileText className="h-10 w-10 opacity-30" aria-hidden="true" />
                        <p className="text-sm font-medium">{t('audit.results.noResults')}</p>
                  </div>
            );
      }

      return (
            <div aria-live="polite">
                  <Table>
                        <TableHeader>
                              <TableRow>
                                    <TableHead className="w-[150px]">{t('audit.table.timestamp')}</TableHead>
                                    <TableHead>{t('audit.table.eventType')}</TableHead>
                                    <TableHead>{t('audit.table.user')}</TableHead>
                                    <TableHead>{t('audit.table.entity')}</TableHead>
                                    <TableHead className="w-[80px] text-center">{t('audit.table.status')}</TableHead>
                                    <TableHead className="w-[60px]" />
                              </TableRow>
                        </TableHeader>
                        <TableBody>
                              {data.items.map((log) => (
                                    <TableRow
                                          key={log.id}
                                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                                          onClick={() => onRowClick(log.id)}
                                          onKeyDown={(e) => handleKeyDown(e, log.id)}
                                          tabIndex={0}
                                          role="button"
                                          aria-label={log.eventType + ' - ' + (log.username ?? '')}
                                    >
                                          <TableCell className="text-xs text-muted-foreground tabular-nums">
                                                {new Date(log.timestamp).toLocaleString()}
                                          </TableCell>
                                          <TableCell>
                                                <Badge variant="outline" className="text-xs font-mono">
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
                                                {log.entityType ? log.entityType + ' #' + (log.entityId?.slice(0, 8) ?? '') : '—'}
                                          </TableCell>
                                          <TableCell className="text-center">
                                                {log.isSuccess ? (
                                                      <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" aria-label={t('audit.filters.success')} />
                                                ) : (
                                                      <XCircle className="h-4 w-4 text-red-500 mx-auto" aria-label={t('audit.filters.failed')} />
                                                )}
                                          </TableCell>
                                          <TableCell>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t('common.view')} tabIndex={-1}>
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
                                          onClick={() => onPageChange(data.pageNumber - 1)}
                                          aria-label={t('common.previous')}
                                    >
                                          {language === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={!data.hasNextPage}
                                          onClick={() => onPageChange(data.pageNumber + 1)}
                                          aria-label={t('common.next')}
                                    >
                                          {language === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                              </div>
                        </div>
                  )}
            </div>
      );
});
