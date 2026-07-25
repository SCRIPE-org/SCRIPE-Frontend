"use client";

/**
 * The nexus chart foundation (Recharts).
 *
 * Recharts through this file is PRIMARY for all new chart work — module
 * surfaces compose ChartContainer/ChartTooltipContent directly. The
 * Chart.js wrapper in ./charts/generic-chart.tsx is LEGACY: kept working,
 * not extended.
 *
 * Colour comes from the global `--chart-1..8` categorical tokens
 * (globals.css defines both themes; the slot ORDER is the CVD-safety
 * mechanism). Consumers read slots through `chartColor` / `chartPalette` /
 * `CHART_TOKEN_PALETTE` below instead of passing raw hex — colour follows
 * the entity's fixed slot, never its rank in the current dataset.
 *
 * The chrome law for every chart in this system: axes, grids, cursors and
 * legends are hairlines and quiet ink; the SERIES is the only loud thing on
 * the canvas. Nothing on a chart moves at rest.
 */

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@core/common/utils";

// Format: { THEME_NAME: CSS_SELECTOR }. Dark mode is the `.dark` class on
// <html> (next-themes runs with attribute="class"); the `data-theme`
// attribute carries the COLOUR theme and coexists with `.dark`
// (`.dark[data-theme=…]` in globals.css), so ChartStyle's dark rules fire
// under every data-theme value.
const THEMES = { light: "", dark: ".dark" } as const;

/**
 * Fixed, ordered reads over the global `--chart-1..8` tokens. These are
 * var() reads, not resolved literals, so SVG-rendered charts (Recharts)
 * follow theme flips with zero JS. Chart.js call sites cannot use these —
 * canvas needs resolved colours; see ./charts/generic-chart.tsx.
 */
export const CHART_TOKEN_PALETTE = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
] as const;

/** Colour for a 1-based palette slot. Slots beyond 8 wrap around. */
export function chartColor(slot: number): string {
  const size = CHART_TOKEN_PALETTE.length;
  const index = (((Math.trunc(slot) - 1) % size) + size) % size;
  return CHART_TOKEN_PALETTE[index];
}

/** The first `count` slot colours, wrapping — for mapping over series. */
export function chartPalette(count: number): string[] {
  return Array.from({ length: count }, (_, i) => chartColor(i + 1));
}

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

/* ── Plot chrome ──────────────────────────────────────────────────────────
   Recharts paints its own defaults as presentation attributes (#ccc grids,
   #fff active-dot halos, #666 tick text). Those were previously overridden
   by SELECTING on the literal — `[stroke='#ccc']` — which meant the rule
   silently stopped applying the moment a caller passed its own stroke, and
   it put raw hex into our source. These target the structural class names
   instead, so the chrome is token-driven no matter what Recharts emits.

   Everything here is either a hairline (--nx-line) or quiet ink
   (--nx-ink-3/-2). The one exception is the focus ring: keyboard focus is
   the only state on a chart that earns accent light. */
const CHART_CHROME = [
  // Axes — hairline rules, tick labels in the quietest legible ink, and
  // tabular figures so a column of numbers lines up digit for digit.
  "[&_.recharts-cartesian-axis-line]:stroke-nx-line",
  "[&_.recharts-cartesian-axis-tick-line]:stroke-nx-line",
  "[&_.recharts-cartesian-axis-tick_text]:fill-nx-ink-3",
  "[&_.recharts-cartesian-axis-tick_text]:tabular-nums",
  "[&_.recharts-label]:fill-nx-ink-3",
  "[&_.recharts-text]:fill-nx-ink-3",
  // Grids — the quietest line in the system. A grid that competes with the
  // series is a grid that is drawn wrong.
  "[&_.recharts-cartesian-grid_line]:stroke-nx-line",
  "[&_.recharts-polar-grid_line]:stroke-nx-line",
  "[&_.recharts-polar-grid_path]:stroke-nx-line",
  // Reference lines are an authored annotation, so they sit one step up.
  "[&_.recharts-reference-line_line]:stroke-nx-line-hi",
  // Pie slice labels sit on the data, so they take full ink; the leader line
  // that connects them is chrome and stays a hairline.
  "[&_.recharts-pie-label-text]:fill-nx-ink",
  "[&_.recharts-pie-label-line]:stroke-nx-line-hi",
  // Recharts separates pie slices with a white stroke, which reads as a bright
  // scratch on a dark card. Painting it the surface colour keeps the gap and
  // loses the glare, in both themes.
  "[&_.recharts-pie-sector_.recharts-sector]:stroke-nx-surface",
  "[&_.recharts-legend-item-text]:!text-nx-ink-2",
  // Hover affordances — a fill step behind the bars, a hairline for the
  // line/area crosshair. Neither is a coloured wash.
  "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-nx-raised",
  "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-nx-line-hi",
  "[&_.recharts-radial-bar-background-sector]:fill-nx-raised",
  // The active dot's halo is Recharts' own white ring; make it the surface
  // it sits on so the dot reads as lifted rather than outlined in white.
  "[&_.recharts-active-dot_.recharts-dot]:stroke-nx-surface",
  // Focus — Recharts' accessibility layer puts tabIndex=0 on .recharts-surface,
  // so the blanket `outline-none` that shipped here erased the ONLY focus
  // indicator a keyboard user gets on a chart. Mouse focus stays silent;
  // keyboard focus wears the shared lit-edge ring.
  "[&_.recharts-layer:focus]:outline-none",
  "[&_.recharts-sector:focus]:outline-none",
  "[&_.recharts-surface:focus]:outline-none",
  "[&_.recharts-surface:focus-visible]:rounded-nx-sm",
  "[&_.recharts-surface:focus-visible]:shadow-nx-focus",
].join(" ");

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", CHART_CHROME, className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  // Generate safe CSS variables without dangerouslySetInnerHTML
  const generateCSSVariables = () => {
    const cssRules: string[] = [];

    Object.entries(THEMES).forEach(([theme, prefix]) => {
      const cssVars = colorConfig
        .map(([key, itemConfig]) => {
          const color =
            itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
          return color ? `--color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");

      if (cssVars) {
        cssRules.push(`${prefix} [data-chart=${id}] { ${cssVars} }`);
      }
    });

    return cssRules.join("\n");
  };

  const cssContent = generateCSSVariables();

  return <style>{cssContent}</style>;
};

const ChartTooltip = RechartsPrimitive.Tooltip;

/** One entry of a Recharts tooltip/legend payload, as far as we read it. */
interface ChartPayloadItem {
  name?: string;
  dataKey?: string | number;
  value?: unknown;
  color?: string;
  fill?: string;
  payload?: Record<string, unknown> & { fill?: string };
  [key: string]: unknown;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ChartPayloadItem[];
  className?: string;
  /** Swatch shape beside each series name. */
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: unknown;
  // The two formatters are declared with METHOD syntax on purpose. Recharts
  // hands us `unknown`, but call sites legitimately narrow their own parameter
  // (`(value: string | number) => …` for a date axis, for instance). Method
  // syntax keeps those parameters bivariant, so this file can state the honest
  // incoming type without every existing consumer having to widen its callback.
  labelFormatter?(value: unknown, payload: ChartPayloadItem[]): React.ReactNode;
  labelClassName?: string;
  formatter?(
    value: unknown,
    name: unknown,
    item: ChartPayloadItem,
    index: number,
    payload: unknown
  ): React.ReactNode;
  /** Pins every swatch to one colour instead of the series colour. */
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

/**
 * Renders a value the way a reader expects to see it.
 *
 * A genuine `0` is data and must print as "0" — the truthiness guard this
 * replaced dropped the number and left a labelled row with nothing in it.
 * Range series (Area with a `[min, max]` datum) print as a real range rather
 * than "0,5".
 */
function formatChartValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : String(value);
  }
  if (typeof value === "string" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((entry) => formatChartValue(entry)).filter((part) => part != null);
    return parts.length ? parts.join(" – ") : null;
  }
  return null;
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium text-nx-ink", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium text-nx-ink", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          // A tooltip genuinely floats, so it is one of the few things in the
          // system allowed a shadow. Hairline + popover surface, nothing else.
          "min-w-36 rounded-nx-md border border-nx-line bg-nx-popover px-3 py-2 text-xs text-nx-ink shadow-nx-popover",
          className
        )}
      >
        {/* The header is the context (a date, a bucket); a hairline separates
            it from the readings so the two do not read as one list. */}
        {!nestLabel && tooltipLabel ? (
          <div className="mb-1.5 border-b border-nx-line pb-1.5">{tooltipLabel}</div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload?.fill || item.color;
            const formattedValue = formatChartValue(item.value);

            return (
              <div
                key={`${key}-${index}`}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-nx-ink-3",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          aria-hidden="true"
                          className={cn("shrink-0 border-[--color-border] bg-[--color-bg]", {
                            // A round swatch matches the dot Recharts draws
                            // on the series itself.
                            "h-2.5 w-2.5 rounded-full": indicator === "dot",
                            "w-1 rounded-full": indicator === "line",
                            "w-0 rounded-none border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between gap-4 leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-nx-ink-2">{itemConfig?.label || item.name}</span>
                      </div>
                      {/* Tabular figures, so stacked readings align on the
                          decimal instead of drifting per glyph width. */}
                      {formattedValue != null && (
                        <span className="font-medium tabular-nums text-nx-ink">
                          {formattedValue}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

export interface ChartLegendContentProps {
  className?: string;
  hideIcon?: boolean;
  payload?: ChartPayloadItem[];
  verticalAlign?: "top" | "middle" | "bottom";
  nameKey?: string;
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          // A legend is a key, not a control: quiet ink, generous gaps, and it
          // wraps rather than clipping when a chart narrows.
          "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-nx-ink-2",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item, index) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={`${key}-${index}`}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-nx-ink-3"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
