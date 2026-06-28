"use client";

import Link from "next/link";
import { useDocsI18n } from "../providers/DocsI18nProvider";

const PERSONAS = [
  {
    id: "business",
    icon: "\uD83C\uDFE2",
    titleKey: "commercial.landing.personaBusiness",
    descKey: "commercial.landing.personaBusinessDesc",
    href: "/commercial/business-client-journeys",
    color: "var(--com-violet)",
  },
  {
    id: "investor",
    icon: "\uD83D\uDCC8",
    titleKey: "commercial.landing.personaInvestor",
    descKey: "commercial.landing.personaInvestorDesc",
    href: "/commercial/investor-overview",
    color: "var(--com-cyan)",
  },
  {
    id: "partner",
    icon: "\uD83E\uDD1D",
    titleKey: "commercial.landing.personaPartner",
    descKey: "commercial.landing.personaPartnerDesc",
    href: "/commercial/partner-journey",
    color: "var(--com-emerald)",
  },
];

const STATS = [
  { value: "B2B2C", labelKey: "commercial.landing.statModel" },
  { value: "\u221E", labelKey: "commercial.landing.statModules" },
  { value: "3 DBs", labelKey: "commercial.landing.statDb" },
  { value: "7 Lang", labelKey: "commercial.landing.statLang" },
];

const VALUE_PROPS = [
  { icon: "\uD83E\uDDE9", titleKey: "commercial.landing.val1Title", descKey: "commercial.landing.val1Desc" },
  { icon: "\uD83D\uDD10", titleKey: "commercial.landing.val2Title", descKey: "commercial.landing.val2Desc" },
  { icon: "\uD83D\uDE80", titleKey: "commercial.landing.val3Title", descKey: "commercial.landing.val3Desc" },
  { icon: "\uD83C\uDF0D", titleKey: "commercial.landing.val4Title", descKey: "commercial.landing.val4Desc" },
  { icon: "\uD83D\uDCCA", titleKey: "commercial.landing.val5Title", descKey: "commercial.landing.val5Desc" },
  { icon: "\uD83E\uDD1D", titleKey: "commercial.landing.val6Title", descKey: "commercial.landing.val6Desc" },
];

export function CommercialHomeLanding() {
  const { t } = useDocsI18n();

  return (
    <div className="com-landing">
      {/* Hero */}
      <section className="com-hero" aria-labelledby="hero-title">
        <div className="com-hero-bg" aria-hidden="true">
          <div className="com-hero-orb com-hero-orb--1" />
          <div className="com-hero-orb com-hero-orb--2" />
          <div className="com-hero-grid" />
        </div>
        <div className="com-hero-content">
          <p className="com-hero-kicker" aria-hidden="true">{t("commercial.landing.kicker")}</p>
          <h1 id="hero-title" className="com-hero-title">
            {t("commercial.landing.heroTitle1")}
            <br />
            <span className="com-hero-title-accent">{t("commercial.landing.heroTitle2")}</span>
          </h1>
          <p className="com-hero-subtitle">{t("commercial.landing.heroSubtitle")}</p>
          <div className="com-hero-ctas">
            <Link href="/commercial/pricing-showcase" className="com-btn com-btn--primary">
              {t("commercial.landing.ctaPrimary")}
            </Link>
            <Link href="/commercial/business-client-journeys" className="com-btn com-btn--ghost">
              {t("commercial.landing.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="com-stats-strip" aria-label="Platform statistics">
        <div className="com-stats-inner">
          {STATS.map((s) => (
            <div key={s.value} className="com-stat">
              <span className="com-stat-value" aria-hidden="true">{s.value}</span>
              <span className="com-stat-label">{t(s.labelKey)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Persona Selector */}
      <section className="com-personas">
        <div className="com-section-inner">
          <h2 className="com-section-title">{t("commercial.landing.personaTitle")}</h2>
          <p className="com-section-sub">{t("commercial.landing.personaSub")}</p>
          <div className="com-persona-cards">
            {PERSONAS.map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="com-persona-card"
                style={{ "--card-accent": p.color } as React.CSSProperties}
              >
                <span className="com-persona-icon" aria-hidden="true">{p.icon}</span>
                <h3 className="com-persona-title">{t(p.titleKey)}</h3>
                <p className="com-persona-desc">{t(p.descKey)}</p>
                <span className="com-persona-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="com-values">
        <div className="com-section-inner">
          <h2 className="com-section-title">{t("commercial.landing.valueTitle")}</h2>
          <div className="com-value-grid">
            {VALUE_PROPS.map((v) => (
              <div key={v.titleKey} className="com-value-item">
                <span className="com-value-icon" aria-hidden="true">{v.icon}</span>
                <h4 className="com-value-title">{t(v.titleKey)}</h4>
                <p className="com-value-desc">{t(v.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="com-footer-cta">
        <div className="com-section-inner com-footer-cta-inner">
          <h2 className="com-footer-cta-title">{t("commercial.landing.footerCtaTitle")}</h2>
          <p className="com-footer-cta-sub">{t("commercial.landing.footerCtaSub")}</p>
          <div className="com-hero-ctas">
            <Link href="/commercial/pricing-showcase" className="com-btn com-btn--primary">
              {t("commercial.landing.ctaPrimary")}
            </Link>
            <Link href="/commercial/investor-overview" className="com-btn com-btn--ghost">
              {t("commercial.landing.ctaInvestor")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
