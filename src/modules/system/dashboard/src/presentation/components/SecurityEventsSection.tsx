'use client';

/**
 * Security Events Section
 *
 * Summary cards for security-related events (failed logins, lockouts, etc.)
 */
import type { SecurityEventSummary } from '../../domain/entities/DashboardEntities';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Skeleton } from '@core/ui/skeleton';
import { Badge } from '@core/ui/badge';
import {
      AlertTriangle,
      Lock,
      Ban,
      ShieldX,
      KeyRound,
      LogOut,
      ShieldAlert,
} from 'lucide-react';

interface Props {
      data: SecurityEventSummary[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

const eventConfig: Record<string, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
      LoginFailed: { icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
      AccountLocked: { icon: Lock, color: 'text-red-500', bgColor: 'bg-red-500/10' },
      AccessDenied: { icon: Ban, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      PrivilegeEscalationAttempt: { icon: ShieldX, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
      SessionRevoked: { icon: LogOut, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
      PasswordReset: { icon: KeyRound, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
};

export function SecurityEventsSection({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      return (
            <Card>
                  <CardHeader>
                        <div className="flex items-center gap-2">
                              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                              <div>
                                    <CardTitle>{t('dashboard.securityEvents.title')}</CardTitle>
                                    <CardDescription>{t('dashboard.securityEvents.description')}</CardDescription>
                              </div>
                        </div>
                  </CardHeader>
                  <CardContent>
                        {isLoading ? (
                              <div className="space-y-3" role="status" aria-label={t('common.loading')}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                          <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                      <Skeleton className="h-8 w-8 rounded" />
                                                      <Skeleton className="h-4 w-32" />
                                                </div>
                                                <Skeleton className="h-6 w-12 rounded-full" />
                                          </div>
                                    ))}
                              </div>
                        ) : error ? (
                              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-3">
                                    <p className="text-sm">{t('common.error')}</p>
                                    {onRetry && (
                                          <button onClick={onRetry} className="text-sm text-primary hover:underline">
                                                {t('common.retry')}
                                          </button>
                                    )}
                              </div>
                        ) : data.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                                    <ShieldX className="h-8 w-8 opacity-50" />
                                    <span>{t('dashboard.securityEvents.noEvents')}</span>
                              </div>
                        ) : (
                              <div className="space-y-3" aria-live="polite">
                                    {data.map((event) => {
                                          const config = eventConfig[event.eventType] ?? {
                                                icon: AlertTriangle,
                                                color: 'text-gray-500',
                                                bgColor: 'bg-gray-500/10',
                                          };
                                          const Icon = config.icon;

                                          return (
                                                <div
                                                      key={event.eventType}
                                                      className="flex items-center justify-between p-2.5 rounded-lg border transition-colors hover:bg-muted/30"
                                                >
                                                      <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                                                  <Icon className={`h-4 w-4 ${config.color}`} />
                                                            </div>
                                                            <div>
                                                                  <p className="text-sm font-medium">{event.eventType}</p>
                                                                  {event.latestOccurrence && (
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                              Last: {new Date(event.latestOccurrence).toLocaleString()}
                                                                        </p>
                                                                  )}
                                                            </div>
                                                      </div>
                                                      <Badge
                                                            variant={event.count > 10 ? 'destructive' : 'secondary'}
                                                            className="tabular-nums"
                                                      >
                                                            {event.count.toLocaleString()}
                                                      </Badge>
                                                </div>
                                          );
                                    })}
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}
