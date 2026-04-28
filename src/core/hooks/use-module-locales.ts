"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Lazily loads module locale files (BOTH en + ar) when a route is accessed.
 * Uses dynamic import() for code splitting — Next.js creates one chunk per module
 * containing both language dictionaries.
 *
 * Rationale for dual-language chunks:
 * - Module locale chunks are < 3 KB each. Loading both languages (~6 KB total)
 *   eliminates network requests during mid-session EN→AR switches.
 * - Language switching becomes instant with zero UI flash.
 *
 * @param loader - Returns a dynamic import, e.g.:
 *   () => import("@modules/system/tenants/locales")
 * @param moduleKey - Unique deduplication key, e.g.: "system.tenants"
 *
 * @example
 * ```tsx
 * // In a view or layout component:
 * useModuleLocales(
 *   () => import("@modules/system/tenants/locales"),
 *   "system.tenants"
 * );
 * ```
 */
export function useModuleLocales(
  loader: () => Promise<{ en: Record<string, any>; ar: Record<string, any> }>,
  moduleKey: string
): { isLoaded: boolean } {
  const { registerBothLanguages, markModuleLoaded, isModuleLoaded } = useI18n();
  const isLoaded = isModuleLoaded(moduleKey);
  // Stable ref to prevent re-creation of loader closure from triggering re-loads.
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    // Primary guard: isModuleLoaded is the source-of-truth (persists across remounts).
    if (isLoaded) return;

    let cancelled = false;

    loaderRef.current()
      .then((mod) => {
        if (cancelled) return;
        // Register BOTH languages in a single O(1) call
        registerBothLanguages(mod.en, mod.ar);
        markModuleLoaded(moduleKey);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`[I18n] Failed to load locales for "${moduleKey}":`, err);
        }
      });

    return () => {
      cancelled = true;
    };

  }, [isLoaded, moduleKey, registerBothLanguages, markModuleLoaded]);

  return { isLoaded };
}
