import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.competitiveAdvantages.intro" },

  // ─── Architecture Advantage ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.competitiveAdvantages.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "commercial.competitiveAdvantages.architectureContent" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "commercial.competitiveAdvantages.uisApproach",
        variant: "positive",
        items: [
          "commercial.competitiveAdvantages.compUISI1",
          "commercial.competitiveAdvantages.compUISI2",
          "commercial.competitiveAdvantages.compUISI3",
          "commercial.competitiveAdvantages.compUISI4",
          "commercial.competitiveAdvantages.compUISI5",
        ],
      },
      {
        titleKey: "commercial.competitiveAdvantages.traditionalApproach",
        variant: "negative",
        items: [
          "commercial.competitiveAdvantages.compTradI1",
          "commercial.competitiveAdvantages.compTradI2",
          "commercial.competitiveAdvantages.compTradI3",
          "commercial.competitiveAdvantages.compTradI4",
          "commercial.competitiveAdvantages.compTradI5",
        ],
      },
    ],
  },

  // ─── Database Freedom ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.competitiveAdvantages.databaseTitle",
    id: "database-freedom",
  },
  { type: "paragraph", contentKey: "commercial.competitiveAdvantages.databaseContent" },
  {
    type: "table",
    headers: [
      "commercial.competitiveAdvantages.tblDbHeader1",
      "commercial.competitiveAdvantages.tblDbHeader2",
      "commercial.competitiveAdvantages.tblDbHeader3",
    ],
    rows: [
      [
        "commercial.competitiveAdvantages.tblDbR1C1",
        "commercial.competitiveAdvantages.tblDbR1C2",
        "commercial.competitiveAdvantages.tblDbR1C3",
      ],
      [
        "commercial.competitiveAdvantages.tblDbR2C1",
        "commercial.competitiveAdvantages.tblDbR2C2",
        "commercial.competitiveAdvantages.tblDbR2C3",
      ],
      [
        "commercial.competitiveAdvantages.tblDbR3C1",
        "commercial.competitiveAdvantages.tblDbR3C2",
        "commercial.competitiveAdvantages.tblDbR3C3",
      ],
      [
        "commercial.competitiveAdvantages.tblDbR4C1",
        "commercial.competitiveAdvantages.tblDbR4C2",
        "commercial.competitiveAdvantages.tblDbR4C3",
      ],
    ],
  },

  // ─── 8-Layer Security ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.competitiveAdvantages.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "commercial.competitiveAdvantages.securityContent" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "commercial.competitiveAdvantages.flowSecTitle",
    nodes: [
      { id: "l1", label: "commercial.competitiveAdvantages.flowSecN1", type: "default" },
      { id: "l2", label: "commercial.competitiveAdvantages.flowSecN2", type: "info" },
      { id: "l3", label: "commercial.competitiveAdvantages.flowSecN3", type: "primary" },
      { id: "l4", label: "commercial.competitiveAdvantages.flowSecN4", type: "primary" },
      { id: "l5", label: "commercial.competitiveAdvantages.flowSecN5", type: "warning" },
      { id: "l6", label: "commercial.competitiveAdvantages.flowSecN6", type: "warning" },
      { id: "l7", label: "commercial.competitiveAdvantages.flowSecN7", type: "success" },
      { id: "l8", label: "commercial.competitiveAdvantages.flowSecN8", type: "danger" },
    ],
    connections: [
      { from: "l1", to: "l2" },
      { from: "l2", to: "l3" },
      { from: "l3", to: "l4" },
      { from: "l4", to: "l5" },
      { from: "l5", to: "l6" },
      { from: "l6", to: "l7" },
      { from: "l7", to: "l8" },
    ],
  },

  // ─── Multi-Tenancy ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.competitiveAdvantages.tenancyTitle",
    id: "multi-tenancy",
  },
  { type: "paragraph", contentKey: "commercial.competitiveAdvantages.tenancyContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "shield",
        titleKey: "commercial.competitiveAdvantages.tenantIsolation",
        descriptionKey: "commercial.competitiveAdvantages.tenantIsolationDesc",
      },
      {
        icon: "building",
        titleKey: "commercial.competitiveAdvantages.tenantHierarchy",
        descriptionKey: "commercial.competitiveAdvantages.tenantHierarchyDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.competitiveAdvantages.tenantBranding",
        descriptionKey: "commercial.competitiveAdvantages.tenantBrandingDesc",
      },
    ],
  },

  // ─── Developer Productivity ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.competitiveAdvantages.productivityTitle",
    id: "productivity",
  },
  { type: "paragraph", contentKey: "commercial.competitiveAdvantages.productivityContent" },
  {
    type: "table",
    headers: [
      "commercial.competitiveAdvantages.tblProdHeader1",
      "commercial.competitiveAdvantages.tblProdHeader2",
    ],
    rows: [
      [
        "commercial.competitiveAdvantages.tblProdR1C1",
        "commercial.competitiveAdvantages.tblProdR1C2",
      ],
      [
        "commercial.competitiveAdvantages.tblProdR2C1",
        "commercial.competitiveAdvantages.tblProdR2C2",
      ],
      [
        "commercial.competitiveAdvantages.tblProdR3C1",
        "commercial.competitiveAdvantages.tblProdR3C2",
      ],
      [
        "commercial.competitiveAdvantages.tblProdR4C1",
        "commercial.competitiveAdvantages.tblProdR4C2",
      ],
      [
        "commercial.competitiveAdvantages.tblProdR5C1",
        "commercial.competitiveAdvantages.tblProdR5C2",
      ],
      [
        "commercial.competitiveAdvantages.tblProdR6C1",
        "commercial.competitiveAdvantages.tblProdR6C2",
      ],
    ],
  },

  // ─── Competitive Comparison ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.competitiveAdvantages.comparisonTitle",
    id: "comparison",
  },
  {
    type: "table",
    headers: [
      "commercial.competitiveAdvantages.tblCompHeader1",
      "commercial.competitiveAdvantages.tblCompHeader2",
      "commercial.competitiveAdvantages.tblCompHeader3",
      "commercial.competitiveAdvantages.tblCompHeader4",
    ],
    rows: [
      [
        "commercial.competitiveAdvantages.tblCompR1C1",
        "commercial.competitiveAdvantages.tblCompR1C2",
        "commercial.competitiveAdvantages.tblCompR1C3",
        "commercial.competitiveAdvantages.tblCompR1C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR2C1",
        "commercial.competitiveAdvantages.tblCompR2C2",
        "commercial.competitiveAdvantages.tblCompR2C3",
        "commercial.competitiveAdvantages.tblCompR2C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR3C1",
        "commercial.competitiveAdvantages.tblCompR3C2",
        "commercial.competitiveAdvantages.tblCompR3C3",
        "commercial.competitiveAdvantages.tblCompR3C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR4C1",
        "commercial.competitiveAdvantages.tblCompR4C2",
        "commercial.competitiveAdvantages.tblCompR4C3",
        "commercial.competitiveAdvantages.tblCompR4C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR5C1",
        "commercial.competitiveAdvantages.tblCompR5C2",
        "commercial.competitiveAdvantages.tblCompR5C3",
        "commercial.competitiveAdvantages.tblCompR5C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR6C1",
        "commercial.competitiveAdvantages.tblCompR6C2",
        "commercial.competitiveAdvantages.tblCompR6C3",
        "commercial.competitiveAdvantages.tblCompR6C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR7C1",
        "commercial.competitiveAdvantages.tblCompR7C2",
        "commercial.competitiveAdvantages.tblCompR7C3",
        "commercial.competitiveAdvantages.tblCompR7C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR8C1",
        "commercial.competitiveAdvantages.tblCompR8C2",
        "commercial.competitiveAdvantages.tblCompR8C3",
        "commercial.competitiveAdvantages.tblCompR8C4",
      ],
      [
        "commercial.competitiveAdvantages.tblCompR9C1",
        "commercial.competitiveAdvantages.tblCompR9C2",
        "commercial.competitiveAdvantages.tblCompR9C3",
        "commercial.competitiveAdvantages.tblCompR9C4",
      ],
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.competitiveAdvantages.evaluationTip" },
];

registerPage({
  slug: "commercial/competitive-advantages",
  titleKey: "commercial.competitiveAdvantages.title",
  descriptionKey: "commercial.competitiveAdvantages.description",
  category: "commercial-why-scripe",
  order: 2,
  sections,
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/target-industries"],
  lastUpdated: "2026-02-20",
});
