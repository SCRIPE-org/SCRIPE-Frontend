"use client";

/**
 * Login Comparison Chart
 *
 * Multi-line area chart comparing successful vs failed logins over time.
 * Uses core ChartContainer for theme-aware dark/light mode rendering.
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
  type ChartConfig,
} from "@core/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import type { ComparisonDataPoint } from "../../domain/entities/AnalyticsEntities";

interface Props {
  data: ComparisonDataPoint[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

/**
 * Exported constant defining parameters and fields for login comparison chart configurations.
 */
export const LoginComparisonChart = memo(function LoginComparisonChart({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  const chartConfig = useMemo<ChartConfig>(
    () => ({
      successful: {
        label: t("tenantAnalytics.comparison.successful"),
        color: "hsl(var(--chart-2))",
      },
      failed: {
        label: t("tenantAnalytics.comparison.failed"),
        color: "hsl(var(--chart-5))",
      },
    }),
    [t]
  );

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        successful: d.successCount,
        failed: d.failedCount,
      })),
    [data]
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" aria-hidden="true" />
          <CardTitle className="text-base">{t("tenantAnalytics.comparison.title")}</CardTitle>
        </div>
        <CardDescription>{t("tenantAnalytics.comparison.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={chartData.length === 0}
          height={280}
        >
          <ChartContainer config={chartConfig} className="h-[280px]">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillSuccessful" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-successful)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-successful)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="successful"
                stroke="var(--color-successful)"
                fill="url(#fillSuccessful)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="var(--color-failed)"
                fill="url(#fillFailed)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </SectionState>
      </CardContent>
    </Card>
  );
});
