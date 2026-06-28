import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.coFounderJourney.intro" },

  // ─── What Does Co-Founding SCRIPE Mean? ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.coFounderJourney.meaningTitle",
    id: "what-it-means",
  },
  { type: "paragraph", contentKey: "commercial.coFounderJourney.meaningContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "target",
        titleKey: "commercial.coFounderJourney.featVision",
        descriptionKey: "commercial.coFounderJourney.featVisionDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.coFounderJourney.featEquity",
        descriptionKey: "commercial.coFounderJourney.featEquityDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.coFounderJourney.featDecisions",
        descriptionKey: "commercial.coFounderJourney.featDecisionsDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.coFounderJourney.featGrowth",
        descriptionKey: "commercial.coFounderJourney.featGrowthDesc",
      },
    ],
  },

  // ─── Market Opportunity ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.coFounderJourney.marketTitle",
    id: "market-opportunity",
  },
  { type: "paragraph", contentKey: "commercial.coFounderJourney.marketContent" },
  {
    type: "table",
    headers: [
      "commercial.coFounderJourney.tblMarketHeader1",
      "commercial.coFounderJourney.tblMarketHeader2",
      "commercial.coFounderJourney.tblMarketHeader3",
    ],
    rows: [
      [
        "commercial.coFounderJourney.tblMarketR1C1",
        "commercial.coFounderJourney.tblMarketR1C2",
        "commercial.coFounderJourney.tblMarketR1C3",
      ],
      [
        "commercial.coFounderJourney.tblMarketR2C1",
        "commercial.coFounderJourney.tblMarketR2C2",
        "commercial.coFounderJourney.tblMarketR2C3",
      ],
      [
        "commercial.coFounderJourney.tblMarketR3C1",
        "commercial.coFounderJourney.tblMarketR3C2",
        "commercial.coFounderJourney.tblMarketR3C3",
      ],
    ],
  },

  // ─── Co-Founder Roles We're Looking For ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.coFounderJourney.rolesTitle",
    id: "roles",
  },
  { type: "paragraph", contentKey: "commercial.coFounderJourney.rolesContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "trending-up",
        titleKey: "commercial.coFounderJourney.roleGrowth",
        descriptionKey: "commercial.coFounderJourney.roleGrowthDesc",
      },
      {
        icon: "briefcase",
        titleKey: "commercial.coFounderJourney.roleProduct",
        descriptionKey: "commercial.coFounderJourney.roleProductDesc",
      },
      {
        icon: "dollar-sign",
        titleKey: "commercial.coFounderJourney.roleRevenue",
        descriptionKey: "commercial.coFounderJourney.roleRevenueDesc",
      },
    ],
  },

  // ─── The Journey to Co-Founding ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.coFounderJourney.pathwayTitle",
    id: "pathway",
  },
  {
    type: "flowchart",
    title: "Pathway to Co-Founding SCRIPE",
    direction: "vertical",
    nodes: [
      { id: "intro", label: "Initial Discovery Call", type: "default" },
      { id: "align", label: "Vision & Values Alignment", type: "primary" },
      { id: "pilot", label: "3-Month Trial Collaboration", type: "info" },
      { id: "negotiate", label: "Term Sheet & Equity Negotiation", type: "default" },
      { id: "cofounder", label: "Officially Co-Founder", type: "success" },
    ],
    connections: [
      { from: "intro", to: "align" },
      { from: "align", to: "pilot" },
      { from: "pilot", to: "negotiate" },
      { from: "negotiate", to: "cofounder" },
    ],
  },

  // ─── What You Get ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.coFounderJourney.benefitsTitle",
    id: "benefits",
  },
  { type: "paragraph", contentKey: "commercial.coFounderJourney.benefitsContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.coFounderJourney.benefit1",
      "commercial.coFounderJourney.benefit2",
      "commercial.coFounderJourney.benefit3",
      "commercial.coFounderJourney.benefit4",
      "commercial.coFounderJourney.benefit5",
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.coFounderJourney.callToAction" },
];

registerPage({
  slug: "commercial/co-founder-journey",
  titleKey: "commercial.coFounderJourney.title",
  descriptionKey: "commercial.coFounderJourney.description",
  category: "commercial-pricing",
  order: 12,
  sections,
  relatedSlugs: ["commercial/investor-overview", "commercial/partner-journey"],
  lastUpdated: "2026-06-28",
});
