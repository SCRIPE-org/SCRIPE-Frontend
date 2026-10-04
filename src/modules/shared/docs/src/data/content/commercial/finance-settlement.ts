import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.financeSettlement.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "100%", labelKey: "commercial.financeSettlement.statAuditability" },
      { value: "0", labelKey: "commercial.financeSettlement.statUnreconciled" },
      { value: "Automated", labelKey: "commercial.financeSettlement.statAllocation" },
      { value: "Multi-POS", labelKey: "commercial.financeSettlement.statChannels" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.financeSettlement.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "FileCheck",
        titleKey: "commercial.financeSettlement.featInvoices",
        descriptionKey: "commercial.financeSettlement.featInvoicesDesc",
      },
      {
        icon: "CreditCard",
        titleKey: "commercial.financeSettlement.featPayments",
        descriptionKey: "commercial.financeSettlement.featPaymentsDesc",
      },
      {
        icon: "PieChart",
        titleKey: "commercial.financeSettlement.featAllocation",
        descriptionKey: "commercial.financeSettlement.featAllocationDesc",
      },
      {
        icon: "RotateCcw",
        titleKey: "commercial.financeSettlement.featRefunds",
        descriptionKey: "commercial.financeSettlement.featRefundsDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "commercial.financeSettlement.featAdjustments",
        descriptionKey: "commercial.financeSettlement.featAdjustmentsDesc",
      },
      {
        icon: "BarChart3",
        titleKey: "commercial.financeSettlement.featLedgerSync",
        descriptionKey: "commercial.financeSettlement.featLedgerSyncDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.financeSettlement.roiTitle",
    id: "roi-impact",
  },
  {
    type: "table",
    headers: [
      "commercial.financeSettlement.tableHeaderMetric",
      "commercial.financeSettlement.tableHeaderTraditional",
      "commercial.financeSettlement.tableHeaderScripe",
    ],
    rows: [
      [
        "commercial.financeSettlement.metricDaysSalesOutstanding",
        "commercial.financeSettlement.tradDso",
        "commercial.financeSettlement.scripeDso",
      ],
      [
        "commercial.financeSettlement.metricReconciliationTime",
        "commercial.financeSettlement.tradReconTime",
        "commercial.financeSettlement.scripeReconTime",
      ],
      [
        "commercial.financeSettlement.metricManualErrors",
        "commercial.financeSettlement.tradErrors",
        "commercial.financeSettlement.scripeErrors",
      ],
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.financeSettlement.ctaTitle",
    subtitleKey: "commercial.financeSettlement.ctaSubtitle",
    primaryCtaKey: "commercial.financeSettlement.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.financeSettlement.ctaSecondary",
    secondaryCtaHref: "/docs/modules/finance-overview",
  },
];

registerPage({
  slug: "commercial/finance-settlement",
  titleKey: "commercial.financeSettlement.title",
  descriptionKey: "commercial.financeSettlement.description",
  category: "commercial-modules",
  order: 12,
  sections,
  relatedSlugs: [
    "commercial/venue-operations",
    "commercial/catalog-smart-pricing",
    "commercial/billing-payments",
  ],
  lastUpdated: "2026-10-03",
});
