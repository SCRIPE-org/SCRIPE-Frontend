/**
 * Settings Provider — Backward Compatibility Shim
 *
 * This file re-exports everything from the new modular @core/settings module.
 * All existing consumers importing from "@core/providers/settings-provider"
 * will continue to work without any changes.
 *
 * New code should import from "@core/settings" directly.
 *
 * @deprecated Import from "@core/settings" instead.
 */

"use client";

// Re-export everything from the new modular location
export {
  // Types (re-exported as types from barrel)
  type Settings,
  type ColorTheme,
  type LightBackgroundTheme,
  type DarkBackgroundTheme,
  type ShadowIntensity,
  type SecondaryColorTheme,
  type GradientDirection,
  type LightGradientTheme,
  type DarkGradientTheme,
  type BackgroundMode,
  type LayoutTemplate,
  type CardStyle,
  type AnimationLevel,
  type AnimationSpeed,
  type Theme,
  type FontSize,
  type BorderRadius,
  type SidebarPosition,
  type HeaderStyle,
  type SidebarStyle,
  type ButtonStyle,
  type NavigationStyle,
  type SpacingSize,
  type IconStyle,
  type InputStyle,
  type TableStyle,
  type BadgeStyle,
  type AvatarStyle,
  type LogoType,
  type LogoAnimation,
  type LogoSize,
  type FormStyle,
  type LoadingStyle,
  type TooltipStyle,
  type ModalStyle,
  type TreeStyle,
  type ToastDesign,
  type DatePickerStyle,
  type CalendarStyle,
  type SelectStyle,
  type SwitchStyle,
  type CheckboxStyle,
  type RadioStyle,
  type ToastStyle,
  type HoverEffectType,
  type HoverEffectIntensity,
  type SettingsContextType,
  type OverrideControl,

  // Runtime exports
  defaultSettings,
  SETTINGS_KEYS,
  SettingsContext,
  useSettings,
  createFallbackSettings,
  createCompatSetters,
  SettingsProvider,
  applySettingsToDOM,
  DEFAULT_OVERRIDE_CONTROL,
} from "@core/settings";
