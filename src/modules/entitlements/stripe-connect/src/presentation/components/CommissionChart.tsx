/**
 * CommissionChart
 * Line chart showing daily commission amount over a configurable period.
 * Uses recharts (already a SCRIPE dependency).
 */
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import type { CommissionTrendPoint } from "../../domain/entities/ConnectAccount";
import type { TrendPeriod } from "../viewmodels/useCommissionDashboardViewModel";

interface CommissionChartProps {
  trends: CommissionTrendPoint[];
  isLoading: boolean;
  trendDays: TrendPeriod;
  onChangePeriod: (days: TrendPeriod) => void;
  t: (key: string) => string;
}

const PERIODS: { label: string; key: string; value: TrendPeriod }[] = [
  { label: "30d", key: "filter30", value: 30 },
  { label: "90d", key: "filter90", value: 90 },
  { label: "365d", key: "filter365", value: 365 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

// Recharts Formatter has a complex overload intersection.

/**
 * React presentation component representing the commission chart UI element.
 */
export function CommissionChart({
  trends,
  isLoading,
  trendDays,
  onChangePeriod,
  t,
}: CommissionChartProps) {
  const chartData = trends.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    amount: point.amount,
    count: point.count,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">{t("entitlements.commissions.trendTitle")}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("entitlements.commissions.trendDesc")}
            </p>
          </div>
          {/* Period selector */}
          <div className="flex gap-1">
            {PERIODS.map(({ label, value }) => (
              <Button
                key={value}
                id={`trend-period-${value}`}
                variant={trendDays === value ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onChangePeriod(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            {t("common.loading") || "Loading..."}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            {t("entitlements.commissions.noData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                formatter={(
                  value: number | string | readonly (number | string)[] | undefined,
                  name: string | number | undefined
                ) => [
                  name === "amount" ? fmt(Number(value) || 0) : Number(value) || 0,
                  name === "amount"
                    ? t("entitlements.commissions.trendAmount")
                    : t("entitlements.commissions.trendCount"),
                ]}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "amount"
                    ? t("entitlements.commissions.trendAmount")
                    : t("entitlements.commissions.trendCount")
                }
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(215, 70%, 55%)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
