"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSettings } from "@core/providers/settings-provider";
import { ar } from "@core/locales/ar";
import { en } from "@core/locales/en";
import { STORAGE_KEYS } from "@core/config/storage-keys";

export type Language = "ar" | "en";
type Direction = "rtl" | "ltr";

interface I18nContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  ar,
  en,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar"); // Default to Arabic
  const [isHydrated, setIsHydrated] = useState(false);
  const { setSidebarPosition } = useSettings();
  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  // ── Stable translation function — only changes when language changes ──
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    const keys = key.split(".");
    let value: any = translations[language];

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
          return params[paramKey] !== undefined ? String(params[paramKey]) : match;
        });
      }
      return value;
    }

    return key;
  }, [language]);

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

  useEffect(() => {
    setIsHydrated(true);
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      handleSetLanguage(savedLanguage);
    } else {
      // Fallback: check tenant admin pref (set by admin in customization settings)
      const tenantPrefLang = localStorage.getItem(STORAGE_KEYS.PREF_LANG) as Language;
      if (tenantPrefLang && (tenantPrefLang === "en" || tenantPrefLang === "ar")) {
        handleSetLanguage(tenantPrefLang);
      } else {
        // Platform default (English — tenant can override via DashboardThemeJson)
        handleSetLanguage("en");
      }
    }
  }, [handleSetLanguage]);

  // ── Stable context value — prevents all consumers from re-rendering on every parent render ──
  const contextValue = useMemo<I18nContextType>(() => ({
    language,
    direction,
    setLanguage: handleSetLanguage,
    t,
  }), [language, direction, handleSetLanguage, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    // During SSR/prerendering or before hydration, provide fallback values
    if (typeof window === "undefined") {
      return {
        language: "ar" as const,
        direction: "rtl" as const,
        setLanguage: () => {},
        t: (key: string, params?: Record<string, any>) => key, // Return key as fallback during SSR
      };
    }
    // Client-side fallback for hydration issues
    return {
      language: "ar" as const,
      direction: "rtl" as const,
      setLanguage: () => {},
      t: (key: string, params?: Record<string, any>) => key,
    };
  }
  return context;
}
