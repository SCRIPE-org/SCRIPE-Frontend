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
import { STORAGE_KEYS } from "@core/config/storage-keys";

// ─── TYPES ──────────────────────────────────────────────────
export type Language = "ar" | "en";
type Direction = "rtl" | "ltr";
type TranslationDict = Record<string, any>;

interface I18nContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  registerBothLanguages: (en: TranslationDict, ar: TranslationDict) => void;
  markModuleLoaded: (moduleKey: string) => void;
  isModuleLoaded: (moduleKey: string) => boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// ─── I18N PROVIDER (v7.0 — Zero-Flash Eager Loading) ────
//
// Architecture:
// 1. ALL module translations are eagerly loaded via module-registry.ts.
//    They're merged into the initial registry so translations are available
//    on the VERY FIRST render — zero flash, zero useEffect race conditions.
// 2. `useModuleLocales()` hook is still safe to call — it becomes a harmless
//    no-op since translations are already in the registry.
// 3. Both EN + AR dictionaries are available synchronously at import time,
//    enabling instant language switching with zero network requests.
//
export function I18nProvider({ children }: { children: React.ReactNode }) {
  // ─── EAGER REGISTRY — All translations available on first render ────
  const registryRef = useRef<Record<Language, TranslationDict>>({
    en: { ...coreEn, ...allModulesEn },
    ar: { ...coreAr, ...allModulesAr },
  });
  const loadedModulesRef = useRef<Set<string>>(new Set());

  const [language, setLanguage] = useState<Language>("ar");
  const [, forceUpdate] = useState(0);
  const { setSidebarPosition } = useSettings();

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  // ─── STRICT O(1) REGISTRATION (both languages at once) ────
  // Enforces ZERO-EXCEPTION non-overlapping top-level namespaces.
  // No recursive merge. No 2-level merge. Pure Object.assign.
  const registerBothLanguages = useCallback(
    (enTranslations: TranslationDict, arTranslations: TranslationDict) => {
      if (process.env.NODE_ENV === "development") {
        // DEV ONLY: Detect namespace collisions
        for (const key of Object.keys(enTranslations)) {
          if (key in registryRef.current.en) {
            // Only warn if this is a module-registered key (not core)
            // Core keys are already in the registry at init time
            console.warn(
              `[I18n] Namespace collision: "${key}" is already registered. ` +
              `Module locales MUST use unique top-level keys.`
            );
          }
        }
      }
      // O(1) shallow merge — strict, no depth exceptions
      Object.assign(registryRef.current.en, enTranslations);
      Object.assign(registryRef.current.ar, arTranslations);
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
        // Simple interpolation: replace {{param}} with actual values
        if (params) {
          return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined
              ? String(params[paramKey])
              : match;
          });
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

  // ─── HYDRATION: Read saved language ───────────────────────
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      handleSetLanguage(savedLanguage);
    } else {
      // Fallback: check tenant admin pref (set by admin in customization settings)
      const tenantPrefLang = localStorage.getItem(STORAGE_KEYS.PREF_LANG) as Language;
      if (tenantPrefLang && (tenantPrefLang === "en" || tenantPrefLang === "ar")) {
        handleSetLanguage(tenantPrefLang);
      } else {
        // Platform default
        handleSetLanguage("en");
      }
    }
  }, [handleSetLanguage]);

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
    [language, direction, handleSetLanguage, t, registerBothLanguages, markModuleLoaded, isModuleLoaded]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
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
      t: (key: string, _params?: Record<string, any>) => key,
      registerBothLanguages: () => {},
      markModuleLoaded: () => {},
      isModuleLoaded: () => false,
    };
  }
  return context;
}
