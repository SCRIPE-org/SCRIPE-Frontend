'use client';

import Link from 'next/link';
import { useDocsI18n } from '../../providers/DocsI18nProvider';

interface DocsPrevNextProps {
      prevSlug?: string;
      prevTitleKey?: string;
      nextSlug?: string;
      nextTitleKey?: string;
}

export function DocsPrevNext({ prevSlug, prevTitleKey, nextSlug, nextTitleKey }: DocsPrevNextProps) {
      const { t } = useDocsI18n();

      if (!prevSlug && !nextSlug) return null;

      return (
            <div className="docs-prev-next">
                  {prevSlug && prevTitleKey && (
                        <Link href={`/docs/${prevSlug}`} className="docs-prev-next-link" data-type="prev">
                              <span className="docs-prev-next-label">← {t('common.previous')}</span>
                              <span className="docs-prev-next-title">{t(prevTitleKey)}</span>
                        </Link>
                  )}
                  {nextSlug && nextTitleKey && (
                        <Link href={`/docs/${nextSlug}`} className="docs-prev-next-link" data-type="next">
                              <span className="docs-prev-next-label">{t('common.next')} →</span>
                              <span className="docs-prev-next-title">{t(nextTitleKey)}</span>
                        </Link>
                  )}
            </div>
      );
}
