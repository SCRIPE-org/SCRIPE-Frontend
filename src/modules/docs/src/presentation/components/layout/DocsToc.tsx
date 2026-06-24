// UI-EXCEPTION: compact studio layout
"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { HeadingSection } from "../../../domain/entities/DocSection";

interface DocsTocProps {
  headings: HeadingSection[];
  activeId: string | null;
}

/**
 * React presentation component representing the docs toc UI element.
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
        return (
          <button
            key={id}
            className="docs-toc-item"
            data-active={activeId === id}
            data-level={heading.level.toString()}
            onClick={() => handleClick(id)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              width: "100%",
              textAlign: "start",
            }}
          >
            {t(heading.titleKey)}
          </button>
        );
      })}
    </aside>
  );
}
