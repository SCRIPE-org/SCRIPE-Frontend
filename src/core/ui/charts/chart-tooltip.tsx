"use client";

/**
 * Chart tooltip primitives
 *
 * A chart that only reveals its numbers on mouse-hover is unreadable on a
 * phone and invisible to a screen reader, so `ChartPoint` is built around all
 * four input methods rather than hover alone:
 *
 *   mouse    hovering opens the tooltip, leaving closes it
 *   touch    tapping toggles it (a Radix Tooltip alone never opens on tap)
 *   keyboard the point is a real button, so Tab reaches it and focus opens it
 *   reader   `label` is the accessible name, so the value is announced even
 *            though the tooltip itself is decorative
 *
 * Every colour here is a token: a chart tooltip is a floating surface and has
 * to stay legible in both themes.
 */

import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

type Side = "top" | "bottom" | "left" | "right";

/** One datum in a Recharts tooltip payload. */
interface RechartsPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: RechartsPayloadEntry[];
  label?: React.ReactNode;
}

/**
 * Recharts `content` renderer. Recharts owns hover/touch/keyboard itself via
 * its accessibility layer, so this is presentation only.
 */
export const CustomChartTooltip = ({ active, payload, label }: CustomChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="min-w-[120px] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg">
      {label != null && <p className="mb-2 font-medium">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          {/* `!= null` so a genuine 0 still prints. */}
          <span className="font-medium tabular-nums">{entry.value != null ? entry.value : "—"}</span>
        </p>
      ))}
    </div>
  );
};

export interface ChartPointProps {
  /**
   * The accessible name — a full phrase, because this is what a screen-reader
   * user hears instead of seeing the chart. e.g. "Monday 09:00 — 42 sessions".
   */
  label: string;
  /** Richer tooltip body. Falls back to `label`. */
  content?: React.ReactNode;
  side?: Side;
  className?: string;
  style?: React.CSSProperties;
  /** Forwarded to the button; use for grid placement. */
  children: React.ReactNode;
  onSelect?: () => void;
}

/**
 * A single interactive data point: cell, segment, tile or node.
 *
 * Renders a real `<button>` so the browser gives us focus, Tab order and touch
 * activation for free — the previous `<div title="...">` had none of them.
 */
export function ChartPoint({
  label,
  content,
  side = "top",
  className,
  style,
  children,
  onSelect,
}: ChartPointProps) {
  const [open, setOpen] = React.useState(false);
  // Mouse gets hover semantics; touch and pen get tap-to-toggle. Without
  // distinguishing them, a mouse click would immediately close the tooltip
  // that hovering had just opened.
  const lastPointerType = React.useRef<string>("mouse");

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn("appearance-none text-start", className)}
            style={style}
            onPointerEnter={(e) => {
              lastPointerType.current = e.pointerType;
              if (e.pointerType === "mouse") setOpen(true);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setOpen(false);
            }}
            onPointerDown={(e) => {
              lastPointerType.current = e.pointerType;
            }}
            onClick={() => {
              if (lastPointerType.current !== "mouse") setOpen((v) => !v);
              onSelect?.();
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} onEscapeKeyDown={() => setOpen(false)}>
          {content ?? label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Wrapper for a static element that just needs an explanatory tooltip. */
export const ChartTooltipWrapper = ({
  children,
  content,
  side = "top",
}: {
  children: React.ReactNode;
  content: string;
  side?: Side;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/** @deprecated Use {@link ChartPoint}, which also handles touch and keyboard. */
export const HeatmapTooltip = ({
  item,
  children,
}: {
  item: { label?: string; value?: number | string };
  children: React.ReactNode;
}) => {
  const { t } = useI18n();
  return (
    <ChartTooltipWrapper content={item.label || t("charts.heatmap.value", { value: item.value ?? "" })}>
      <span>{children}</span>
    </ChartTooltipWrapper>
  );
};
