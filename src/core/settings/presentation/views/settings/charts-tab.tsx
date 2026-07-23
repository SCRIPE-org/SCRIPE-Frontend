"use client";

/**
 * Settings → Charts: an honest preview of the real chart foundation.
 *
 * The previous incarnation was a twelve-file, ~3,800-line Chart.js demo
 * gallery (Professional*Charts) with 246 colour literals that no product
 * surface imported. This tab now renders what modules actually ship: the
 * Recharts foundation from `@core/ui/chart` drawing the global --chart-1..8
 * tokens — so the preview IS the palette, in both themes, under every
 * workspace accent.
 *
 * The export keeps its historical name: SettingsView lazy-imports
 * `ProfessionalChartsTab`, and that file belongs to another slot.
 */

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  CHART_TOKEN_PALETTE,
  chartColor,
  type ChartConfig,
} from "@core/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

/* Sample series — quarter and device labels come from the existing
   charts.common.* keys, so the preview is localized without new strings. */
const QUARTER_KEYS = ["q1", "q2", "q3", "q4"] as const;
const TREND_VALUES = [
  { revenue: 186, profit: 80 },
  { revenue: 305, profit: 137 },
  { revenue: 237, profit: 96 },
  { revenue: 341, profit: 172 },
];
const BAR_VALUES = [
  { sales: 214, users: 140 },
  { sales: 305, users: 200 },
  { sales: 262, users: 180 },
  { sales: 390, users: 260 },
];
const DEVICE_SLICES = [
  { key: "desktop", value: 46 },
  { key: "mobile", value: 38 },
  { key: "tablet", value: 11 },
  { key: "other", value: 5 },
];

export function ProfessionalChartsTab() {
  const { t } = useI18n();

  // Same inline read the auth surfaces use; a preference change mid-session
  // re-resolves on the next render.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const trendData = QUARTER_KEYS.map((key, index) => ({
    quarter: t(`charts.common.${key}`),
    ...TREND_VALUES[index],
  }));
  const trendConfig = {
    revenue: { label: t("charts.common.revenue"), color: chartColor(1) },
    profit: { label: t("charts.common.profit"), color: chartColor(2) },
  } satisfies ChartConfig;

  const barData = QUARTER_KEYS.map((key, index) => ({
    quarter: t(`charts.common.${key}`),
    ...BAR_VALUES[index],
  }));
  const barConfig = {
    sales: { label: t("charts.common.sales"), color: chartColor(3) },
    users: { label: t("charts.common.users"), color: chartColor(4) },
  } satisfies ChartConfig;

  const deviceData = DEVICE_SLICES.map((slice, index) => ({
    name: t(`charts.common.${slice.key}`),
    value: slice.value,
    fill: chartColor(index + 1),
  }));
  const deviceConfig = deviceData.reduce<ChartConfig>((config, slice) => {
    config[slice.name] = { label: slice.name, color: slice.fill };
    return config;
  }, {});

  return (
    <div className="space-y-6">
      {/* The palette itself — the eight fixed --chart-N slots. Slot order is
          the CVD-safety mechanism (see globals.css), so the swatches carry
          their slot number. */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.tabs.charts")}</CardTitle>
          <CardDescription>
            <code className="font-mono text-xs">--chart-1 … --chart-8</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {CHART_TOKEN_PALETTE.map((color, index) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <div
                  className="h-9 w-9 rounded-md border border-border"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.charts.area.title")}</CardTitle>
            <CardDescription>{t("settings.charts.area.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[220px] w-full">
              <AreaChart data={trendData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  fill="var(--color-revenue)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                />
                <Area
                  dataKey="profit"
                  type="monotone"
                  stroke="var(--color-profit)"
                  fill="var(--color-profit)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.charts.bar.title")}</CardTitle>
            <CardDescription>{t("settings.charts.bar.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[220px] w-full">
              <BarChart data={barData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="sales"
                  fill="var(--color-sales)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                />
                <Bar
                  dataKey="users"
                  fill="var(--color-users)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.charts.pie.donut.title")}</CardTitle>
            <CardDescription>{t("charts.common.deviceUsage")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={deviceConfig} className="h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                >
                  {deviceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
