'use client';

/**
 * Blocked IPs Table
 *
 * Shows table of blocked IP addresses with their failed attempt counts.
 */
import { memo } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Badge } from '@core/ui/badge';
import { Skeleton } from '@core/ui/skeleton';
import { Button } from '@core/ui/button';
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from '@core/ui/table';
import { Shield } from 'lucide-react';
import type { BlockedIPSummary } from '@modules/system/dashboard/src/domain/entities/DashboardEntities';

interface Props {
      data: BlockedIPSummary[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

export const BlockedIPsTable = memo(function BlockedIPsTable({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      return (
            <Card>
                  <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-orange-500" aria-hidden="true" />
                              <CardTitle className="text-base">{t('security.blockedIPs.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('security.blockedIPs.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        {isLoading ? (
                              <div className="space-y-3" role="status" aria-label={t('common.loading')}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                          <Skeleton key={i} className="h-10 w-full" />
                                    ))}
                              </div>
                        ) : error ? (
                              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-3">
                                    <p className="text-sm">{t('common.error')}</p>
                                    {onRetry && <Button variant="ghost" size="sm" onClick={onRetry}>{t('common.retry')}</Button>}
                              </div>
                        ) : data.length === 0 ? (
                              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                    <p className="text-sm">{t('dashboard.blockedIPs.noBlocked')}</p>
                              </div>
                        ) : (
                              <Table>
                                    <TableHeader>
                                          <TableRow>
                                                <TableHead>{t('dashboard.blockedIPs.ipAddress')}</TableHead>
                                                <TableHead className="text-center">{t('dashboard.blockedIPs.attempts')}</TableHead>
                                                <TableHead>{t('dashboard.blockedIPs.lastAttempt')}</TableHead>
                                                <TableHead className="text-center">{t('common.status')}</TableHead>
                                          </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {data.map((ip) => (
                                                <TableRow key={ip.ipAddress}>
                                                      <TableCell className="font-mono text-sm">{ip.ipAddress}</TableCell>
                                                      <TableCell className="text-center">
                                                            <Badge variant={ip.failedCount >= 10 ? 'destructive' : 'secondary'} className="tabular-nums">
                                                                  {ip.failedCount}
                                                            </Badge>
                                                      </TableCell>
                                                      <TableCell className="text-sm text-muted-foreground tabular-nums">
                                                            {new Date(ip.latestAttempt).toLocaleString()}
                                                      </TableCell>
                                                      <TableCell className="text-center">
                                                            <Badge variant={ip.failedCount >= 5 ? 'destructive' : 'outline'}>
                                                                  {ip.failedCount >= 5 ? t('dashboard.blockedIPs.blocked') : t('dashboard.blockedIPs.active')}
                                                            </Badge>
                                                      </TableCell>
                                                </TableRow>
                                          ))}
                                    </TableBody>
                              </Table>
                        )}
                  </CardContent>
            </Card>
      );
});
