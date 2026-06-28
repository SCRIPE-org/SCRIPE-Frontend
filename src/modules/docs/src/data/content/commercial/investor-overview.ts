import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.investorOverview.intro" },

  // ═══ Market Opportunity ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.investorOverview.marketTitle",
    id: "market-opportunity",
  },
  { type: "paragraph", contentKey: "commercial.investorOverview.marketContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "trending-up",
        titleKey: "commercial.investorOverview.marketTam",
        descriptionKey: "commercial.investorOverview.marketTamDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.investorOverview.marketTiming",
        descriptionKey: "commercial.investorOverview.marketTimingDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.investorOverview.marketMENA",
        descriptionKey: "commercial.investorOverview.marketMENADesc",
      },
    ],
  },
  {
    type: "table",
    headers: ["Metric", "Value", "Source / Context"],
    rows: [
      ["Global B2B SaaS Market Size (2025)", "$307 billion", "Gartner Enterprise Software Forecast"],
      ["CAGR (2024–2030)", "18.7%", "Grand View Research"],
      ["Enterprise Workflow Automation TAM", "$28 billion", "Forrester B2B Platform Report"],
      ["MENA SaaS Market Size (2025)", "$6.8 billion", "IDC Middle East SaaS Report"],
      ["Average Enterprise SaaS Contract Value", "$180K ARR", "Based on comparable platforms"],
      ["Time-to-Revenue Advantage vs. Building Custom", "9–15 months", "SCRIPE internal benchmark"],
    ],
  },

  // ═══ Revenue Model ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.investorOverview.revenueTitle",
    id: "revenue-model",
  },
  { type: "paragraph", contentKey: "commercial.investorOverview.revenueContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "refresh-cw",
        titleKey: "commercial.investorOverview.revSubscription",
        descriptionKey: "commercial.investorOverview.revSubscriptionDesc",
      },
      {
        icon: "briefcase",
        titleKey: "commercial.investorOverview.revEnterprise",
        descriptionKey: "commercial.investorOverview.revEnterpriseDesc",
      },
      {
        icon: "shopping-bag",
        titleKey: "commercial.investorOverview.revMarketplace",
        descriptionKey: "commercial.investorOverview.revMarketplaceDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.investorOverview.revPartner",
        descriptionKey: "commercial.investorOverview.revPartnerDesc",
      },
    ],
  },
  {
    type: "table",
    headers: ["Revenue Stream", "Model", "Projected Contribution (Year 3)"],
    rows: [
      ["Subscription Tiers (Starter / Growth / Enterprise)", "Monthly/Annual Recurring Revenue", "55%"],
      ["Enterprise Custom Contracts", "Annual contract + implementation fee", "25%"],
      ["Marketplace Revenue Share", "30% of partner plugin sales", "10%"],
      ["Training & Certification", "Per-seat online programs", "5%"],
      ["Professional Services", "Implementation & migration consulting", "5%"],
    ],
  },

  // ═══ Competitive Moat ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.investorOverview.moatTitle",
    id: "competitive-moat",
  },
  { type: "paragraph", contentKey: "commercial.investorOverview.moatContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "shield",
        titleKey: "commercial.investorOverview.moatArchitecture",
        descriptionKey: "commercial.investorOverview.moatArchitectureDesc",
      },
      {
        icon: "layers",
        titleKey: "commercial.investorOverview.moatB2B2C",
        descriptionKey: "commercial.investorOverview.moatB2B2CDesc",
      },
      {
        icon: "terminal",
        titleKey: "commercial.investorOverview.moatCLI",
        descriptionKey: "commercial.investorOverview.moatCLIDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.investorOverview.moatRTL",
        descriptionKey: "commercial.investorOverview.moatRTLDesc",
      },
      {
        icon: "database",
        titleKey: "commercial.investorOverview.moatMultiDB",
        descriptionKey: "commercial.investorOverview.moatMultiDBDesc",
      },
      {
        icon: "lock",
        titleKey: "commercial.investorOverview.moatSecurity",
        descriptionKey: "commercial.investorOverview.moatSecurityDesc",
      },
    ],
  },

  // ═══ Competitive Landscape ═══
  {
    type: "heading",
    level: 3,
    titleKey: "commercial.investorOverview.landscapeTitle",
    id: "competitive-landscape",
  },
  {
    type: "table",
    headers: ["Competitor Type", "Their Weakness", "SCRIPE Advantage"],
    rows: [
      ["Traditional ERP (SAP, Oracle)", "Rigid, expensive, 18-month implementations", "Full source code, deploy in days, no per-seat fees"],
      ["Low-code platforms (Mendix, OutSystems)", "Cannot handle enterprise-grade clean architecture", "Full code ownership, no runtime lock-in"],
      ["Generic SaaS starters (boilerplates)", "No B2B2C model, no multi-tenant hierarchy", "Purpose-built B2B2C with hierarchical tenancy"],
      ["Custom-built platforms", "12–18 months + $300K+ to reach SCRIPE's baseline", "Day 1 production readiness"],
      ["Open-source ERPs (Odoo, ERPNext)", "No SaaS subscription model, poor developer UX", "Modern TypeScript + .NET 10, CLI-first DX"],
    ],
  },

  // ═══ Investment Thesis ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.investorOverview.thesisTitle",
    id: "investment-thesis",
  },
  { type: "paragraph", contentKey: "commercial.investorOverview.thesisContent" },
  {
    type: "list",
    variant: "ordered",
    items: [
      "B2B SaaS market is growing at 18.7% CAGR — SCRIPE captures the underserved mid-market segment",
      "No other platform offers B2B2C subscription management with this level of architectural quality",
      "Recurring revenue model ensures predictable ARR growth with low churn (architecture moat creates switching costs)",
      "MENA market represents an untapped $6.8B opportunity with first-mover native Arabic RTL advantage",
      "Modular marketplace creates a platform flywheel: more partners build modules, more customers subscribe",
      "Lean team structure enabled by CLI automation — scales revenue without proportional headcount growth",
    ],
  },

  // ═══ Team & Vision ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.investorOverview.teamTitle",
    id: "team-vision",
  },
  { type: "paragraph", contentKey: "commercial.investorOverview.teamContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "code",
        titleKey: "commercial.investorOverview.teamEngineering",
        descriptionKey: "commercial.investorOverview.teamEngineeringDesc",
      },
      {
        icon: "target",
        titleKey: "commercial.investorOverview.teamProduct",
        descriptionKey: "commercial.investorOverview.teamProductDesc",
      },
      {
        icon: "trending-up",
        titleKey: "commercial.investorOverview.teamGTM",
        descriptionKey: "commercial.investorOverview.teamGTMDesc",
      },
    ],
  },

  // ═══ CTA ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.investorOverview.ctaTitle",
    id: "next-steps",
  },
  { type: "paragraph", contentKey: "commercial.investorOverview.ctaContent" },
  {
    type: "info",
    variant: "success",
    contentKey: "commercial.investorOverview.ctaTip",
  },
];

registerPage({
  slug: "commercial/investor-overview",
  titleKey: "commercial.investorOverview.title",
  descriptionKey: "commercial.investorOverview.description",
  category: "commercial-pricing",
  order: 11,
  sections,
  relatedSlugs: ["commercial/roi-analysis", "commercial/pricing-showcase", "commercial/competitive-advantages"],
  lastUpdated: "2026-06-28",
});
