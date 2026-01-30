"use client";

import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables, ChartOptions, ChartData } from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Download, Maximize2, RotateCcw, Filter, Settings } from "lucide-react";
import { cn } from "@core/common/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@core/ui/collapsible";

// Register all Chart.js components
Chart.register(...registerables);

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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Initialize visible datasets
  useEffect(() => {
    if (data.datasets) {
      setVisibleDatasets(new Array(data.datasets.length).fill(true));
    }
  }, [data.datasets]);

  // Filter datasets based on visibility
  const filteredData = {
    ...data,
        datasets: data.datasets?.map((dataset: any, index: number) => ({
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
    const allVisible = visibleDatasets.every(visible => visible);
    setVisibleDatasets(new Array(data.datasets?.length || 0).fill(!allVisible));
  };

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // Destroy existing chart
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Create new chart with Generic styling
        chartRef.current = new Chart(ctx, {
          type,
          data: filteredData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
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
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "white",
                bodyColor: "white",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                padding: 12,
              },
            },
            scales: type === "pie" || type === "doughnut" ? {} : {
              x: {
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "rgba(255, 255, 255, 0.7)",
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "rgba(255, 255, 255, 0.7)",
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
            animation: {
              duration: 2000,
              easing: "easeInOutQuart",
            },
            interaction: {
              intersect: false,
              mode: "index",
            },
            ...options,
          },
        });
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [filteredData, options, type]);

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
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                 <CollapsibleContent ref={filterRef} className="absolute top-12 right-0 z-50 w-64 p-4 bg-background border rounded-lg shadow-lg">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Filter Datasets</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAllDatasets}
                        className="text-xs"
                      >
                        {visibleDatasets.every(visible => visible) ? "Hide All" : "Show All"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                              {data.datasets.map((dataset: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {resizable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaximize}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: typeof height === 'number' ? `${height}px` : height, width: typeof width === 'number' ? `${width}px` : width }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Generic color palettes
export const GENERIC_COLORS = {
  primary: [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
  ],
  gradient: [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  ],
  monochrome: [
    "#1F2937", // Gray 800
    "#374151", // Gray 700
    "#4B5563", // Gray 600
    "#6B7280", // Gray 500
    "#9CA3AF", // Gray 400
    "#D1D5DB", // Gray 300
    "#E5E7EB", // Gray 200
    "#F3F4F6", // Gray 100
  ],
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
    return Array.from({ length: count }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  },

  generateTimeSeriesData: (days: number, baseValue: number = 50) => {
    return Array.from({ length: days }, (_, i) => {
      const trend = Math.sin(i * 0.1) * 20;
      const noise = (Math.random() - 0.5) * 10;
      return Math.max(0, baseValue + trend + noise);
    });
  },
};
