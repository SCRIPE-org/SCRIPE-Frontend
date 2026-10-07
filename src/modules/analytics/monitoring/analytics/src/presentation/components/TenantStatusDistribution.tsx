"use client";

import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface StatusItem {
  status: string;
  count: number;
  percentage: number;
  fill: string;
}

interface TenantStatusDistributionProps {
  data: StatusItem[];
  isLoading: boolean;
  totalTenants: number;
}

export function TenantStatusDistribution({
  data,
  isLoading,
  totalTenants,
}: TenantStatusDistributionProps) {
  const { t } = useI18n();

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return t("tenantAnalytics.status.active") || status;
      case "trial":
        return t("tenantAnalytics.status.trial") || status;
      case "suspended":
        return t("tenantAnalytics.status.suspended") || status;
      case "deactivated":
        return t("tenantAnalytics.status.deactivated") || status;
      default:
        return status;
    }
  };

  const chartData = useMemo(() => {
    return data.map((d) => ({
      name: getStatusLabel(d.status),
      value: d.count,
      fill: d.fill,
      percentage: d.percentage,
    }));
  }, [data, t]);

  return (
    <Card className="h-full flex flex-col border-border/80 bg-card/80 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            {t("tenantAnalytics.status.title") || "Tenant Status"}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {t("tenantAnalytics.status.subtitle") ||
            "Operational and lifecycle distribution across all tenant workspaces"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2 flex-1 flex flex-col justify-center min-h-[240px]">
        {isLoading ? (
          <div className="h-[200px] w-full animate-pulse rounded-lg bg-muted/20" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            {t("tenantAnalytics.status.noData") || "No status data available"}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            {/* Donut chart */}
            <div className="relative h-[126px] w-[126px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 p-2 shadow-md backdrop-blur-xs text-xs">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-foreground">{totalTenants}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                  {t("tenantAnalytics.status.tenants") || "Tenants"}
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 min-w-0 space-y-2">
              {data.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-medium text-foreground whitespace-nowrap text-[11px] sm:text-xs">
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground shrink-0 font-mono text-[11px]">
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
