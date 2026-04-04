/**
 * Settings Context & Hook
 *
 * Defines the context type (with generic updateSetting + backward-compat setters),
 * the React context, the useSettings hook, and the SSR fallback factory.
 */

"use client";

import { createContext, useContext } from "react";
import type { Settings } from "./types";
import { defaultSettings, SETTINGS_KEYS } from "./defaults";
import type { OverrideControl } from "./merge-engine";
import { DEFAULT_OVERRIDE_CONTROL } from "./merge-engine";

// ── Context Type ──────────────────────────────────────────

/** Individual setter function type — generated dynamically from Settings keys */
type SetterName<K extends string> = `set${Capitalize<K>}`;

/** Build the full map of individual setter types from Settings */
type IndividualSetters = {
  [K in keyof Settings as SetterName<K & string>]: (value: Settings[K]) => void;
};

export interface SettingsContextType extends Settings, IndividualSetters {
  /** Generic setter — works for any setting key */
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;

  // Utility functions
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => boolean;

  // M11: Admin override control
  overrideControl: OverrideControl;
}

// ── Backward-Compatible Setter Generator ──────────────────

/**
 * Auto-generate individual setXxx methods from a generic updateSetting function.
 * Eliminates the need to manually list 61 setters in 4 separate places.
 */
export function createCompatSetters(
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
): IndividualSetters {
  const setters: Record<string, (value: unknown) => void> = {};
  for (const key of SETTINGS_KEYS) {
    const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    setters[setterName] = (value: unknown) => updateSetting(key, value as Settings[typeof key]);
  }
  return setters as unknown as IndividualSetters;
}

// ── Context ───────────────────────────────────────────────

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ── Fallback (SSR / hydration issues) ─────────────────────

const noop = () => {};

/**
 * Create a fallback context value for SSR or hydration issues.
 * Values mirror defaultSettings exactly to prevent hydration mismatches.
 */
export function createFallbackSettings(): SettingsContextType {
  const noopUpdate = <K extends keyof Settings>(_key: K, _value: Settings[K]) => {};
  return {
    ...defaultSettings,
    updateSetting: noopUpdate,
    ...createCompatSetters(noopUpdate),
    resetSettings: noop,
    exportSettings: () => "{}",
    importSettings: () => false,
    overrideControl: DEFAULT_OVERRIDE_CONTROL,
  } as SettingsContextType;
}

// ── Hook ──────────────────────────────────────────────────

/**
 * Access the settings context. Returns fallback values during SSR.
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // During SSR/prerendering or hydration issues, provide fallback values
    return createFallbackSettings();
  }
  return context;
}
