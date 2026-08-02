import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────────
  { type: "paragraph", contentKey: "commercial.marketplaceShowcase.intro" },

  // ─── What Is the Marketplace ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplaceShowcase.whatIsTitle",
    id: "what-is-marketplace",
  },
  { type: "paragraph", contentKey: "commercial.marketplaceShowcase.whatIsContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "grid",
        titleKey: "commercial.marketplaceShowcase.featCategories",
        descriptionKey: "commercial.marketplaceShowcase.featCategoriesDesc",
      },
      {
        icon: "download",
        titleKey: "commercial.marketplaceShowcase.featOneClick",
        descriptionKey: "commercial.marketplaceShowcase.featOneClickDesc",
      },
      {
        icon: "box",
        titleKey: "commercial.marketplaceShowcase.featSandbox",
        descriptionKey: "commercial.marketplaceShowcase.featSandboxDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.marketplaceShowcase.featPartners",
        descriptionKey: "commercial.marketplaceShowcase.featPartnersDesc",
      },
    ],
  },

  // ─── Module Catalog ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplaceShowcase.catalogTitle",
    id: "module-catalog",
  },
  { type: "paragraph", contentKey: "commercial.marketplaceShowcase.catalogContent" },
  {
    type: "table",
    headers: [
      "commercial.marketplaceShowcase.tblCatH1",
      "commercial.marketplaceShowcase.tblCatH2",
      "commercial.marketplaceShowcase.tblCatH3",
      "commercial.marketplaceShowcase.tblCatH4",
    ],
    rows: [
      [
        "commercial.marketplaceShowcase.tblCatR1C1",
        "commercial.marketplaceShowcase.tblCatR1C2",
        "commercial.marketplaceShowcase.tblCatR1C3",
        "commercial.marketplaceShowcase.tblCatR1C4",
      ],
      [
        "commercial.marketplaceShowcase.tblCatR2C1",
        "commercial.marketplaceShowcase.tblCatR2C2",
        "commercial.marketplaceShowcase.tblCatR2C3",
        "commercial.marketplaceShowcase.tblCatR2C4",
      ],
      [
        "commercial.marketplaceShowcase.tblCatR3C1",
        "commercial.marketplaceShowcase.tblCatR3C2",
        "commercial.marketplaceShowcase.tblCatR3C3",
        "commercial.marketplaceShowcase.tblCatR3C4",
      ],
      [
        "commercial.marketplaceShowcase.tblCatR4C1",
        "commercial.marketplaceShowcase.tblCatR4C2",
        "commercial.marketplaceShowcase.tblCatR4C3",
        "commercial.marketplaceShowcase.tblCatR4C4",
      ],
      [
        "commercial.marketplaceShowcase.tblCatR5C1",
        "commercial.marketplaceShowcase.tblCatR5C2",
        "commercial.marketplaceShowcase.tblCatR5C3",
        "commercial.marketplaceShowcase.tblCatR5C4",
      ],
      [
        "commercial.marketplaceShowcase.tblCatR6C1",
        "commercial.marketplaceShowcase.tblCatR6C2",
        "commercial.marketplaceShowcase.tblCatR6C3",
        "commercial.marketplaceShowcase.tblCatR6C4",
      ],
      [
        "commercial.marketplaceShowcase.tblCatR7C1",
        "commercial.marketplaceShowcase.tblCatR7C2",
        "commercial.marketplaceShowcase.tblCatR7C3",
        "commercial.marketplaceShowcase.tblCatR7C4",
      ],
      [
        "commercial.marketplaceShowcase.tblCatR8C1",
        "commercial.marketplaceShowcase.tblCatR8C2",
        "commercial.marketplaceShowcase.tblCatR8C3",
        "commercial.marketplaceShowcase.tblCatR8C4",
      ],
    ],
  },

  // ─── How It Works ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplaceShowcase.howItWorksTitle",
    id: "how-it-works",
  },
  { type: "paragraph", contentKey: "commercial.marketplaceShowcase.howItWorksContent" },
  {
    type: "flowchart",
    title: "Module Installation Journey",
    direction: "vertical",
    nodes: [
      { id: "n1", label: "Browse the Marketplace in your workspace", type: "default" },
      { id: "n2", label: "Preview the module — features, screenshots, reviews", type: "default" },
      { id: "n3", label: "Click Install (included or add-on pricing)", type: "default" },
      { id: "n4", label: "Module activates in your workspace instantly", type: "default" },
      { id: "n5", label: "Assign permissions to your team members", type: "default" },
      { id: "n6", label: "Your team is live with the new capability", type: "success" },
    ],
    connections: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n4" },
      { from: "n4", to: "n5" },
      { from: "n5", to: "n6" },
    ],
  },

  // ─── Revenue Model ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplaceShowcase.pricingTitle",
    id: "pricing-model",
  },
  { type: "paragraph", contentKey: "commercial.marketplaceShowcase.pricingContent" },
  {
    type: "table",
    headers: [
      "commercial.marketplaceShowcase.tblPricingH1",
      "commercial.marketplaceShowcase.tblPricingH2",
      "commercial.marketplaceShowcase.tblPricingH3",
    ],
    rows: [
      [
        "commercial.marketplaceShowcase.tblPricingR1C1",
        "commercial.marketplaceShowcase.tblPricingR1C2",
        "commercial.marketplaceShowcase.tblPricingR1C3",
      ],
      [
        "commercial.marketplaceShowcase.tblPricingR2C1",
        "commercial.marketplaceShowcase.tblPricingR2C2",
        "commercial.marketplaceShowcase.tblPricingR2C3",
      ],
      [
        "commercial.marketplaceShowcase.tblPricingR3C1",
        "commercial.marketplaceShowcase.tblPricingR3C2",
        "commercial.marketplaceShowcase.tblPricingR3C3",
      ],
    ],
  },

  // ─── FAQ ──────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplaceShowcase.faqTitle",
    id: "faq",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.marketplaceShowcase.faqItem1",
      "commercial.marketplaceShowcase.faqItem2",
      "commercial.marketplaceShowcase.faqItem3",
      "commercial.marketplaceShowcase.faqItem4",
      "commercial.marketplaceShowcase.faqItem5",
    ],
  },

  // ─── Tips ─────────────────────────────────────────────────────
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.marketplaceShowcase.browseTip",
  },
  {
    type: "info",
    variant: "note",
    contentKey: "commercial.marketplaceShowcase.partnerNote",
  },
];

registerPage({
  slug: "commercial/marketplace-showcase",
  titleKey: "commercial.marketplaceShowcase.title",
  descriptionKey: "commercial.marketplaceShowcase.description",
  category: "commercial-why-scripe",
  order: 12,
  sections,
  relatedSlugs: [
    "commercial/why-scripe-overview",
    "commercial/enterprise-addons",
    "commercial/module-catalog",
  ],
  lastUpdated: "2026-06-28",
});
