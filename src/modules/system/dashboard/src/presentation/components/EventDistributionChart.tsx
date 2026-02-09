'use client';

/**
 * Event Distribution Chart
 *
 * Pie/donut chart showing event type breakdown.
 */
import { useMemo, memo } from 'react';
import type { EventTypeCount } from '../../domain/entities/DashboardEntities';
import { useI18n } from '@core/providers/i18n-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/ui/card';
import { SectionState } from '@core/ui/section-state';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@core/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { PieChartIcon } from 'lucide-react';

interface Props {
      data: EventTypeCount[];
      isLoading: boolean;
      error?: Error | null;
      onRetry?: () => void;
}

const COLORS = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
      'hsl(210, 70%, 50%)',
      'hsl(280, 60%, 50%)',
      'hsl(30, 80%, 50%)',
];

export const EventDistributionChart = memo(function EventDistributionChart({ data, isLoading, error, onRetry }: Props) {
      const { t } = useI18n();

      const chartConfig = useMemo<ChartConfig>(() => {
            const config: ChartConfig = {};
            data.forEach((item, index) => {
                  config[item.eventType] = {
                        label: item.eventType,
                        color: COLORS[index % COLORS.length],
                  };
            });
            return config;
      }, [data]);

      const chartData = useMemo(() =>
            data.map((item, index) => ({
                  name: item.eventType,
                  value: item.count,
                  fill: COLORS[index % COLORS.length],
            })),
            [data]);

      const totalEvents = useMemo(() =>
            data.reduce((sum, item) => sum + item.count, 0),
            [data]);

      return (
            <Card className="h-full">
                  <CardHeader>
                        <div className="flex items-center gap-2">
                              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                    <CardTitle>{t('dashboard.eventDistribution.title')}</CardTitle>
                                    <CardDescription>{t('dashboard.eventDistribution.description')}</CardDescription>
                              </div>
                        </div>
                  </CardHeader>
                  <CardContent>
                        <SectionState isLoading={isLoading} error={error} onRetry={onRetry} isEmpty={data.length === 0} height={300}>
                              <div className="space-y-4">
                                    <ChartContainer config={chartConfig} className="h-[200px]">
                                          <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                                                      {chartData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                          </PieChart>
                                    </ChartContainer>
                                    <div className="space-y-1.5">
                                          {data.slice(0, 5).map((item, index) => {
                                                const percentage = totalEvents > 0 ? ((item.count / totalEvents) * 100).toFixed(1) : '0';
                                                return (
                                                      <div key={item.eventType} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                                  <span className="text-muted-foreground truncate">{item.eventType}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                  <span className="text-muted-foreground tabular-nums">{percentage}%</span>
                                                                  <span className="font-medium tabular-nums">{item.count.toLocaleString()}</span>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                          {data.length > 5 && (
                                                <p className="text-[10px] text-muted-foreground text-center">+{data.length - 5} more</p>
                                          )}
                                    </div>
                              </div>
                        </SectionState>
                  </CardContent>
            </Card>
      );
});
