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
 */

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Chart, registerables, ChartConfiguration, ChartOptions, ChartData } from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Download, Maximize2, RotateCcw, Filter } from "lucide-react";
import { cn } from "@core/common/utils";
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
  options = {},
  type,
  className,
  exportable = true,
  resizable = true,
  filterable = true,
  onReset,
  height = 400,
  width = "100%",
  theme = "auto",
  animation = true,
  responsive = true,
  maintainAspectRatio = false,
  plugins = {},
  scales = {},
  elements = {},
  interaction = {},
  dataTransform = {},
  exportOptions = {},
  loading = false,
  error = null,
  onError,
  ariaLabel,
  ariaDescription,
}: GenericChartProps) {
  const { resolvedTheme } = useTheme();
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleDatasets, setVisibleDatasets] = useState<boolean[]>([]);

  // Handle click outside to close filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Initialize visible datasets (render-time, no setState in effect)
  const prevDatasetCountRef = useRef(data.datasets?.length ?? 0);
  const datasetCount = data.datasets?.length ?? 0;
  if (datasetCount !== prevDatasetCountRef.current) {
    prevDatasetCountRef.current = datasetCount;
    setVisibleDatasets(new Array(datasetCount).fill(true));
  }

  // Filter datasets based on visibility
  const filteredData = {
    ...data,
    datasets:
      data.datasets?.map((dataset: any, index: number) => ({
        ...dataset,
        hidden: !visibleDatasets[index],
      })) || [],
  };

  const handleDatasetToggle = (index: number) => {
    const newVisibleDatasets = [...visibleDatasets];
    newVisibleDatasets[index] = !newVisibleDatasets[index];
    setVisibleDatasets(newVisibleDatasets);
  };

  const toggleAllDatasets = () => {
    const allVisible = visibleDatasets.every((visible) => visible);
    setVisibleDatasets(new Array(data.datasets?.length || 0).fill(!allVisible));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Entry animation: ~300ms, and none at all under reduced motion. The
    // previous 2000ms easeInOutQuart replayed on every rebuild and read as
    // the chart re-drawing itself rather than settling.
    const resolvedAnimation = (prefersReducedMotion || animation === false
      ? false
      : {
          duration: 300,
          easing: "easeOutQuart",
          ...(typeof animation === "object" ? animation : {}),
        }) as ChartOptions["animation"];

    // The colours below are resolved from the computed token values, which
    // change when the theme does — resolvedTheme is a real dependency. The
    // previous hardcoded rgba(255,255,255,·) made every axis label invisible
    // in light mode.
    const chartOptions: ChartOptions = {
      responsive,
      maintainAspectRatio,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: "bold" as const,
            },
          },
        },
        tooltip: {
          backgroundColor: readToken("--popover"),
          titleColor: readToken("--popover-foreground"),
          bodyColor: readToken("--popover-foreground"),
          borderColor: readToken("--border"),
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          padding: 12,
        },
      },
      scales:
        type === "pie" || type === "doughnut"
          ? {}
          : {
              x: {
                grid: {
                  color: readToken("--border", 0.5),
                },
                ticks: {
                  color: readToken("--muted-foreground"),
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                grid: {
                  color: readToken("--border", 0.5),
                },
                ticks: {
                  color: readToken("--muted-foreground"),
                  font: {
                    size: 11,
                  },
                },
              },
            },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2,
          hoverBorderWidth: 3,
        },
        line: {
          borderWidth: 3,
          tension: 0.4,
        },
        bar: {
          borderRadius: 4,
          borderSkipped: false,
        },
      },
      animation: resolvedAnimation,
      interaction: {
        intersect: false,
        mode: "index",
      },
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
    chartRef.current = new Chart(ctx, {
      type,
      data: filteredData,
      options: chartOptions,
    } as ChartConfiguration);
  }, [filteredData, options, type, animation, responsive, maintainAspectRatio, resolvedTheme]);

  // Destroy only on unmount — the update path above reuses the instance.
  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  const handleExport = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image("image/png", 1);
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleMaximize = () => {
    if (canvasRef.current) {
      canvasRef.current.requestFullscreen();
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {filterable && data.datasets && data.datasets.length > 1 && (
              <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Filter className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent
                  ref={filterRef}
                  className="absolute end-0 top-12 z-popover w-64 rounded-lg border bg-background p-4 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Filter Datasets</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAllDatasets}
                        className="text-xs"
                      >
                        {visibleDatasets.every((visible) => visible) ? "Hide All" : "Show All"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {data.datasets.map((dataset: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            id={`dataset-${index}`}
                            checked={visibleDatasets[index]}
                            onCheckedChange={() => handleDatasetToggle(index)}
                          />
                          <label
                            htmlFor={`dataset-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {dataset.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            {exportable && (
              <Button variant="outline" size="sm" onClick={handleExport} className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            )}
            {resizable && (
              <Button variant="outline" size="sm" onClick={handleMaximize} className="h-8 w-8 p-0">
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            {onReset && (
              <Button variant="outline" size="sm" onClick={onReset} className="h-8 w-8 p-0">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="relative"
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: typeof width === "number" ? `${width}px` : width,
          }}
        >
          {/* ariaLabel/ariaDescription were declared and destructured but
              never reached the DOM — the canvas was unlabelled to a reader. */}
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            role="img"
            aria-label={ariaLabel}
            aria-description={ariaDescription}
          />
        </div>
      </CardContent>
    </Card>
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
