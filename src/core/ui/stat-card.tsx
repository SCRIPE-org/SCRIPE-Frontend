"use client";

/**
 * StatCard — the single KPI surface
 *
 * This pattern was re-implemented at least ten times across billing,
 * compliance, entitlements and analytics, each with an incompatible prop shape
 * (variant/suffix/tooltip, onClick/subtitle, colour...). The union of those
 * shapes lives here so a page never has to draw a number again.
 *
 * Wave K: the FIGURE is the hero. It was set at text-2xl beside a tinted icon
 * tile that outweighed it, and the delta printed `Math.abs(value)%` — no sign
 * at all, so direction was carried by an arrow glyph and a colour and nothing
 * else. The number now leads the card at text-3xl with the tone tile demoted to
 * the inline end, and the delta is a bordered chip with an explicit sign, so it
 * survives both colour-blindness and a greyscale print.
 *
 * Status tone maps to the semantic tokens, never to a fixed palette shade, so
 * a card reads correctly in both themes and under any tenant palette.
 */

import * as React from "react";
import { cn } from "@core/common/utils";
import { Card, CardContent } from "@core/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { ArrowDownRight, ArrowUpRight, Info, Minus, type LucideIcon } from "lucide-react";

/** Semantic tone of the figure — drives icon tint and trend colour. */
export type StatTone = "neutral" | "success" | "warning" | "danger" | "info";

// Hairline + wash + ink, one measured triple per tone. Neutral is a plain
// surface step so an untinted card carries no colour at all.
const TONE_ICON: Record<StatTone, string> = {
  neutral: "border-nx-line bg-nx-raised text-nx-ink-2",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning-strong/30 bg-warning/15 text-nx-warning-strong",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-info/30 bg-info/10 text-info",
};

const TONE_CARD: Record<StatTone, string> = {
  neutral: "",
  success: "border-success/30 hover:border-success/50",
  warning: "border-warning-strong/30 hover:border-warning-strong/50",
  danger: "border-destructive/30 hover:border-destructive/50",
  info: "border-info/30 hover:border-info/50",
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
  /** Flips trend colouring for figures where a fall is good news (churn,
      errors, cost) — the arrow still follows the sign, only the tone flips. */
  invertTrend?: boolean;
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
  invertTrend = false,
  tooltip,
  onClick,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      // Static fill steps, not a shimmer: a placeholder is the absence of a
      // number, and absence does not breathe. The block sizes mirror the
      // rendered anatomy — 12px label, 30px figure — so swapping placeholder
      // for data never shifts the layout.
      <Card role="status" aria-busy="true" aria-label={label} className={className}>
        <CardContent className="flex items-start gap-4 p-4">
          <div className="min-w-0 flex-1" aria-hidden="true">
            <div className="h-3 w-24 rounded-nx-sm bg-nx-raised-2" />
            <div className="mt-3 h-7 w-20 rounded-nx-sm bg-nx-raised-2" />
          </div>
          <div
            aria-hidden="true"
            className="h-10 w-10 shrink-0 rounded-nx-md border border-nx-line bg-nx-raised-2"
          />
        </CardContent>
      </Card>
    );
  }

  const isInteractive = typeof onClick === "function";

  // Sign drives the glyph, invertTrend drives the tone, and a flat period is
  // neither good nor bad — it reads neutral instead of borrowing "success"
  // green from the zero-is-good rule.
  const direction = trend ? Math.sign(trend.value) : 0;
  const TrendIcon = direction > 0 ? ArrowUpRight : direction < 0 ? ArrowDownRight : Minus;
  const trendIsGood = trend ? (invertTrend ? trend.value <= 0 : trend.value >= 0) : false;
  const trendClass =
    direction === 0
      ? "border-nx-line bg-nx-raised text-nx-ink-2"
      : trendIsGood
        ? "border-success/30 bg-success/10 text-success"
        : "border-destructive/30 bg-destructive/10 text-destructive";
  const trendSign = direction > 0 ? "+" : direction < 0 ? "−" : "";

  const body = (
    <CardContent className={cn("flex items-start gap-4 p-4", isInteractive && "pointer-events-none relative z-10")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="min-w-0 truncate text-xs font-medium text-nx-ink-2">{label}</p>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Native button sibling to the card's primary stretched trigger
                      so keyboard/AT navigation never hits nested interactive nodes. */}
                  <button
                    type="button"
                    aria-label={tooltip}
                    onClick={(event) => event.stopPropagation()}
                    className="pointer-events-auto relative z-20 -my-2 -me-1 inline-grid h-8 w-8 shrink-0 place-items-center rounded-nx-sm text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink-2 focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px]">{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <p className="mt-1.5 flex items-baseline gap-1.5 text-3xl font-semibold tabular-nums leading-none tracking-tight text-nx-ink">
          <span className="truncate">{value}</span>
          {suffix && <span className="shrink-0 text-base font-medium text-nx-ink-3">{suffix}</span>}
        </p>

        {(subtitle || trend) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-nx-ink-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-nx-sm border px-1.5 py-0.5 font-semibold tabular-nums leading-none",
                  trendClass
                )}
              >
                <TrendIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                {trendSign}
                {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ""}
              </span>
            )}
            {subtitle && <span className="min-w-0 truncate text-nx-ink-3">{subtitle}</span>}
          </div>
        )}
      </div>

      {Icon && (
        // Demoted to a quiet marker at the inline end: it labels the figure,
        // it does not compete with it.
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border",
            TONE_ICON[tone]
          )}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
    </CardContent>
  );

  if (!isInteractive) {
    return <Card className={cn(TONE_CARD[tone], className)}>{body}</Card>;
  }

  return (
    <Card
      className={cn(
        "relative focus-within:border-nx-line-hi",
        TONE_CARD[tone],
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="absolute inset-0 z-0 cursor-pointer rounded-nx-lg focus-visible:shadow-nx-focus focus-visible:outline-none active:shadow-[inset_0_0_0_1px_var(--nx-accent)] transition-[box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none"
      />
      {body}
    </Card>
  );
}
