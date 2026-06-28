"use client";
 
import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { LandingHeroBlockSection } from "../../../domain/entities/DocSection";

export function LandingHeroBlock({ section }: { section: LandingHeroBlockSection }) {
  const { t } = useDocsI18n();

  return (
    <section className="com-hero" aria-labelledby="hero-title">
      <div className="com-hero-bg" aria-hidden="true">
        <div className="com-hero-orb com-hero-orb--1" />
        <div className="com-hero-orb com-hero-orb--2" />
        <div className="com-hero-grid" />
      </div>
      <div className="com-hero-content">
        {section.kickerKey && (
          <p className="com-hero-kicker" aria-hidden="true">{t(section.kickerKey)}</p>
        )}
        <h1 id="hero-title" className="com-hero-title">
          {t(section.title1Key)}
          {section.title2Key && (
            <>
              <br />
              <span className="com-hero-title-accent">{t(section.title2Key)}</span>
            </>
          )}
        </h1>
        <p className="com-hero-subtitle">{t(section.subtitleKey)}</p>
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
