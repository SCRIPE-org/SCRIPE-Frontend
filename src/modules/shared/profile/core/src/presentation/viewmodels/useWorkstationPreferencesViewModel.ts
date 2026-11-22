"use client";

/**
 * useWorkstationPreferencesViewModel
 *
 * ViewModel for Workstation Preferences & Ergonomics.
 * Coordinates Relay vNext Theme Mode, Brand Accent Hue, UI Density,
 * Broadcast Privacy Blur, Bilingual Direction (EN/AR), Numeral System,
 * Operating Timezone, Reduced Motion, and Smart Toast Viewport Position.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { toast } from "@core/ui/sileo-toast";
import type { SovereignPreferencesSlice } from "../../domain/entities/SovereignAccountWorkstationEntities";
import {
  sovereignAccountKeys,
  useAccountPreferencesSliceViewModel,
} from "./useSovereignAccountSlicesViewModel";
import {
  usePreferencesMutationQueue,
  type PreferencesSyncStatus,
} from "./usePreferencesMutationQueue";
import {
  invalidateOnConcurrencyConflict,
  isConcurrencyConflictError,
  resolveProfileSaveErrorMessage,
} from "../utils/concurrency";
import {
  ACCENT_PALETTES,
  VALID_TOAST_POSITIONS,
  applyAccentDom,
  applyDensityDom,
  applyNumeralSystemDom,
  applyPrivacyBlurDom,
  applyReducedMotionDom,
  applyTimezoneDom,
  applyToastPositionDom,
  detectDefaultTimezone,
  hydrateErgonomicsFromPreferences,
  readInitialAccent,
  readInitialNumeralSystem,
  readInitialToastPosition,
  type AccentHue,
  type NumeralSystem,
  type ToastPosition,
  type UiDensity,
} from "../utils/preferences-ergonomics.utils";

export {
  ACCENT_PALETTES,
  VALID_TOAST_POSITIONS,
  type AccentHue,
  type NumeralSystem,
  type ToastPosition,
  type UiDensity,
};

/** ViewModel hook coordinating theme, accent, density, locale, timezone, and FIFO preference sync. */
export function useWorkstationPreferencesViewModel() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useTheme();
  const { language, setLanguage: setI18nLanguage, direction, t } = useI18n();
  const queryClient = useQueryClient();
  const setAppStoreDensity = useAppStore((s) => s.setDensity);
  const {
    preferences,
    isLoadingPreferences,
    isPreferencesError,
    preferencesError,
    refetchPreferences,
    updatePreferences,
    isUpdatingPreferences,
  } = useAccountPreferencesSliceViewModel();

  const [persistError, setPersistError] = useState<string | null>(null);
  const hasHydratedFromDbRef = useRef(false);

  const [accent, setAccentState] = useState<AccentHue>(readInitialAccent);
  const [density, setDensityState] = useState<UiDensity>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("scr_pref_density") as UiDensity | null;
      if (stored === "compact" || stored === "comfortable") return stored;
    }
    return useAppStore.getState().density === "compact" ? "compact" : "comfortable";
  });
  const [timezone, setTimezoneState] = useState<string>(detectDefaultTimezone);
  const [toastPosition, setToastPositionState] = useState<ToastPosition>(readInitialToastPosition);
  const [privacyBlur, setPrivacyBlurState] = useState<boolean>(() =>
    typeof window !== "undefined" ? document.documentElement.hasAttribute("data-privacy-blur") : false
  );
  const [numeralSystem, setNumeralSystemState] = useState<NumeralSystem>(readInitialNumeralSystem);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() =>
    typeof window !== "undefined" ? document.documentElement.hasAttribute("data-reduced-motion") : false
  );

  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  const {
    enqueue,
    syncStatus,
    pendingCount,
    clearError: clearQueueError,
  } = usePreferencesMutationQueue({
    initialRowVersion: preferences?.rowVersion,
    mutate: (patch) => updatePreferences(patch),
    onConflict: (error) => {
      invalidateOnConcurrencyConflict(queryClient, sovereignAccountKeys.preferences(), error);
      const message = resolveProfileSaveErrorMessage(error, tRef.current);
      setPersistError(message);
      toast.warning(message);
    },
    onError: (error) => {
      if (isConcurrencyConflictError(error)) return;
      const message = resolveProfileSaveErrorMessage(error, tRef.current);
      setPersistError(message);
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!preferences || hasHydratedFromDbRef.current) return;
    hasHydratedFromDbRef.current = true;
    hydrateErgonomicsFromPreferences(preferences, {
      setAccentState,
      setDensityState,
      setAppStoreDensity,
      setTimezoneState,
      setToastPositionState,
      setPrivacyBlurState,
      setNumeralSystemState,
      setReducedMotionState,
    });
  }, [preferences, setAppStoreDensity]);

  const persistSettingsToBackend = useCallback(
    (patch: Partial<SovereignPreferencesSlice>) => {
      setPersistError(null);
      clearQueueError();
      void enqueue(patch);
    },
    [enqueue, clearQueueError]
  );

  const setTheme = useCallback(
    (newTheme: string) => {
      setNextTheme(newTheme);
      const mode =
        newTheme === "light" || newTheme === "dark" || newTheme === "system" ? newTheme : "system";
      persistSettingsToBackend({ themeMode: mode });
    },
    [setNextTheme, persistSettingsToBackend]
  );

  const setAccent = useCallback(
    (newAccent: AccentHue) => {
      setAccentState(newAccent);
      applyAccentDom(newAccent);
      persistSettingsToBackend({ clubAccentHue: newAccent });
    },
    [persistSettingsToBackend]
  );

  const setDensity = useCallback(
    (newDensity: UiDensity) => {
      setDensityState(newDensity);
      setAppStoreDensity(newDensity);
      applyDensityDom(newDensity);
      persistSettingsToBackend({ density: newDensity });
    },
    [setAppStoreDensity, persistSettingsToBackend]
  );

  const setLanguage = useCallback(
    (newLang: "en" | "ar") => {
      setI18nLanguage(newLang);
      persistSettingsToBackend({ languageCode: newLang });
    },
    [setI18nLanguage, persistSettingsToBackend]
  );

  const setPrivacyBlur = useCallback(
    (checked: boolean) => {
      setPrivacyBlurState(checked);
      applyPrivacyBlurDom(checked);
      persistSettingsToBackend({ broadcastPrivacyBlurDefault: checked });
    },
    [persistSettingsToBackend]
  );

  const setNumeralSystem = useCallback(
    (sys: NumeralSystem) => {
      setNumeralSystemState(sys);
      applyNumeralSystemDom(sys);
      persistSettingsToBackend({ numeralSystem: sys });
    },
    [persistSettingsToBackend]
  );

  const setTimezone = useCallback(
    (newTz: string) => {
      setTimezoneState(newTz);
      applyTimezoneDom(newTz);
      persistSettingsToBackend({ operatingTimezone: newTz });
    },
    [persistSettingsToBackend]
  );

  const setReducedMotion = useCallback(
    (checked: boolean) => {
      setReducedMotionState(checked);
      applyReducedMotionDom(checked);
      persistSettingsToBackend({ reducedMotionEnabled: checked });
    },
    [persistSettingsToBackend]
  );

  const setToastPosition = useCallback(
    (newPosition: ToastPosition) => {
      setToastPositionState(newPosition);
      applyToastPositionDom(newPosition);
      persistSettingsToBackend({ toastPosition: newPosition });
    },
    [persistSettingsToBackend]
  );

  const isStartupMutationBlocked = useCallback(() => {
    const isImp =
      typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEYS.IMPERSONATING) === "true";
    return isImp || Boolean(preferences?.isStartupTargetEnforcedByRole);
  }, [preferences]);

  const setStartupTarget = useCallback(
    (rawTarget: string) => {
      if (isStartupMutationBlocked()) return;
      const normalized = rawTarget.trim().toLowerCase();
      if (!normalized || normalized === "default") {
        persistSettingsToBackend({ clearStartupTarget: true, startupTarget: null });
        return;
      }
      persistSettingsToBackend({ startupTarget: normalized, clearStartupTarget: false });
    },
    [isStartupMutationBlocked, persistSettingsToBackend]
  );

  const clearStartupTarget = useCallback(() => {
    if (isStartupMutationBlocked()) return;
    persistSettingsToBackend({ clearStartupTarget: true, startupTarget: null });
  }, [isStartupMutationBlocked, persistSettingsToBackend]);

  const startupTarget = preferences?.activeStartupTarget || "default";

  return {
    theme: theme || "system",
    setTheme,
    resolvedTheme: resolvedTheme || "dark",
    accent,
    setAccent,
    availableAccents: ACCENT_PALETTES,
    density,
    setDensity,
    language,
    setLanguage,
    isRtl: direction === "rtl",
    privacyBlur,
    setPrivacyBlur,
    numeralSystem,
    setNumeralSystem,
    timezone,
    setTimezone,
    reducedMotion,
    setReducedMotion,
    toastPosition,
    setToastPosition,
    startupTarget,
    setStartupTarget,
    clearStartupTarget,
    activeContextKey: preferences?.activeContextKey ?? "",
    isStartupTargetEnforcedByRole: Boolean(preferences?.isStartupTargetEnforcedByRole),
    enforcingRoleName: preferences?.enforcingRoleName ?? null,
    startupTargetFallbackActive: Boolean(preferences?.startupTargetFallbackActive),
    startupTargetFallbackReason: preferences?.startupTargetFallbackReason ?? null,
    syncStatus: (isUpdatingPreferences && pendingCount === 0
      ? "saving"
      : syncStatus) as PreferencesSyncStatus,
    pendingCount,
    persistError,
    isLoadingPreferences,
    isPreferencesError,
    preferencesError,
    refetchPreferences,
    preferences,
  };
}
