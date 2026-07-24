/**
 * Settings Merge Engine
 *
 * Pure function implementing the 4-layer settings merge:
 *   Layer 1: Platform defaults (defaultSettings)
 *   Layer 3: Tenant defaults (from DashboardThemeJson)
 *   Layer 4: Admin overrides (from AdminSettingsJson, filtered by allowed paths)
 *
 * Gap #10: Includes version-based stale cache detection.
 *
 * Wave C: every raw layer now passes through migrateStoredSettings before it
 * merges — culled/unknown fields are dropped and retired variant values map
 * to their survivors, so a stale persisted blob can never crash the merge or
 * leak a dead field into runtime Settings.
 */

import type { Settings } from "./types";
import { defaultSettings, SETTINGS_KEYS } from "./defaults";

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

// ── Legacy Stored-Value Migration ─────────────────────────
//
// Persisted settings blobs (tenant PREF_DASHBOARD_SETTINGS, cached admin
// DASHBOARD_SETTINGS, user-imported exports) can predate the Wave A–C
// collapses. Two normalisations keep them loading cleanly:
//
//   1. DROP unknown fields — anything not in SETTINGS_KEYS is discarded.
//      This covers the Wave C culls (headerStyle, sidebarStyle,
//      sidebarPosition, customPrimaryColor, customSecondaryColor,
//      customLightBgColor, customDarkBgColor, showToastIcons, toastDuration,
//      compactMode) and any future cull for free.
//   2. MAP retired variant values to their survivors — mirrors of the
//      component-level fallbacks published by Wave A (checkbox/radio/switch),
//      Wave B (loadingStyle in loading-spinner.tsx, toastStyle in
//      enhanced-toast.tsx), and the backgroundMode "custom" cull.

/** Per-field nearest-survivor maps for retired variant values. */
const LEGACY_VALUE_MAP: Partial<Record<keyof Settings, Record<string, string>>> = {
  // Wave B2 — 12 loader variants collapsed to spinner/dots/pulse
  loadingStyle: {
    bars: "dots",
    wave: "dots",
    matrix: "dots",
    orbit: "spinner",
    gradient: "spinner",
    helix: "spinner",
    ripple: "pulse",
    quantum: "pulse",
    morphing: "pulse",
  },
  // Wave B1 — 10 toast designs collapsed to classic/minimal/modern
  toastStyle: {
    neon: "modern",
    glassmorphism: "modern",
    aurora: "modern",
    cosmic: "modern",
    gradient: "modern",
    neumorphism: "classic",
    outlined: "minimal",
  },
  // Wave C — the "custom" background mode died with its colour fields
  backgroundMode: { custom: "preset" },
  // Wave C4 — 12 tree skins collapsed to lines/cards (mirrors
  // resolveTreeVariant in tree-view.tsx): the retired skins were card panels
  // with different wallpaper, so they read nearest to "cards"; "minimal" was
  // pixel-identical to "lines" bar a dashed connector.
  treeStyle: {
    minimal: "lines",
    bubble: "cards",
    modern: "cards",
    glass: "cards",
    elegant: "cards",
    professional: "cards",
    gradient: "cards",
    neon: "cards",
    organic: "cards",
    corporate: "cards",
  },
  // Wave C4 — 7 date-picker skins collapsed to default/elegant (mirrors
  // resolveDatePickerVariant in date-picker.tsx)
  datePickerStyle: {
    modern: "default",
    glass: "default",
    outlined: "default",
    filled: "default",
    minimal: "default",
  },
  // Wave C4 — 6 calendar skins collapsed to default/elegant (mirrors
  // resolveCalendarVariant in custom-calendar.tsx)
  calendarStyle: {
    modern: "default",
    glass: "default",
    minimal: "default",
    dark: "default",
  },
};

/**
 * Fields whose value must be one of the listed survivors; anything else maps
 * through LEGACY_VALUE_MAP first and then falls back to the field's default.
 * Wave A collapsed checkbox/radio to default/minimal and switch to
 * default/ios/android — every other retired skin reads nearest to "default".
 */
const SURVIVOR_VALUES: Partial<Record<keyof Settings, readonly string[]>> = {
  loadingStyle: ["spinner", "dots", "pulse"],
  toastStyle: ["classic", "minimal", "modern"],
  checkboxStyle: ["default", "minimal"],
  radioStyle: ["default", "minimal"],
  switchStyle: ["default", "ios", "android"],
  backgroundMode: ["preset", "gradient"],
  treeStyle: ["lines", "cards"],
  datePickerStyle: ["default", "elegant"],
  calendarStyle: ["default", "elegant"],
  // Wave G — the multi-layout system was retired; nexus is the only shell.
  // No per-value LEGACY_VALUE_MAP entry is needed: every retired layout name
  // ("modern", "scripe", "classic", … ~50 in all) falls through to the field
  // default below, which is "nexus", so a user with any stored layoutTemplate
  // resolves to nexus with no error.
  layoutTemplate: ["nexus"],
};

const KNOWN_KEYS = new Set<string>(SETTINGS_KEYS);

/**
 * Normalise one raw persisted settings blob. Pure — safe to unit-test with
 * any JSON shape. Unknown fields are dropped; retired variant values resolve
 * to survivors; everything else passes through untouched.
 */
export function migrateStoredSettings(raw: Record<string, unknown>): Partial<Settings> {
  const migrated: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!KNOWN_KEYS.has(key)) continue; // culled or foreign field — drop

    const survivors = SURVIVOR_VALUES[key as keyof Settings];
    if (survivors && typeof value === "string" && !survivors.includes(value)) {
      const mapped = LEGACY_VALUE_MAP[key as keyof Settings]?.[value];
      migrated[key] = mapped ?? defaultSettings[key as keyof Settings];
      continue;
    }

    migrated[key] = value;
  }

  return migrated as Partial<Settings>;
}

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

  // Layer 3: Tenant defaults (meta keys read from the raw blob, settings
  // fields normalised through the migration)
  if (input.tenantRaw) {
    const { _allowAdminOverride, _allowedAdminPaths, _settingsVersion } = input.tenantRaw;
    tenantDefaults = migrateStoredSettings(input.tenantRaw);
    tenantVersion = (_settingsVersion as number) ?? 0;
    if (_allowAdminOverride !== undefined) allowAdminOverride = _allowAdminOverride as boolean;
    if (_allowedAdminPaths) allowedPaths = _allowedAdminPaths as string[];
  }

  // Layer 4: Admin overrides (filtered by override control + version check)
  let adminOverrides: Partial<Settings> = {};
  let isStale = false;

  if (allowAdminOverride && input.adminRaw) {
    const adminBasedOnVersion = (input.adminRaw._basedOnVersion as number) ?? 0;
    const adminMigrated = migrateStoredSettings(input.adminRaw) as Record<string, unknown>;

    if (tenantVersion > adminBasedOnVersion) {
      // Gap #10: Tenant settings are newer — admin cache is stale
      isStale = true;
    } else if (allowedPaths && allowedPaths.length > 0) {
      // FILTERED: only whitelisted paths can override
      for (const path of allowedPaths) {
        if (path in adminMigrated) {
          (adminOverrides as Record<string, unknown>)[path] = adminMigrated[path];
        }
      }
    } else {
      // No path filter = all overrides allowed
      adminOverrides = adminMigrated as Partial<Settings>;
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
