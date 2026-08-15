"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ComparisonColumn } from "../../../domain/entities/DocSection";

interface ComparisonBlockProps {
  columns: ComparisonColumn[];
}

const variantConfig: Record<ComparisonColumn["variant"], { icon: string; className: string }> = {
  positive: {
    icon: "✅",
    className: "docs-comparison-positive",
  },
  negative: {
    icon: "❌",
    className: "docs-comparison-negative",
  },
  neutral: {
    icon: "•",
    className: "docs-comparison-neutral",
  },
  warning: {
    icon: "⚠️",
    className: "docs-comparison-warning",
  },
  info: {
    icon: "ℹ️",
    className: "docs-comparison-info",
  },
};

/**
 * ComparisonBlock — Side-by-side comparison columns.
 * Supports: positive, negative, neutral, warning, info variants.
 */
export function ComparisonBlock({ columns }: ComparisonBlockProps) {
  const { t } = useDocsI18n();

  return (
    <ul
      className="docs-comparison"
      style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
    >
      {columns.map((col, colIdx) => {
        const config = variantConfig[col.variant];
        return (
          <li key={colIdx} className={`docs-comparison-column ${config.className}`}>
            <div className="docs-comparison-header">
              {/* The heading already states the verdict — the glyph is a
                  restatement, and the list markers repeat it a third time. */}
              <span className="docs-comparison-icon" aria-hidden="true">
                {config.icon}
              </span>
              <h4 className="docs-comparison-title">{t(col.titleKey)}</h4>
            </div>
            <ul className="docs-comparison-list">
              {col.items.map((item, itemIdx) => (
                <li key={itemIdx}>{t(item)}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
