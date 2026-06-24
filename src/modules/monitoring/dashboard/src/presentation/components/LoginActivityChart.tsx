"use client";

/**
 * Login Activity Chart
 *
 * Area chart showing successful vs failed logins over time.
 * Uses Recharts via core chart wrapper.
 */
import { useMemo, memo } from "react";
import type { LoginActivityPoint } from "../../domain/entities/DashboardEntities";
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

interface Props {
  data: LoginActivityPoint[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  chartPalette?: string[];
}

/**
 * Constant definition representing login activity chart.
 */
export const LoginActivityChart = memo(function LoginActivityChart({
  data,
  isLoading,
  error,
  onRetry,
  chartPalette,
}: Props) {
  const { t } = useI18n();

  // Use palette colors if provided, otherwise fall back to CSS vars
  const successColor = chartPalette?.[0] || "hsl(var(--chart-2))";
  const failedColor = chartPalette?.[4] || "hsl(var(--chart-5))";

  const chartConfig = useMemo<ChartConfig>(
    () => ({
      successCount: {
        label: t("dashboard.loginActivity.successful"),
        color: successColor,
      },
      failedCount: {
        label: t("dashboard.loginActivity.failed"),
        color: failedColor,
      },
    }),
    [t, successColor, failedColor]
  );

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        successCount: point.successCount,
        failedCount: point.failedCount,
      })),
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>{t("dashboard.loginActivity.title")}</CardTitle>
            <CardDescription>{t("dashboard.loginActivity.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={data.length === 0}
          height={300}
        >
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
        </SectionState>
      </CardContent>
    </Card>
  );
});
