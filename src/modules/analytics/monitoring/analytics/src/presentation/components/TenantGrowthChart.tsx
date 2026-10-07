"use client";

import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TenantGrowthPoint } from "../../domain/entities/AnalyticsEntities";

interface TenantGrowthChartProps {
  data: TenantGrowthPoint[];
  isLoading: boolean;
  timeRangeLabel: string;
}

export function TenantGrowthChart({
  data,
  isLoading,
  timeRangeLabel,
}: TenantGrowthChartProps) {
  const { t } = useI18n();

  const formattedData = useMemo(() => {
    return data.map((d) => {
      const parts = d.date.split("-");
      const shortDate =
        parts.length === 3
          ? `${new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
          : d.date;
      return {
        ...d,
        displayDate: shortDate,
      };
    });
  }, [data]);

  return (
    <Card className="h-full flex flex-col border-border/80 bg-card/80 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">
                {t("tenantAnalytics.growth.title") || "Tenant Growth"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {t("tenantAnalytics.growth.subtitle") ||
                `Total tenants and new tenants over time (${timeRangeLabel.toLowerCase()})`}
            </CardDescription>
          </div>

          {/* Legend indicator */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{t("tenantAnalytics.growth.totalTenants") || "Total Tenants"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-info" />
              <span>{t("tenantAnalytics.growth.newTenants") || "New Tenants"}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2 flex-1 flex flex-col justify-between min-h-[220px]">
        {isLoading ? (
          <div className="h-[220px] w-full animate-pulse rounded-lg bg-muted/20 flex-1" />
        ) : formattedData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground flex-1">
            {t("tenantAnalytics.growth.noData") || "No tenant growth data in this time range"}
          </div>
        ) : (
          <div className="h-[220px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))", opacity: 0.5 }}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-md backdrop-blur-xs">
                          <p className="text-[11px] font-semibold text-foreground mb-1">
                            {label}
                          </p>
                          {payload.map((entry, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-4 text-xs"
                            >
                              <span
                                className="flex items-center gap-1.5 text-muted-foreground"
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}:
                              </span>
                              <span className="font-bold text-foreground">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Bar for new tenants */}
                <Bar
                  dataKey="newTenants"
                  name={t("tenantAnalytics.growth.newTenants") || "New Tenants"}
                  fill="hsl(var(--info))"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                  opacity={0.85}
                />
                {/* Line / Area for total cumulative tenants */}
                <Area
                  type="monotone"
                  dataKey="totalTenants"
                  name={t("tenantAnalytics.growth.totalTenants") || "Total Tenants"}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#growthAreaGradient)"
                  dot={{ r: 2.5, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
