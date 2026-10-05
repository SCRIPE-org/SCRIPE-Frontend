import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.catalogPricing.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "100%", labelKey: "commercial.catalogPricing.statAuditability" },
      { value: "4x", labelKey: "commercial.catalogPricing.statQuotingSpeed" },
      { value: "Multi-Cur", labelKey: "commercial.catalogPricing.statCurrencies" },
      { value: "Dynamic", labelKey: "commercial.catalogPricing.statDiscounts" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.catalogPricing.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "BookOpen",
        titleKey: "commercial.catalogPricing.featPriceBooks",
        descriptionKey: "commercial.catalogPricing.featPriceBooksDesc",
      },
      {
        icon: "FileText",
        titleKey: "commercial.catalogPricing.featQuotation",
        descriptionKey: "commercial.catalogPricing.featQuotationDesc",
      },
      {
        icon: "Percent",
        titleKey: "commercial.catalogPricing.featDiscounts",
        descriptionKey: "commercial.catalogPricing.featDiscountsDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "commercial.catalogPricing.featAgreements",
        descriptionKey: "commercial.catalogPricing.featAgreementsDesc",
      },
      {
        icon: "Globe",
        titleKey: "commercial.catalogPricing.featTaxes",
        descriptionKey: "commercial.catalogPricing.featTaxesDesc",
      },
      {
        icon: "History",
        titleKey: "commercial.catalogPricing.featVersioning",
        descriptionKey: "commercial.catalogPricing.featVersioningDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.catalogPricing.roiTitle",
    id: "roi-impact",
  },
  {
    type: "table",
    headers: [
      "commercial.catalogPricing.tableHeaderMetric",
      "commercial.catalogPricing.tableHeaderTraditional",
      "commercial.catalogPricing.tableHeaderScripe",
    ],
    rows: [
      [
        "commercial.catalogPricing.metricTurnaround",
        "commercial.catalogPricing.tradTurnaround",
        "commercial.catalogPricing.scripeTurnaround",
      ],
      [
        "commercial.catalogPricing.metricMarginLeakage",
        "commercial.catalogPricing.tradMarginLeakage",
        "commercial.catalogPricing.scripeMarginLeakage",
      ],
      [
        "commercial.catalogPricing.metricTaxCompliance",
        "commercial.catalogPricing.tradTaxCompliance",
        "commercial.catalogPricing.scripeTaxCompliance",
      ],
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.catalogPricing.ctaTitle",
    subtitleKey: "commercial.catalogPricing.ctaSubtitle",
    primaryCtaKey: "commercial.catalogPricing.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.catalogPricing.ctaSecondary",
    secondaryCtaHref: "/docs/modules/catalog-pricing-overview",
  },
];

registerPage({
  slug: "commercial/catalog-smart-pricing",
  titleKey: "commercial.catalogPricing.title",
  descriptionKey: "commercial.catalogPricing.description",
  category: "commercial-modules",
  order: 11,
  sections,
  relatedSlugs: [
    "commercial/venue-operations",
    "commercial/finance-settlement",
    "commercial/billing-payments",
  ],
  lastUpdated: "2026-10-03",
});
