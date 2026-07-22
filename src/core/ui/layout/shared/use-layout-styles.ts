"use client";

import { useSettings } from "@core/providers/settings-provider";
import type {
  AnimationLevel,
  BorderRadius,
  ButtonStyle,
  CardStyle,
  HeaderStyle,
  ShadowIntensity,
  SidebarStyle,
  SpacingSize,
} from "@core/providers/settings-provider";

/**
 * Enhanced layout-style utility hook.
 *
 * Provides all style helpers based on global settings,
 * including new `getColorThemeClasses()` and `getIndentStyle()`
 * that eliminate duplicated 9-way ternary chains across layouts.
 */
export function useLayoutStyles() {
  const {
    headerStyle,
    sidebarStyle,
    spacingSize,
    borderRadius,
    animationLevel,
    shadowIntensity,
    buttonStyle,
    cardStyle,
    colorTheme,
  } = useSettings();

  const merge = <T extends string>(
    value: T,
    base: Record<string, string>,
    overrides?: Partial<Record<string, string>>
  ) => {
    const map = { ...base, ...overrides };
    return map[value] ?? map.default ?? "";
  };

  const getSpacingClass = (overrides?: Partial<Record<SpacingSize | "default", string>>) =>
    merge(
      spacingSize,
      {
        compact: "px-4 py-2",
        comfortable: "px-10 py-6",
        spacious: "px-12 py-8",
        default: "px-8 py-4",
      },
      overrides
    );

  const getHeaderStyleClass = (mapping: Record<HeaderStyle | "default", string>) =>
    merge(headerStyle, mapping);

  const getSidebarStyleClass = (mapping: Record<SidebarStyle | "default", string>) =>
    merge(sidebarStyle, mapping);

  const getShadowClass = (overrides?: Partial<Record<ShadowIntensity | "default", string>>) =>
    merge(
      shadowIntensity,
      {
        none: "",
        subtle: "shadow-sm",
        moderate: "shadow-lg",
        strong: "shadow-2xl",
        default: "shadow-lg",
      },
      overrides
    );

  const getAnimationClass = (overrides?: Partial<Record<AnimationLevel | "default", string>>) =>
    merge(
      animationLevel,
      {
        none: "",
        minimal: "transition-colors duration-200",
        moderate: "transition-all duration-300",
        high: "transition-all duration-500",
        default: "transition-all duration-500",
      },
      overrides
    );

  const getBorderRadiusClass = (overrides?: Partial<Record<BorderRadius | "default", string>>) =>
    merge(
      borderRadius,
      {
        none: "rounded-none",
        small: "rounded-sm",
        large: "rounded-lg",
        full: "rounded-full",
        default: "rounded-md",
      },
      overrides
    );

  const getButtonStyleClass = (overrides?: Partial<Record<ButtonStyle | "default", string>>) =>
    merge(
      buttonStyle,
      {
        rounded: "rounded-full",
        sharp: "rounded-none",
        modern: "rounded-xl",
        default: "rounded-lg",
      },
      overrides
    );

  const getCardStyleClass = (overrides?: Partial<Record<CardStyle | "default", string>>) =>
    merge(
      cardStyle,
      {
        glass:
          "bg-foreground/5 backdrop-blur-xl border border-border/50 shadow-[0_8px_32px_0_hsl(var(--foreground)/0.15)]",
        solid: "bg-muted/80 dark:bg-muted/80 border-0",
        bordered: "border-2 border-border/50 bg-card/50 backdrop-blur-sm",
        elevated: "shadow-xl border-0 bg-card",
        default: "border border-border/30 bg-card/80 shadow-sm backdrop-blur-sm",
      },
      overrides
    );

  // ---------- NEW: Color-theme aware classes ----------

  /**
   * Returns classes for navigation items based on the active colorTheme.
   * Replaces the verbose 9-way ternary chains found in classic-sidebar, etc.
   *
   * @param variant  "active" | "hover" | "icon-bg" | "icon-active"
   * @param isDark   Whether the current theme is dark mode
   */
  const getColorThemeClasses = (
    variant: "active" | "hover" | "icon-bg" | "icon-active"
  ): string => {
    // For most themes we just use CSS custom properties (bg-primary, text-primary)
    // which already switch based on the color theme. The 9-way ternary was
    // unnecessarily hard-coding colors per-theme when CSS vars handle it.
    const map: Record<string, string> = {
      active: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md",
      hover: "hover:bg-primary/10 hover:text-primary",
      "icon-bg": "bg-primary/10",
      "icon-active": "bg-white/20",
    };
    return map[variant] ?? "";
  };

  /**
   * Returns RTL-aware indentation style.
   * Uses `paddingInlineStart` so it works in both LTR and RTL.
   */
  const getIndentStyle = (
    level: number,
    pxPerLevel: number = 16,
    basePx: number = 16,
    maxLevel: number = 5
  ): React.CSSProperties => ({
    paddingInlineStart: `${basePx + Math.min(level, maxLevel) * pxPerLevel}px`,
  });

  return {
    // Existing
    getSpacingClass,
    getHeaderStyleClass,
    getSidebarStyleClass,
    getShadowClass,
    getAnimationClass,
    getBorderRadiusClass,
    getButtonStyleClass,
    getCardStyleClass,
    // New
    getColorThemeClasses,
    getIndentStyle,
    // Raw values
    colorTheme,
    animationLevel,
    shadowIntensity,
    spacingSize,
  };
}

export type LayoutStyleHelpers = ReturnType<typeof useLayoutStyles>;
