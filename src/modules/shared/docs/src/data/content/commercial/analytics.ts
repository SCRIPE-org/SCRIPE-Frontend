import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.analytics.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "Append-Only", labelKey: "commercial.analytics.statAppendOnly" },
      { value: "Daily", labelKey: "commercial.analytics.statProjections" },
      { value: "Sub-second", labelKey: "commercial.analytics.statQuerySpeed" },
      { value: "Zero Mutate", labelKey: "commercial.analytics.statTrust" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.analytics.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "BarChart",
        titleKey: "commercial.analytics.featEventStream",
        descriptionKey: "commercial.analytics.featEventStreamDesc",
      },
      {
        icon: "TrendingUp",
        titleKey: "commercial.analytics.featDailyRollups",
        descriptionKey: "commercial.analytics.featDailyRollupsDesc",
      },
      {
        icon: "Cpu",
        titleKey: "commercial.analytics.featInProcessRecording",
        descriptionKey: "commercial.analytics.featInProcessRecordingDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "commercial.analytics.featTenantIsolation",
        descriptionKey: "commercial.analytics.featTenantIsolationDesc",
      },
      {
        icon: "PieChart",
        titleKey: "commercial.analytics.featExecutiveMetrics",
        descriptionKey: "commercial.analytics.featExecutiveMetricsDesc",
      },
      {
        icon: "Zap",
        titleKey: "commercial.analytics.featZeroLatencyDashboards",
        descriptionKey: "commercial.analytics.featZeroLatencyDashboardsDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.analytics.ctaTitle",
    subtitleKey: "commercial.analytics.ctaSubtitle",
    primaryCtaKey: "commercial.analytics.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.analytics.ctaSecondary",
    secondaryCtaHref: "/docs/modules/analytics-overview",
  },
];

registerPage({
  slug: "commercial/analytics",
  titleKey: "commercial.analytics.title",
  descriptionKey: "commercial.analytics.description",
  category: "commercial-modules",
  order: 21,
  sections,
  relatedSlugs: [
    "commercial/venue-operations",
    "commercial/finance-settlement",
    "commercial/observability-monitoring",
  ],
  lastUpdated: "2026-10-03",
});
