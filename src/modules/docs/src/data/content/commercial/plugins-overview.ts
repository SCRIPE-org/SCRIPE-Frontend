import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.pluginsOverview.intro" },

  // ─── Key Business Value ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pluginsOverview.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "puzzle",
        titleKey: "commercial.pluginsOverview.featureExtTitle",
        descriptionKey: "commercial.pluginsOverview.featureExtDesc",
      },
      {
        icon: "shield-check",
        titleKey: "commercial.pluginsOverview.featureSandboxTitle",
        descriptionKey: "commercial.pluginsOverview.featureSandboxDesc",
      },
      {
        icon: "store",
        titleKey: "commercial.pluginsOverview.featureMarketTitle",
        descriptionKey: "commercial.pluginsOverview.featureMarketDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.pluginsOverview.featureFastTitle",
        descriptionKey: "commercial.pluginsOverview.featureFastDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.pluginsOverview.featureLogsTitle",
        descriptionKey: "commercial.pluginsOverview.featureLogsDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.pluginsOverview.featureI18nTitle",
        descriptionKey: "commercial.pluginsOverview.featureI18nDesc",
      },
    ],
  },

  // ─── Two-Tier Model ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pluginsOverview.tiersTitle",
    id: "tier-model",
  },
  { type: "paragraph", contentKey: "commercial.pluginsOverview.tiersIntro" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "commercial.pluginsOverview.tier1Title",
        variant: "positive" as const,
        items: [
          "commercial.pluginsOverview.tier1Point1",
          "commercial.pluginsOverview.tier1Point2",
          "commercial.pluginsOverview.tier1Point3",
          "commercial.pluginsOverview.tier1Point4",
        ],
      },
      {
        titleKey: "commercial.pluginsOverview.tier2Title",
        variant: "positive" as const,
        items: [
          "commercial.pluginsOverview.tier2Point1",
          "commercial.pluginsOverview.tier2Point2",
          "commercial.pluginsOverview.tier2Point3",
          "commercial.pluginsOverview.tier2Point4",
        ],
      },
    ],
  },

  // ─── Who Benefits ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pluginsOverview.audienceTitle",
    id: "who-benefits",
  },
  { type: "paragraph", contentKey: "commercial.pluginsOverview.audienceIntro" },
  {
    type: "table",
    headers: [
      "commercial.pluginsOverview.audRole",
      "commercial.pluginsOverview.audBenefit",
    ],
    rows: [
      ["commercial.pluginsOverview.audPlatform",     "commercial.pluginsOverview.audPlatformBenefit"],
      ["commercial.pluginsOverview.audTenant",       "commercial.pluginsOverview.audTenantBenefit"],
      ["commercial.pluginsOverview.audPartner",      "commercial.pluginsOverview.audPartnerBenefit"],
      ["commercial.pluginsOverview.audDeveloper",    "commercial.pluginsOverview.audDeveloperBenefit"],
    ],
  },

  // ─── Security Guarantee ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pluginsOverview.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "commercial.pluginsOverview.securityIntro" },
  {
    type: "info",
    variant: "note",
    titleKey: "commercial.pluginsOverview.securityNoteTitle",
    contentKey: "commercial.pluginsOverview.securityNoteContent",
  },
];

registerPage({
  slug: "commercial/plugins-overview",
  titleKey: "commercial.pluginsOverview.title",
  descriptionKey: "commercial.pluginsOverview.description",
  category: "commercial-modules",
  order: 3,
  sections,
  lastUpdated: "2026-05-10",
});
