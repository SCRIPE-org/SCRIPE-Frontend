import { useSettings } from "@core/providers/settings-provider";
import type {
  AnimationLevel,
  BorderRadius,
  ButtonStyle,
  HeaderStyle,
  SidebarStyle,
  ShadowIntensity,
  SpacingSize,
  CardStyle,
} from "@core/providers/settings-provider";

// Utility hook that exposes common style helpers based on global settings
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

  return {
    getSpacingClass,
    getHeaderStyleClass,
    getSidebarStyleClass,
    getShadowClass,
    getAnimationClass,
    getBorderRadiusClass,
    getButtonStyleClass,
    getCardStyleClass,
  };
}

export type LayoutStyleHelpers = ReturnType<typeof useLayoutStyles>;
