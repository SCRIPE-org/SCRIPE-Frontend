// UI-EXCEPTION: compact studio layout
"use client";

import Link from "next/link";
import { Search, Menu, Building, Globe, Check, Moon, Sun } from "lucide-react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { BRAND } from "@core/config/branding";

interface DocsHeaderProps {
  onSearchOpen: () => void;
  onMobileMenuOpen: () => void;
}

/**
 * Presentation UI component rendering the docs header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DocsHeader({ onSearchOpen, onMobileMenuOpen }: DocsHeaderProps) {
  const { t } = useDocsI18n();

  return (
    <header className="docs-header">
      {/* Mobile hamburger */}
      <button className="docs-hamburger" onClick={onMobileMenuOpen} aria-label={t("common.menu")}>
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Logo */}
      <Link href="/docs" className="docs-header-logo">
        <Image src="/app-logo.png" alt={BRAND.namePascal} width={32} height={32} className="docs-header-logo-img" />
        <span>{BRAND.nameUpper}</span>
      </Link>

      {/* Search Trigger — aria-label carries the name even on breakpoints
          where docs-hide-mobile removes the visible "Search" text, so the
          accessible name never collapses down to the bare "⌘K" hint. */}
      <button
        className="docs-search-trigger"
        onClick={onSearchOpen}
        aria-label={t("common.search")}
      >
        <Search size={16} aria-hidden="true" />
        <span className="docs-hide-mobile" aria-hidden="true">
          {t("common.search")}
        </span>
        <span className="docs-search-shortcut" aria-hidden="true">
          {t("common.searchShortcut")}
        </span>
      </button>

      {/* Actions */}
      <div className="docs-header-actions">
        {/* Commercial Docs link */}
        <Link href="/commercial" className="docs-commercial-link">
          <Building size={14} aria-hidden="true" />
          <span className="docs-hide-mobile">{t("common.commercialDocs")}</span>
        </Link>

        <DocsLangSwitcherInline />
        <DocsThemeToggleInline />
      </div>
    </header>
  );
}

// ─── Inline Language Switcher ──────────────────────────────────
import { useState, useRef, useEffect } from "react";

function DocsLangSwitcherInline() {
  const { language, setLanguage, languages, currentLanguageInfo, t } = useDocsI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="docs-lang-dropdown" ref={ref}>
      <button
        className="docs-lang-btn"
        onClick={() => setOpen(!open)}
        aria-label={t("common.language")}
        aria-expanded={open}
      >
        <Globe size={16} aria-hidden="true" />
        <span>{currentLanguageInfo.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="docs-lang-menu" role="menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className="docs-lang-option"
              role="menuitemradio"
              aria-checked={lang.code === language}
              data-active={lang.code === language}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
            >
              <span>{lang.nativeLabel}</span>
              {lang.code === language && <Check size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline Theme Toggle ───────────────────────────────────────
import { useTheme } from "next-themes";
import Image from "next/image";

function DocsThemeToggleInline() {
  const { t } = useDocsI18n();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="docs-theme-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("common.toggleTheme")}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
