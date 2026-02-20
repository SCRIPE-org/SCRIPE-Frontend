"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocsMode } from "../../viewmodels/useDocsModeViewModel";

// ─── Props ───────────────────────────────────────────────────────
interface CommercialHeaderProps {
      onSearchOpen: () => void;
      onMobileMenuOpen: () => void;
      docsMode: DocsMode;
      onDocsModeChange: (mode: DocsMode) => void;
}

// ─── Component ───────────────────────────────────────────────────
export function CommercialHeader({
      onSearchOpen,
      onMobileMenuOpen,
      docsMode,
      onDocsModeChange,
}: CommercialHeaderProps) {
      const { t } = useDocsI18n();

      return (
            <header className="commercial-header">
                  <div className="commercial-header-inner">
                        {/* Mobile menu */}
                        <button
                              className="commercial-mobile-trigger"
                              onClick={onMobileMenuOpen}
                              aria-label="Open menu"
                        >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" x2="20" y1="12" y2="12" />
                                    <line x1="4" x2="20" y1="6" y2="6" />
                                    <line x1="4" x2="20" y1="18" y2="18" />
                              </svg>
                        </button>

                        {/* Logo + Brand */}
                        <Link href="/docs/commercial/why-nexora-overview" className="commercial-header-brand">
                              <div className="commercial-header-logo">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                                          <line x1="12" x2="12" y1="22" y2="15.5" />
                                          <polyline points="22 8.5 12 15.5 2 8.5" />
                                          <polyline points="2 15.5 12 8.5 22 15.5" />
                                          <line x1="12" x2="12" y1="2" y2="8.5" />
                                    </svg>
                              </div>
                              <div className="commercial-header-brand-text">
                                    <span className="commercial-header-brand-name">NEXORA</span>
                                    <span className="commercial-header-brand-tag">{t("common.commercial")}</span>
                              </div>
                        </Link>

                        {/* Center nav */}
                        <nav className="commercial-header-nav">
                              <button className="commercial-header-nav-link" onClick={onSearchOpen}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <circle cx="11" cy="11" r="8" />
                                          <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    {t("common.search")}
                              </button>
                        </nav>

                        {/* Actions */}
                        <div className="commercial-header-actions">
                              {/* Switch to Technical */}
                              <button
                                    className="commercial-header-switch"
                                    onClick={() => onDocsModeChange("technical")}
                              >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="16 18 22 12 16 6" />
                                          <polyline points="8 6 2 12 8 18" />
                                    </svg>
                                    {t("common.technical")}
                              </button>

                              {/* CTA */}
                              <a href="mailto:sales@nexora.io" className="commercial-header-cta">
                                    {t("common.contactSales") || "Contact Sales"}
                              </a>
                        </div>
                  </div>
            </header>
      );
}
