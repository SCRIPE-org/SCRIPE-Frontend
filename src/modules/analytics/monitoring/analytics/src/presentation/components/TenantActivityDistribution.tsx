/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useMemo } from "react";
import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { ActivityDistributionItem } from "../../domain/entities/AnalyticsEntities";

interface TenantActivityDistributionProps {
  data: ActivityDistributionItem[];
  isLoading: boolean;
  totalTenants: number;
}

/**
 * TenantActivityDistribution
 */
export function TenantActivityDistribution({
  data,
  isLoading,
  totalTenants,
}: TenantActivityDistributionProps) {
  const { t } = useI18n();

  const getActivityLabel = (level: string, defaultLabel: string) => {
    switch (level.toLowerCase()) {
      case "highly_active":
      case "high":
        return t("tenantAnalytics.activity.highlyActive") || defaultLabel;
      case "moderately_active":
      case "moderate":
        return t("tenantAnalytics.activity.moderatelyActive") || defaultLabel;
      case "low_activity":
      case "low":
        return t("tenantAnalytics.activity.lowActivity") || defaultLabel;
      case "inactive":
        return t("tenantAnalytics.activity.inactive") || defaultLabel;
      default:
        return defaultLabel;
    }
  };

  const chartData = useMemo(() => {
    return data.map((d) => ({
      name: getActivityLabel(d.level, d.label),
      value: d.count,
      fill: d.fill,
      percentage: d.percentage,
    }));
  }, [data, t]);

  return (
    <Card className="backdrop-blur-xs shadow-xs flex h-full flex-col border-border/80 bg-card/80">
      <CardHeader className="p-4 pb-2 sm:p-5">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            {t("tenantAnalytics.activity.title") || "Tenant Activity Distribution"}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {t("tenantAnalytics.activity.subtitle") ||
            "Engagement level based on authentication frequency and active seats"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-[220px] flex-1 flex-col justify-center p-4 pt-2 sm:p-5">
        {isLoading ? (
          <div className="h-[200px] w-full animate-pulse rounded-lg bg-muted/20" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            {t("tenantAnalytics.activity.noData") || "No activity data available"}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            {/* Donut chart with center text */}
            <div className="relative h-[126px] w-[126px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="backdrop-blur-xs rounded-lg border border-border bg-popover/95 p-2 text-xs shadow-md">
                            <span className="font-semibold text-foreground">{item.name}: </span>
                            <span className="font-bold text-primary">{item.value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={54}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center count display */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-foreground">{totalTenants}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("tenantAnalytics.activity.tenants") || "Tenants"}
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="min-w-0 flex-1 space-y-2">
              {data.map((item) => (
                <div key={item.level} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="whitespace-nowrap text-[11px] font-medium text-foreground sm:text-xs">
                      {getActivityLabel(item.level, item.label)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground">{item.count}</span>
                    <span className="text-[10px] text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
