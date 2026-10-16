"use client";

import { CtaBannerBlock } from "../components/content/CtaBannerBlock";
import { LandingHeroBlock } from "../components/content/LandingHeroBlock";
import { PersonaSelector } from "../components/content/PersonaSelector";
import { StatsStripBlock } from "../components/content/StatsStripBlock";
import { ValuePropsBlock } from "../components/content/ValuePropsBlock";
import type {
  CtaBannerBlockSection,
  LandingHeroBlockSection,
  StatsStripBlockSection,
  ValuePropsBlockSection,
} from "../../domain/entities/DocSection";

const heroSection: LandingHeroBlockSection = {
  type: "landing-hero-block",
  kickerKey: "commercial.landing.kicker",
  title1Key: "commercial.landing.heroTitle1",
  title2Key: "commercial.landing.heroTitle2",
  subtitleKey: "commercial.landing.heroSubtitle",
  primaryCtaKey: "commercial.landing.ctaPrimary",
  primaryCtaHref: "/commercial/pricing-showcase",
  secondaryCtaKey: "commercial.landing.ctaSecondary",
  secondaryCtaHref: "/commercial/business-client-journeys",
};

const statsSection: StatsStripBlockSection = {
  type: "stats-strip-block",
  stats: [
    { value: "B2B2C", labelKey: "commercial.landing.statModel" },
    { value: "Open", labelKey: "commercial.landing.statModules" },
    { value: "3 DBs", labelKey: "commercial.landing.statDb" },
    { value: "7 Lang", labelKey: "commercial.landing.statLang" },
  ],
};

const valuesSection: ValuePropsBlockSection = {
  type: "value-props-block",
  titleKey: "commercial.landing.valueTitle",
  props: [
    {
      icon: "modules",
      titleKey: "commercial.landing.val1Title",
      descKey: "commercial.landing.val1Desc",
    },
    {
      icon: "access",
      titleKey: "commercial.landing.val2Title",
      descKey: "commercial.landing.val2Desc",
    },
    {
      icon: "launch",
      titleKey: "commercial.landing.val3Title",
      descKey: "commercial.landing.val3Desc",
    },
    {
      icon: "global",
      titleKey: "commercial.landing.val4Title",
      descKey: "commercial.landing.val4Desc",
    },
    {
      icon: "analytics",
      titleKey: "commercial.landing.val5Title",
      descKey: "commercial.landing.val5Desc",
    },
    {
      icon: "partner",
      titleKey: "commercial.landing.val6Title",
      descKey: "commercial.landing.val6Desc",
    },
  ],
};

const ctaSection: CtaBannerBlockSection = {
  type: "cta-banner-block",
  titleKey: "commercial.landing.footerCtaTitle",
  subtitleKey: "commercial.landing.footerCtaSub",
  primaryCtaKey: "commercial.landing.ctaPrimary",
  primaryCtaHref: "/commercial/pricing-showcase",
  secondaryCtaKey: "commercial.landing.ctaInvestor",
  secondaryCtaHref: "/commercial/investor-overview",
};

/**
 * Documentation for module export
 */
export function CommercialHomeLanding() {
  return (
    <div className="com-landing">
      <LandingHeroBlock section={heroSection} />
      <StatsStripBlock section={statsSection} />
      <ValuePropsBlock section={valuesSection} />
      <PersonaSelector />
      <CtaBannerBlock section={ctaSection} />
    </div>
  );
}
