'use client';

import { useDocsI18n } from '../../providers/DocsI18nProvider';
import type { StepItem } from '../../../domain/entities/DocSection';
import { CodeBlock } from './CodeBlock';

interface StepGuideProps {
      steps: StepItem[];
}

export function StepGuide({ steps }: StepGuideProps) {
      const { t } = useDocsI18n();

      return (
            <div className="docs-steps">
                  {steps.map((step, idx) => (
                        <div key={idx} className="docs-step">
                              <div className="docs-step-number">{idx + 1}</div>
                              <div className="docs-step-title">{t(step.titleKey)}</div>
                              <div className="docs-step-content">{t(step.contentKey)}</div>
                              {step.code && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                          <CodeBlock
                                                code={step.code}
                                                language={step.codeLanguage || 'bash'}
                                                filename={step.codeFilename}
                                          />
                                    </div>
                              )}
                        </div>
                  ))}
            </div>
      );
}
