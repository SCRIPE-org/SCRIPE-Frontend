"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ComparisonColumn } from "../../../domain/entities/DocSection";

interface ComparisonBlockProps {
      columns: ComparisonColumn[];
}

const variantConfig = {
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
};

/**
 * ComparisonBlock — Side-by-side comparison columns.
 * Used to show ✅ Do vs ❌ Don't patterns, or feature comparisons.
 */
export function ComparisonBlock({ columns }: ComparisonBlockProps) {
      const { t } = useDocsI18n();

      return (
            <div className="docs-comparison" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                  {columns.map((col, colIdx) => {
                        const config = variantConfig[col.variant];
                        return (
                              <div key={colIdx} className={`docs-comparison-column ${config.className}`}>
                                    <div className="docs-comparison-header">
                                          <span className="docs-comparison-icon">{config.icon}</span>
                                          <span className="docs-comparison-title">{t(col.titleKey)}</span>
                                    </div>
                                    <ul className="docs-comparison-list">
                                          {col.items.map((item, itemIdx) => (
                                                <li key={itemIdx}>{item}</li>
                                          ))}
                                    </ul>
                              </div>
                        );
                  })}
            </div>
      );
}
