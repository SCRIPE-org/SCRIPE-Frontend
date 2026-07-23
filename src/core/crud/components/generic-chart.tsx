"use client";

/**
 * Thin Recharts wrapper for generic CRUD dashboards.
 *
 * Series colours default to the shared --chart-N slot palette from
 * `@core/ui/chart`, so call sites stop passing raw hex — pass `color` only
 * to pin an entity to a specific slot, and pass a token read when you do.
 * For richer charts (config-driven tooltips, legends, theming) compose the
 * ChartContainer foundation in `@core/ui/chart` directly.
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
import { chartColor } from "@core/ui/chart";

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
  const ChartComponent = type === "line" ? LineChart : BarChart;

  // Same inline read the auth surfaces use; re-resolves on the next render.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
        <YAxis className="text-muted-foreground" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            color: "hsl(var(--popover-foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        {multiple ? (
          <>
            <Legend />
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
                  isAnimationActive={!reducedMotion}
                  animationDuration={200}
                />
              ) : (
                <Bar
                  key={item.dataKey}
                  dataKey={item.dataKey}
                  fill={seriesColor}
                  name={item.name}
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
            isAnimationActive={!reducedMotion}
            animationDuration={200}
          />
        ) : (
          <Bar
            dataKey={dataKey || "value"}
            fill={chartColor(1)}
            isAnimationActive={!reducedMotion}
            animationDuration={200}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
