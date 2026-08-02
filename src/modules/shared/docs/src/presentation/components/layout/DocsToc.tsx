// UI-EXCEPTION: compact studio layout
"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { HeadingSection } from "../../../domain/entities/DocSection";

interface DocsTocProps {
  headings: HeadingSection[];
  activeId: string | null;
}

/**
 * Presentation UI component rendering the docs toc.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DocsToc({ headings, activeId }: DocsTocProps) {
  const { t } = useDocsI18n();

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="docs-toc">
      <div className="docs-toc-title">{t("common.onThisPage")}</div>
      {headings.map((heading) => {
        const id = heading.id || heading.titleKey.split(".").pop() || "";
        const isActive = activeId === id;
        return (
          <button
            key={id}
            type="button"
            className="docs-toc-item w-full cursor-pointer border-0 bg-transparent text-start"
            data-active={isActive}
            data-level={heading.level.toString()}
            aria-current={isActive ? "location" : undefined}
            onClick={() => handleClick(id)}
          >
            {t(heading.titleKey)}
          </button>
        );
      })}
    </aside>
  );
}
