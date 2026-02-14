"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface DocsHeaderProps {
  onSearchOpen: () => void;
  onMobileMenuOpen: () => void;
}

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

export function DocsHeader({ onSearchOpen, onMobileMenuOpen }: DocsHeaderProps) {
  const { t } = useDocsI18n();

  return (
    <header className="docs-header">
      {/* Mobile hamburger */}
      <button className="docs-hamburger" onClick={onMobileMenuOpen} aria-label={t("common.menu")}>
        <MenuIcon />
      </button>

      {/* Logo */}
      <a href="/docs" className="docs-header-logo">
        <img src="/app-logo.png" alt="Nexora" className="docs-header-logo-img" />
        <span>NEXORA</span>
      </a>

      {/* Search Trigger */}
      <button className="docs-search-trigger" onClick={onSearchOpen}>
        <SearchIcon />
        <span>{t("common.search")}</span>
        <span className="docs-search-shortcut">{t("common.searchShortcut")}</span>
      </button>

      {/* Actions */}
      <div className="docs-header-actions">
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
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span>{currentLanguageInfo.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="docs-lang-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className="docs-lang-option"
              data-active={lang.code === language}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
            >
              <span>{lang.nativeLabel}</span>
              {lang.code === language && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline Theme Toggle ───────────────────────────────────────
import { useTheme } from "next-themes";

function DocsThemeToggleInline() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="docs-theme-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
