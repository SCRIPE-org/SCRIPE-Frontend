import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.venueOperations.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "0", labelKey: "commercial.venueOperations.statConflicts" },
      { value: "+38%", labelKey: "commercial.venueOperations.statUtilization" },
      { value: "15 min", labelKey: "commercial.venueOperations.statHoldTtl" },
      { value: "Real-time", labelKey: "commercial.venueOperations.statSync" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.venueOperations.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Building",
        titleKey: "commercial.venueOperations.featMultiFacility",
        descriptionKey: "commercial.venueOperations.featMultiFacilityDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "commercial.venueOperations.featHoldEngine",
        descriptionKey: "commercial.venueOperations.featHoldEngineDesc",
      },
      {
        icon: "Calendar",
        titleKey: "commercial.venueOperations.featDynamicSchedules",
        descriptionKey: "commercial.venueOperations.featDynamicSchedulesDesc",
      },
      {
        icon: "Activity",
        titleKey: "commercial.venueOperations.featBlackouts",
        descriptionKey: "commercial.venueOperations.featBlackoutsDesc",
      },
      {
        icon: "DollarSign",
        titleKey: "commercial.venueOperations.featMonetization",
        descriptionKey: "commercial.venueOperations.featMonetizationDesc",
      },
      {
        icon: "Smartphone",
        titleKey: "commercial.venueOperations.featMobileReady",
        descriptionKey: "commercial.venueOperations.featMobileReadyDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.venueOperations.roiTitle",
    id: "roi-impact",
  },
  {
    type: "table",
    headers: [
      "commercial.venueOperations.tableHeaderMetric",
      "commercial.venueOperations.tableHeaderTraditional",
      "commercial.venueOperations.tableHeaderScripe",
    ],
    rows: [
      [
        "commercial.venueOperations.metricBookingLatency",
        "commercial.venueOperations.tradBookingLatency",
        "commercial.venueOperations.scripeBookingLatency",
      ],
      [
        "commercial.venueOperations.metricDoubleBookings",
        "commercial.venueOperations.tradDoubleBookings",
        "commercial.venueOperations.scripeDoubleBookings",
      ],
      [
        "commercial.venueOperations.metricUnsoldSlots",
        "commercial.venueOperations.tradUnsoldSlots",
        "commercial.venueOperations.scripeUnsoldSlots",
      ],
      [
        "commercial.venueOperations.metricAdminLabor",
        "commercial.venueOperations.tradAdminLabor",
        "commercial.venueOperations.scripeAdminLabor",
      ],
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.venueOperations.ctaTitle",
    subtitleKey: "commercial.venueOperations.ctaSubtitle",
    primaryCtaKey: "commercial.venueOperations.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.venueOperations.ctaSecondary",
    secondaryCtaHref: "/docs/modules/venue-overview",
  },
];

registerPage({
  slug: "commercial/venue-operations",
  titleKey: "commercial.venueOperations.title",
  descriptionKey: "commercial.venueOperations.description",
  category: "commercial-modules",
  order: 10,
  sections,
  relatedSlugs: [
    "commercial/catalog-smart-pricing",
    "commercial/finance-settlement",
    "commercial/workforce-hrms",
  ],
  lastUpdated: "2026-10-03",
});
