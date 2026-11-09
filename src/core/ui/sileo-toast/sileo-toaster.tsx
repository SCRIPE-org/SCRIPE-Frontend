"use client";

import * as React from "react";
import { Toaster as SileoBaseToaster } from "sileo";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import type { SileoAnyPosition, SileoPosition, SileoToasterProps } from "./types";

/**
 * Mirror position for right-to-left layout when auto-mirroring is enabled.
 * Supports physical ("top-right", "top-left", etc.) and logical ("top-end", "top-start", etc.) positions.
 */
export function resolveRtlPosition(
  position: SileoPosition | "top-end" | "top-start" | "bottom-end" | "bottom-start" | string,
  direction: "ltr" | "rtl",
  autoMirror: boolean = true
): SileoPosition {
  const norm = (position || "top-right").toLowerCase().trim();

  // Logical position mappings
  if (norm === "top-end") {
    return direction === "rtl" ? "top-left" : "top-right";
  }
  if (norm === "top-start") {
    return direction === "rtl" ? "top-right" : "top-left";
  }
  if (norm === "bottom-end") {
    return direction === "rtl" ? "bottom-left" : "bottom-right";
  }
  if (norm === "bottom-start") {
    return direction === "rtl" ? "bottom-right" : "bottom-left";
  }

  // Center positions remain constant in both LTR and RTL
  if (norm === "top-center") return "top-center";
  if (norm === "bottom-center") return "bottom-center";

  // If autoMirror is disabled or in LTR, return physical position
  if (!autoMirror || direction !== "rtl") {
    if (
      norm === "top-left" ||
      norm === "top-right" ||
      norm === "bottom-left" ||
      norm === "bottom-right"
    ) {
      return norm as SileoPosition;
    }
    return "top-right";
  }

  // In RTL mode with autoMirror enabled:
  // "top-right" (the standard LTR end) auto-mirrors to "top-left" (the Arabic RTL end)
  // "top-left" (the standard LTR start) auto-mirrors to "top-right" (the Arabic RTL start)
  // "bottom-right" auto-mirrors to "bottom-left"
  // "bottom-left" auto-mirrors to "bottom-right"
  switch (norm) {
    case "top-right":
      return "top-left";
    case "top-left":
      return "top-right";
    case "bottom-right":
      return "bottom-left";
    case "bottom-left":
      return "bottom-right";
    default:
      return "top-left";
  }
}

/**
 * SileoToaster — The premier physics-based toast viewport for SCRIPE.
 *
 * Automatically binds to:
 * - Next-Themes: dynamic light/dark/system theme synchronization
 * - I18n: direction-aware positioning (LTR: top-right, RTL: top-left)
 * - User Preferences: reactive synchronization with Profile Workstation preferences
 * - Nexus Design System: status tokens, elevated surface fills, and typography
 */
export function SileoToaster({
  position: propPosition,
  offset = { top: 20, right: 20, left: 20, bottom: 20 },
  options,
  theme: themeProp,
  rtlAutoMirror = true,
  children,
}: SileoToasterProps) {
  const { resolvedTheme } = useTheme();
  const { direction } = useI18n();

  // Preferred position state hydrated from localStorage / CustomEvent
  const [preferredPosition, setPreferredPosition] = React.useState<SileoAnyPosition>(() => {
    if (propPosition) return propPosition;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("scr_pref_toast_position") as SileoAnyPosition | null;
      if (
        stored &&
        [
          "top-left",
          "top-center",
          "top-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
          "top-end",
          "top-start",
          "bottom-end",
          "bottom-start",
        ].includes(stored)
      ) {
        return stored;
      }
    }
    return "top-right";
  });

  React.useEffect(() => {
    if (propPosition) {
      setPreferredPosition(propPosition);
      return;
    }

    const handlePositionChange = (e: Event) => {
      const customEvent = e as CustomEvent<SileoAnyPosition>;
      if (customEvent.detail) {
        setPreferredPosition(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "scr_pref_toast_position" && e.newValue) {
        setPreferredPosition(e.newValue as SileoAnyPosition);
      }
    };

    window.addEventListener("scripe:toast-position-changed", handlePositionChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("scripe:toast-position-changed", handlePositionChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [propPosition]);

  const isDark =
    themeProp === "dark" || (!themeProp && (resolvedTheme === "dark" || resolvedTheme === undefined));

  const effectivePosition = propPosition ?? preferredPosition;
  const activePosition = resolveRtlPosition(effectivePosition, direction, rtlAutoMirror);
  const defaultFill = isDark ? "#0d0d0e" : "#ffffff";

  type BaseToasterOptions = NonNullable<React.ComponentProps<typeof SileoBaseToaster>["options"]>;

  const { id: _id, position: rawOptionPosition, button: rawOptionButton, ...restOptions } = options ?? {};

  const normalizedOptionPosition = rawOptionPosition
    ? resolveRtlPosition(rawOptionPosition, direction, rtlAutoMirror)
    : undefined;

  const normalizedOptionButton = rawOptionButton
    ? {
        title: rawOptionButton.title || rawOptionButton.label || "",
        onClick: rawOptionButton.onClick,
      }
    : undefined;

  const mergedOptions: BaseToasterOptions = {
    fill: options?.fill ?? defaultFill,
    roundness: options?.roundness ?? 16,
    autopilot: options?.autopilot ?? true,
    ...restOptions,
    ...(normalizedOptionPosition ? { position: normalizedOptionPosition } : {}),
    ...(normalizedOptionButton ? { button: normalizedOptionButton } : {}),
  };

  return (
    <SileoBaseToaster
      key={activePosition}
      position={activePosition}
      offset={offset}
      options={mergedOptions}
    >
      {children}
    </SileoBaseToaster>
  );
}
