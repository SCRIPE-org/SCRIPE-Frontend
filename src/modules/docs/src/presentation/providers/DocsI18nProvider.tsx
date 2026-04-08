"use client";

/**
 * DocsI18nProvider — Isolated i18n context for the documentation portal.
 *
 * Architecture (v2 — Zero-Flash Eager Loading):
 * 1. ALL docs translations are eagerly loaded via docs-registry.ts.
 *    They're merged into the registry so translations are available
 *    on the VERY FIRST render — zero flash, zero useEffect race conditions.
 * 2. loadSection() is a harmless no-op kept for backward compatibility.
 * 3. All 7 language dictionaries are available synchronously at import time,
 *    enabling instant language switching with zero network requests.
 *
 * Supports 7 languages: en, ar, fr, ru, zh, es, de
 */

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  allDocsEn, allDocsAr, allDocsFr,
  allDocsRu, allDocsZh, allDocsEs, allDocsDe,
} from "../../locales/docs-registry";

// ─── Types ─────────────────────────────────────────────────────
export type DocLanguage = "en" | "ar" | "fr" | "ru" | "zh" | "es" | "de";
export type DocDirection = "ltr" | "rtl";
export type DocScope = "technical" | "commercial";

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

// ─── EAGER REGISTRY — All translations available at import time ──
const globalRegistry: Record<DocLanguage, Record<string, any>> = {
  en: allDocsEn,
  ar: allDocsAr,
  fr: allDocsFr,
  ru: allDocsRu,
  zh: allDocsZh,
  es: allDocsEs,
  de: allDocsDe,
};

const DOCS_LANG_KEY = "docs-language";

// ─── Context ───────────────────────────────────────────────────
interface DocsI18nContextType {
  language: DocLanguage;
  direction: DocDirection;
  setLanguage: (lang: DocLanguage) => void;
  t: (key: string, params?: Record<string, any>) => string;
  languages: DocLanguageInfo[];
  currentLanguageInfo: DocLanguageInfo;
  /** @deprecated No longer needed — all translations are eagerly loaded. */
  loadSection: (slug: string) => void;
}

const DocsI18nContext = createContext<DocsI18nContextType | undefined>(
  undefined,
);

// ─── Provider ──────────────────────────────────────────────────
export function DocsI18nProvider({
  children,
  scope = "technical",
}: {
  children: React.ReactNode;
  scope?: DocScope;
}) {
  const [language, setLanguageState] = useState<DocLanguage>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  const currentLanguageInfo = useMemo(
    () => DOC_LANGUAGES.find((l) => l.code === language) ?? DOC_LANGUAGES[0],
    [language],
  );

  const direction = currentLanguageInfo.direction;

  // ── loadSection is now a no-op (backward compat) ─────────────
  const loadSection = useCallback((_slug: string) => {}, []);

  // ── Translation function ─────────────────────────────────────
  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      const keys = key.split(".");

      // Lookup chain: current language → English fallback
      const sources: Record<string, any>[] = [];
      if (language !== "en") sources.push(globalRegistry[language]);
      sources.push(globalRegistry.en);

      for (const source of sources) {
        let value: any = source;
        let found = true;

        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            found = false;
            break;
          }
        }

        if (found && typeof value === "string") {
          if (params) {
            return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) =>
              params[paramKey] !== undefined ? String(params[paramKey]) : match,
            );
          }
          return value;
        }
      }

      return key;
    },
    [language],
  );

  const setLanguage = useCallback((lang: DocLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(DOCS_LANG_KEY, lang);
    } catch {
      /* noop */
    }
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DOCS_LANG_KEY) as DocLanguage | null;
      if (saved && DOC_LANGUAGES.some((l) => l.code === saved)) {
        setLanguageState(saved);
      }
    } catch {
      /* noop */
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
      loadSection,
    }),
    [language, direction, setLanguage, t, currentLanguageInfo, loadSection],
  );

  if (!isHydrated) return null;

  return (
    <DocsI18nContext.Provider value={contextValue}>
      {children}
    </DocsI18nContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────
export function useDocsI18n(): DocsI18nContextType {
  const context = useContext(DocsI18nContext);
  if (context === undefined) {
    return {
      language: "en",
      direction: "ltr",
      setLanguage: () => {},
      t: (key: string) => key,
      languages: DOC_LANGUAGES,
      currentLanguageInfo: DOC_LANGUAGES[0],
      loadSection: () => {},
    };
  }
  return context;
}
