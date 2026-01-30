"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";

// Custom Chart Tooltip for Recharts
export const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[120px]">
        <p className="text-foreground font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full inline-block" 
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
  side = "top" 
}: { 
  children: React.ReactNode; 
  content: string; 
  side?: "top" | "bottom" | "left" | "right";
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Heatmap tooltip component
export const HeatmapTooltip = ({
  item,
  children
}: {
  item: any;
  children: React.ReactNode;
}) => {
  const { t } = useI18n();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p>{item.label || t("charts.heatmap.value", { value: item.value })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
