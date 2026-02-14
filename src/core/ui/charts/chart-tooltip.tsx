"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";

// Custom Chart Tooltip for Recharts
export const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[120px] rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="mb-2 font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Wrapper for UI Tooltip with chart data
export const ChartTooltipWrapper = ({
  children,
  content,
  side = "top",
}: {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Heatmap tooltip component
export const HeatmapTooltip = ({ item, children }: { item: any; children: React.ReactNode }) => {
  const { t } = useI18n();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{item.label || t("charts.heatmap.value", { value: item.value })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
