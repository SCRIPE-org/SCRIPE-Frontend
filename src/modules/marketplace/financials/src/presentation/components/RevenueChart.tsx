"use client";

import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { TrendingUp } from "lucide-react";

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
  /** Chart title (default: "Revenue Over Time"). */
  title?: string;
  /** Total revenue figure to display in the header. */
  totalRevenue?: number;
  /** Optional CSS class. */
  className?: string;
}

/**
 * RevenueChart (Phase 5.4)
 *
 * Area chart for developer/marketplace revenue over time.
 * Uses Recharts (already a dependency via @core/charts).
 *
 * Pure presentational — data is provided by the parent ViewModel.
 * No direct data fetching inside this component.
 */
export function RevenueChart({
  data,
  currencySymbol = "$",
  title = "Revenue Over Time",
  totalRevenue,
  className = "",
}: RevenueChartProps) {
  // Compute trend: positive = green, flat/negative = muted
  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].revenue;
    const last = data[data.length - 1].revenue;
    return last - first;
  }, [data]);

  const trendColor = trend >= 0 ? "text-green-600" : "text-destructive";

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <h3 className="text-base font-semibold">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No revenue data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          {totalRevenue !== undefined && (
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight">
                {currencySymbol}
                {totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {trend !== 0 && (
                <p className={`flex items-center gap-0.5 text-xs justify-end ${trendColor}`}>
                  <TrendingUp className="size-3" />
                  {trend > 0 ? "+" : ""}
                  {currencySymbol}
                  {Math.abs(trend).toLocaleString(undefined, { maximumFractionDigits: 0 })} vs start
                </p>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${currencySymbol}${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value) => {
                const num = typeof value === "number" ? value : 0;
                return [
                  `${currencySymbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  "Revenue",
                ] as [string, string];
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
