"use client";

import { useSettings } from "@core/providers/settings-provider";
import type {
  AnimationLevel,
  BorderRadius,
  ShadowIntensity,
  SpacingSize,
} from "@core/providers/settings-provider";

/**
 * Layout-style utility hook.
 *
 * Provides the shared style helpers driven by global settings. Wave C pruned
 * the dead helpers (header/sidebar/button/card class builders, the
 * colour-theme class map, and the indent builder) — none had a caller, and
 * the header/sidebar fields they read were culled from Settings.
 */
export function useLayoutStyles() {
  const { spacingSize, borderRadius, animationLevel, shadowIntensity, colorTheme } = useSettings();

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

  return {
    getSpacingClass,
    getShadowClass,
    getAnimationClass,
    getBorderRadiusClass,
    // Raw values
    colorTheme,
    animationLevel,
    shadowIntensity,
    spacingSize,
  };
}

export type LayoutStyleHelpers = ReturnType<typeof useLayoutStyles>;
