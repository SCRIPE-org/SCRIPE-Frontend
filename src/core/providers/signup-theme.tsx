"use client";

import { useTheme } from "next-themes";
import { DARK_THEME, LIGHT_THEME, type ThemeTokens } from "@core/ui/tokens/brand";

/**
 * Signup-scoped theme hook.
 *
 * Reads from the global next-themes context (already provided by AppProvider →
 * theme-provider.tsx) and returns typed Aurora Refined token sets for the signup
 * wizard. No second context is created — this is a zero-overhead adapter.
 *
 * NOTE: This is intentionally separate from theme-provider.tsx.
 *   theme-provider.tsx  — wraps next-themes; used in AppProvider (global)
 *   signup-theme.tsx    — hook adapter returning typed Aurora tokens; used in signup wizard only
 */
export function useSignupTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const tokens: ThemeTokens = isDark ? DARK_THEME : LIGHT_THEME;

  return {
    theme: isDark ? ("dark" as const) : ("light" as const),
    tokens,
    toggleTheme: () => setTheme(isDark ? "light" : "dark"),
  };
}

/**
 * No-op wrapper — exists so SignupWizard can use the provider-boundary pattern
 * without an extra React context. The real theme is provided by AppProvider.
 */
export function SignupThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
