"use client";

/**
 * GenericChart — the LEGACY Chart.js wrapper.
 *
 * New chart work composes the Recharts foundation in `@core/ui/chart`
 * (ChartContainer + the chartColor/--chart-1..8 palette helpers); this
 * wrapper stays only for canvas-rendered Chart.js call sites. Chart.js
 * paints to <canvas>, so CSS var() reads never reach it — every colour in
 * this file is resolved from the computed token values at call time and
 * re-resolved when the theme flips.
 *
 * The chrome follows the same law as the Recharts side: axes, grids and the
 * legend are hairlines and quiet ink, the series is the only loud thing, and
 * nothing on the canvas moves once the entry animation has settled.
 */

import React, { useRef, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Chart, registerables, ChartConfiguration, ChartOptions, ChartData } from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { BarChart3, Download, Maximize2, RotateCcw, Filter } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@core/ui/collapsible";

// Register all Chart.js components
Chart.register(...registerables);

/* Canvas needs literal colour strings, so this resolves an HSL-triplet
   token from the computed styles at call time. The SSR fallback is a
   neutral mid grey; real values arrive on the first client render. Alpha
   goes through the hsl slash channel, never string concatenation. */
const FALLBACK_TRIPLET = "0 0% 50%";

const readToken = (name: string, alpha?: number) => {
  if (typeof window === "undefined") return `hsl(${FALLBACK_TRIPLET})`;
  const triplet =
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || FALLBACK_TRIPLET;
  return alpha == null ? `hsl(${triplet})` : `hsl(${triplet} / ${alpha})`;
};

/* The --nx- shell tokens hold COMPLETE colour values (#hex / rgba() /
   oklch()), not HSL triplets, so they must not go through readToken's hsl()
   wrapper — wrapping silently produces an invalid colour and Chart.js falls
   back to its own #666 defaults. That is exactly what happened to the legend:
   it carried no colour at all and painted Chart.js grey on the dark ground. */
const readShellToken = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

/* Shared empty default for every optional object prop. A fresh `{}` per render
   changes identity every time, which re-ran the build effect on every render
   and pushed a chart.update() through with it. */
const NO_OVERRIDES = {} as const;

/** One axis of the declared `scales` prop — `false` means "hide this axis". */
type AxisSpec =
  | boolean
  | { display?: boolean; title?: string; stacked?: boolean; beginAtZero?: boolean }
  | undefined;

export interface GenericChartProps {
  title: string;
  description: string;
  data: ChartData;
  options?: ChartOptions;
  type: "line" | "bar" | "pie" | "doughnut" | "radar" | "scatter" | "bubble";
  className?: string;
  exportable?: boolean;
  resizable?: boolean;
  filterable?: boolean;
  onReset?: () => void;
  // Advanced customization options
  height?: number | string;
  width?: number | string;
  theme?: "light" | "dark" | "auto";
  animation?: boolean | { duration?: number; easing?: string };
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: boolean | { position?: "top" | "bottom" | "left" | "right"; display?: boolean };
    tooltip?: boolean | { enabled?: boolean; mode?: string; intersect?: boolean };
    title?: boolean | { display?: boolean; text?: string; position?: string };
  };
  scales?: {
    x?: boolean | { display?: boolean; title?: string; stacked?: boolean };
    y?: boolean | { display?: boolean; title?: string; stacked?: boolean; beginAtZero?: boolean };
  };
  elements?: {
    point?: { radius?: number; hoverRadius?: number; borderWidth?: number };
    line?: { tension?: number; borderWidth?: number };
    bar?: { borderWidth?: number; borderRadius?: number };
  };
  interaction?: {
    mode?: "nearest" | "index" | "point" | "dataset";
    intersect?: boolean;
  };
  // Data transformation options
  dataTransform?: {
    sort?: boolean;
    reverse?: boolean;
    filter?: (item: any) => boolean;
    map?: (item: any) => any;
  };
  // Export options
  exportOptions?: {
    formats?: ("png" | "jpeg" | "pdf" | "svg")[];
    filename?: string;
    quality?: number;
  };
  // Loading and error states
  loading?: boolean;
  error?: string | null;
  onError?: (error: Error) => void;
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
}

export function GenericChart({
  title,
  description,
  data,
  options = NO_OVERRIDES,
  type,
  className,
  exportable = true,
  resizable = true,
  filterable = true,
  onReset,
  height = 400,
  width = "100%",
  // `theme` is inert by design: every colour on this canvas is resolved from
  // the live computed tokens, so the chart already follows next-themes. Kept
  // in the signature so existing call sites keep type-checking.
  theme = "auto",
  animation = true,
  responsive = true,
  maintainAspectRatio = false,
  plugins = NO_OVERRIDES,
  scales = NO_OVERRIDES,
  elements = NO_OVERRIDES,
  interaction = NO_OVERRIDES,
  dataTransform = NO_OVERRIDES,
  exportOptions = NO_OVERRIDES,
  loading = false,
  error = null,
  onError,
  ariaLabel,
  ariaDescription,
}: GenericChartProps) {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const descriptionId = React.useId();
  // Held in a ref so an inline `onError={…}` at a call site does not give the
  // build effect a new identity on every render. Synced in an effect rather
  // than during render (a render-phase ref write is a side effect): this effect
  // is declared before the build effect, so it commits the latest handler first
  // in the same pass, while `onError` itself stays out of the build deps.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Seeded from the real dataset count. Seeding with [] meant every
  // `!visibleDatasets[index]` read `!undefined` on the first render, so a
  // freshly mounted chart drew nothing at all until the dataset count changed.
  const [visibleDatasets, setVisibleDatasets] = useState<boolean[]>(() =>
    new Array(data.datasets?.length ?? 0).fill(true)
  );

  // Handle click outside to close filter. The ref sits on the wrapper, not on
  // the panel, so a mousedown on the trigger itself is "inside" and the
  // disclosure toggles once instead of closing and reopening.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFilterOpen(false);
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFilterOpen]);

  // Initialize visible datasets (render-time, no setState in effect)
  const prevDatasetCountRef = useRef(data.datasets?.length ?? 0);
  const datasetCount = data.datasets?.length ?? 0;
  if (datasetCount !== prevDatasetCountRef.current) {
    prevDatasetCountRef.current = datasetCount;
    setVisibleDatasets(new Array(datasetCount).fill(true));
  }

  // Filter datasets based on visibility, and apply the declared dataTransform
  // to each series — sort/reverse/filter/map were part of the published API
  // and were silently ignored.
  const filteredData = useMemo(() => {
    const { sort, reverse, filter, map } = dataTransform;

    const transform = (points: unknown) => {
      if (!Array.isArray(points)) return points;
      let next = points;
      if (filter) next = next.filter(filter);
      if (map) next = next.map(map);
      // Numeric-aware: Array.prototype.sort's default is lexicographic, which
      // orders 10 before 9 and quietly lies about the shape of the series.
      if (sort)
        next = [...next].sort((a, b) =>
          typeof a === "number" && typeof b === "number"
            ? a - b
            : String(a).localeCompare(String(b))
        );
      if (reverse) next = [...next].reverse();
      return next;
    };

    return {
      ...data,
      datasets:
        data.datasets?.map((dataset: any, index: number) => ({
          ...dataset,
          data: transform(dataset.data),
          // `?? true` so a dataset that arrives before the count sync still
          // draws rather than starting life hidden.
          hidden: !(visibleDatasets[index] ?? true),
        })) || [],
    };
  }, [data, visibleDatasets, dataTransform]);

  const handleDatasetToggle = (index: number) => {
    const newVisibleDatasets = [...visibleDatasets];
    newVisibleDatasets[index] = !newVisibleDatasets[index];
    setVisibleDatasets(newVisibleDatasets);
  };

  const toggleAllDatasets = () => {
    const allVisible = visibleDatasets.every((visible) => visible);
    setVisibleDatasets(new Array(data.datasets?.length || 0).fill(!allVisible));
  };

  // ── Which of the four states are we in ───────────────────────────
  // A chart with no series is not a chart with empty axes — it is an empty
  // state, and it says so.
  const hasSeries = (data.datasets ?? []).some(
    (dataset: any) => Array.isArray(dataset?.data) && dataset.data.length > 0
  );
  const status: "error" | "loading" | "empty" | "ready" = error
    ? "error"
    : loading
      ? "loading"
      : hasSeries
        ? "ready"
        : "empty";
  const isReady = status === "ready";

  useEffect(() => {
    const canvas = canvasRef.current;
    // The canvas only exists in the ready state; when it goes away with the
    // chart still alive, the instance is pointing at a detached node.
    if (!canvas) {
      chartRef.current?.destroy();
      chartRef.current = null;
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Entry animation: ~300ms, and none at all under reduced motion. The
    // previous 2000ms easeInOutQuart replayed on every rebuild and read as
    // the chart re-drawing itself rather than settling.
    const resolvedAnimation = (
      prefersReducedMotion || animation === false
        ? false
        : {
            duration: 300,
            easing: "easeOutQuart",
            ...(typeof animation === "object" ? animation : {}),
          }
    ) as ChartOptions["animation"];

    // Chrome ink, resolved from the computed token values — which change when
    // the theme does, so resolvedTheme is a real dependency. The previous
    // hardcoded rgba(255,255,255,·) made every axis label invisible in light
    // mode; the legend carried no colour at all.
    const inkPrimary = readShellToken("--nx-ink", readToken("--foreground"));
    const inkLegend = readShellToken("--nx-ink-2", readToken("--muted-foreground"));
    const inkTicks = readShellToken("--nx-ink-3", readToken("--muted-foreground"));
    const hairline = readShellToken("--nx-line", readToken("--border", 0.5));
    const popoverSurface = readShellToken("--nx-popover", readToken("--popover"));

    // Declared-but-ignored props, wired. Each one reads `false` as "off",
    // an object as an override, and anything else as the considered default.
    const legendProp = plugins.legend;
    const legendObject = typeof legendProp === "object" ? legendProp : undefined;
    const tooltipProp = plugins.tooltip;
    const tooltipObject = typeof tooltipProp === "object" ? tooltipProp : undefined;
    const titleProp = plugins.title;
    const titleObject = typeof titleProp === "object" ? titleProp : undefined;

    const axis = (spec: AxisSpec) => {
      const config = typeof spec === "object" && spec !== null ? spec : {};
      return {
        display: spec === false ? false : config.display !== false,
        stacked: config.stacked ?? false,
        ...(config.beginAtZero != null ? { beginAtZero: config.beginAtZero } : {}),
        // Grid lines are the quietest mark on the canvas; the axis border is
        // the same hairline, so the plot frame reads as one weight.
        grid: { color: hairline, drawTicks: false },
        border: { color: hairline },
        ticks: { color: inkTicks, font: { size: 11 }, padding: 8 },
        ...(config.title
          ? {
              title: {
                display: true,
                text: config.title,
                color: inkLegend,
                font: { size: 11, weight: 500 as const },
              },
            }
          : {}),
      };
    };

    // Pie/doughnut have no cartesian axes at all; everything else gets the
    // same hairline frame on both.
    const scaleOptions =
      type === "pie" || type === "doughnut" ? {} : { x: axis(scales.x), y: axis(scales.y) };

    const chartOptions: ChartOptions = {
      responsive,
      maintainAspectRatio,
      plugins: {
        legend: {
          display: legendProp === false ? false : legendObject?.display !== false,
          position: legendObject?.position ?? ("top" as const),
          labels: {
            // A legend is a key, not a headline: quiet ink, normal weight,
            // round point styles that match the series dots.
            color: inkLegend,
            usePointStyle: true,
            pointStyle: "circle" as const,
            boxWidth: 8,
            boxHeight: 8,
            padding: 16,
            font: { size: 12 },
          },
        },
        tooltip: {
          enabled: tooltipProp === false ? false : tooltipObject?.enabled !== false,
          ...(tooltipObject?.mode ? { mode: tooltipObject.mode as "index" } : {}),
          ...(tooltipObject?.intersect != null ? { intersect: tooltipObject.intersect } : {}),
          backgroundColor: popoverSurface,
          titleColor: inkPrimary,
          bodyColor: inkLegend,
          borderColor: hairline,
          borderWidth: 1,
          cornerRadius: 10,
          displayColors: true,
          usePointStyle: true,
          padding: 10,
          titleFont: { size: 12, weight: 500 as const },
          bodyFont: { size: 12 },
        },
        title: {
          display: titleProp === true || titleObject?.display === true,
          text: titleObject?.text ?? "",
          color: inkPrimary,
          font: { size: 13, weight: 500 as const },
        },
      } as ChartOptions["plugins"],
      scales: scaleOptions as ChartOptions["scales"],
      elements: {
        // Restrained marks. The 3px stroke and 0.4 tension this replaces made
        // every series read as a heavy hand-drawn curve — over-smoothing
        // invents inflections the data does not have.
        point: {
          radius: 2.5,
          hoverRadius: 5,
          borderWidth: 2,
          hoverBorderWidth: 2,
          ...elements.point,
        },
        line: { borderWidth: 2, tension: 0.25, ...elements.line },
        bar: { borderRadius: 4, borderWidth: 0, borderSkipped: false, ...elements.bar },
      } as ChartOptions["elements"],
      animation: resolvedAnimation,
      interaction: {
        intersect: false,
        mode: "index",
        ...interaction,
      } as ChartOptions["interaction"],
      ...options,
    };

    // Theme flips and data changes go through chart.update(): the canvas
    // stays alive and Chart.js animates the delta. The old destroy/new on
    // every change blanked the chart and replayed the entry animation.
    // Only a chart-type switch pays the destroy/recreate cost — Chart.js
    // cannot morph type in place.
    const existing = chartRef.current;
    if (existing && (existing.config as { type?: string }).type === type) {
      existing.data = filteredData;
      existing.options = chartOptions;
      existing.update(prefersReducedMotion ? "none" : undefined);
      return;
    }

    existing?.destroy();
    try {
      chartRef.current = new Chart(ctx, {
        type,
        data: filteredData,
        options: chartOptions,
      } as ChartConfiguration);
    } catch (constructionError) {
      // onError was declared and never called; a chart that cannot be built
      // should tell its owner rather than throwing through the render tree.
      chartRef.current = null;
      onErrorRef.current?.(constructionError as Error);
    }
  }, [
    filteredData,
    options,
    type,
    animation,
    responsive,
    maintainAspectRatio,
    resolvedTheme,
    plugins,
    scales,
    elements,
    interaction,
    isReady,
  ]);

  // Destroy only on unmount — the update path above reuses the instance.
  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  const handleExport = () => {
    const chart = chartRef.current;
    if (!chart) return;
    // exportOptions was declared and ignored. png/jpeg are what a canvas can
    // hand back directly; pdf/svg would need a renderer this wrapper does not
    // carry, so they fall through to png rather than silently producing an
    // empty file.
    const requested = exportOptions.formats?.[0];
    const format = requested === "jpeg" ? "jpeg" : "png";
    const quality = exportOptions.quality ?? 1;
    const url = chart.toBase64Image(`image/${format}`, quality);
    const link = document.createElement("a");
    link.download = `${exportOptions.filename ?? title.toLowerCase().replace(/\s+/g, "-")}.${format}`;
    link.href = url;
    link.click();
  };

  const handleMaximize = () => {
    // Fullscreening the bare canvas put the plot on a black void with no
    // title and no axis room. The plot wrapper carries its own surface — and
    // the request rejects whenever the gesture is not user-activated, which
    // used to surface as an unhandled promise rejection.
    const node = plotRef.current;
    if (!node) return;
    void node.requestFullscreen().catch((fullscreenError: Error) => {
      onErrorRef.current?.(fullscreenError);
    });
  };

  const allVisible = visibleDatasets.every((visible) => visible);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {/* Toolbar. Every control is icon-only, so every control carries a
              name — the four buttons here shipped completely unlabelled. They
              go disabled together whenever there is nothing to act on. */}
          <div className="flex shrink-0 items-center gap-2">
            {filterable && data.datasets && data.datasets.length > 1 && (
              <div className="relative" ref={filterRef}>
                <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={t("common.filter")}
                      disabled={!isReady}
                    >
                      <Filter className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute end-0 top-full z-popover mt-2 w-64 rounded-nx-md border border-nx-line bg-nx-popover p-3 shadow-nx-popover">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-medium uppercase tracking-wide text-nx-ink-3">
                          {t("common.filter")}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleAllDatasets}
                          className="h-8 px-2 text-xs"
                        >
                          {allVisible ? t("common.deselectAll") : t("common.selectAll")}
                        </Button>
                      </div>
                      <div className="border-t border-nx-line pt-1">
                        {data.datasets.map((dataset: any, index: number) => {
                          // The panel doubles as the legend, so each row shows
                          // the swatch it toggles — colour is never the only
                          // signal, the label carries the meaning.
                          const swatch =
                            typeof dataset.borderColor === "string"
                              ? dataset.borderColor
                              : typeof dataset.backgroundColor === "string"
                                ? dataset.backgroundColor
                                : undefined;
                          return (
                            <div
                              key={index}
                              className="flex h-8 items-center gap-2.5 rounded-nx-sm px-1 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none"
                            >
                              <Checkbox
                                id={`dataset-${index}`}
                                checked={visibleDatasets[index] ?? true}
                                onCheckedChange={() => handleDatasetToggle(index)}
                              />
                              {swatch && (
                                <span
                                  aria-hidden="true"
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: swatch }}
                                />
                              )}
                              <label
                                htmlFor={`dataset-${index}`}
                                className="min-w-0 flex-1 cursor-pointer truncate text-sm leading-none text-nx-ink"
                              >
                                {dataset.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-8 w-8 p-0"
                aria-label={t("common.download")}
                disabled={!isReady}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            {resizable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaximize}
                className="h-8 w-8 p-0"
                aria-label={t("layout.click_to_expand")}
                disabled={!isReady}
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="h-8 w-8 p-0"
                aria-label={t("common.reset")}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* The inline height/width is the in-card size, so fullscreen has to
            override it — hence the important flags on the fullscreen rules. */}
        <div
          ref={plotRef}
          className="relative [&:fullscreen]:!h-full [&:fullscreen]:!w-full [&:fullscreen]:bg-nx-surface [&:fullscreen]:p-6"
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: typeof width === "number" ? `${width}px` : width,
          }}
        >
          {status === "error" && (
            <div className="flex h-full flex-col justify-center">
              <ErrorMessage size="sm" message={error ?? t("common.error")} onRetry={onReset} />
            </div>
          )}

          {status === "loading" && <ChartPlaceholder type={type} label={t("common.loading")} />}

          {status === "empty" && (
            <div className="flex h-full flex-col justify-center">
              <EmptyState size="sm" bare icon={BarChart3} title={t("common.noData")} />
            </div>
          )}

          {isReady && (
            <>
              {/* ariaLabel/ariaDescription were declared and destructured but
                  never reached the DOM — the canvas was unlabelled to a reader.
                  The description goes through aria-describedby: aria-description
                  is a draft attribute that most readers still ignore. */}
              <canvas
                ref={canvasRef}
                className="h-full w-full"
                role="img"
                aria-label={ariaLabel ?? title}
                aria-describedby={ariaDescription ? descriptionId : undefined}
              />
              {ariaDescription && (
                <span id={descriptionId} className="sr-only">
                  {ariaDescription}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * The shape of what is coming, held still.
 *
 * A loading chart used to be a blank box. This is the plot frame with the
 * silhouette the chart will actually take — bars for cartesian types, a ring
 * for pie/doughnut — drawn in the raised fill step. Deliberately motionless:
 * a shimmer at rest is the exact idle animation this system does not do.
 */
function ChartPlaceholder({ type, label }: { type: string; label: string }) {
  const isRadial = type === "pie" || type === "doughnut";

  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-full w-full items-center justify-center rounded-nx-md border border-nx-line bg-nx-hover p-4"
    >
      {isRadial ? (
        <span
          aria-hidden="true"
          className="aspect-square h-full max-h-40 rounded-full border-[12px] border-nx-raised-2"
        />
      ) : (
        <span aria-hidden="true" className="flex h-full w-full items-end gap-3">
          {[45, 72, 38, 88, 56, 66].map((barHeight) => (
            <span
              key={barHeight}
              className="flex-1 rounded-nx-sm bg-nx-raised-2"
              style={{ height: `${barHeight}%` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}

/* Categorical palette — reads over the global --chart-1..8 tokens, the same
   slots the Recharts foundation exposes as CHART_TOKEN_PALETTE in
   @core/ui/chart. The getters resolve at read time (browser only), so a
   theme flip re-reads fresh values. The demo-era hex/gradient/monochrome
   sets died with their only consumers, the settings showcase demos. */
const CHART_SLOT_COUNT = 8;

export const GENERIC_COLORS = {
  /** Solid series colours for slots 1..8, resolved to literal hsl() strings. */
  get primary(): string[] {
    return Array.from({ length: CHART_SLOT_COUNT }, (_, i) => readToken(`--chart-${i + 1}`));
  },
  /** The same slots at 25% alpha — soft fills for area/bar backgrounds. */
  get soft(): string[] {
    return Array.from({ length: CHART_SLOT_COUNT }, (_, i) => readToken(`--chart-${i + 1}`, 0.25));
  },
};

// Utility functions for creating Generic chart data
export const ChartUtils = {
  createGradient: (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  },

  generateData: (count: number, min: number = 0, max: number = 100) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  },

  generateTimeSeriesData: (days: number, baseValue: number = 50) => {
    return Array.from({ length: days }, (_, i) => {
      const trend = Math.sin(i * 0.1) * 20;
      const noise = (Math.random() - 0.5) * 10;
      return Math.max(0, baseValue + trend + noise);
    });
  },
};
