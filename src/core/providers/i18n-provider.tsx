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
import { useSettings } from "@core/providers/settings-provider";
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
  const { setSidebarPosition } = useSettings();

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
          return key; // Return the key if path not found
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

      return key;
    },
    [language]
  );

  // ─── LANGUAGE SWITCH ──────────────────────────────────────
  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
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
  useEffect(() => {
    document.documentElement.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", language);
    if (language === "ar") {
      document.body.classList.add("font-arabic");
      document.body.classList.remove("font-english");
    } else {
      document.body.classList.add("font-english");
      document.body.classList.remove("font-arabic");
    }
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
