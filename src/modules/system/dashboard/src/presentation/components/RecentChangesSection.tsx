'use client';

/**
 * Recent Changes Section
 *
 * Activity feed showing latest entity modifications.
 */
import { useMemo, memo } from 'react';
import type { RecentChange } from '../../domain/entities/DashboardEntities';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { SectionState } from '@core/ui/section-state';
import { Badge } from '@core/ui/badge';
import { ScrollArea } from '@core/ui/scroll-area';
import {
      Plus,
      Pencil,
      Trash2,
      Shield,
      Key,
      Activity,
      History,
} from 'lucide-react';

interface Props {
      data: RecentChange[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

const eventIconMap: Record<string, typeof Activity> = {
      Create: Plus,
      Update: Pencil,
      Delete: Trash2,
      RoleAssigned: Shield,
      RoleUnassigned: Shield,
      PermissionGranted: Key,
      PermissionRevoked: Key,
};

const eventColorMap: Record<string, string> = {
      Create: 'bg-green-500/10 text-green-500',
      Update: 'bg-blue-500/10 text-blue-500',
      Delete: 'bg-red-500/10 text-red-500',
      RoleAssigned: 'bg-violet-500/10 text-violet-500',
      RoleUnassigned: 'bg-orange-500/10 text-orange-500',
      PermissionGranted: 'bg-emerald-500/10 text-emerald-500',
      PermissionRevoked: 'bg-rose-500/10 text-rose-500',
};

function formatTimeAgo(timestamp: string, t: (key: string, params?: Record<string, string | number>) => string): string {
      const diff = Date.now() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return t('common.timeAgo.justNow');
      if (minutes < 60) return t('common.timeAgo.minutesAgo', { count: minutes });
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return t('common.timeAgo.hoursAgo', { count: hours });
      const days = Math.floor(hours / 24);
      return t('common.timeAgo.daysAgo', { count: days });
}

export const RecentChangesSection = memo(function RecentChangesSection({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      const items = useMemo(() => data, [data]);

      return (
            <Card>
                  <CardHeader>
                        <div className="flex items-center gap-2">
                              <History className="h-5 w-5 text-muted-foreground" />
                              <div>
                                    <CardTitle>{t('dashboard.recentChanges.title')}</CardTitle>
                                    <CardDescription>{t('dashboard.recentChanges.description')}</CardDescription>
                              </div>
                        </div>
                  </CardHeader>
                  <CardContent>
                        <SectionState
                              isLoading={isLoading}
                              error={error}
                              onRetry={onRetry}
                              isEmpty={data.length === 0}
                              emptyMessage={t('dashboard.recentChanges.noChanges')}
                              skeletonType="rows"
                              skeletonRows={5}
                              height={350}
                        >
                              <ScrollArea className="h-[350px]">
                                    <div className="space-y-3" aria-live="polite">
                                          {items.map((change) => {
                                                const Icon = eventIconMap[change.eventType] ?? Activity;
                                                const colorClass = eventColorMap[change.eventType] ?? 'bg-gray-500/10 text-gray-500';
                                                return (
                                                      <div key={change.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className={`p-2 rounded-full shrink-0 ${colorClass}`}>
                                                                  <Icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                  <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-sm truncate">{change.username ?? 'System'}</span>
                                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{change.eventType}</Badge>
                                                                  </div>
                                                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                                        {change.entityType} {change.entityId ? `#${change.entityId.slice(0, 8)}` : ''}
                                                                  </p>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                                                  {formatTimeAgo(change.timestamp, t)}
                                                            </span>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </ScrollArea>
                        </SectionState>
                  </CardContent>
            </Card>
      );
});
