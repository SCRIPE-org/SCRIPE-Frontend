"use client";

/**
 * Thin Recharts wrapper for generic CRUD dashboards.
 *
 * Series colours default to the shared --chart-N slot palette from
 * `@core/ui/chart`, so call sites stop passing raw hex — pass `color` only
 * to pin an entity to a specific slot, and pass a token read when you do.
 * For richer charts (config-driven tooltips, legends, theming) compose the
 * ChartContainer foundation in `@core/ui/chart` directly.
 *
 * Chrome follows the same law as the rest of the chart system: axes and grid
 * are hairlines, labels are the quietest legible ink, and the series is the
 * only loud mark. Recharts paints its own defaults (#ccc grids, #666 tick
 * text) as SVG attributes, which the Tailwind classes that used to sit here
 * could never override — `className="stroke-muted"` on a CartesianGrid styles
 * the <g>, not the <line> children that carry their own stroke attribute. So
 * the tokens are passed as props, the way Recharts actually reads them.
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { chartColor } from "@core/ui/chart";
import { CustomChartTooltip } from "@core/ui/charts/chart-tooltip";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";

/* Token reads, as Recharts props rather than classes. Browsers resolve var()
   in SVG presentation attributes, which is the same mechanism the shared
   CHART_TOKEN_PALETTE relies on — so these follow a theme flip with no JS. */
const HAIRLINE = "var(--nx-line)";
const HAIRLINE_HI = "var(--nx-line-hi)";
const INK_QUIET = "var(--nx-ink-3)";
const SURFACE = "var(--nx-surface)";
const CURSOR_FILL = "var(--nx-raised)";

interface ChartProps {
  data: any[];
  type: "line" | "bar";
  dataKey?: string;
  height?: number;
  multiple?: Array<{
    dataKey: string;
    /** Optional slot pin; defaults to the series' palette slot. */
    color?: string;
    name: string;
  }>;
}

export function GenericChart({ data, type, dataKey, height = 300, multiple }: ChartProps) {
  const { t } = useI18n();
  const ChartComponent = type === "line" ? LineChart : BarChart;

  // Same inline read the auth surfaces use; re-resolves on the next render.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // An empty dataset used to render a frame of naked axes, which reads as a
  // broken chart rather than as "nothing to plot yet".
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col justify-center" style={{ height }}>
        <EmptyState size="sm" bare icon={BarChart3} title={t("common.noData")} />
      </div>
    );
  }

  const axisTick = { fill: INK_QUIET, fontSize: 12 };
  // Tabular figures so a column of axis numbers lines up digit for digit.
  const axisTickStyle = { fontVariantNumeric: "tabular-nums" as const };
  const activeDot = { r: 4, strokeWidth: 2, stroke: SURFACE };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        {/* Horizontal rules only: vertical grid lines add a second grid the
            reader never asked for and compete with bar edges. */}
        <CartesianGrid strokeDasharray="3 3" stroke={HAIRLINE} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...axisTick, style: axisTickStyle }}
          tickLine={false}
          axisLine={{ stroke: HAIRLINE }}
          tickMargin={8}
        />
        <YAxis
          tick={{ ...axisTick, style: axisTickStyle }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        {/* The shared tooltip, so a CRUD dashboard and a module dashboard show
            the same anatomy — and so a genuine 0 prints as "0". */}
        <Tooltip
          content={<CustomChartTooltip />}
          cursor={type === "bar" ? { fill: CURSOR_FILL } : { stroke: HAIRLINE_HI, strokeWidth: 1 }}
        />
        {multiple ? (
          <>
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ color: INK_QUIET, fontSize: 12, paddingTop: 8 }}
            />
            {multiple.map((item, index) => {
              const seriesColor = item.color ?? chartColor(index + 1);
              return type === "line" ? (
                <Line
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  stroke={seriesColor}
                  strokeWidth={2}
                  name={item.name}
                  dot={false}
                  activeDot={activeDot}
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                />
              ) : (
                <Bar
                  key={item.dataKey}
                  dataKey={item.dataKey}
                  fill={seriesColor}
                  name={item.name}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                />
              );
            })}
          </>
        ) : type === "line" ? (
          <Line
            type="monotone"
            dataKey={dataKey || "value"}
            stroke={chartColor(1)}
            strokeWidth={2}
            dot={false}
            activeDot={activeDot}
            isAnimationActive={!reducedMotion}
            animationDuration={200}
          />
        ) : (
          <Bar
            dataKey={dataKey || "value"}
            fill={chartColor(1)}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            isAnimationActive={!reducedMotion}
            animationDuration={200}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
