"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { DARK_THEME, LIGHT_THEME, type ThemeTokens } from "@core/ui/tokens/brand";

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function subscribeHtmlThemeClass(callback: () => void) {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
    return () => {};
  }
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getHtmlThemeDarkSnapshot(): boolean | null {
  if (typeof document === "undefined") return null;
  const cls = document.documentElement.classList;
  if (cls.contains("dark")) return true;
  if (cls.contains("light")) return false;
  return null;
}

function getServerHtmlThemeSnapshot(): boolean | null {
  return null;
}

/**
 * Signup-scoped theme hook.
 *
 * Reads from the global next-themes context (already provided by AppProvider →
 * theme-provider.tsx) and returns typed Relay vNext token sets for the signup
 * wizard. Syncs with `<html class="dark|light">` and delays resolved-theme
 * branching until after mount via useSyncExternalStore so SSR HTML and initial
 * client hydration always match cleanly without a mismatch warning.
 */
export function useSignupTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);
  const htmlIsDark = useSyncExternalStore(
    subscribeHtmlThemeClass,
    getHtmlThemeDarkSnapshot,
    getServerHtmlThemeSnapshot
  );

  const isDark = mounted ? (htmlIsDark ?? (resolvedTheme !== "light")) : true;
  const tokens: ThemeTokens = isDark ? DARK_THEME : LIGHT_THEME;

  return {
    theme: isDark ? ("dark" as const) : ("light" as const),
    tokens,
    mounted,
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
