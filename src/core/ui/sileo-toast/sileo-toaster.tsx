"use client";

import * as React from "react";
import { Toaster as SileoBaseToaster } from "sileo";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import type { SileoPosition, SileoToasterProps } from "./types";

/**
 * Mirror position for right-to-left layout when auto-mirroring is enabled.
 */
function resolveRtlPosition(
  position: SileoPosition,
  direction: "ltr" | "rtl",
  autoMirror: boolean
): SileoPosition {
  if (!autoMirror || direction !== "rtl") {
    return position;
  }

  switch (position) {
    case "top-right":
      return "top-left";
    case "top-left":
      return "top-right";
    case "bottom-right":
      return "bottom-left";
    case "bottom-left":
      return "bottom-right";
    default:
      return position;
  }
}

/**
 * SileoToaster — The premier physics-based toast viewport for SCRIPE.
 *
 * Automatically binds to:
 * - Next-Themes: dynamic light/dark/system theme synchronization
 * - I18n: direction-aware positioning (LTR: top-right, RTL: top-left)
 * - Nexus Design System: status tokens, elevated surface fills, and typography
 */
export function SileoToaster({
  position = "top-right",
  offset = { top: 20, right: 20, left: 20, bottom: 20 },
  options,
  theme: themeProp,
  rtlAutoMirror = true,
  children,
}: SileoToasterProps) {
  const { resolvedTheme } = useTheme();
  const { direction } = useI18n();

  const isDark =
    themeProp === "dark" || (!themeProp && (resolvedTheme === "dark" || resolvedTheme === undefined));
  const activeTheme: "light" | "dark" | "system" =
    themeProp ??
    (resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : "system");

  const activePosition = resolveRtlPosition(position, direction, rtlAutoMirror);
  const defaultFill = isDark ? "#151719" : "#ffffff";

  const mergedOptions = {
    fill: options?.fill ?? defaultFill,
    roundness: options?.roundness ?? 16,
    autopilot: options?.autopilot ?? true,
    ...options,
  };

  return (
    <SileoBaseToaster
      position={activePosition}
      offset={offset}
      options={mergedOptions}
    >
      {children}
    </SileoBaseToaster>
  );
}
