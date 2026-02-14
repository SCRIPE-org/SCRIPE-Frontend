"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { SearchResult } from "../../../domain/interfaces/IDocsRepository";

interface DocsSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => SearchResult[];
}

export function DocsSearch({ isOpen, onClose, onSearch }: DocsSearchProps) {
  const { t } = useDocsI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search on query change
  useEffect(() => {
    if (query.trim()) {
      const r = onSearch(query);
      setResults(r);
      setSelectedIdx(0);
    } else {
      setResults([]);
    }
  }, [query, onSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIdx]) {
        e.preventDefault();
        router.push(`/docs/${results[selectedIdx].slug}`);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIdx, router, onClose]
  );

  // Global Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // This won't actually open since state is in parent,
          // but the parent handles this
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="docs-search-overlay" onClick={onClose}>
      <div className="docs-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Input */}
        <div className="docs-search-input-wrapper">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="docs-search-input"
            placeholder={t("common.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "hsl(var(--muted-foreground))",
              padding: "0.25rem",
            }}
          >
            <kbd
              style={{
                fontSize: "0.75rem",
                padding: "0.125rem 0.375rem",
                background: "hsl(var(--muted))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "3px",
              }}
            >
              ESC
            </kbd>
          </button>
        </div>

        {/* Results */}
        <div className="docs-search-results">
          {query && results.length === 0 && (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "hsl(var(--muted-foreground))",
                fontSize: "0.875rem",
              }}
            >
              {t("common.searchNoResults")}
            </div>
          )}
          {results.map((result, idx) => (
            <div
              key={result.slug}
              className="docs-search-result"
              data-selected={idx === selectedIdx}
              onClick={() => {
                router.push(`/docs/${result.slug}`);
                onClose();
              }}
              onMouseEnter={() => setSelectedIdx(idx)}
            >
              <span className="docs-search-result-title">{t(result.titleKey)}</span>
              <span className="docs-search-result-category">
                {result.category}
                {result.matchedHeadingKey && ` → ${t(result.matchedHeadingKey)}`}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="docs-search-footer">
          <span>
            <kbd>↑↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> select
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
