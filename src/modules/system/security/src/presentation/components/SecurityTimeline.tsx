'use client';

/**
 * Security Timeline
 *
 * Chronological feed of recent security-related events.
 */
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Badge } from '@core/ui/badge';
import { Skeleton } from '@core/ui/skeleton';
import { Button } from '@core/ui/button';
import {
      Shield,
      LogIn,
      LogOut,
      Lock,
      Unlock,
      UserX,
      Key,
      AlertTriangle,
} from 'lucide-react';
import type { RecentChange } from '@modules/system/dashboard/src/domain/entities/DashboardEntities';

interface Props {
      data: RecentChange[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

const EVENT_ICONS: Record<string, { icon: typeof Shield; color: string }> = {
      LoginSuccess: { icon: LogIn, color: 'text-green-500' },
      LoginFailed: { icon: LogOut, color: 'text-red-500' },
      AccountLocked: { icon: Lock, color: 'text-orange-500' },
      AccountUnlocked: { icon: Unlock, color: 'text-blue-500' },
      AccessDenied: { icon: UserX, color: 'text-yellow-500' },
      PasswordReset: { icon: Key, color: 'text-violet-500' },
      PermissionGranted: { icon: Shield, color: 'text-emerald-500' },
      PermissionRevoked: { icon: AlertTriangle, color: 'text-rose-500' },
};

export function SecurityTimeline({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      return (
            <Card>
                  <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-500" aria-hidden="true" />
                              <CardTitle className="text-base">{t('security.timeline.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('security.timeline.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        {isLoading ? (
                              <div className="space-y-4" role="status" aria-label={t('common.loading')}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                          <div key={i} className="flex gap-3">
                                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                                <div className="flex-1 space-y-1">
                                                      <Skeleton className="h-4 w-3/4" />
                                                      <Skeleton className="h-3 w-1/2" />
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        ) : error ? (
                              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-3">
                                    <p className="text-sm">{t('common.error')}</p>
                                    {onRetry && <Button variant="ghost" size="sm" onClick={onRetry}>{t('common.retry')}</Button>}
                              </div>
                        ) : data.length === 0 ? (
                              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                    <p className="text-sm">{t('security.noEvents')}</p>
                              </div>
                        ) : (
                              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2" aria-live="polite">
                                    {data.map((event) => {
                                          const config = EVENT_ICONS[event.eventType] ?? { icon: Shield, color: 'text-gray-500' };
                                          const Icon = config.icon;

                                          return (
                                                <div key={event.id} className="flex items-start gap-3 group">
                                                      <div className={`p-1.5 rounded-full bg-muted ${config.color} shrink-0 transition-transform group-hover:scale-110`}>
                                                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                  <Badge variant="outline" className="text-[10px]">{event.eventType}</Badge>
                                                                  {event.username && (
                                                                        <span className="text-xs text-muted-foreground">{event.username}</span>
                                                                  )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                                                                  {new Date(event.timestamp).toLocaleString()}
                                                            </p>
                                                      </div>
                                                      <Badge variant={event.isSuccess ? 'default' : 'destructive'} className="text-[9px] shrink-0">
                                                            {event.isSuccess ? '✓' : '✕'}
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
