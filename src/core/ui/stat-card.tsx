"use client";

/**
 * StatCard — the single KPI surface
 *
 * This pattern was re-implemented at least ten times across billing,
 * compliance, entitlements and analytics, each with an incompatible prop shape
 * (variant/suffix/tooltip, onClick/subtitle, colour...). The union of those
 * shapes lives here so a page never has to draw a number again.
 *
 * Status tone maps to the semantic tokens, never to a fixed palette shade, so
 * a card reads correctly in both themes and under any tenant palette.
 */

import * as React from "react";
import { cn } from "@core/common/utils";
import { Card, CardContent } from "@core/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { Skeleton } from "@core/ui/skeleton";
import { ArrowDownRight, ArrowUpRight, Info, type LucideIcon } from "lucide-react";

/** Semantic tone of the figure — drives icon tint and trend colour. */
export type StatTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_ICON: Record<StatTone, string> = {
  neutral: "text-muted-foreground bg-muted",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-destructive bg-destructive/10",
  info: "text-info bg-info/10",
};

export interface StatCardProps {
  /** Short label above the figure. */
  label: string;
  /** The figure itself. Numbers are localised by the caller. */
  value: React.ReactNode;
  /** Optional unit rendered immediately after the value. */
  suffix?: string;
  /** Supporting line under the figure. */
  subtitle?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  /** Period-over-period change; sign decides the arrow and colour. */
  trend?: { value: number; label?: string };
  /** Renders an info affordance carrying this explanation. */
  tooltip?: string;
  /** Makes the whole card activatable. */
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Presentation UI component rendering a single key figure.
 */
export function StatCard({
  label,
  value,
  suffix,
  subtitle,
  icon: Icon,
  tone = "neutral",
  trend,
  tooltip,
  onClick,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isInteractive = typeof onClick === "function";
  const TrendIcon = trend && trend.value < 0 ? ArrowDownRight : ArrowUpRight;

  const body = (
    <CardContent className="flex items-center gap-4 p-4">
      {Icon && (
        <div className={cn("shrink-0 rounded-xl p-2.5", TONE_ICON[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          {label}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex" tabIndex={0} aria-label={tooltip}>
                    <Info className="h-3 w-3 opacity-70" aria-hidden="true" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px]">{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </p>
        <p className="flex items-baseline gap-1 text-2xl font-bold tabular-nums">
          <span className="truncate">{value}</span>
          {suffix && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
        </p>
        {(subtitle || trend) && (
          <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold tabular-nums",
                  trend.value < 0 ? "text-destructive" : "text-success"
                )}
              >
                <TrendIcon className="h-3 w-3" aria-hidden="true" />
                {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ""}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </p>
        )}
      </div>
    </CardContent>
  );

  if (!isInteractive) {
    return <Card className={className}>{body}</Card>;
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {body}
    </Card>
  );
}
