/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
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
  const safeLang: Language = lang === "ar" ? "ar" : "en";
  const isHttps = typeof window !== "undefined" && window.location?.protocol === "https:";
  const secureAttr = isHttps ? "; Secure" : "";
  document.cookie = `${STORAGE_KEYS.LANGUAGE}=${safeLang}; path=/; max-age=31536000; samesite=lax${secureAttr}`;
}

function reportMissingKey(key: string, language: Language): string {
  if (isDev && !warnedMissingKeys.has(`${language}:${key}`)) {
    warnedMissingKeys.add(`${language}:${key}`);

    console.warn(`[i18n] missing key: "${key}" (language: "${language}")`);
  }
  return key;
}

/**
 * Interpolates `{{param}}` and `{param}` placeholders in a single pass using
 * own properties on `params` to avoid prototype property leakage.
 */
function interpolateParams(template: string, params?: Record<string, any>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}|\{(\w+)\}/g, (match, doubleKey, singleKey) => {
    const paramKey = doubleKey ?? singleKey;
    return Object.prototype.hasOwnProperty.call(params, paramKey) && params[paramKey] !== undefined
      ? String(params[paramKey])
      : match;
  });
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
export function I18nProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  // ─── EAGER REGISTRY — All translations available on first render ────
  const registryRef = useRef<Record<Language, TranslationDict>>({
    en: deepMerge({}, coreEn, allModulesEn),
    ar: deepMerge({}, coreAr, allModulesAr),
  });
  const loadedModulesRef = useRef<Set<string>>(new Set());

  // Initialize synchronously from SSR-matched initialLanguage so the first
  // client render aligns identically with <html lang dir> and <body> font.
  // Client localStorage overrides are reconciled safely post-hydration in useEffect.
  const [language, setLanguage] = useState<Language>(initialLanguage);
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
        if (
          value !== null &&
          typeof value === "object" &&
          Object.prototype.hasOwnProperty.call(value, k)
        ) {
          value = value[k];
        } else {
          reportMissingKey(key, language);
          if (params && typeof params.defaultValue === "string") {
            return interpolateParams(params.defaultValue, params);
          }
          return key;
        }
      }

      if (typeof value === "string") {
        return interpolateParams(value, params);
      }

      // Resolved to a non-string leaf (object/array) — treat as a miss.
      reportMissingKey(key, language);
      if (params && typeof params.defaultValue === "string") {
        return interpolateParams(params.defaultValue, params);
      }
      return key;
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
    let cancelled = false;
    let targetLang: Language = initialLanguage;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language | null;
      const tenantPref = localStorage.getItem(STORAGE_KEYS.PREF_LANG) as Language | null;
      if (saved === "en" || saved === "ar") {
        targetLang = saved;
      } else if (tenantPref === "en" || tenantPref === "ar") {
        targetLang = tenantPref;
      }
    } catch {
      // Ignore storage access failures in restricted contexts
    }

    if (targetLang !== initialLanguage) {
      queueMicrotask(() => {
        if (!cancelled) {
          setLanguage(targetLang);
        }
      });
    }

    const targetDir = targetLang === "ar" ? "rtl" : "ltr";
    if (document.documentElement.getAttribute("dir") !== targetDir) {
      document.documentElement.setAttribute("dir", targetDir);
    }
    if (document.documentElement.getAttribute("lang") !== targetLang) {
      document.documentElement.setAttribute("lang", targetLang);
    }
    const fontClass = targetLang === "ar" ? "font-arabic" : "font-english";
    const staleFontClass = targetLang === "ar" ? "font-english" : "font-arabic";
    if (!document.body.classList.contains(fontClass)) {
      document.body.classList.add(fontClass);
    }
    if (document.body.classList.contains(staleFontClass)) {
      document.body.classList.remove(staleFontClass);
    }
    // Backfills the cookie for sessions that only ever had the localStorage
    // value (e.g. existing users, before this cookie existed), so the very
    // next request already gets the correct SSR <html lang dir>.
    persistLanguageCookie(targetLang);

    return () => {
      cancelled = true;
    };
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
    // Unmounted/no-provider fallback — returns interpolated defaultValue or raw key with coherent "ar"/"rtl" contract
    return {
      language: "ar" as const,
      direction: "rtl" as const,
      setLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        if (params && typeof params.defaultValue === "string") {
          return interpolateParams(params.defaultValue, params);
        }
        return key;
      },
      registerBothLanguages: () => {},
      markModuleLoaded: () => {},
      isModuleLoaded: () => false,
    };
  }
  return context;
}
