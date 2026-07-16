"use client";

import type { GlossaryTerm } from "../../../domain/entities/DocSection";
import { GlossaryCard } from "../ui/GlossaryCard";

interface BilingualGlossaryProps {
  terms: GlossaryTerm[];
}

export function BilingualGlossary({ terms }: BilingualGlossaryProps) {
  return (
    <div className="docs-glossary-grid">
      {terms.map((term, idx) => (
        <GlossaryCard key={idx} term={term} />
      ))}
    </div>
  );
}
