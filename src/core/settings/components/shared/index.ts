/**
 * @module core/settings/components/shared
 *
 * Shared setting UI primitives for dashboard customization.
 * Used by: SettingsView tabs, DashboardBuilderTab, Customizer Studio panels.
 *
 * All components are provider-agnostic — they accept props and emit callbacks.
 * This enables reuse across both the full-page Settings view and the compact
 * Customizer Studio sidebar with different data sources.
 */

// ── Atomic Primitives ──
export {
  SettingToggle,
  SettingSection,
  ColorSwatchGrid,
  StyleCardPicker,
  ModePicker,
  EditionGatedControl,
} from "./setting-primitives";

// ── Lock & Override Indicators (M11 Phase E) ──
export { LockedSettingBadge, useSettingLock } from "./LockedSettingBadge";
export { TenantDefaultIndicator } from "./TenantDefaultIndicator";

// ── Types ──
export type {
  SettingToggleProps,
  SettingSectionProps,
  ColorSwatchGridProps,
  StyleCardPickerProps,
  ModePickerProps,
  EditionGatedControlProps,
  StyleOption,
  ColorSwatchOption,
  ModeOption,
} from "./setting-primitives";
