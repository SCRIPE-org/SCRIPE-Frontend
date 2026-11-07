"use client";

/**
 * useWorkstationPreferencesViewModel
 *
 * ViewModel for Workstation Preferences & Ergonomics.
 * Coordinates Relay vNext Theme Mode, Club Accent Hue, UI Density,
 * Bilingual Direction (EN/AR), and Timezone configuration.
 * Hydrates from and persists to backend database (`adminSettingsJson`) while keeping
 * Zustand (`useAppStore`) and local DOM state synchronized with zero latency.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useProfileDossierViewModel } from "./useProfileDossierViewModel";

export type AccentHue = "signal-lime" | "electric-emerald" | "ocean-blue" | "amber-gold";
export type UiDensity = "comfortable" | "compact";

export const ACCENT_PALETTES: Array<{ id: AccentHue; label: string; hex: string }> = [
  { id: "signal-lime", label: "Signal Lime (Standard)", hex: "#84cc16" },
  { id: "electric-emerald", label: "Electric Emerald", hex: "#10b981" },
  { id: "ocean-blue", label: "Tactical Cyan", hex: "#06b6d4" },
  { id: "amber-gold", label: "Executive Amber", hex: "#f59e0b" },
];

interface PersistedWorkstationSettings {
  theme?: string;
  accentHue?: AccentHue;
  density?: UiDensity;
  language?: "en" | "ar";
  timezone?: string;
  personalAccessTokens?: unknown[];
  [key: string]: unknown;
}

export function useWorkstationPreferencesViewModel() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useTheme();
  const { language, setLanguage: setI18nLanguage, direction } = useI18n();
  const setAppStoreDensity = useAppStore((s) => s.setDensity);
  const { profile, updateProfile } = useProfileDossierViewModel();
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

  // Hydrate Zustand & DOM from DB `adminSettingsJson` when profile loads
  useEffect(() => {
    if (!profile?.adminSettingsJson || hasHydratedFromDbRef.current) return;
    try {
      const parsed = JSON.parse(profile.adminSettingsJson) as PersistedWorkstationSettings;
      hasHydratedFromDbRef.current = true;

      if (parsed.accentHue) {
        setAccentState(parsed.accentHue);
        if (typeof window !== "undefined") {
          localStorage.setItem("scr_pref_accent", parsed.accentHue);
          document.documentElement.setAttribute("data-accent", parsed.accentHue);
        }
      }
      if (parsed.density === "compact" || parsed.density === "comfortable") {
        setDensityState(parsed.density);
        setAppStoreDensity(parsed.density);
        if (typeof window !== "undefined") {
          localStorage.setItem("scr_pref_density", parsed.density);
          document.documentElement.setAttribute("data-density", parsed.density);
        }
      }
      if (parsed.timezone) {
        setTimezoneState(parsed.timezone);
        if (typeof window !== "undefined") {
          localStorage.setItem("scr_pref_timezone", parsed.timezone);
        }
      }
    } catch {
      // ignore malformed JSON
    }
  }, [profile?.adminSettingsJson, setAppStoreDensity]);

  const persistSettingsToBackend = useCallback(
    (patch: Partial<PersistedWorkstationSettings>) => {
      if (!profile) return;
      let existing: PersistedWorkstationSettings = {};
      if (profile.adminSettingsJson) {
        try {
          existing = JSON.parse(profile.adminSettingsJson) as PersistedWorkstationSettings;
        } catch {
          existing = {};
        }
      }
      const nextSettings: PersistedWorkstationSettings = {
        ...existing,
        theme: theme || "system",
        accentHue: accent,
        density,
        language: language as "en" | "ar",
        timezone,
        ...patch,
      };
      updateProfile({
        firstName: profile.firstName || "Alex",
        lastName: profile.lastName || "Morgan",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio,
        activeBranchName: profile.activeBranchName,
        isAvailableForOperations: profile.isAvailableForOperations,
        adminSettingsJson: JSON.stringify(nextSettings),
      }).catch(() => {
        // Optimistic local + Zustand update still succeeds if offline
      });
    },
    [profile, theme, accent, density, language, timezone, updateProfile]
  );

  const setTheme = (newTheme: string) => {
    setNextTheme(newTheme);
    persistSettingsToBackend({ theme: newTheme });
  };

  const setAccent = (newAccent: AccentHue) => {
    setAccentState(newAccent);
    if (typeof window !== "undefined") {
      localStorage.setItem("scr_pref_accent", newAccent);
      document.documentElement.setAttribute("data-accent", newAccent);
    }
    persistSettingsToBackend({ accentHue: newAccent });
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
    persistSettingsToBackend({ language: newLang });
  };

  const setTimezone = (newTz: string) => {
    setTimezoneState(newTz);
    if (typeof window !== "undefined") {
      localStorage.setItem("scr_pref_timezone", newTz);
    }
    persistSettingsToBackend({ timezone: newTz });
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
  };
}
