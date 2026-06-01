"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { STORAGE_KEYS } from "@core/config/storage-keys";

/**
 * THEME FALLBACK CHAIN
 *
 * Priority (highest → lowest):
 *   1. localStorage.theme  — manual user override (set by header toggle)
 *   2. scr_pref_theme   — tenant admin pref (set by admin in Settings → Prefs)
 *   3. "system"            — platform default
 *
 * next-themes keeps theme in React state and ALWAYS re-writes to localStorage on render.
 * This means deleting the "theme" key at runtime is impossible — next-themes restores it.
 * The user MUST refresh the page after clearing localStorage for the fallback to take effect.
 *
 * On refresh:
 *   1. preseedTheme() runs synchronously at module load (BEFORE NextThemesProvider renders)
 *   2. If "theme" key is missing → copies scr_pref_theme into "theme"
 *   3. NextThemesProvider reads "theme" → uses the tenant default
 *
 * Also clean up the legacy scr_admin_prefs_version key from old implementation.
 */
function preseedTheme() {
  if (typeof window === "undefined") return;

  // Clean up legacy key from previous implementation
  localStorage.removeItem("scr_admin_prefs_version");

  const currentTheme = localStorage.getItem("theme");
  if (!currentTheme) {
    const tenantPrefTheme = localStorage.getItem(STORAGE_KEYS.PREF_THEME);
    if (tenantPrefTheme) {
      localStorage.setItem("theme", tenantPrefTheme);
    }
  }
}

// Run synchronously BEFORE React mounts — guaranteed before NextThemesProvider
preseedTheme();

/**
 * Read tenant pref theme for defaultTheme prop.
 * When next-themes has NO stored value, it uses defaultTheme.
 * By setting this to the tenant pref, even if preseed fails,
 * next-themes falls back to the tenant default.
 */
function getTenantDefaultTheme(): string {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem(STORAGE_KEYS.PREF_THEME) || "system";
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={getTenantDefaultTheme()}
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
