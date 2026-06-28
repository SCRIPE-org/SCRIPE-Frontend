"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { CtaBannerBlockSection } from "../../../domain/entities/DocSection";

export function CtaBannerBlock({ section }: { section: CtaBannerBlockSection }) {
  const { t } = useDocsI18n();

  return (
    <section className="com-footer-cta">
      <div className="com-section-inner com-footer-cta-inner">
        <h2 className="com-footer-cta-title">{t(section.titleKey)}</h2>
        <p className="com-footer-cta-sub">{t(section.subtitleKey)}</p>
        <div className="com-hero-ctas">
          <Link href={section.primaryCtaHref} className="com-btn com-btn--primary">
            {t(section.primaryCtaKey)}
          </Link>
          {section.secondaryCtaKey && section.secondaryCtaHref && (
            <Link href={section.secondaryCtaHref} className="com-btn com-btn--ghost">
              {t(section.secondaryCtaKey)}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
