"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ValuePropsBlockSection } from "../../../domain/entities/DocSection";

export function ValuePropsBlock({ section }: { section: ValuePropsBlockSection }) {
  const { t } = useDocsI18n();

  return (
    <section className="com-values">
      <div className="com-section-inner">
        <h2 className="com-section-title">{t(section.titleKey)}</h2>
        <div className="com-value-grid">
          {section.props.map((v, idx) => (
            <div key={idx} className="com-value-item">
              <span className="com-value-icon" aria-hidden="true">{v.icon}</span>
              <h4 className="com-value-title">{t(v.titleKey)}</h4>
              <p className="com-value-desc">{t(v.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
