/**
 * Settings Module — Barrel Exports
 *
 * Single entry point for all settings-related imports.
 * Usage: import { useSettings, type Settings, defaultSettings } from "@core/settings";
 */

// Types
export type {
  Settings,
  ColorTheme,
  LightBackgroundTheme,
  DarkBackgroundTheme,
  ShadowIntensity,
  SecondaryColorTheme,
  GradientDirection,
  LightGradientTheme,
  DarkGradientTheme,
  BackgroundMode,
  LayoutTemplate,
  CardStyle,
  AnimationLevel,
  AnimationSpeed,
  Theme,
  FontSize,
  BorderRadius,
  SidebarPosition,
  HeaderStyle,
  SidebarStyle,
  ButtonStyle,
  NavigationStyle,
  SpacingSize,
  IconStyle,
  InputStyle,
  TableStyle,
  BadgeStyle,
  AvatarStyle,
  LogoType,
  LogoAnimation,
  LogoSize,
  FormStyle,
  LoadingStyle,
  TooltipStyle,
  ModalStyle,
  TreeStyle,
  ToastDesign,
  DatePickerStyle,
  CalendarStyle,
  SelectStyle,
  SwitchStyle,
  CheckboxStyle,
  RadioStyle,
  ToastStyle,
  HoverEffectType,
  HoverEffectIntensity,
} from "./types";

// Defaults
export { defaultSettings, SETTINGS_KEYS } from "./defaults";

// Context
export type { SettingsContextType } from "./context";
export {
  SettingsContext,
  useSettings,
  createFallbackSettings,
  createCompatSetters,
} from "./context";

// Merge engine
export type { OverrideControl, MergeInput, MergeResult } from "./merge-engine";
export { mergeSettings, DEFAULT_OVERRIDE_CONTROL } from "./merge-engine";

// DOM applicator
export { applySettingsToDOM } from "./dom-applicator";

// Persistence
export {
  readTenantDefaults,
  readAdminOverrides,
  writeAdminOverrides,
  clearStaleAdminOverrides,
} from "./persistence";

// Provider
export { SettingsProvider } from "./settings-provider";
