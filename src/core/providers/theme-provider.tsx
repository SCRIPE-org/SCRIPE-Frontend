"use client";
import { useEffect, useRef } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { STORAGE_KEYS } from "@core/config/storage-keys";

/**
 * THEME FALLBACK CHAIN
 *
 * Priority (highest → lowest):
 *   1. localStorage.theme  — manual user override (set by header toggle)
 *   2. scr_pref_theme      — tenant admin pref (set by admin in Settings → Prefs)
 *   3. "system"            — platform default
 *
 * Pre-paint hydration note:
 *   RootLayout (<head>) executes the synchronous preseed + .dark/.light script
 *   before body paints and before next-themes's own inline script runs. That
 *   guarantees localStorage.theme is preseeded from scr_pref_theme prior to
 *   first paint while keeping NextThemesProvider's SSR/CSR props identical.
 *
 *   TenantThemePreseed runs once on mount as an idempotent fallback for
 *   environments rendered outside RootLayout (e.g. Storybook or unit tests).
 */
function preseedTheme(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // Clean up legacy key from previous implementation
    localStorage.removeItem("scr_admin_prefs_version");

    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) return null;

    const tenantPrefTheme = localStorage.getItem(STORAGE_KEYS.PREF_THEME);
    if (tenantPrefTheme === "light" || tenantPrefTheme === "dark" || tenantPrefTheme === "system") {
      localStorage.setItem("theme", tenantPrefTheme);
      return tenantPrefTheme;
    }
  } catch {
    // Ignore storage access failures in restricted browsing contexts
  }

  return null;
}

function TenantThemePreseed() {
  const { setTheme } = useTheme();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const seeded = preseedTheme();
    if (seeded) {
      setTheme(seeded);
    }
  }, [setTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <TenantThemePreseed />
      {children}
    </NextThemesProvider>
  );
}
