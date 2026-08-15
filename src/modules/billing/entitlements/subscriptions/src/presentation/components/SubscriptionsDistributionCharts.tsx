"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, chartColor } from "@core/ui/chart";
import { Users, CreditCard, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";

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

// Fixed entity → categorical-slot assignments, so a status/type keeps the
// same colour no matter where it currently ranks in the sorted list (the
// slot order itself is the CVD-safety mechanism — see @core/ui/chart).
const STATUS_SLOT: Record<string, number> = {
  Active: 2,
  Trialing: 1,
  Suspended: 3,
  Canceled: 5,
  Expired: 6,
  GracePeriod: 4,
};

const TYPE_SLOT: Record<string, number> = {
  Monthly: 1,
  Yearly: 4,
  Lifetime: 7,
  Trial: 8,
  AddOn: 6,
};

/**
 * Presentation UI component rendering the subscriptions distribution charts.
 * Status/type donuts plus a revenue-by-edition bar, all through
 * ChartContainer so chrome (axes, grids, tooltip, focus ring) is token-driven
 * rather than hand-styled per chart.
 */
export function SubscriptionsDistributionCharts({
  statusDistribution,
  typeDistribution,
  revenueByEdition,
  totalCount,
  formatDisplay,
  t,
}: SubscriptionsDistributionChartsProps) {
  const statusPieData = statusDistribution.map((item) => ({
    status: item.status,
    name: t(`tenant.statusLabel.${item.status?.toLowerCase()}`) || item.status,
    value: item.count,
    percentage: item.percentage,
    color: chartColor(item.status ? (STATUS_SLOT[item.status] ?? 8) : 8),
  }));

  const typePieData = typeDistribution.map((item) => ({
    type: item.type,
    name: t(`tenant.typeLabel.${item.type?.toLowerCase()}`) || item.type,
    value: item.count,
    percentage: item.percentage,
    color: chartColor(item.type ? (TYPE_SLOT[item.type] ?? 8) : 8),
  }));

  const revenueBars = revenueByEdition.slice(0, 5).map((item, index) => ({
    ...item,
    color: chartColor(index + 1),
  }));

  const revenueFormatter = (value: unknown, name: unknown) => (
    <div className="flex flex-1 items-center justify-between gap-4">
      <span className="text-nx-ink-2">{String(name)}</span>
      <span className="font-medium tabular-nums text-nx-ink">
        {formatDisplay(Number(value), "USD")}
      </span>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Status Distribution */}
      <Card>
        <CardHeader className="border-b border-nx-line pb-3">
          <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
            <Users className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            {t("dashboard.chart.statusDist")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-[120px] w-[120px] shrink-0">
              <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusPieData.map((entry) => (
                      <Cell key={entry.status ?? entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold tabular-nums tracking-tight text-nx-ink">
                  {totalCount}
                </span>
                <span className="text-[10px] font-semibold uppercase text-nx-ink-3">
                  {t("common.total")}
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2.5">
              {statusPieData.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-nx-ink-2">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-nx-ink">{item.value}</span>
                    <span className="w-12 text-end text-[10px] text-nx-ink-3">
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
      <Card>
        <CardHeader className="border-b border-nx-line pb-3">
          <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
            <CreditCard className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            {t("dashboard.chart.typeDist")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-[120px] w-[120px] shrink-0">
              <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {typePieData.map((entry) => (
                      <Cell key={entry.type ?? entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold tabular-nums tracking-tight text-nx-ink">
                  {totalCount}
                </span>
                <span className="text-[10px] font-semibold uppercase text-nx-ink-3">
                  {t("common.total")}
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2.5">
              {typePieData.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-nx-ink-2">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-nx-ink">{item.value}</span>
                    <span className="w-12 text-end text-[10px] text-nx-ink-3">
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
      <Card>
        <CardHeader className="border-b border-nx-line pb-3">
          <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
            <BarChart3 className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            {t("dashboard.chart.revenueByEdition")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {revenueBars.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-sm font-medium text-nx-ink-3">
              {t("common.noData")}
            </div>
          ) : (
            <div className="h-[140px] w-full">
              <ChartContainer
                config={{ revenue: { label: t("entSubscriptions.amount") } }}
                className="h-full w-full"
              >
                <BarChart
                  data={revenueBars}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="edition"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={revenueFormatter} />} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {revenueBars.map((entry) => (
                      <Cell key={entry.edition} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
