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
  /** Stroke-derived series colour (line/area). */
  color?: string;
  /** Fill-derived series colour (bar/pie) — some series only carry this one. */
  fill?: string;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: RechartsPayloadEntry[];
  label?: React.ReactNode;
}

/**
 * Prints a reading the way a reader expects it.
 *
 * A genuine `0` is data and must show as "0"; only a missing value gets the
 * em dash. Deliberately duplicated from the Recharts foundation rather than
 * imported — this module is what hand-rolled (canvas-free, recharts-free)
 * chart layouts reach for, and importing `@core/ui/chart` would drag the whole
 * Recharts bundle into them.
 */
function formatReading(value: number | string | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : String(value);
  }
  return value;
}

/**
 * Recharts `content` renderer. Recharts owns hover/touch/keyboard itself via
 * its accessibility layer, so this is presentation only.
 *
 * Series name and reading are two columns, not one run of inline text, so a
 * multi-series tooltip aligns its numbers instead of ragging down the middle.
 */
export const CustomChartTooltip = ({ active, payload, label }: CustomChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      role="tooltip"
      className="min-w-32 rounded-nx-md border border-nx-line bg-nx-popover px-3 py-2 text-xs text-nx-ink shadow-nx-popover"
    >
      {label != null && (
        <p className="mb-1.5 border-b border-nx-line pb-1.5 font-medium text-nx-ink">{label}</p>
      )}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1">
        {payload.map((entry, index) => {
          const reading = formatReading(entry.value);
          return (
            <React.Fragment key={`${entry.name ?? "series"}-${index}`}>
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? entry.fill }}
              />
              <span className="text-nx-ink-2">{entry.name}</span>
              <span className="text-end font-medium tabular-nums text-nx-ink">
                {reading ?? "—"}
              </span>
            </React.Fragment>
          );
        })}
      </div>
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
  /**
   * Forwarded to the button; use for grid placement. Size the child to at
   * least 32×32 when the point is selectable — the button takes whatever box
   * its child gives it.
   */
  children: React.ReactNode;
  onSelect?: () => void;
  /**
   * A point that exists but cannot be acted on — an out-of-range bucket, a
   * period the current plan does not cover. It stays focusable and still
   * explains itself; it just does not fire `onSelect`.
   */
  disabled?: boolean;
}

/**
 * A single interactive data point: cell, segment, tile or node.
 *
 * Renders a real `<button>` so the browser gives us focus, Tab order and touch
 * activation for free — the previous `<div title="...">` had none of them.
 *
 * States: at rest the point is only its own fill; hover adds a hairline ring;
 * keyboard focus takes the shared lit-edge ring, which is the one place light
 * collects on a chart. Nothing moves and nothing animates at rest.
 */
export function ChartPoint({
  label,
  content,
  side = "top",
  className,
  style,
  children,
  onSelect,
  disabled = false,
}: ChartPointProps) {
  const [open, setOpen] = React.useState(false);
  // Mouse gets hover semantics; touch and pen get tap-to-toggle. Without
  // distinguishing them, a mouse click would immediately close the tooltip
  // that hovering had just opened.
  const lastPointerType = React.useRef<string>("mouse");
  const selectable = !disabled && typeof onSelect === "function";

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            aria-disabled={disabled || undefined}
            className={cn(
              "appearance-none rounded-nx-sm text-start",
              // 140ms on the ring only — no transform, so a dense grid never
              // jitters under the cursor.
              "transition-shadow duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "hover:shadow-[inset_0_0_0_1px_var(--nx-line-hi)]",
              "focus-visible:outline-none focus-visible:shadow-nx-focus",
              selectable ? "cursor-pointer" : "cursor-default",
              disabled && "cursor-not-allowed",
              className
            )}
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
              // aria-disabled keeps the point reachable and explainable, so
              // the guard has to live here rather than on the element.
              if (!disabled) onSelect?.();
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
  // Same 120ms delay as ChartPoint, so hovering across a chart made of both
  // reads as one behaviour rather than two.
  <TooltipProvider delayDuration={120}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
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
    <ChartTooltipWrapper
      content={item.label || t("charts.heatmap.value", { value: item.value ?? "" })}
    >
      <span>{children}</span>
    </ChartTooltipWrapper>
  );
};
