/**
 * ============================================================================
 * SHARED NAVIGATION STYLING UTILITIES
 * ============================================================================
 *
 * Single source of truth for all navigation styling functions.
 * Used by both NavigationMainSidebar and NavigationPanelSidebar.
 *
 * Eliminates the massive duplication that existed before where every
 * component had its own copy of these functions.
 * ============================================================================
 */

import { cn } from "@core/common/utils";
import type {
  ColorTheme,
  AnimationLevel,
  BorderRadius,
  NavigationStyle,
  IconStyle,
  CardStyle,
} from "@core/providers/settings-provider";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NavigationStyleConfig {
  colorTheme: ColorTheme;
  animationLevel: AnimationLevel;
  borderRadius: BorderRadius;
  navigationStyle: NavigationStyle;
  iconStyle: IconStyle;
  cardStyle: CardStyle;
  direction: "ltr" | "rtl";
}

// ─── Color map ──────────────────────────────────────────────────────────────

const THEME_COLORS: Record<
  string,
  {
    bg: string;
    hover: string;
    text: string;
    border: string;
    bgAlpha: string;
    bgAlpha10: string;
    light: string;
    gradient: string;
  }
> = {
  blue: {
    bg: "bg-blue-600",
    hover: "hover:bg-blue-700",
    text: "text-blue-600",
    border: "border-blue-600",
    bgAlpha: "bg-blue-600/20",
    bgAlpha10: "bg-blue-600/10",
    light: "bg-blue-300",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  purple: {
    bg: "bg-purple-600",
    hover: "hover:bg-purple-700",
    text: "text-purple-600",
    border: "border-purple-600",
    bgAlpha: "bg-purple-600/20",
    bgAlpha10: "bg-purple-600/10",
    light: "bg-purple-300",
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
  },
  green: {
    bg: "bg-green-600",
    hover: "hover:bg-green-700",
    text: "text-green-600",
    border: "border-green-600",
    bgAlpha: "bg-green-600/20",
    bgAlpha10: "bg-green-600/10",
    light: "bg-green-300",
    gradient: "bg-gradient-to-br from-green-500 to-green-600",
  },
  orange: {
    bg: "bg-orange-600",
    hover: "hover:bg-orange-700",
    text: "text-orange-600",
    border: "border-orange-600",
    bgAlpha: "bg-orange-600/20",
    bgAlpha10: "bg-orange-600/10",
    light: "bg-orange-300",
    gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  red: {
    bg: "bg-red-600",
    hover: "hover:bg-red-700",
    text: "text-red-600",
    border: "border-red-600",
    bgAlpha: "bg-red-600/20",
    bgAlpha10: "bg-red-600/10",
    light: "bg-red-300",
    gradient: "bg-gradient-to-br from-red-500 to-red-600",
  },
  teal: {
    bg: "bg-teal-600",
    hover: "hover:bg-teal-700",
    text: "text-teal-600",
    border: "border-teal-600",
    bgAlpha: "bg-teal-600/20",
    bgAlpha10: "bg-teal-600/10",
    light: "bg-teal-300",
    gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
  },
  pink: {
    bg: "bg-pink-600",
    hover: "hover:bg-pink-700",
    text: "text-pink-600",
    border: "border-pink-600",
    bgAlpha: "bg-pink-600/20",
    bgAlpha10: "bg-pink-600/10",
    light: "bg-pink-300",
    gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
  },
  indigo: {
    bg: "bg-indigo-600",
    hover: "hover:bg-indigo-700",
    text: "text-indigo-600",
    border: "border-indigo-600",
    bgAlpha: "bg-indigo-600/20",
    bgAlpha10: "bg-indigo-600/10",
    light: "bg-indigo-300",
    gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  },
  cyan: {
    bg: "bg-cyan-600",
    hover: "hover:bg-cyan-700",
    text: "text-cyan-600",
    border: "border-cyan-600",
    bgAlpha: "bg-cyan-600/20",
    bgAlpha10: "bg-cyan-600/10",
    light: "bg-cyan-300",
    gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
  },
};

function getColors(theme: string) {
  return THEME_COLORS[theme] ?? THEME_COLORS.blue;
}

// ─── Shared styling functions ───────────────────────────────────────────────

export function getBorderRadiusClass(radius: BorderRadius): string {
  switch (radius) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-sm";
    case "large":
      return "rounded-lg";
    case "full":
      return "rounded-full";
    default:
      return "rounded-md";
  }
}

export function getAnimationClass(
  level: AnimationLevel,
  variant: "main" | "panel" = "main"
): string {
  if (level === "none") return "";
  if (level === "minimal") return "transition-colors duration-200";
  if (level === "moderate") return "transition-all duration-200";
  return variant === "main"
    ? "transition-all duration-300 hover:scale-105"
    : "transition-all duration-300 hover:scale-[1.02]";
}

export function getIconClasses(style: IconStyle, size: "sm" | "md" = "md"): string {
  const baseClasses = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  switch (style) {
    case "filled":
      return cn(baseClasses, "fill-current");
    case "duotone":
      return cn(baseClasses, "fill-current opacity-75");
    case "minimal":
      return cn(baseClasses, "stroke-2");
    default:
      return cn(baseClasses, "stroke-current fill-none");
  }
}

export function getSidebarBgClass(cardStyle: CardStyle, direction: "ltr" | "rtl"): string {
  const bg =
    cardStyle === "glass"
      ? "bg-foreground/5 backdrop-blur-xl border-border/50 shadow-[0_8px_32px_0_hsl(var(--foreground)/0.15)]"
      : cardStyle === "solid"
        ? "bg-card border-border backdrop-blur-sm"
        : cardStyle === "bordered"
          ? "bg-card border border-border"
          : "bg-card";

  const border = direction === "rtl" ? "right-0 border-l" : "left-0 border-r";
  return cn(bg, border);
}

export function getPanelBgClass(cardStyle: CardStyle, direction: "ltr" | "rtl"): string {
  const bg =
    cardStyle === "glass"
      ? "bg-foreground/5 backdrop-blur-xl border-border/50 shadow-[0_8px_32px_0_hsl(var(--foreground)/0.15)]"
      : cardStyle === "solid"
        ? "bg-card border-border backdrop-blur-sm"
        : cardStyle === "bordered"
          ? "bg-card border border-border"
          : "bg-card";

  const border = direction === "rtl" ? "right-24 border-l" : "left-24 border-r";
  return cn(bg, border);
}

// ─── Active item styling ────────────────────────────────────────────────────

/**
 * Main sidebar active item classes (icon buttons).
 * `variant` controls border direction for the "sidebar" navigation style.
 */
export function getMainItemClasses(
  isActive: boolean,
  config: NavigationStyleConfig,
  isMobile = false
): string {
  const baseClasses = isMobile ? "w-full justify-start gap-3 h-12" : "w-14 h-14 relative group";

  if (!isActive) {
    return cn(baseClasses, "hover:bg-accent hover:text-accent-foreground");
  }

  const c = getColors(config.colorTheme);

  switch (config.navigationStyle) {
    case "pills":
      return cn(baseClasses, "text-white shadow-lg rounded-full", c.bg, c.hover);
    case "underline":
      return cn(baseClasses, "rounded-none border-b-2", c.border, c.text);
    case "sidebar": {
      const borderSide = isMobile
        ? config.direction === "rtl"
          ? "border-r-4"
          : "border-l-4"
        : config.direction === "rtl"
          ? "border-l-4"
          : "border-r-4";
      return cn(baseClasses, "rounded-none", borderSide, c.bgAlpha, c.border, c.text);
    }
    default:
      return cn(baseClasses, "text-white shadow-lg", c.bg, c.hover);
  }
}

/**
 * Panel sidebar active item classes (text links).
 */
export function getPanelItemClasses(isActive: boolean, config: NavigationStyleConfig): string {
  const baseClasses = "w-full gap-2 h-10 px-3";

  if (!isActive) {
    return cn(baseClasses, "hover:bg-accent hover:text-accent-foreground");
  }

  const c = getColors(config.colorTheme);

  switch (config.navigationStyle) {
    case "pills":
      return cn(baseClasses, "text-white shadow-sm rounded-full", c.bg, c.hover);
    case "underline":
      return cn(baseClasses, "rounded-none border-b-2", c.border, c.text);
    case "sidebar": {
      const borderSide = config.direction === "rtl" ? "border-l-4" : "border-r-4";
      return cn(baseClasses, "rounded-none", borderSide, c.bgAlpha, c.border, c.text);
    }
    default:
      return cn(baseClasses, "text-white shadow-sm", c.bg, c.hover);
  }
}

/**
 * Panel sidebar PARENT GROUP styling — subtler than the active leaf.
 * Used when a parent contains an active descendant but is not the active page itself.
 *
 * Visual hierarchy:
 *   inactive  → no color
 *   parent    → light tinted bg + colored text (this function)
 *   active    → full solid bg + white text (getPanelItemClasses)
 */
export function getPanelParentClasses(config: NavigationStyleConfig): string {
  const baseClasses = "w-full gap-2 h-10 px-3";
  const c = getColors(config.colorTheme);

  switch (config.navigationStyle) {
    case "pills":
      return cn(baseClasses, "rounded-full", c.bgAlpha10, c.text, "font-medium");
    case "underline":
      return cn(baseClasses, "rounded-none border-b", c.border, c.text, "border-opacity-40");
    case "sidebar": {
      const borderSide = config.direction === "rtl" ? "border-l-2" : "border-r-2";
      return cn(
        baseClasses,
        "rounded-none",
        borderSide,
        c.bgAlpha10,
        c.border,
        c.text,
        "border-opacity-50"
      );
    }
    default:
      return cn(baseClasses, c.bgAlpha10, c.text, "font-medium");
  }
}

/**
 * Get the active indicator bar color for the main sidebar.
 */
export function getIndicatorColor(colorTheme: ColorTheme): string {
  return getColors(colorTheme).light;
}

/**
 * Get the gradient class for the panel header icon badge.
 */
export function getPanelHeaderGradient(colorTheme: ColorTheme): string {
  return getColors(colorTheme).gradient;
}
