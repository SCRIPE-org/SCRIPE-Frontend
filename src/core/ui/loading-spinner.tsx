"use client";

/**
 * LoadingSpinner — THE loader
 *
 * One loading indicator for the whole product: a hairline ring with an accent
 * arc, a 3-dot stagger, or a breathing pulse. The old twelve-variant switch is
 * gone — nine of its variants were visually broken (transition-delay classes
 * misread as animation-delay, delay utilities that do not exist in Tailwind,
 * keyframes that were never defined, an invalid alpha on currentColor) and
 * none of them belonged to the nexus look.
 *
 * The `inline` size renders with currentColor so it inherits the button ink —
 * Button and ~50 other call sites depend on it; that API is unchanged.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import type { LoadingStyle } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

type LoaderVariant = "spinner" | "dots" | "pulse";

// The Settings loadingStyle values, collapsed onto the three honest loaders.
// Each legacy stored value falls back to its nearest survivor; the
// LoadingStyle type itself is untouched, so stored settings keep
// deserialising. Unknown values fall through to "spinner" at the lookup.
const LEGACY_STYLE: Record<LoadingStyle, LoaderVariant> = {
  spinner: "spinner",
  dots: "dots",
  bars: "dots",
  pulse: "pulse",
  wave: "dots",
  orbit: "spinner",
  ripple: "pulse",
  gradient: "spinner",
  matrix: "dots",
  helix: "spinner",
  quantum: "pulse",
  morphing: "pulse",
};

type SpinnerSize = "sm" | "md" | "lg" | "inline";

const RING: Record<SpinnerSize, string> = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  inline: "h-4 w-4",
};

const DOT: Record<SpinnerSize, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
  inline: "h-1 w-1",
};

// Stagger for the nx-dot keyframes (1s cycle) — inline animation-delay, not
// Tailwind delay-* classes: delay-* sets transition-delay, which was the
// original bug.
const DOT_DELAYS = [0, 160, 320] as const;

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  showText?: boolean;
  /** Opt-in full-viewport centring (the old hardcoded default). */
  fullHeight?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  showText = true,
  fullHeight = false,
  className,
}: LoadingSpinnerProps) {
  const { t } = useI18n();
  const settings = useSettings();

  const variant: LoaderVariant = LEGACY_STYLE[settings.loadingStyle] ?? "spinner";
  // Inline rides currentColor so it reads the button ink; blocks wear the
  // workspace accent — the loader is the active thing on the screen.
  const inline = size === "inline";

  const loader = (() => {
    switch (variant) {
      case "dots":
        return (
          <span className={cn("flex items-center", inline ? "gap-0.5" : "gap-1")} aria-hidden="true">
            {DOT_DELAYS.map((delay) => (
              <span
                key={delay}
                className={cn(
                  "rounded-full motion-safe:animate-nx-dot",
                  DOT[size],
                  inline ? "bg-current" : "bg-nx-accent"
                )}
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        );
      case "pulse":
        if (inline) {
          return (
            <span
              className="h-3 w-3 rounded-full bg-current opacity-60 motion-safe:animate-pulse"
              aria-hidden="true"
            />
          );
        }
        // Static accent wash ring, breathing accent core — opacity only.
        return (
          <span
            className={cn("grid place-items-center rounded-full bg-nx-accent-wash", RING[size])}
            aria-hidden="true"
          >
            <span className="h-1/2 w-1/2 rounded-full bg-nx-accent motion-safe:animate-pulse" />
          </span>
        );
      default: // spinner — hairline track, accent arc
        return (
          <span className={cn("relative inline-block", RING[size])} aria-hidden="true">
            <span
              className={cn(
                "absolute inset-0 rounded-full border-2",
                inline ? "border-current opacity-20" : "border-nx-line"
              )}
            />
            <span
              className={cn(
                "absolute inset-0 rounded-full border-2 border-transparent motion-safe:animate-spin",
                inline ? "border-t-current" : "border-t-nx-accent"
              )}
            />
          </span>
        );
    }
  })();

  if (inline) {
    return <div className={cn("inline-flex items-center", className)}>{loader}</div>;
  }

  return (
    <div
      role="status"
      aria-label={t("common.loading")}
      className={cn(
        "flex items-center justify-center py-6",
        fullHeight && "min-h-[60vh]",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {loader}
        {showText && <p className="text-sm font-medium text-nx-ink-2">{t("common.loading")}</p>}
      </div>
    </div>
  );
}
