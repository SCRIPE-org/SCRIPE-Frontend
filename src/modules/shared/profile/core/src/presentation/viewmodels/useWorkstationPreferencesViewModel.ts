"use client";

/**
 * useWorkstationPreferencesViewModel
 *
 * ViewModel for Workstation Preferences & Ergonomics.
 * Coordinates Relay vNext Theme Mode, Brand Accent Hue, UI Density,
 * Bilingual Direction (EN/AR), and Timezone configuration.
 * Hydrates from and persists to backend database (`identity.admin_preferences`) while keeping
 * Zustand (`useAppStore`) and local DOM state synchronized with zero latency.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useAccountPreferencesSliceViewModel } from "./useSovereignAccountSlicesViewModel";

export type AccentHue = "signal-lime" | "electric-emerald" | "ocean-blue" | "amber-gold";
export type UiDensity = "comfortable" | "compact";
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

export const ACCENT_PALETTES: Array<{ id: AccentHue; label: string; hex: string }> = [
  { id: "signal-lime", label: "Signal Lime (Standard)", hex: "#84cc16" },
  { id: "electric-emerald", label: "Electric Emerald", hex: "#10b981" },
  { id: "ocean-blue", label: "Tactical Cyan", hex: "#06b6d4" },
  { id: "amber-gold", label: "Executive Amber", hex: "#f59e0b" },
];

export function useWorkstationPreferencesViewModel() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useTheme();
  const { language, setLanguage: setI18nLanguage, direction } = useI18n();
  const setAppStoreDensity = useAppStore((s) => s.setDensity);
  const { preferences, updatePreferences } = useAccountPreferencesSliceViewModel();
  const isRtl = direction === "rtl";
  const hasHydratedFromDbRef = useRef(false);

  const [accent, setAccentState] = useState<AccentHue>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("scr_pref_accent") as AccentHue | null;
      if (stored) return stored;
    }
    return "signal-lime";
  });

  const [density, setDensityState] = useState<UiDensity>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("scr_pref_density") as UiDensity | null;
      if (stored === "compact" || stored === "comfortable") return stored;
    }
    const storeDensity = useAppStore.getState().density;
    return storeDensity === "compact" ? "compact" : "comfortable";
  });

  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("scr_pref_timezone");
      if (stored) return stored;
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected) return detected;
      } catch {
        // ignore
      }
    }
    return "Africa/Cairo";
  });

  const [toastPosition, setToastPositionState] = useState<ToastPosition>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("scr_pref_toast_position") as ToastPosition | null;
      if (stored && VALID_TOAST_POSITIONS.includes(stored)) return stored;
    }
    return "top-right";
  });

  const dbAccentHue = preferences?.clubAccentHue;
  const dbUiDensity = preferences?.density;
  const dbTimezone = preferences?.operatingTimezone;
  const dbToastPosition = preferences?.toastPosition;

  // Hydrate Zustand & DOM from DB `identity.admin_preferences` when preferences load
  useEffect(() => {
    if (!dbAccentHue && !dbUiDensity && !dbTimezone && !dbToastPosition) return;
    if (hasHydratedFromDbRef.current) return;
    hasHydratedFromDbRef.current = true;

    if (
      dbAccentHue === "signal-lime" ||
      dbAccentHue === "electric-emerald" ||
      dbAccentHue === "ocean-blue" ||
      dbAccentHue === "amber-gold"
    ) {
      setAccentState(dbAccentHue);
      if (typeof window !== "undefined") {
        localStorage.setItem("scr_pref_accent", dbAccentHue);
        document.documentElement.setAttribute("data-accent", dbAccentHue);
      }
    }
    if (dbUiDensity === "compact" || dbUiDensity === "comfortable") {
      setDensityState(dbUiDensity);
      setAppStoreDensity(dbUiDensity);
      if (typeof window !== "undefined") {
        localStorage.setItem("scr_pref_density", dbUiDensity);
        document.documentElement.setAttribute("data-density", dbUiDensity);
      }
    }
    if (dbTimezone) {
      setTimezoneState(dbTimezone);
      if (typeof window !== "undefined") {
        localStorage.setItem("scr_pref_timezone", dbTimezone);
      }
    }
    if (dbToastPosition && VALID_TOAST_POSITIONS.includes(dbToastPosition as ToastPosition)) {
      setToastPositionState(dbToastPosition as ToastPosition);
      if (typeof window !== "undefined") {
        localStorage.setItem("scr_pref_toast_position", dbToastPosition);
        window.dispatchEvent(
          new CustomEvent("scripe:toast-position-changed", { detail: dbToastPosition })
        );
      }
    }
  }, [dbAccentHue, dbUiDensity, dbTimezone, dbToastPosition, setAppStoreDensity]);

  const persistSettingsToBackend = useCallback(
    (patch: {
      themeMode?: string;
      clubAccentHue?: string;
      density?: string;
      languageCode?: string;
      operatingTimezone?: string;
      toastPosition?: string;
    }) => {
      updatePreferences(patch).catch(() => {
        // Optimistic local + Zustand update still succeeds if offline
      });
    },
    [updatePreferences]
  );

  const setTheme = (newTheme: string) => {
    setNextTheme(newTheme);
    const mode =
      newTheme === "light" || newTheme === "dark" || newTheme === "system"
        ? newTheme
        : "system";
    persistSettingsToBackend({ themeMode: mode });
  };

  const setAccent = (newAccent: AccentHue) => {
    setAccentState(newAccent);
    if (typeof window !== "undefined") {
      localStorage.setItem("scr_pref_accent", newAccent);
      document.documentElement.setAttribute("data-accent", newAccent);
    }
    persistSettingsToBackend({ clubAccentHue: newAccent });
  };

  const setDensity = (newDensity: UiDensity) => {
    setDensityState(newDensity);
    setAppStoreDensity(newDensity);
    if (typeof window !== "undefined") {
      localStorage.setItem("scr_pref_density", newDensity);
      document.documentElement.setAttribute("data-density", newDensity);
    }
    persistSettingsToBackend({ density: newDensity });
  };

  const setLanguage = (newLang: "en" | "ar") => {
    setI18nLanguage(newLang);
    persistSettingsToBackend({ languageCode: newLang });
  };

  const setTimezone = (newTz: string) => {
    setTimezoneState(newTz);
    if (typeof window !== "undefined") {
      localStorage.setItem("scr_pref_timezone", newTz);
    }
    persistSettingsToBackend({ operatingTimezone: newTz });
  };

  const setToastPosition = (newPosition: ToastPosition) => {
    setToastPositionState(newPosition);
    if (typeof window !== "undefined") {
      localStorage.setItem("scr_pref_toast_position", newPosition);
      window.dispatchEvent(
        new CustomEvent("scripe:toast-position-changed", { detail: newPosition })
      );
    }
    persistSettingsToBackend({ toastPosition: newPosition });
  };

  return {
    // Theme
    theme: theme || "system",
    setTheme,
    resolvedTheme: resolvedTheme || "dark",

    // Accent
    accent,
    setAccent,
    availableAccents: ACCENT_PALETTES,

    // Density
    density,
    setDensity,

    // Language / Direction
    language,
    setLanguage,
    isRtl,

    // Timezone
    timezone,
    setTimezone,

    // Toast Viewport Position
    toastPosition,
    setToastPosition,
  };
}
