'use client';

import Link from 'next/link';
import { useDocsI18n } from '../../providers/DocsI18nProvider';
import type { DocCategory, DocNavItem } from '../../../domain/entities/DocCategory';

interface DocsMobileNavProps {
      categories: DocCategory[];
      activeSlug: string;
      isOpen: boolean;
      onClose: () => void;
}

export function DocsMobileNav({ categories, activeSlug, isOpen, onClose }: DocsMobileNavProps) {
      const { t } = useDocsI18n();

      if (!isOpen) return null;

      const renderItem = (item: DocNavItem) => {
            if (!item.slug) return null;
            const isActive = item.slug === activeSlug;
            return (
                  <Link
                        key={item.id}
                        href={`/docs/${item.slug}`}
                        className="docs-sidebar-item"
                        data-active={isActive}
                        onClick={onClose}
                  >
                        {t(item.titleKey)}
                  </Link>
            );
      };

      return (
            <>
                  <div className="docs-mobile-overlay" onClick={onClose} />
                  <nav className="docs-mobile-nav">
                        <button className="docs-mobile-close" onClick={onClose} aria-label={t('common.closeMenu')}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <div style={{ paddingTop: '2rem' }}>
                              {categories.map((cat) => (
                                    <div key={cat.id} className="docs-sidebar-category">
                                          <div
                                                className="docs-sidebar-category-btn"
                                                style={{ cursor: 'default' }}
                                          >
                                                <span>{t(cat.titleKey)}</span>
                                          </div>
                                          <div className="docs-sidebar-items" style={{ maxHeight: '9999px' }}>
                                                {cat.items.map(renderItem)}
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </nav>
            </>
      );
}
