"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { DocContent } from "./DocContent";
import type { DocSection } from "../../../domain/entities/DocSection";

// ─── Props ───────────────────────────────────────────────────────
interface CommercialContentProps {
  sections: DocSection[];
  titleKey: string;
  descriptionKey?: string;
  lastUpdated?: string;
}

// ─── Component ───────────────────────────────────────────────────
/**
 * React presentation component representing the commercial content UI element.
 */
export function CommercialContent({
  sections,
  titleKey,
  descriptionKey,
  lastUpdated,
}: CommercialContentProps) {
  const { t } = useDocsI18n();

  return (
    <div className="commercial-content">
      {/* Page hero */}
      <div className="commercial-content-hero">
        <h1 className="commercial-content-title">{t(titleKey)}</h1>
        {descriptionKey && <p className="commercial-content-description">{t(descriptionKey)}</p>}
        {lastUpdated && (
          <div className="commercial-content-meta">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Last updated: {lastUpdated}</span>
          </div>
        )}
      </div>

      {/* Sections — reuse the technical DocContent under the hood */}
      <div className="commercial-content-body">
        <DocContent sections={sections} />
      </div>
    </div>
  );
}
