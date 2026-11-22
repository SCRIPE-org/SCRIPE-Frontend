/**
 * Workstation Preferences & Ergonomics Pure Helpers
 *
 * Types, accent palette definitions, DOM/localStorage persistence helpers,
 * and hydration sync utilities for `useWorkstationPreferencesViewModel`.
 */
import type { SovereignPreferencesSlice } from "../../domain/entities/SovereignAccountWorkstationEntities";

/** Supported brand accent hue identifiers. */
export type AccentHue =
  | "signal-lime"
  | "electric-emerald"
  | "ocean-blue"
  | "amber-gold";

/** Supported workstation UI density presets. */
export type UiDensity = "comfortable" | "compact";

/** Supported numeral formatting systems (`latn` or `arab`). */
export type NumeralSystem = "latn" | "arab";

/** Supported toast notification viewport anchor positions. */
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-end"
  | "top-start"
  | "bottom-end"
  | "bottom-start";

/** Exhaustive list of valid toast notification viewport positions. */
export const VALID_TOAST_POSITIONS: ToastPosition[] = [
  "top-right",
  "top-left",
  "top-center",
  "bottom-right",
  "bottom-left",
  "bottom-center",
  "top-end",
  "top-start",
  "bottom-end",
  "bottom-start",
];

/** Available console brand accent hue options with localization keys and preview colors. */
export const ACCENT_PALETTES: Array<{
  id: AccentHue;
  label: string;
  labelKey: string;
  hex: string;
}> = [
  {
    id: "signal-lime",
    label: "Signal Lime (Standard)",
    labelKey: "profile.preferences.accentSignalLime",
    hex: "#84cc16",
  },
  {
    id: "electric-emerald",
    label: "Electric Emerald",
    labelKey: "profile.preferences.accentElectricEmerald",
    hex: "#10b981",
  },
  {
    id: "ocean-blue",
    label: "Tactical Cyan",
    labelKey: "profile.preferences.accentOceanBlue",
    hex: "#06b6d4",
  },
  {
    id: "amber-gold",
    label: "Executive Amber",
    labelKey: "profile.preferences.accentAmberGold",
    hex: "#f59e0b",
  },
];

/** Detects the initial operating timezone from localStorage or the browser Intl API. */
export function detectDefaultTimezone(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("scr_pref_timezone");
    if (stored) return stored;
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) return detected;
    } catch {
      // ignore fallback
    }
  }
  return "UTC";
}

/** Reads the initial accent hue from localStorage with safe fallback. */
export function readInitialAccent(): AccentHue {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("scr_pref_accent");
    if (stored && ACCENT_PALETTES.some((palette) => palette.id === stored)) {
      return stored as AccentHue;
    }
  }
  return "signal-lime";
}

/** Reads the initial toast position from localStorage with safe fallback. */
export function readInitialToastPosition(): ToastPosition {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("scr_pref_toast_position") as ToastPosition | null;
    if (stored && VALID_TOAST_POSITIONS.includes(stored)) return stored;
  }
  return "top-end";
}

/** Reads the initial numeral system preference from localStorage. */
export function readInitialNumeralSystem(): NumeralSystem {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("scr_pref_numerals");
    if (stored === "arab" || stored === "latn") return stored;
  }
  return "latn";
}

/** Applies accent hue to localStorage and `<html data-accent>`. */
export function applyAccentDom(next: AccentHue): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("scr_pref_accent", next);
    document.documentElement.setAttribute("data-accent", next);
  }
}

/** Applies UI density to localStorage and `<html data-density>`. */
export function applyDensityDom(next: UiDensity): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("scr_pref_density", next);
    document.documentElement.setAttribute("data-density", next);
  }
}

/** Persists operating timezone to localStorage. */
export function applyTimezoneDom(next: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("scr_pref_timezone", next);
  }
}

/** Persists toast position to localStorage and broadcasts viewport change event. */
export function applyToastPositionDom(next: ToastPosition): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("scr_pref_toast_position", next);
    window.dispatchEvent(
      new CustomEvent("scripe:toast-position-changed", { detail: next })
    );
  }
}

/** Toggles `<html data-privacy-blur>` attribute in the browser document. */
export function applyPrivacyBlurDom(checked: boolean): void {
  if (typeof document !== "undefined") {
    document.documentElement.toggleAttribute("data-privacy-blur", checked);
  }
}

/** Persists numeral system to localStorage. */
export function applyNumeralSystemDom(next: NumeralSystem): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("scr_pref_numerals", next);
  }
}

/** Toggles `<html data-reduced-motion>` attribute in the browser document. */
export function applyReducedMotionDom(checked: boolean): void {
  if (typeof document !== "undefined") {
    document.documentElement.toggleAttribute("data-reduced-motion", checked);
  }
}

/** Callbacks invoked when hydrating ergonomics state from backend preferences. */
export interface ErgonomicsHydrationSetters {
  setAccentState: (value: AccentHue) => void;
  setDensityState: (value: UiDensity) => void;
  setAppStoreDensity: (value: UiDensity) => void;
  setTimezoneState: (value: string) => void;
  setToastPositionState: (value: ToastPosition) => void;
  setPrivacyBlurState: (value: boolean) => void;
  setNumeralSystemState: (value: NumeralSystem) => void;
  setReducedMotionState: (value: boolean) => void;
}

/** Synchronizes loaded database preference fields into React state and DOM attributes. */
export function hydrateErgonomicsFromPreferences(
  preferences: SovereignPreferencesSlice,
  setters: ErgonomicsHydrationSetters
): void {
  const hue = preferences.clubAccentHue;
  if (
    hue === "signal-lime" ||
    hue === "electric-emerald" ||
    hue === "ocean-blue" ||
    hue === "amber-gold"
  ) {
    setters.setAccentState(hue);
    applyAccentDom(hue);
  }
  if (preferences.density === "compact" || preferences.density === "comfortable") {
    setters.setDensityState(preferences.density);
    setters.setAppStoreDensity(preferences.density);
    applyDensityDom(preferences.density);
  }
  if (preferences.operatingTimezone) {
    setters.setTimezoneState(preferences.operatingTimezone);
    applyTimezoneDom(preferences.operatingTimezone);
  }
  if (
    preferences.toastPosition &&
    VALID_TOAST_POSITIONS.includes(preferences.toastPosition as ToastPosition)
  ) {
    const pos = preferences.toastPosition as ToastPosition;
    setters.setToastPositionState(pos);
    applyToastPositionDom(pos);
  }
  if (typeof preferences.broadcastPrivacyBlurDefault === "boolean") {
    setters.setPrivacyBlurState(preferences.broadcastPrivacyBlurDefault);
    applyPrivacyBlurDom(preferences.broadcastPrivacyBlurDefault);
  }
  if (preferences.numeralSystem === "arab" || preferences.numeralSystem === "latn") {
    setters.setNumeralSystemState(preferences.numeralSystem);
    applyNumeralSystemDom(preferences.numeralSystem);
  }
  if (typeof preferences.reducedMotionEnabled === "boolean") {
    setters.setReducedMotionState(preferences.reducedMotionEnabled);
    applyReducedMotionDom(preferences.reducedMotionEnabled);
  }
}
