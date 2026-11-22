"use client";

import * as React from "react";
import { Toaster as SileoBaseToaster } from "sileo";
import { twMerge } from "tailwind-merge";
import { useI18n } from "@core/providers/i18n-provider";
import {
  LOCKED_DARK_SILEO_STYLES,
  LOCKED_LIGHT_SILEO_STYLES,
  NEXUS_SILEO_STYLES,
  resolveRtlPosition,
  setActiveToasterOptions,
} from "./sileo-config";
import type { SileoAnyPosition, SileoToasterProps } from "./types";

export { resolveRtlPosition } from "./sileo-config";

/**
 * SileoToaster — The premier physics-based toast viewport for SCRIPE.
 *
 * Automatically binds to:
 * - Nexus Theme System: live CSS variable surface fills (`var(--nx-surface)`) and High Contrast parity
 * - I18n: direction-aware positioning (LTR: top-right, RTL: top-left)
 * - User Preferences: reactive synchronization with Profile Workstation preferences
 * - Explicit Theme Lock: contrast-matched surfaces when `theme="light"` or `theme="dark"` is forced
 */
export function SileoToaster({
  position: propPosition,
  offset = { top: 20, right: 20, left: 20, bottom: 20 },
  options,
  theme: themeProp,
  rtlAutoMirror = true,
  children,
}: SileoToasterProps) {
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

  const effectivePosition = propPosition ?? preferredPosition;
  const activePosition = resolveRtlPosition(effectivePosition, direction, rtlAutoMirror);
  const defaultFill =
    themeProp === "dark"
      ? "#15181c"
      : themeProp === "light"
        ? "#ffffff"
        : "var(--nx-surface)";

  type BaseToasterOptions = NonNullable<React.ComponentProps<typeof SileoBaseToaster>["options"]>;

  const {
    id: _id,
    position: rawOptionPosition,
    button: rawOptionButton,
    styles: rawOptionStyles,
    ...restOptions
  } = options ?? {};

  const resolvedFill = options?.fill ?? defaultFill;
  const lockedStyles =
    options?.fill !== undefined
      ? undefined
      : themeProp === "dark"
        ? LOCKED_DARK_SILEO_STYLES
        : themeProp === "light"
          ? LOCKED_LIGHT_SILEO_STYLES
          : undefined;

  const inheritedTitleStyle =
    lockedStyles?.title || rawOptionStyles?.title
      ? twMerge(lockedStyles?.title, rawOptionStyles?.title)
      : undefined;
  const inheritedDescriptionStyle =
    lockedStyles?.description || rawOptionStyles?.description
      ? twMerge(lockedStyles?.description, rawOptionStyles?.description)
      : undefined;
  const inheritedButtonStyle =
    rawOptionButton?.className || lockedStyles?.button || rawOptionStyles?.button
      ? twMerge(lockedStyles?.button, rawOptionStyles?.button, rawOptionButton?.className)
      : undefined;
  const inheritedBadgeStyle =
    lockedStyles?.badge || rawOptionStyles?.badge
      ? twMerge(lockedStyles?.badge, rawOptionStyles?.badge)
      : undefined;

  const mergedStyles = {
    title: twMerge(NEXUS_SILEO_STYLES.title, inheritedTitleStyle),
    description: twMerge(NEXUS_SILEO_STYLES.description, inheritedDescriptionStyle),
    button: twMerge(NEXUS_SILEO_STYLES.button, inheritedButtonStyle),
    badge: twMerge(NEXUS_SILEO_STYLES.badge, inheritedBadgeStyle),
  };

  React.useEffect(() => {
    setActiveToasterOptions({
      fill: resolvedFill,
      styles: {
        ...(inheritedTitleStyle ? { title: inheritedTitleStyle } : {}),
        ...(inheritedDescriptionStyle ? { description: inheritedDescriptionStyle } : {}),
        ...(inheritedButtonStyle ? { button: inheritedButtonStyle } : {}),
        ...(inheritedBadgeStyle ? { badge: inheritedBadgeStyle } : {}),
      },
    });
    return () => {
      setActiveToasterOptions(undefined);
    };
  }, [
    resolvedFill,
    inheritedTitleStyle,
    inheritedDescriptionStyle,
    inheritedButtonStyle,
    inheritedBadgeStyle,
  ]);

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
    fill: resolvedFill,
    roundness: options?.roundness ?? 16,
    autopilot: options?.autopilot ?? true,
    ...restOptions,
    styles: mergedStyles,
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
