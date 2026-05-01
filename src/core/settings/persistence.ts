/**
 * Settings Persistence
 *
 * Read/write helpers for localStorage with version stamps.
 * Centralizes all localStorage key access for settings.
 */

import type { Settings } from "./types";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { appLogger } from "@core/common/logger";

/**
 * Read tenant defaults from localStorage (written by TenantBrandingProvider).
 * Returns null if not present or invalid.
 */
export function readTenantDefaults(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Read admin overrides from localStorage (cached from server).
 * Returns null if not present or invalid.
 */
export function readAdminOverrides(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Write admin overrides to localStorage with version stamp.
 * Gap #10: Stamps _basedOnVersion from current tenant version.
 */
export function writeAdminOverrides(settings: Settings): void {
  try {
    let basedOnVersion = 0;
    try {
      const prefRaw = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
      if (prefRaw) basedOnVersion = JSON.parse(prefRaw)?._settingsVersion ?? 0;
    } catch {
      /* ignore */
    }

    const toSave = { ...settings, _basedOnVersion: basedOnVersion };
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(toSave));
  } catch (error) {
    appLogger.error("Failed to save settings:", error);
  }
}

/**
 * Remove stale admin overrides from localStorage (called when version mismatch detected).
 */
export function clearStaleAdminOverrides(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
    appLogger.info("[SettingsPersistence] Cleared stale admin overrides");
  } catch {
    /* ignore */
  }
}
