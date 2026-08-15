"use client";

import type { GlossaryTerm } from "../../../domain/entities/DocSection";
import { GlossaryCard } from "../ui/GlossaryCard";

interface BilingualGlossaryProps {
  terms: GlossaryTerm[];
}

/**
 * BilingualGlossary — the grid of term cards.
 * A real list, so assistive tech announces how many terms are in the glossary
 * before the reader starts walking them.
 */
export function BilingualGlossary({ terms }: BilingualGlossaryProps) {
  return (
    <ul className="docs-glossary-grid">
      {terms.map((term, idx) => (
        <GlossaryCard key={idx} term={term} />
      ))}
    </ul>
  );
}
