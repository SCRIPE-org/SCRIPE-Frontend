/**
 * Settings Merge Engine
 *
 * Pure function implementing the 4-layer settings merge:
 *   Layer 1: Platform defaults (defaultSettings)
 *   Layer 3: Tenant defaults (from DashboardThemeJson)
 *   Layer 4: Admin overrides (from AdminSettingsJson, filtered by allowed paths)
 *
 * Gap #10: Includes version-based stale cache detection.
 */

import type { Settings } from "./types";
import { defaultSettings } from "./defaults";

// ── Types ─────────────────────────────────────────────────

export interface OverrideControl {
  allowAdminOverride: boolean;
  allowedPaths: string[] | null;
  /** Check if a specific setting key is locked (admin cannot override) */
  isSettingLocked: (key: string) => boolean;
}

export interface MergeInput {
  /** Parsed tenant defaults from PREF_DASHBOARD_SETTINGS */
  tenantRaw: Record<string, unknown> | null;
  /** Parsed admin overrides from DASHBOARD_SETTINGS */
  adminRaw: Record<string, unknown> | null;
}

export interface MergeResult {
  settings: Settings;
  overrideControl: OverrideControl;
  /** True if admin cache was discarded due to version mismatch */
  isStale: boolean;
}

export const DEFAULT_OVERRIDE_CONTROL: OverrideControl = {
  allowAdminOverride: true,
  allowedPaths: null,
  isSettingLocked: () => false,
};

// ── Merge Function ────────────────────────────────────────

/**
 * Merge settings from all layers. Returns the final settings + override control state.
 * This is a pure function — no side effects, no localStorage, no DOM.
 */
export function mergeSettings(input: MergeInput): MergeResult {
  let tenantDefaults: Partial<Settings> = {};
  let allowAdminOverride = true;
  let allowedPaths: string[] | null = null;
  let tenantVersion = 0;

  // Layer 3: Tenant defaults
  if (input.tenantRaw) {
    const {
      theme, language, sidebarCollapsed, _schemaVersion,
      _allowAdminOverride, _allowedAdminPaths, _settingsVersion,
      ...dashboardSettings
    } = input.tenantRaw;
    tenantDefaults = dashboardSettings as Partial<Settings>;
    tenantVersion = ((_settingsVersion as number) ?? 0);
    if (_allowAdminOverride !== undefined) allowAdminOverride = _allowAdminOverride as boolean;
    if (_allowedAdminPaths) allowedPaths = _allowedAdminPaths as string[];
  }

  // Layer 4: Admin overrides (filtered by override control + version check)
  let adminOverrides: Partial<Settings> = {};
  let isStale = false;

  if (allowAdminOverride && input.adminRaw) {
    const adminBasedOnVersion = (input.adminRaw._basedOnVersion as number) ?? 0;

    if (tenantVersion > adminBasedOnVersion) {
      // Gap #10: Tenant settings are newer — admin cache is stale
      isStale = true;
    } else if (allowedPaths && allowedPaths.length > 0) {
      // FILTERED: only whitelisted paths can override
      for (const path of allowedPaths) {
        if (path in input.adminRaw) {
          (adminOverrides as Record<string, unknown>)[path] = input.adminRaw[path];
        }
      }
    } else {
      // No path filter = all overrides allowed
      adminOverrides = input.adminRaw as Partial<Settings>;
    }
  }

  // Build override control with isSettingLocked helper
  const overrideControl: OverrideControl = {
    allowAdminOverride,
    allowedPaths,
    isSettingLocked: (key: string) => {
      if (!allowAdminOverride) return true;
      if (allowedPaths && allowedPaths.length > 0) {
        return !allowedPaths.includes(key);
      }
      return false;
    },
  };

  // Final merge: Layer 1 → Layer 3 → Layer 4
  const settings: Settings = { ...defaultSettings, ...tenantDefaults, ...adminOverrides };

  return { settings, overrideControl, isStale };
}
