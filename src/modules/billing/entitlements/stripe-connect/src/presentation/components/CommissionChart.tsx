/**
 * CommissionChart
 * Line chart showing daily commission amount over a configurable period.
 * Recharts via the shared @core/ui/chart foundation — colour comes from the
 * fixed chart-token slots, never a raw hex/hsl literal.
 */
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { SectionState } from "@core/ui/section-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  chartColor,
  type ChartConfig,
} from "@core/ui/chart";
import type { CommissionTrendPoint } from "../../domain/entities/ConnectAccount";
import type { TrendPeriod } from "../viewmodels/useCommissionDashboardViewModel";
import { formatDateUtc } from "@core/common/utils";

interface CommissionChartProps {
  trends: CommissionTrendPoint[];
  isLoading: boolean;
  trendDays: TrendPeriod;
  onChangePeriod: (days: TrendPeriod) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const PERIODS: readonly TrendPeriod[] = [30, 90, 365];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Presentation UI component rendering the commission chart.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CommissionChart({
  trends,
  isLoading,
  trendDays,
  onChangePeriod,
  t,
}: CommissionChartProps) {
  const chartConfig: ChartConfig = {
    amount: { label: t("entitlements.commissions.trendAmount"), color: chartColor(1) },
    count: { label: t("entitlements.commissions.trendCount"), color: chartColor(4) },
  };

  const chartData = trends.map((point) => ({
    date: formatDateUtc(point.date),
    amount: point.amount,
    count: point.count,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">{t("entitlements.commissions.trendTitle")}</CardTitle>
            <CardDescription>{t("entitlements.commissions.trendDesc")}</CardDescription>
          </div>
          {/* Period selector */}
          <div
            className="flex gap-1"
            role="group"
            aria-label={t("entitlements.commissions.filterDays")}
          >
            {PERIODS.map((value) => (
              <Button
                key={value}
                id={`trend-period-${value}`}
                variant={trendDays === value ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onChangePeriod(value)}
                aria-pressed={trendDays === value}
              >
                {t("entitlements.commissions.trendPeriodDays", { days: value })}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <SectionState
          isLoading={isLoading}
          isEmpty={chartData.length === 0}
          emptyMessage={t("entitlements.commissions.noData")}
          height={220}
        >
          <ChartContainer config={chartConfig} className="h-[220px]">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={fmt}
                className="text-xs"
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="var(--color-amount)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 3 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </SectionState>
      </CardContent>
    </Card>
  );
}
