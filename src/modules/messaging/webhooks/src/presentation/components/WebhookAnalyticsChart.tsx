/**
 * WebhookAnalyticsChart
 *
 * Daily delivery stats chart with area/bar visualization.
 * Shows delivered vs failed deliveries and average latency over time.
 * Uses the shadcn ChartContainer pattern.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@core/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { WebhookAnalytics } from "../../domain/entities/Webhook";
import { BarChart3, TrendingUp, Clock, Skull, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";

interface WebhookAnalyticsChartProps {
  analytics: WebhookAnalytics | null;
  isLoading: boolean;
}

const chartConfig: ChartConfig = {
  delivered: {
    label: "Delivered",
    color: "hsl(152, 69%, 41%)", // emerald-500
  },
  failed: {
    label: "Failed",
    color: "hsl(0, 72%, 51%)", // red-500
  },
};

/**
 * Presentation UI component rendering the webhook analytics chart.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhookAnalyticsChart({ analytics, isLoading }: WebhookAnalyticsChartProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  if (!analytics) return null;

  const chartData = analytics.dailyStats.map((d) => ({
    date: d.date,
    delivered: d.delivered,
    failed: d.failed,
    total: d.total,
    avgLatencyMs: d.avgLatencyMs,
  }));

  const summaryCards = [
    {
      label: t("webhooks.analytics.successRate") || "Success Rate",
      value: analytics.totalEvents > 0 ? `${analytics.successRate.toFixed(1)}%` : "—",
      icon: TrendingUp,
      color:
        analytics.successRate >= 95
          ? "text-emerald-600 dark:text-emerald-400"
          : analytics.successRate >= 80
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400",
      bg:
        analytics.successRate >= 95
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : analytics.successRate >= 80
            ? "bg-amber-50 dark:bg-amber-950/30"
            : "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: t("webhooks.analytics.avgLatency") || "Avg Latency",
      value: analytics.avgLatencyMs > 0 ? `${analytics.avgLatencyMs.toFixed(0)}ms` : "—",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: t("webhooks.analytics.p95Latency") || "P95 Latency",
      value: analytics.p95LatencyMs > 0 ? `${analytics.p95LatencyMs.toFixed(0)}ms` : "—",
      icon: BarChart3,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: t("webhooks.analytics.deadLettered") || "Dead Lettered",
      value: analytics.deadLetteredCount.toLocaleString(),
      sub: analytics.retryingCount > 0 ? `${analytics.retryingCount} retrying` : undefined,
      icon: analytics.deadLetteredCount > 0 ? Skull : RefreshCw,
      color:
        analytics.deadLetteredCount > 0
          ? "text-red-600 dark:text-red-400"
          : "text-zinc-500 dark:text-zinc-400",
      bg:
        analytics.deadLetteredCount > 0
          ? "bg-red-50 dark:bg-red-950/30"
          : "bg-zinc-50 dark:bg-zinc-800/30",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-border/50">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${card.bg} shrink-0`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-none tracking-tight">{card.value}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("webhooks.analytics.deliveryTrend") || "Delivery Trend"}
          </CardTitle>
          <CardDescription>
            {t("webhooks.analytics.last30days") || "Daily delivery breakdown — last 30 days"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              {t("webhooks.analytics.noData") || "No delivery data available"}
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-delivered)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-delivered)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    try {
                      return format(parseISO(value), "MMM d");
                    } catch {
                      return value;
                    }
                  }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={4} width={40} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value: string | number) => {
                        try {
                          return format(parseISO(value as string), "MMM d, yyyy");
                        } catch {
                          return value as string;
                        }
                      }}
                    />
                  }
                />
                <Area
                  dataKey="delivered"
                  type="monotone"
                  fill="url(#fillDelivered)"
                  stroke="var(--color-delivered)"
                  strokeWidth={2}
                  stackId="1"
                />
                <Area
                  dataKey="failed"
                  type="monotone"
                  fill="url(#fillFailed)"
                  stroke="var(--color-failed)"
                  strokeWidth={2}
                  stackId="1"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
