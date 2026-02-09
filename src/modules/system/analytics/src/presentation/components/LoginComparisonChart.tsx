'use client';

/**
 * Login Comparison Chart
 *
 * Multi-line area chart comparing successful vs failed logins over time.
 */
import { useMemo, memo } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Skeleton } from '@core/ui/skeleton';
import { Button } from '@core/ui/button';
import {
      AreaChart,
      Area,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      ResponsiveContainer,
      Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { LoginActivityPoint } from '@modules/system/dashboard/src/domain/entities/DashboardEntities';

interface Props {
      data: LoginActivityPoint[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

export const LoginComparisonChart = memo(function LoginComparisonChart({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      const chartData = useMemo(() =>
            data.map((d) => ({
                  date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                  successful: d.successCount,
                  failed: d.failedCount,
            })),
            [data]);

      return (
            <Card>
                  <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" aria-hidden="true" />
                              <CardTitle className="text-base">{t('tenantAnalytics.comparison.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('tenantAnalytics.comparison.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        {isLoading ? (
                              <Skeleton className="h-[280px] w-full" aria-label={t('common.loading')} />
                        ) : error ? (
                              <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground gap-3">
                                    <p className="text-sm">{t('common.error')}</p>
                                    {onRetry && <Button variant="ghost" size="sm" onClick={onRetry}>{t('common.retry')}</Button>}
                              </div>
                        ) : chartData.length === 0 ? (
                              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                                    <p className="text-sm">{t('common.noData')}</p>
                              </div>
                        ) : (
                              <div aria-live="polite">
                                    <ResponsiveContainer width="100%" height={280}>
                                          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                                <defs>
                                                      <linearGradient id="colorSuccessful" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                      </linearGradient>
                                                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                      </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                                                <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 11 }} />
                                                <Tooltip
                                                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                                                />
                                                <Legend />
                                                <Area type="monotone" dataKey="successful" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccessful)" />
                                                <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailed)" />
                                          </AreaChart>
                                    </ResponsiveContainer>
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
});
