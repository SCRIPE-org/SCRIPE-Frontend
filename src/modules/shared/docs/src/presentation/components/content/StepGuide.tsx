"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { StepItem } from "../../../domain/entities/DocSection";
import { CodeBlock } from "./CodeBlock";

interface StepGuideProps {
  steps: StepItem[];
}

/**
 * Presentation UI component rendering the step guide.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function StepGuide({ steps }: StepGuideProps) {
  const { t } = useDocsI18n();

  // An ordered list: the sequence is the meaning here, and <ol> is what tells
  // a screen reader "step 2 of 5" without the number disc being read as text.
  return (
    <ol className="docs-steps">
      {steps.map((step, idx) => (
        <li key={idx} className="docs-step">
          <span className="docs-step-number" aria-hidden="true">
            {idx + 1}
          </span>
          <h4 className="docs-step-title">{t(step.titleKey)}</h4>
          <div className="docs-step-content">{t(step.contentKey)}</div>
          {step.code && (
            <div style={{ marginTop: "0.75rem" }}>
              <CodeBlock
                code={step.code}
                language={step.codeLanguage || "bash"}
                filename={step.codeFilename}
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
