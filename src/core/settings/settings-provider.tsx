/**
 * Settings Provider — Lean Orchestrator
 *
 * Wires together the merge engine, persistence, DOM applicator, and context.
 * ~150 lines vs the original 1,252-line monolith.
 *
 * Architecture:
 *   types.ts       → Pure type definitions
 *   defaults.ts    → Default values
 *   merge-engine.ts → 4-layer merge logic (pure function)
 *   persistence.ts  → localStorage read/write
 *   dom-applicator.ts → Data attributes + CSS vars
 *   context.ts      → Context type, hook, fallback
 *   THIS FILE       → React provider component (orchestrator only)
 */

"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appLogger } from "@core/common/logger";
import { useAppStore } from "@core/store/useAppStore";

import type { Settings } from "./types";
import { defaultSettings } from "./defaults";
import type { OverrideControl } from "./merge-engine";
import { mergeSettings, DEFAULT_OVERRIDE_CONTROL } from "./merge-engine";
import {
  readTenantDefaults,
  readAdminOverrides,
  writeAdminOverrides,
  clearStaleAdminOverrides,
} from "./persistence";
import { applySettingsToDOM } from "./dom-applicator";
import type { SettingsContextType } from "./context";
import { SettingsContext, createCompatSetters } from "./context";

/**
 * Settings Provider Component
 *
 * Provides centralized settings management with:
 * - 4-layer merge (defaults → tenant → admin)
 * - localStorage persistence with version stamps
 * - DOM attribute application
 * - Override control (admin lock system)
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Compute initial settings SYNCHRONOUSLY to avoid a hydration flash.
  // mergeSettings reads localStorage (synchronous), so we can do this in the
  // useState initializer and skip the blocking isHydrated=false render entirely.
  // We compute once and extract both settings + overrideControl in one pass.
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return defaultSettings;
    try {
      const result = mergeSettings({
        tenantRaw: readTenantDefaults(),
        adminRaw: readAdminOverrides(),
      });
      if (result.isStale) clearStaleAdminOverrides();
      return result.settings;
    } catch {
      return defaultSettings;
    }
  });
  // Start as already hydrated — initial settings are computed synchronously above.
  // This eliminates the 1-frame (or 1-second on first login) pulse animation shimmer.
  const [isHydrated, setIsHydrated] = useState(true);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  // M11: Override control state — initialized synchronously (matches settings init above)
  const [overrideControl, setOverrideControl] = useState<OverrideControl>(() => {
    if (typeof window === "undefined") return DEFAULT_OVERRIDE_CONTROL;
    try {
      const result = mergeSettings({
        tenantRaw: readTenantDefaults(),
        adminRaw: readAdminOverrides(),
      });
      return result.overrideControl;
    } catch {
      return DEFAULT_OVERRIDE_CONTROL;
    }
  });

  // Gap #2/#7: Track whether we're inside a merge operation.
  // When true, auto-save is suppressed to prevent feedback loops.
  const isMergingRef = useRef(false);

  // M11: Track which field was last changed (for sync hook's 409 field-level merge)
  const [lastChangedField, setLastChangedField] = useState<string | null>(null);

  // ── Merge function ──────────────────────────────────────

  const mergeAndApplySettings = useCallback(() => {
    try {
      const result = mergeSettings({
        tenantRaw: readTenantDefaults(),
        adminRaw: readAdminOverrides(),
      });

      // If admin cache was stale, clear it
      if (result.isStale) {
        clearStaleAdminOverrides();
      }

      // Update override control state
      setOverrideControl(result.overrideControl);

      // Wrap in isMerging flag so auto-save effect ignores this state change
      isMergingRef.current = true;
      setSettings(result.settings);
    } catch (error) {
      appLogger.error("Failed to load settings:", error);
    } finally {
      setIsHydrated(true);
      // Clear merging flag on next microtask (after React batches the state update)
      queueMicrotask(() => {
        isMergingRef.current = false;
      });
    }
  }, []);

  // ── Initial merge on mount ──────────────────────────────

  useEffect(() => {
    queueMicrotask(() => {
      mergeAndApplySettings();
    });
  }, [mergeAndApplySettings]);

  // ── Re-merge on external events ─────────────────────────

  useEffect(() => {
    const handler = () => mergeAndApplySettings();
    window.addEventListener("admin-settings-loaded", handler);
    window.addEventListener("tenant-branding-loaded", handler);
    return () => {
      window.removeEventListener("admin-settings-loaded", handler);
      window.removeEventListener("tenant-branding-loaded", handler);
    };
  }, [mergeAndApplySettings]);

  // ── Logout reset (Gap #7) ──────────────────────────────

  useEffect(() => {
    if (!isAuthenticated && isHydrated) {
      queueMicrotask(() => {
        isMergingRef.current = true;
        setSettings(defaultSettings);
        queueMicrotask(() => {
          isMergingRef.current = false;
        });
      });
    }
  }, [isAuthenticated, isHydrated]);

  // ── Auto-save to localStorage (Gap #2/#7) ──────────────

  const autoSave = settings.autoSave;
  useEffect(() => {
    if (isHydrated && isAuthenticated && autoSave && !isMergingRef.current) {
      writeAdminOverrides(settings);
      // M11: Include which specific field changed — used by useAdminSettingsSync for 409 merge
      window.dispatchEvent(
        new CustomEvent("settings-changed", {
          detail: { changedField: lastChangedField },
        })
      );
    }
  }, [settings, isHydrated, isAuthenticated, autoSave, lastChangedField]);

  // ── Apply to DOM ────────────────────────────────────────

  useEffect(() => {
    if (isHydrated) applySettingsToDOM(settings);
  }, [settings, isHydrated]);

  // ── Generic update function (Gap #14: stable via useCallback) ──

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLastChangedField(key);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Utilities (Gap #9: respect locks) ───────────────────

  const resetSettings = useCallback(() => {
    setSettings((prev) => {
      const reset = { ...defaultSettings };
      const { allowAdminOverride, allowedPaths } = overrideControl;
      if (!allowAdminOverride) return prev; // all locked
      if (allowedPaths && allowedPaths.length > 0) {
        const result = { ...prev };
        for (const path of allowedPaths) {
          if (path in reset) {
            (result as Record<string, unknown>)[path] = (reset as Record<string, unknown>)[path];
          }
        }
        return result;
      }
      return reset;
    });
  }, [overrideControl]);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback(
    (settingsString: string): boolean => {
      try {
        const parsed = JSON.parse(settingsString);
        const { allowAdminOverride, allowedPaths } = overrideControl;
        if (!allowAdminOverride) return false;
        let filtered = parsed;
        if (allowedPaths && allowedPaths.length > 0) {
          filtered = Object.fromEntries(
            Object.entries(parsed).filter(([k]) => allowedPaths.includes(k))
          );
        }
        setSettings((prev) => ({ ...prev, ...defaultSettings, ...filtered }));
        return true;
      } catch {
        return false;
      }
    },
    [overrideControl]
  );

  // ── Context value (memoized) ────────────────────────────

  const compatSetters = useMemo(
    () => createCompatSetters((k, v) => updateSetting(k, v)),
    [updateSetting]
  );

  const contextValue = useMemo<SettingsContextType>(
    () => ({
      ...settings,
      updateSetting,
      ...compatSetters,
      resetSettings,
      exportSettings,
      importSettings,
      overrideControl,
    }),
    [
      settings,
      overrideControl,
      resetSettings,
      exportSettings,
      importSettings,
      updateSetting,
      compatSetters,
    ]
  );

  // isHydrated is always true (synchronous init above) — block kept as safety guard
  // only for SSR contexts where window is undefined (server renders defaultSettings).
  if (!isHydrated) {
    return <div className="min-h-screen bg-nx-ground" suppressHydrationWarning />;
  }

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}
