import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "landing-hero-block",
    kickerKey: "commercial.landing.kicker",
    title1Key: "commercial.landing.heroTitle1",
    title2Key: "commercial.landing.heroTitle2",
    subtitleKey: "commercial.landing.heroSubtitle",
    primaryCtaKey: "commercial.landing.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.landing.ctaSecondary",
    secondaryCtaHref: "/commercial/business-client-journeys",
  },
  {
    type: "stats-strip-block",
    stats: [
      { value: "B2B2C", labelKey: "commercial.landing.statModel" },
      { value: "Open", labelKey: "commercial.landing.statModules" },
      { value: "3 DBs", labelKey: "commercial.landing.statDb" },
      { value: "7 Lang", labelKey: "commercial.landing.statLang" },
    ],
  },
  {
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
  },
  {
    type: "persona-selector",
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.landing.footerCtaTitle",
    subtitleKey: "commercial.landing.footerCtaSub",
    primaryCtaKey: "commercial.landing.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.landing.ctaInvestor",
    secondaryCtaHref: "/commercial/investor-overview",
  },
];

registerPage({
  slug: "commercial/why-scripe-overview",
  titleKey: "commercial.whyScripeOverview.title",
  descriptionKey: "commercial.whyScripeOverview.description",
  layout: "landing",
  category: "commercial-why-scripe",
  order: 1,
  sections,
  relatedSlugs: ["commercial/competitive-advantages", "commercial/success-metrics"],
  lastUpdated: "2026-02-20",
});
