"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { ar as coreAr } from "@core/locales/ar";
import { en as coreEn } from "@core/locales/en";
import { allModulesEn, allModulesAr } from "@core/locales/module-registry";
import { deepMerge } from "@core/utils/deep-merge";
import { STORAGE_KEYS } from "@core/config/storage-keys";

// ─── TYPES ──────────────────────────────────────────────────
export type Language = "ar" | "en";
type Direction = "rtl" | "ltr";
type TranslationDict = Record<string, unknown>;

interface I18nContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  registerBothLanguages: (en: TranslationDict, ar: TranslationDict) => void;
  markModuleLoaded: (moduleKey: string) => void;
  isModuleLoaded: (moduleKey: string) => boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// ─── DEV-MODE MISSING-KEY SURFACING ─────────────────────────
// In development we make missing translation keys LOUD instead of
// silently returning the bare key (which historically leaked raw keys
// like "signup.discovery.seePlans" to the UI, and turned the common
// `t(key) || "fallback"` pattern into dead code).
//
// In production we stay graceful — return the bare key, never throw —
// so a single missing key can never blank out or crash a screen.
const isDev = process.env.NODE_ENV !== "production";
const warnedMissingKeys = new Set<string>();

// ─── SSR LOCALE COOKIE (R8) ──────────────────────────────────
// Mirrors the resolved language into a cookie under the SAME name as the
// localStorage key above it (STORAGE_KEYS.LANGUAGE / "scr_lang") so the root
// server layout can read it with next/headers `cookies()` and emit the
// correct <html lang dir> before first paint — localStorage does not exist
// yet at request time, so without this the server always guesses and the
// client effect below has to correct it after mount.
function persistLanguageCookie(lang: Language) {
  if (typeof document === "undefined") return;
  document.cookie = `${STORAGE_KEYS.LANGUAGE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

function reportMissingKey(key: string, language: Language): string {
  if (isDev && !warnedMissingKeys.has(`${language}:${key}`)) {
    warnedMissingKeys.add(`${language}:${key}`);

    console.warn(`[i18n] missing key: "${key}" (language: "${language}")`);
  }
  return key;
}

// ─── I18N PROVIDER (v8.0 — Zero-Flash + Deep Merge) ─────
//
// Architecture:
// 1. ALL module translations are eagerly loaded via module-registry.ts
//    using deepMerge — available on the VERY FIRST render, zero flash.
// 2. `useModuleLocales()` hook is still safe to call — it becomes a
//    harmless no-op since translations are already in the registry.
// 3. Both EN + AR dictionaries are synchronous — instant language switching.
// 4. Deep merge (from @core/utils/deep-merge) ensures modules sharing
//    the same top-level namespace (e.g. "entitlements") never clobber
//    each other's keys — both at build-time and lazy-load runtime.
//
export function I18nProvider({ children }: { children: React.ReactNode }) {
  // ─── EAGER REGISTRY — All translations available on first render ────
  const registryRef = useRef<Record<Language, TranslationDict>>({
    en: deepMerge({}, coreEn, allModulesEn),
    ar: deepMerge({}, coreAr, allModulesAr),
  });
  const loadedModulesRef = useRef<Set<string>>(new Set());

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "ar";
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    if (saved === "en" || saved === "ar") return saved;
    const tenantPref = localStorage.getItem(STORAGE_KEYS.PREF_LANG) as Language;
    if (tenantPref === "en" || tenantPref === "ar") return tenantPref;
    return "en";
  });
  const [, forceUpdate] = useState(0);

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  // ─── REGISTRATION (both languages at once) ────────────────
  // Uses shared deepMerge utility to safely merge lazy-loaded module
  // locales without clobbering sibling keys under shared namespaces.
  const registerBothLanguages = useCallback(
    (enTranslations: TranslationDict, arTranslations: TranslationDict) => {
      deepMerge(registryRef.current.en, enTranslations);
      deepMerge(registryRef.current.ar, arTranslations);
      forceUpdate((n) => n + 1);
    },
    []
  );

  // ─── MODULE TRACKING ──────────────────────────────────────
  const markModuleLoaded = useCallback((moduleKey: string) => {
    loadedModulesRef.current.add(moduleKey);
  }, []);

  const isModuleLoaded = useCallback((moduleKey: string) => {
    return loadedModulesRef.current.has(moduleKey);
  }, []);

  // ─── TRANSLATION FUNCTION ─────────────────────────────────
  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      if (!key || typeof key !== "string") return key || "";
      const keys = key.split(".");
      let value: any = registryRef.current[language];

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          return reportMissingKey(key, language); // path not found
        }
      }

      if (typeof value === "string") {
        // Simple interpolation: replace {{param}} and {param} with actual values
        if (params) {
          let interpolated = value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : match;
          });
          interpolated = interpolated.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : match;
          });
          return interpolated;
        }
        return value;
      }

      // Resolved to a non-string leaf (object/array) — treat as a miss.
      return reportMissingKey(key, language);
    },
    [language]
  );

  // ─── LANGUAGE SWITCH ──────────────────────────────────────
  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    persistLanguageCookie(lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);

    // Update body class for font
    if (lang === "ar") {
      document.body.classList.add("font-arabic");
      document.body.classList.remove("font-english");
    } else {
      document.body.classList.add("font-english");
      document.body.classList.remove("font-arabic");
    }
  }, []);

  // ─── HYDRATION: Apply saved language's DOM side-effects on mount ──
  // R8 — this <html> can carry writes from up to three sources: the server
  // (this provider's own cookie, read in the root layout), this effect, and
  // DocsI18nProvider on docs routes. DocsI18nProvider already guards itself;
  // this one now does too — read first, compare, only touch the DOM when this
  // provider's own target actually differs, so a cookie that already matches
  // produces zero writes instead of an unconditional (and possibly redundant)
  // one.
  useEffect(() => {
    const targetDir = language === "ar" ? "rtl" : "ltr";
    if (document.documentElement.getAttribute("dir") !== targetDir) {
      document.documentElement.setAttribute("dir", targetDir);
    }
    if (document.documentElement.getAttribute("lang") !== language) {
      document.documentElement.setAttribute("lang", language);
    }
    const fontClass = language === "ar" ? "font-arabic" : "font-english";
    const staleFontClass = language === "ar" ? "font-english" : "font-arabic";
    if (!document.body.classList.contains(fontClass)) {
      document.body.classList.add(fontClass);
    }
    if (document.body.classList.contains(staleFontClass)) {
      document.body.classList.remove(staleFontClass);
    }
    // Backfills the cookie for sessions that only ever had the localStorage
    // value (e.g. existing users, before this cookie existed), so the very
    // next request already gets the correct SSR <html lang dir>.
    persistLanguageCookie(language);
  }, []);

  // ─── STABLE CONTEXT VALUE ─────────────────────────────────
  const contextValue = useMemo<I18nContextType>(
    () => ({
      language,
      direction,
      setLanguage: handleSetLanguage,
      t,
      registerBothLanguages,
      markModuleLoaded,
      isModuleLoaded,
    }),
    [
      language,
      direction,
      handleSetLanguage,
      t,
      registerBothLanguages,
      markModuleLoaded,
      isModuleLoaded,
    ]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

// ─── CONSUMER HOOK ──────────────────────────────────────────
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    // SSR/prerender fallback — returns raw keys (safe, no state leak)
    return {
      language: "ar" as const,
      direction: "rtl" as const,
      setLanguage: () => {},
      t: (key: string, _params?: Record<string, string | number>) => key,
      registerBothLanguages: () => {},
      markModuleLoaded: () => {},
      isModuleLoaded: () => false,
    };
  }
  return context;
}
