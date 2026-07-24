"use client";

/**
 * Admin Distribution Pie Chart
 *
 * Donut chart showing event distribution across types.
 * Uses SectionState for consistent loading/error/empty states.
 */
import { useMemo, memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartColor,
  type ChartConfig,
} from "@core/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import type { DistributionData } from "../../domain/entities/AnalyticsEntities";

interface Props {
  data: DistributionData[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

/**
 * Exported constant defining parameters and fields for admin distribution pie configurations.
 */
export const AdminDistributionPie = memo(function AdminDistributionPie({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  // Fixed, ordered reads over the global --chart-* slots — colour follows
  // the entity's position in the response, not a hardcoded hex ramp, so the
  // series stays theme-aware and CVD-safe like every other chart here.
  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    data.forEach((item, index) => {
      config[item.eventType] = { label: item.eventType, color: chartColor(index + 1) };
    });
    return config;
  }, [data]);

  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        name: d.eventType,
        value: d.count,
        fill: chartColor(i + 1),
      })),
    [data]
  );

  const total = useMemo(() => chartData.reduce((acc, d) => acc + d.value, 0), [chartData]);

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          <CardTitle className="text-base">{t("tenantAnalytics.distribution.title")}</CardTitle>
        </div>
        <CardDescription>{t("tenantAnalytics.distribution.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={chartData.length === 0}
          height={280}
        >
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[200px]">
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
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            {/* A Recharts Legend can't format a per-item percentage, so the
                breakdown renders as its own list — the same composition
                EventDistributionChart uses for the sibling dashboard pie. */}
            <div className="space-y-1.5">
              {chartData.map((entry) => {
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
                return (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="truncate text-nx-ink-2">{entry.name}</span>
                    </div>
                    <span className="shrink-0 tabular-nums text-nx-ink-3">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionState>
      </CardContent>
    </Card>
  );
});
