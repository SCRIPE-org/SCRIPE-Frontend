'use client';

/**
 * Failed Logins Heatmap
 *
 * Displays a bar chart of daily failed login attempts.
 */
import { useMemo } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Skeleton } from '@core/ui/skeleton';
import { Button } from '@core/ui/button';
import {
      BarChart,
      Bar,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      ResponsiveContainer,
} from 'recharts';
import { ShieldAlert } from 'lucide-react';

interface HeatmapPoint {
      date: string;
      failed: number;
      total: number;
}

interface Props {
      data: HeatmapPoint[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

export function FailedLoginsHeatmap({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      const chartData = useMemo(() =>
            data.map((d) => ({
                  date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                  failed: d.failed,
            })),
            [data]);

      return (
            <Card>
                  <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4 text-red-500" aria-hidden="true" />
                              <CardTitle className="text-base">{t('security.failedLogins.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('security.failedLogins.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        {isLoading ? (
                              <Skeleton className="h-[250px] w-full" aria-label={t('common.loading')} />
                        ) : error ? (
                              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground gap-3">
                                    <p className="text-sm">{t('common.error')}</p>
                                    {onRetry && <Button variant="ghost" size="sm" onClick={onRetry}>{t('common.retry')}</Button>}
                              </div>
                        ) : chartData.length === 0 ? (
                              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                                    <p className="text-sm">{t('security.noEvents')}</p>
                              </div>
                        ) : (
                              <div aria-live="polite">
                                    <ResponsiveContainer width="100%" height={250}>
                                          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                                                <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 11 }} />
                                                <Tooltip
                                                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                                                />
                                                <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                                          </BarChart>
                                    </ResponsiveContainer>
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}
