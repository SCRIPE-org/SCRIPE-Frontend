'use client';

/**
 * Blocked IPs Section
 *
 * Table of IP addresses with the most failed login attempts.
 */
import type { BlockedIPSummary } from '../../domain/entities/DashboardEntities';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Skeleton } from '@core/ui/skeleton';
import { Badge } from '@core/ui/badge';
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from '@core/ui/table';
import { Globe } from 'lucide-react';

interface Props {
      data: BlockedIPSummary[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

export function BlockedIPsSection({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      return (
            <Card>
                  <CardHeader>
                        <div className="flex items-center gap-2">
                              <Globe className="h-5 w-5 text-red-500" />
                              <div>
                                    <CardTitle>{t('dashboard.blockedIPs.title')}</CardTitle>
                                    <CardDescription>{t('dashboard.blockedIPs.description')}</CardDescription>
                              </div>
                        </div>
                  </CardHeader>
                  <CardContent>
                        {isLoading ? (
                              <div className="space-y-3" role="status" aria-label={t('common.loading')}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                          <Skeleton key={i} className="h-10 w-full" />
                                    ))}
                              </div>
                        ) : error ? (
                              <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground gap-3">
                                    <p className="text-sm">{t('common.error')}</p>
                                    {onRetry && (
                                          <button onClick={onRetry} className="text-sm text-primary hover:underline">
                                                {t('common.retry')}
                                          </button>
                                    )}
                              </div>
                        ) : data.length === 0 ? (
                              <div className="flex items-center justify-center h-[100px] text-muted-foreground">
                                    {t('dashboard.blockedIPs.noBlocked')}
                              </div>
                        ) : (
                              <Table>
                                    <TableHeader>
                                          <TableRow>
                                                <TableHead>{t('dashboard.blockedIPs.ipAddress')}</TableHead>
                                                <TableHead>{t('dashboard.blockedIPs.attempts')}</TableHead>
                                                <TableHead>{t('dashboard.blockedIPs.lastUser')}</TableHead>
                                                <TableHead>{t('dashboard.blockedIPs.lastAttempt')}</TableHead>
                                          </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {data.map((ip) => (
                                                <TableRow key={ip.ipAddress}>
                                                      <TableCell className="font-mono text-sm">{ip.ipAddress}</TableCell>
                                                      <TableCell>
                                                            <Badge
                                                                  variant={ip.failedCount > 20 ? 'destructive' : ip.failedCount > 5 ? 'default' : 'secondary'}
                                                                  className="tabular-nums"
                                                            >
                                                                  {ip.failedCount}
                                                            </Badge>
                                                      </TableCell>
                                                      <TableCell className="text-muted-foreground">
                                                            {ip.lastUsername ?? '—'}
                                                      </TableCell>
                                                      <TableCell className="text-muted-foreground text-sm tabular-nums">
                                                            {new Date(ip.latestAttempt).toLocaleString()}
                                                      </TableCell>
                                                </TableRow>
                                          ))}
                                    </TableBody>
                              </Table>
                        )}
                  </CardContent>
            </Card>
      );
}
