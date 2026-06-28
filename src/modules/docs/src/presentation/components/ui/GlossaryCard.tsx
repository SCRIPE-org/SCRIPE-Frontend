"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { GlossaryTerm } from "../../../domain/entities/DocSection";

interface GlossaryCardProps {
  term: GlossaryTerm;
}

export function GlossaryCard({ term }: GlossaryCardProps) {
  const { t, language } = useDocsI18n();
  const [showEnglish, setShowEnglish] = useState(true);

  return (
    <div
      className="docs-glossary-card"
      onClick={() => setShowEnglish(!showEnglish)}
    >
      <div className="docs-glossary-header">
        <span className="docs-term-en">{term.termEn}</span>
        <span className="docs-term-ar">{term.termAr}</span>
      </div>
      <p className="docs-glossary-desc">{t(term.descriptionKey)}</p>
      <span className="docs-glossary-indicator">
        {language === "ar" ? "اضغط للتبديل" : "Click to flip language"}
      </span>
    </div>
  );
}
