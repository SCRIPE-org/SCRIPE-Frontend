"use client";

/**
 * DocsI18nProvider — Isolated i18n context for the documentation portal.
 * Completely separate from the main app's I18nProvider.
 * Supports 7 languages: en, ar, fr, ru, zh, es, de.
 */

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { docEn, DocTranslations } from "../../locales/doc.en";
import { docAr } from "../../locales/doc.ar";
import { docFr } from "../../locales/doc.fr";
import { docRu } from "../../locales/doc.ru";
import { docZh } from "../../locales/doc.zh";
import { docEs } from "../../locales/doc.es";
import { docDe } from "../../locales/doc.de";

// ─── Types ─────────────────────────────────────────────────────
export type DocLanguage = "en" | "ar" | "fr" | "ru" | "zh" | "es" | "de";
export type DocDirection = "ltr" | "rtl";

export interface DocLanguageInfo {
  code: DocLanguage;
  label: string;
  nativeLabel: string;
  direction: DocDirection;
}

export const DOC_LANGUAGES: DocLanguageInfo[] = [
  { code: "en", label: "English", nativeLabel: "English", direction: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", direction: "rtl" },
  { code: "fr", label: "French", nativeLabel: "Français", direction: "ltr" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", direction: "ltr" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", direction: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", direction: "ltr" },
  { code: "de", label: "German", nativeLabel: "Deutsch", direction: "ltr" },
];

// ─── Translations Map ──────────────────────────────────────────
const translations: Record<DocLanguage, DocTranslations> = {
  en: docEn,
  ar: docAr,
  fr: docFr,
  ru: docRu,
  zh: docZh,
  es: docEs,
  de: docDe,
};

// ─── Storage Key ───────────────────────────────────────────────
const DOCS_LANG_KEY = "docs-language";

// ─── Context ───────────────────────────────────────────────────
interface DocsI18nContextType {
  language: DocLanguage;
  direction: DocDirection;
  setLanguage: (lang: DocLanguage) => void;
  t: (key: string, params?: Record<string, any>) => string;
  languages: DocLanguageInfo[];
  currentLanguageInfo: DocLanguageInfo;
}

const DocsI18nContext = createContext<DocsI18nContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────
export function DocsI18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<DocLanguage>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  const currentLanguageInfo = useMemo(
    () => DOC_LANGUAGES.find((l) => l.code === language) ?? DOC_LANGUAGES[0],
    [language]
  );

  const direction = currentLanguageInfo.direction;

  // Translate function with dot-notation and interpolation
  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      const keys = key.split(".");
      let value: any = translations[language];

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }

      if (typeof value === "string") {
        if (params) {
          return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : match;
          });
        }
        return value;
      }

      return key;
    },
    [language]
  );

  const setLanguage = useCallback((lang: DocLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(DOCS_LANG_KEY, lang);
    } catch {
      // localStorage not available
    }
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DOCS_LANG_KEY) as DocLanguage | null;
      if (saved && translations[saved]) {
        setLanguageState(saved);
      }
    } catch {
      // localStorage not available
    }
    setIsHydrated(true);
  }, []);

  const contextValue = useMemo(
    () => ({
      language,
      direction,
      setLanguage,
      t,
      languages: DOC_LANGUAGES,
      currentLanguageInfo,
    }),
    [language, direction, setLanguage, t, currentLanguageInfo]
  );

  // Prevent flash during hydration
  if (!isHydrated) {
    return null;
  }

  return <DocsI18nContext.Provider value={contextValue}>{children}</DocsI18nContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────
export function useDocsI18n(): DocsI18nContextType {
  const context = useContext(DocsI18nContext);
  if (context === undefined) {
    // SSR fallback
    return {
      language: "en",
      direction: "ltr",
      setLanguage: () => {},
      t: (key: string) => key,
      languages: DOC_LANGUAGES,
      currentLanguageInfo: DOC_LANGUAGES[0],
    };
  }
  return context;
}
