'use client';

/**
 * Admin Distribution Pie Chart
 *
 * Donut chart showing event distribution across types.
 * Uses SectionState for consistent loading/error/empty states.
 */
import { useMemo, memo } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { SectionState } from '@core/ui/section-state';
import {
      PieChart,
      Pie,
      Cell,
      ResponsiveContainer,
      Tooltip,
      Legend,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { EventTypeCount } from '@modules/system/dashboard/src/domain/entities/DashboardEntities';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface Props {
      data: EventTypeCount[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

export const AdminDistributionPie = memo(function AdminDistributionPie({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      const chartData = useMemo(() =>
            data.map((d, i) => ({
                  name: d.eventType,
                  value: d.count,
                  fill: COLORS[i % COLORS.length],
            })),
            [data]);

      const total = useMemo(() => chartData.reduce((acc, d) => acc + d.value, 0), [chartData]);

      return (
            <Card>
                  <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                              <PieChartIcon className="h-4 w-4 text-violet-500" aria-hidden="true" />
                              <CardTitle className="text-base">{t('tenantAnalytics.distribution.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('tenantAnalytics.distribution.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        <SectionState
                              isLoading={isLoading}
                              error={error}
                              onRetry={onRetry}
                              isEmpty={chartData.length === 0}
                              height={280}
                        >
                              <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                          <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                          >
                                                {chartData.map((entry) => (
                                                      <Cell key={entry.name} fill={entry.fill} className="outline-none" />
                                                ))}
                                          </Pie>
                                          <Tooltip
                                                contentStyle={{
                                                      backgroundColor: 'hsl(var(--popover))',
                                                      border: '1px solid hsl(var(--border))',
                                                      borderRadius: '8px',
                                                      fontSize: '12px',
                                                }}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                formatter={(value: any) => {
                                                      const num = Number(value) || 0;
                                                      const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0';
                                                      return [num + ' (' + pct + '%)', ''];
                                                }}
                                          />
                                          <Legend
                                                formatter={(value: string) => {
                                                      const item = chartData.find(d => d.name === value);
                                                      const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                                                      return value + ' (' + pct + '%)';
                                                }}
                                          />
                                    </PieChart>
                              </ResponsiveContainer>
                        </SectionState>
                  </CardContent>
            </Card>
      );
});
