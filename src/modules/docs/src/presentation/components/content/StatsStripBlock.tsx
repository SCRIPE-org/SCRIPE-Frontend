"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { StatsStripBlockSection } from "../../../domain/entities/DocSection";

export function StatsStripBlock({ section }: { section: StatsStripBlockSection }) {
  const { t } = useDocsI18n();

  return (
    <section className="com-stats-strip" aria-label="Platform statistics">
      <div className="com-stats-inner">
        {section.stats.map((s, idx) => (
          <div key={idx} className="com-stat">
            <span className="com-stat-value" aria-hidden="true">{s.value}</span>
            <span className="com-stat-label">{t(s.labelKey)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
