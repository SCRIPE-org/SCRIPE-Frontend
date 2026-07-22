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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import type { DistributionData } from "../../domain/entities/AnalyticsEntities";
import { ChartTooltip } from "@core/ui/chart";

// The five --chart-* tokens, matching every other module chart. The previous
// eight hardcoded hexes were identical in both themes and ignored tenant
// theming entirely; the series repeat past five rather than reintroduce
// colours the token layer does not define.
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

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

  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        name: d.eventType,
        value: d.count,
        fill: COLORS[i % COLORS.length],
      })),
    [data]
  );

  const total = useMemo(() => chartData.reduce((acc, d) => acc + d.value, 0), [chartData]);

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-primary" aria-hidden="true" />
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
              <ChartTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{
                  color: "hsl(var(--popover-foreground))",
                }}
                labelStyle={{
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: any) => {
                  const num = Number(value) || 0;
                  const pct = total > 0 ? ((num / total) * 100).toFixed(1) : "0";
                  return [num + " (" + pct + "%)", ""];
                }}
              />
              <Legend
                formatter={(value: string) => {
                  const item = chartData.find((d) => d.name === value);
                  const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
                  return value + " (" + pct + "%)";
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </SectionState>
      </CardContent>
    </Card>
  );
});
