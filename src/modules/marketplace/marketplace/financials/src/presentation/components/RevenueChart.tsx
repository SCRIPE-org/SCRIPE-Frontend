"use client";

import { useMemo } from "react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartColor,
  type ChartConfig,
} from "@core/ui/chart";
import { useI18n } from "@core/providers/i18n-provider";
import { TrendingUp, BarChart3 } from "lucide-react";

/** A single data point for the revenue chart. */
export interface RevenueDataPoint {
  /** Display label for the X-axis (e.g. "Jan", "Feb", "2024-01"). */
  label: string;
  /** Revenue amount in the primary currency. */
  revenue: number;
  /** Optional: number of purchases in this period. */
  purchases?: number;
}

interface RevenueChartProps {
  /** The revenue time-series data to plot. */
  data: RevenueDataPoint[];
  /** Currency symbol for tooltip (default: "$"). */
  currencySymbol?: string;
  /** Chart title. Defaults to the localized "Revenue Over Time". */
  title?: string;
  /** Total revenue figure to display in the header. */
  totalRevenue?: number;
  /** Optional CSS class. */
  className?: string;
}

/**
 * RevenueChart (Phase 5.4)
 *
 * Area chart for developer/marketplace revenue over time, composed from the
 * shared Recharts foundation (@core/ui/chart) — axes, grid and tooltip chrome
 * come from ChartContainer, so this file only supplies the series colour and
 * the data.
 *
 * Pure presentational — data is provided by the parent ViewModel.
 * No direct data fetching inside this component.
 */
export function RevenueChart({
  data,
  currencySymbol = "$",
  title,
  totalRevenue,
  className = "",
}: RevenueChartProps) {
  const { t } = useI18n();
  const chartTitle = title ?? t("marketplace.financialsRevenueChartTitle");

  // Compute trend: positive = success tone, flat/negative = destructive tone
  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].revenue;
    const last = data[data.length - 1].revenue;
    return last - first;
  }, [data]);

  const trendColor = trend >= 0 ? "text-success" : "text-destructive";

  const chartConfig: ChartConfig = {
    revenue: { label: t("marketplace.financialsRevenueLabel"), color: chartColor(2) },
  };

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <h3 className="text-base font-semibold text-nx-ink">{chartTitle}</h3>
        </CardHeader>
        <CardContent>
          <EmptyState
            size="sm"
            bare
            icon={BarChart3}
            title={t("marketplace.financialsNoRevenueData")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-nx-ink">{chartTitle}</h3>
          {totalRevenue !== undefined && (
            <div className="text-end">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-nx-ink">
                {currencySymbol}
                {totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {trend !== 0 && (
                <p className={`flex items-center justify-end gap-0.5 text-xs ${trendColor}`}>
                  <TrendingUp className="size-3" aria-hidden="true" />
                  {trend > 0 ? "+" : ""}
                  {currencySymbol}
                  {Math.abs(trend).toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                  {t("marketplace.financialsVsStart")}
                </p>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px]">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${currencySymbol}${v.toLocaleString()}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const num = typeof value === "number" ? value : 0;
                    return (
                      <div className="flex flex-1 items-center justify-between gap-4">
                        <span className="text-nx-ink-2">
                          {t("marketplace.financialsRevenueLabel")}
                        </span>
                        <span className="font-medium tabular-nums text-nx-ink">
                          {currencySymbol}
                          {num.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
