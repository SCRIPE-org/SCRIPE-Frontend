"use client";

/**
 * DocsI18nProvider — Isolated i18n context for the documentation portal.
 *
 * Architecture:
 * - Common chrome (nav, search, UI) is eagerly loaded (~30KB)
 * - Page sections are lazy-loaded via dynamic import() based on URL slug
 * - Adding a new section? Just add ONE entry to SLUG_MAP. Zero new imports.
 * - Translation state is MODULE-SCOPED (persists across React remounts)
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

// ─── Slug → Section Resolution ─────────────────────────────────
// Maps the first URL slug segment to the section file name.
// To add a new section: just add ONE entry here. That's it.
const TECH_SLUG_MAP: Record<string, string> = {
  "get-started": "get-started",
  overview: "get-started",
  prerequisites: "get-started",
  "quick-start": "get-started",
  "project-structure": "get-started",
  architecture: "architecture",
  features: "features",
  modules: "modules",
  security: "security",
  frontend: "frontend",
  infrastructure: "infrastructure",
  tutorials: "tutorials",
  "api-reference": "api-reference",
  api: "api-reference",
};

const COMM_SLUG_MAP: Record<string, string> = {
  "why-nexora": "why-nexora",
  platform: "platform",
  enterprise: "enterprise",
  security: "security",
  technical: "technical",
  developer: "developer",
  integration: "integration",
  pricing: "pricing",
  modules: "modules",
  entitlements: "entitlements",
  customization: "customization",
};

// ─── Dynamic Import Factory ────────────────────────────────────
function loadPageLocale(
  scope: DocScope,
  section: string,
  lang: DocLanguage,
): Promise<Record<string, any>> {
  if (scope === "commercial") {
    return import(`../../locales/comm-pages/${section}.${lang}`);
  }
  return import(`../../locales/pages/${section}.${lang}`);
}

// ─── Common Chrome Loader ──────────────────────────────────────
async function loadCommonLocales(): Promise<
  Record<DocLanguage, Record<string, any>>
> {
  const [en, ar, fr, ru, zh, es, de] = await Promise.all([
    import("../../locales/pages/common.en").then((m) => m.en),
    import("../../locales/pages/common.ar").then((m) => m.ar),
    import("../../locales/pages/common.fr").then((m) => m.fr),
    import("../../locales/pages/common.ru").then((m) => m.ru),
    import("../../locales/pages/common.zh").then((m) => m.zh),
    import("../../locales/pages/common.es").then((m) => m.es),
    import("../../locales/pages/common.de").then((m) => m.de),
  ]);
  return { en, ar, fr, ru, zh, es, de };
}

// ─── Helpers ───────────────────────────────────────────────────
function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
): Record<string, any> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      result[key] &&
      typeof result[key] === "object" &&
      typeof source[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const DOCS_LANG_KEY = "docs-language";

// ─── MODULE-SCOPED STATE ───────────────────────────────────────
// Translation state lives OUTSIDE React so it persists across component
// remounts (e.g., Next.js route changes). This prevents the "load then
// disappear" bug where translations were lost when the provider remounted.
const globalRegistry: Record<DocLanguage, Record<string, any>> = {
  en: {},
  ar: {},
  fr: {},
  ru: {},
  zh: {},
  es: {},
  de: {},
};
const globalLoadedSections = new Set<string>();
let globalCommonLoaded = false;
let globalCommonLoading: Promise<void> | null = null;

// ─── Context ───────────────────────────────────────────────────
interface DocsI18nContextType {
  language: DocLanguage;
  direction: DocDirection;
  setLanguage: (lang: DocLanguage) => void;
  t: (key: string, params?: Record<string, any>) => string;
  languages: DocLanguageInfo[];
  currentLanguageInfo: DocLanguageInfo;
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
  const [, forceUpdate] = useState(0);

  // Load common chrome once (globally cached)
  useEffect(() => {
    if (globalCommonLoaded) return;

    // Prevent double-loading if effect fires twice (StrictMode)
    if (!globalCommonLoading) {
      globalCommonLoading = loadCommonLocales().then((common) => {
        for (const lang of DOC_LANGUAGES) {
          globalRegistry[lang.code] = deepMerge(
            globalRegistry[lang.code],
            common[lang.code] || {},
          );
        }
        globalCommonLoaded = true;
        globalCommonLoading = null;
      });
    }

    globalCommonLoading?.then(() => {
      forceUpdate((n) => n + 1);
    });
  }, []);

  const currentLanguageInfo = useMemo(
    () => DOC_LANGUAGES.find((l) => l.code === language) ?? DOC_LANGUAGES[0],
    [language],
  );

  const direction = currentLanguageInfo.direction;

  // ── Load a section for ALL languages in parallel ──────────────
  const loadSection = useCallback(
    async (slug: string) => {
      const firstSegment = slug.split("/")[0];
      const slugMap =
        scope === "commercial" ? COMM_SLUG_MAP : TECH_SLUG_MAP;
      const sectionName = slugMap[firstSegment] || firstSegment;

      const loadKey = `${scope}:${sectionName}`;
      if (globalLoadedSections.has(loadKey)) {
        // Already loaded — just trigger a re-render to pick up cached data
        forceUpdate((n) => n + 1);
        return;
      }
      globalLoadedSections.add(loadKey);

      // Wait for common chrome to finish loading first
      if (globalCommonLoading) {
        await globalCommonLoading;
      }

      await Promise.all(
        DOC_LANGUAGES.map(async (langInfo) => {
          try {
            const mod = await loadPageLocale(scope, sectionName, langInfo.code);
            const data =
              mod[langInfo.code] || mod.default || Object.values(mod)[0] || {};
            globalRegistry[langInfo.code] = deepMerge(
              globalRegistry[langInfo.code],
              data,
            );
          } catch {
            // Section not available for this language — skip silently
          }
        }),
      );

      forceUpdate((n) => n + 1);
    },
    [scope],
  );

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
