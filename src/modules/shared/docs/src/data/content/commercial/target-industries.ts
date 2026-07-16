import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.targetIndustries.intro" },

  // ─── Enterprise SaaS ────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.targetIndustries.saasTitle", id: "saas" },
  { type: "paragraph", contentKey: "commercial.targetIndustries.saasContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "users",
        titleKey: "commercial.targetIndustries.saasMultiTenant",
        descriptionKey: "commercial.targetIndustries.saasMultiTenantDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.targetIndustries.saasScaling",
        descriptionKey: "commercial.targetIndustries.saasScalingDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.targetIndustries.saasWhiteLabel",
        descriptionKey: "commercial.targetIndustries.saasWhiteLabelDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.targetIndustries.saasAnalytics",
        descriptionKey: "commercial.targetIndustries.saasAnalyticsDesc",
      },
    ],
  },

  // ─── Government & Public Sector ─────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.targetIndustries.govTitle", id: "government" },
  { type: "paragraph", contentKey: "commercial.targetIndustries.govContent" },
  {
    type: "table",
    headers: [
      "commercial.targetIndustries.tblGovHeader1",
      "commercial.targetIndustries.tblGovHeader2",
    ],
    rows: [
      ["commercial.targetIndustries.tblGovR1C1", "commercial.targetIndustries.tblGovR1C2"],
      ["commercial.targetIndustries.tblGovR2C1", "commercial.targetIndustries.tblGovR2C2"],
      ["commercial.targetIndustries.tblGovR3C1", "commercial.targetIndustries.tblGovR3C2"],
      ["commercial.targetIndustries.tblGovR4C1", "commercial.targetIndustries.tblGovR4C2"],
      ["commercial.targetIndustries.tblGovR5C1", "commercial.targetIndustries.tblGovR5C2"],
      ["commercial.targetIndustries.tblGovR6C1", "commercial.targetIndustries.tblGovR6C2"],
    ],
  },

  // ─── Financial Services ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.targetIndustries.financeTitle",
    id: "finance",
  },
  { type: "paragraph", contentKey: "commercial.targetIndustries.financeContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.targetIndustries.lstFinI1",
      "commercial.targetIndustries.lstFinI2",
      "commercial.targetIndustries.lstFinI3",
      "commercial.targetIndustries.lstFinI4",
      "commercial.targetIndustries.lstFinI5",
      "commercial.targetIndustries.lstFinI6",
    ],
  },

  // ─── Healthcare ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.targetIndustries.healthcareTitle",
    id: "healthcare",
  },
  { type: "paragraph", contentKey: "commercial.targetIndustries.healthcareContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "shield",
        titleKey: "commercial.targetIndustries.healthSecurity",
        descriptionKey: "commercial.targetIndustries.healthSecurityDesc",
      },
      {
        icon: "building",
        titleKey: "commercial.targetIndustries.healthMultiSite",
        descriptionKey: "commercial.targetIndustries.healthMultiSiteDesc",
      },
    ],
  },

  // ─── MENA Region ────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.targetIndustries.menaTitle", id: "mena" },
  { type: "paragraph", contentKey: "commercial.targetIndustries.menaContent" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "commercial.targetIndustries.menaBuiltIn",
        variant: "positive",
        items: [
          "commercial.targetIndustries.compMenaI1Pos",
          "commercial.targetIndustries.compMenaI2Pos",
          "commercial.targetIndustries.compMenaI3Pos",
          "commercial.targetIndustries.compMenaI4Pos",
          "commercial.targetIndustries.compMenaI5Pos",
        ],
      },
      {
        titleKey: "commercial.targetIndustries.menaCompetitor",
        variant: "negative",
        items: [
          "commercial.targetIndustries.compMenaI1Neg",
          "commercial.targetIndustries.compMenaI2Neg",
          "commercial.targetIndustries.compMenaI3Neg",
          "commercial.targetIndustries.compMenaI4Neg",
          "commercial.targetIndustries.compMenaI5Neg",
        ],
      },
    ],
  },

  // ─── Education ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.targetIndustries.educationTitle",
    id: "education",
  },
  { type: "paragraph", contentKey: "commercial.targetIndustries.educationContent" },

  // ─── Retail & E-Commerce ────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.targetIndustries.retailTitle", id: "retail" },
  { type: "paragraph", contentKey: "commercial.targetIndustries.retailContent" },

  // ─── Industry Fit Matrix ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.targetIndustries.matrixTitle",
    id: "fit-matrix",
  },
  {
    type: "table",
    headers: [
      "commercial.targetIndustries.tblMatrixHeader1",
      "commercial.targetIndustries.tblMatrixHeader2",
      "commercial.targetIndustries.tblMatrixHeader3",
    ],
    rows: [
      [
        "commercial.targetIndustries.tblMatrixR1C1",
        "commercial.targetIndustries.tblMatrixR1C2",
        "commercial.targetIndustries.tblMatrixR1C3",
      ],
      [
        "commercial.targetIndustries.tblMatrixR2C1",
        "commercial.targetIndustries.tblMatrixR2C2",
        "commercial.targetIndustries.tblMatrixR2C3",
      ],
      [
        "commercial.targetIndustries.tblMatrixR3C1",
        "commercial.targetIndustries.tblMatrixR3C2",
        "commercial.targetIndustries.tblMatrixR3C3",
      ],
      [
        "commercial.targetIndustries.tblMatrixR4C1",
        "commercial.targetIndustries.tblMatrixR4C2",
        "commercial.targetIndustries.tblMatrixR4C3",
      ],
      [
        "commercial.targetIndustries.tblMatrixR5C1",
        "commercial.targetIndustries.tblMatrixR5C2",
        "commercial.targetIndustries.tblMatrixR5C3",
      ],
      [
        "commercial.targetIndustries.tblMatrixR6C1",
        "commercial.targetIndustries.tblMatrixR6C2",
        "commercial.targetIndustries.tblMatrixR6C3",
      ],
      [
        "commercial.targetIndustries.tblMatrixR7C1",
        "commercial.targetIndustries.tblMatrixR7C2",
        "commercial.targetIndustries.tblMatrixR7C3",
      ],
    ],
  },
];

registerPage({
  slug: "commercial/target-industries",
  titleKey: "commercial.targetIndustries.title",
  descriptionKey: "commercial.targetIndustries.description",
  category: "commercial-why-scripe",
  order: 3,
  sections,
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/competitive-advantages"],
  lastUpdated: "2026-02-20",
});
