import type { SileoStyles } from "sileo";
import type { SileoPosition } from "./types";

/**
 * Nexus design system default style classes for Sileo toast sub-elements.
 * Merged via `tailwind-merge` so caller `styles` and `button.className`
 * overrides compose cleanly without specificity conflicts.
 */
export const NEXUS_SILEO_STYLES: Required<SileoStyles> = {
  title: "font-sans font-semibold tracking-tight text-[13px]",
  description: "font-sans text-[12px] leading-relaxed text-nx-ink-2",
  button:
    "rounded-nx-control border font-medium text-xs px-3 py-1 focus-visible:outline-none focus-visible:shadow-nx-focus transition-colors motion-reduce:transition-none",
  badge: "shrink-0",
};

/**
 * Contrast fallback classes when `<SileoToaster theme="light" />` explicitly locks
 * a light surface fill (`#ffffff`), keeping description and button crisp even if the
 * surrounding page is rendered in Dark mode.
 */
export const LOCKED_LIGHT_SILEO_STYLES: Partial<SileoStyles> = {
  description: "text-[#4b504c]",
  button: "bg-[#f1f3f2] border-[#d3dcd4] text-[#0d0d0e] hover:bg-[#e5eae6]",
};

/**
 * Contrast fallback classes when `<SileoToaster theme="dark" />` explicitly locks
 * a dark surface fill (`#15181c`), keeping description and button crisp even if the
 * surrounding page is rendered in Light mode.
 */
export const LOCKED_DARK_SILEO_STYLES: Partial<SileoStyles> = {
  description: "text-[#c5ccc6]",
  button: "bg-[#1c2026] border-[#2e343d] text-[#f2f4f2] hover:bg-[#262b33]",
};

export interface ActiveToasterDefaults {
  fill?: string;
  styles?: Partial<SileoStyles>;
}

let activeToasterDefaults: ActiveToasterDefaults | undefined;

/**
 * Registers active `<SileoToaster />` defaults (e.g. `"var(--nx-surface)"` or a
 * custom `options.fill` / `options.styles`) so imperative `toast.*` calls
 * inherit them automatically unless overridden per toast.
 */
export function setActiveToasterOptions(options?: ActiveToasterDefaults): void {
  activeToasterDefaults = options;
}

export function setActiveToasterFill(fill?: string): void {
  activeToasterDefaults = fill !== undefined ? { ...activeToasterDefaults, fill } : undefined;
}

export function getActiveToasterOptions(): ActiveToasterDefaults | undefined {
  return activeToasterDefaults;
}

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
