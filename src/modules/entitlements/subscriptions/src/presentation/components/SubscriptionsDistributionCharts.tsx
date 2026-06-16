"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Users, CreditCard, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface DistItem {
  status?: string;
  type?: string;
  count: number;
  percentage: number;
  color: string;
}

interface EditionRevenueItem {
  edition: string;
  revenue: number;
  percentage: number;
  color: string;
}

interface SubscriptionsDistributionChartsProps {
  statusDistribution: DistItem[];
  typeDistribution: DistItem[];
  revenueByEdition: EditionRevenueItem[];
  totalCount: number;
  formatDisplay: (amount: number, currency: string) => string;
  t: (key: string) => string;
}

export function SubscriptionsDistributionCharts({
  statusDistribution,
  typeDistribution,
  revenueByEdition,
  totalCount,
  formatDisplay,
  t,
}: SubscriptionsDistributionChartsProps) {
  // Format tooltips for pie charts
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
          <p className="font-bold">{data.name}</p>
          <p className="mt-0.5 font-medium text-muted-foreground">
            {t("common.count") || "Count"}:{" "}
            <span className="font-bold text-foreground">{data.value}</span> ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Format tooltips for bar chart
  const renderBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
          <p className="font-bold">{data.edition}</p>
          <p className="mt-0.5 font-medium text-muted-foreground">
            {t("entSubscriptions.amount") || "Revenue"}:{" "}
            <span className="font-bold text-foreground">{formatDisplay(data.revenue, "USD")}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const statusPieData = statusDistribution.map((item) => ({
    name: t(`tenant.statusLabel.${item.status?.toLowerCase()}`) || item.status,
    value: item.count,
    percentage: item.percentage,
    color: item.color,
  }));

  const typePieData = typeDistribution.map((item) => ({
    name: t(`tenant.typeLabel.${item.type?.toLowerCase()}`) || item.type,
    value: item.count,
    percentage: item.percentage,
    color: item.color,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Status Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/95">
            <Users className="h-4.5 w-4.5 text-muted-foreground" />
            {t("dashboard.chart.statusDist") || "Status Distribution"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-[120px] w-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderPieTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                  {totalCount}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {t("common.total") || "Total"}
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2.5">
              {statusDistribution.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">
                      {t(`tenant.statusLabel.${item.status?.toLowerCase()}`) || item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-foreground">{item.count}</span>
                    <span className="w-12 text-right text-[10px] text-muted-foreground/80">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/95">
            <CreditCard className="h-4.5 w-4.5 text-muted-foreground" />
            {t("dashboard.chart.typeDist") || "Type Distribution"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-[120px] w-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderPieTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                  {totalCount}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {t("common.total") || "Total"}
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2.5">
              {typeDistribution.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">
                      {t(`tenant.typeLabel.${item.type?.toLowerCase()}`) || item.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-foreground">{item.count}</span>
                    <span className="w-12 text-right text-[10px] text-muted-foreground/80">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Edition */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/95">
            <BarChart3 className="h-4.5 w-4.5 text-muted-foreground" />
            {t("dashboard.chart.revenueByEdition") || "Revenue by Edition"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {revenueByEdition.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-sm font-semibold text-muted-foreground/80">
              {t("common.noData") || "No revenue data"}
            </div>
          ) : (
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueByEdition.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="edition"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={renderBarTooltip} cursor={{ fill: "rgba(0, 0, 0, 0.04)" }} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {revenueByEdition.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
