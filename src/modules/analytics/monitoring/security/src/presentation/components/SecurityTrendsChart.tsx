"use client";

import React, { useMemo, memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@core/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";
import type { LoginActivityPoint } from "../../domain/entities/SecurityEntities";

interface SecurityTrendsChartProps {
  data: LoginActivityPoint[];
  isLoading: boolean;
  onRetry?: () => void;
  cardClasses?: string;
}

export const SecurityTrendsChart = memo(function SecurityTrendsChart({
  data,
  isLoading,
  onRetry,
  cardClasses,
}: SecurityTrendsChartProps) {
  const { t } = useI18n();

  const chartConfig = useMemo<ChartConfig>(
    () => ({
      failed: {
        label: t("security.trends.failedLogins") || "Failed Logins",
        color: "hsl(var(--destructive))",
      },
      success: {
        label: t("security.trends.successLogins") || "Successful Logins",
        color: "hsl(var(--primary))",
      },
    }),
    [t]
  );

  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: formatDateUtc(d.date),
      failed: d.failedCount,
      success: d.successCount,
      total: d.successCount + d.failedCount,
    }));
  }, [data]);

  return (
    <Card className={`h-full flex flex-col ${cardClasses || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {t("security.trends.title") || "Security Trends"}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("security.trends.description") ||
                  "Daily authentication volume and failure trends across platform endpoints"}
              </CardDescription>
            </div>
          </div>

          {/* Quick legend pills */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span>{t("security.trends.failed") || "Failed"}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{t("security.trends.success") || "Successful"}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <SectionState
          isLoading={isLoading}
          onRetry={onRetry}
          isEmpty={chartData.length === 0}
          emptyMessage={t("security.trends.noData") || "No authentication activity recorded for this period."}
          height={260}
        >
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="secTrendSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="secTrendFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                className="text-[11px] fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                className="text-[11px] fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="success"
                stroke="var(--color-success)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#secTrendSuccess)"
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="var(--color-failed)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#secTrendFailed)"
              />
            </AreaChart>
          </ChartContainer>
        </SectionState>
      </CardContent>
    </Card>
  );
});
