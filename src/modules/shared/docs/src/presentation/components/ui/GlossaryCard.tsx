"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { Button } from "@core/ui/button";
import type { GlossaryTerm } from "../../../domain/entities/DocSection";

interface GlossaryCardProps {
  term: GlossaryTerm;
}

/**
 * GlossaryCard — one bilingual term.
 *
 * The card is a real <button>: it was an onClick <div>, so it could not be
 * reached by Tab, could not be fired with Enter or Space, and announced
 * nothing about being operable. The flip label is a translation key rather
 * than an inline en/ar ternary — the portal ships seven languages, and a
 * two-branch ternary left five of them reading English.
 *
 * The flip swaps the two terms visually via flex order, so the DOM order —
 * and therefore the order a screen reader reads them in — never moves under
 * the user; only the leading position on screen changes.
 */
export function GlossaryCard({ term }: GlossaryCardProps) {
  const { t } = useDocsI18n();
  const [primaryIsEnglish, setPrimaryIsEnglish] = useState(true);

  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        className="docs-glossary-card h-auto p-0 text-start font-normal hover:bg-transparent"
        aria-pressed={!primaryIsEnglish}
        onClick={() => setPrimaryIsEnglish((current) => !current)}
      >
        <span className="docs-glossary-header" data-primary={primaryIsEnglish ? "en" : "ar"}>
          {/* Each term carries its own lang so a screen reader switches voice
              instead of reading Arabic with an English pronunciation. */}
          <span className="docs-term-en" lang="en">
            {term.termEn}
          </span>
          <span className="docs-term-ar" lang="ar" dir="rtl">
            {term.termAr}
          </span>
        </span>
        <span className="docs-glossary-desc">{t(term.descriptionKey)}</span>
        <span className="docs-glossary-indicator">{t("common.glossaryFlip")}</span>
      </Button>
    </li>
  );
}
