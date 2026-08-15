"use client";

/**
 * Charts — the one group that shows rather than asks.
 *
 * There is no chart *setting*: series colour comes from the eight fixed
 * `--chart-N` slots, which the workspace accent and the light/dark theme drive.
 * So this group is a reference — the real Recharts foundation from
 * `@core/ui/chart` drawing those tokens, which means it doubles as the living
 * check that the palette still reads correctly under every accent and theme.
 */

import { useI18n } from "@core/providers/i18n-provider";
import {
  CHART_TOKEN_PALETTE,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
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
import { GroupPanel, Row } from "../controls";
import { ROW } from "../settings-map";

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

export function ChartsGroup() {
  const { t } = useI18n();

  // Same inline read the auth surfaces use; a preference change mid-session
  // re-resolves on the next render.
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    <GroupPanel title={t("settings.tabs.charts")}>
      <Row row={ROW["chart-palette"]}>
        <div className="space-y-8">
          {/* The palette itself — the eight fixed --chart-N slots. Slot order
              is the CVD-safety mechanism (see globals.css), so each swatch
              carries its slot number. */}
          <div>
            <p className="mb-3 font-mono text-xs text-nx-ink-3">--chart-1 … --chart-8</p>
            <div className="flex flex-wrap gap-3">
              {CHART_TOKEN_PALETTE.map((color, index) => (
                <div key={color} className="flex flex-col items-center gap-1.5">
                  <span
                    aria-hidden
                    className="block h-9 w-9 rounded-nx-sm ring-1 ring-nx-line"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono text-[0.625rem] tabular-nums text-nx-ink-3">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 2xl:grid-cols-2">
            <figure className="min-w-0">
              <figcaption className="mb-3">
                <span className="block text-sm font-medium text-nx-ink">
                  {t("settings.charts.area.title")}
                </span>
                <span className="block text-xs text-nx-ink-3">
                  {t("settings.charts.area.description")}
                </span>
              </figcaption>
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
            </figure>

            <figure className="min-w-0">
              <figcaption className="mb-3">
                <span className="block text-sm font-medium text-nx-ink">
                  {t("settings.charts.bar.title")}
                </span>
                <span className="block text-xs text-nx-ink-3">
                  {t("settings.charts.bar.description")}
                </span>
              </figcaption>
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
            </figure>

            <figure className="min-w-0">
              <figcaption className="mb-3">
                <span className="block text-sm font-medium text-nx-ink">
                  {t("settings.charts.pie.donut.title")}
                </span>
                <span className="block text-xs text-nx-ink-3">
                  {t("charts.common.deviceUsage")}
                </span>
              </figcaption>
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
            </figure>
          </div>
        </div>
      </Row>
    </GroupPanel>
  );
}
