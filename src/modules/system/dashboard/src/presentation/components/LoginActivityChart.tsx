'use client';

/**
 * Login Activity Chart
 *
 * Area chart showing successful vs failed logins over time.
 * Uses Recharts via core chart wrapper.
 */
import { useMemo } from 'react';
import type { LoginActivityPoint } from '../../domain/entities/DashboardEntities';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { Skeleton } from '@core/ui/skeleton';
import {
      ChartContainer,
      ChartTooltip,
      ChartTooltipContent,
      type ChartConfig,
} from '@core/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Props {
      data: LoginActivityPoint[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

export function LoginActivityChart({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      const chartConfig = useMemo<ChartConfig>(() => ({
            successCount: {
                  label: t('dashboard.loginActivity.successful'),
                  color: 'hsl(var(--chart-2))',
            },
            failedCount: {
                  label: t('dashboard.loginActivity.failed'),
                  color: 'hsl(var(--chart-5))',
            },
      }), [t]);

      const chartData = useMemo(() =>
            data.map((point) => ({
                  date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  successCount: point.successCount,
                  failedCount: point.failedCount,
            })),
            [data]);

      return (
            <Card>
                  <CardHeader>
                        <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-muted-foreground" />
                              <div>
                                    <CardTitle>{t('dashboard.loginActivity.title')}</CardTitle>
                                    <CardDescription>{t('dashboard.loginActivity.description')}</CardDescription>
                              </div>
                        </div>
                  </CardHeader>
                  <CardContent>
                        {isLoading ? (
                              <div className="space-y-3" role="status" aria-label={t('common.loading')}>
                                    <Skeleton className="h-[300px] w-full" />
                              </div>
                        ) : error ? (
                              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-3">
                                    <p className="text-sm">{t('common.error')}</p>
                                    {onRetry && (
                                          <button
                                                onClick={onRetry}
                                                className="text-sm text-primary hover:underline"
                                          >
                                                {t('common.retry')}
                                          </button>
                                    )}
                              </div>
                        ) : data.length === 0 ? (
                              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                    {t('common.noData')}
                              </div>
                        ) : (
                              <ChartContainer config={chartConfig} className="h-[300px]">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                          <defs>
                                                <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                                                      <stop offset="5%" stopColor="var(--color-successCount)" stopOpacity={0.8} />
                                                      <stop offset="95%" stopColor="var(--color-successCount)" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                                                      <stop offset="5%" stopColor="var(--color-failedCount)" stopOpacity={0.8} />
                                                      <stop offset="95%" stopColor="var(--color-failedCount)" stopOpacity={0.1} />
                                                </linearGradient>
                                          </defs>
                                          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                          <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
                                          <YAxis tickLine={false} axisLine={false} className="text-xs" allowDecimals={false} />
                                          <ChartTooltip content={<ChartTooltipContent />} />
                                          <Area
                                                type="monotone"
                                                dataKey="successCount"
                                                stroke="var(--color-successCount)"
                                                fill="url(#fillSuccess)"
                                                strokeWidth={2}
                                          />
                                          <Area
                                                type="monotone"
                                                dataKey="failedCount"
                                                stroke="var(--color-failedCount)"
                                                fill="url(#fillFailed)"
                                                strokeWidth={2}
                                          />
                                    </AreaChart>
                              </ChartContainer>
                        )}
                  </CardContent>
            </Card>
      );
}
