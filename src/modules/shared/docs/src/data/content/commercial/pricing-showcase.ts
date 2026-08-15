import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.pricingShowcase.intro" },

  // ═══ Subscription Tiers Overview ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pricingShowcase.tiersTitle",
    id: "subscription-tiers",
  },
  { type: "paragraph", contentKey: "commercial.pricingShowcase.tiersIntro" },

  // Starter
  {
    type: "heading",
    level: 3,
    titleKey: "commercial.pricingShowcase.starterTitle",
    id: "starter-plan",
  },
  { type: "paragraph", contentKey: "commercial.pricingShowcase.starterContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "users",
        titleKey: "commercial.pricingShowcase.starterUsers",
        descriptionKey: "commercial.pricingShowcase.starterUsersDesc",
      },
      {
        icon: "package",
        titleKey: "commercial.pricingShowcase.starterModules",
        descriptionKey: "commercial.pricingShowcase.starterModulesDesc",
      },
      {
        icon: "message-circle",
        titleKey: "commercial.pricingShowcase.starterSupport",
        descriptionKey: "commercial.pricingShowcase.starterSupportDesc",
      },
    ],
  },

  // Growth
  {
    type: "heading",
    level: 3,
    titleKey: "commercial.pricingShowcase.growthTitle",
    id: "growth-plan",
  },
  { type: "paragraph", contentKey: "commercial.pricingShowcase.growthContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "users",
        titleKey: "commercial.pricingShowcase.growthUsers",
        descriptionKey: "commercial.pricingShowcase.growthUsersDesc",
      },
      {
        icon: "package",
        titleKey: "commercial.pricingShowcase.growthModules",
        descriptionKey: "commercial.pricingShowcase.growthModulesDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.pricingShowcase.growthSupport",
        descriptionKey: "commercial.pricingShowcase.growthSupportDesc",
      },
      {
        icon: "palette",
        titleKey: "commercial.pricingShowcase.growthBranding",
        descriptionKey: "commercial.pricingShowcase.growthBrandingDesc",
      },
      {
        icon: "bar-chart-2",
        titleKey: "commercial.pricingShowcase.growthAnalytics",
        descriptionKey: "commercial.pricingShowcase.growthAnalyticsDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.pricingShowcase.growthDomain",
        descriptionKey: "commercial.pricingShowcase.growthDomainDesc",
      },
    ],
  },

  // Enterprise
  {
    type: "heading",
    level: 3,
    titleKey: "commercial.pricingShowcase.enterpriseTitle",
    id: "enterprise-plan",
  },
  { type: "paragraph", contentKey: "commercial.pricingShowcase.enterpriseContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "infinity",
        titleKey: "commercial.pricingShowcase.enterpriseUsers",
        descriptionKey: "commercial.pricingShowcase.enterpriseUsersDesc",
      },
      {
        icon: "layers",
        titleKey: "commercial.pricingShowcase.enterpriseModules",
        descriptionKey: "commercial.pricingShowcase.enterpriseModulesDesc",
      },
      {
        icon: "headphones",
        titleKey: "commercial.pricingShowcase.enterpriseSupport",
        descriptionKey: "commercial.pricingShowcase.enterpriseSupportDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.pricingShowcase.enterpriseSLA",
        descriptionKey: "commercial.pricingShowcase.enterpriseSLADesc",
      },
      {
        icon: "server",
        titleKey: "commercial.pricingShowcase.enterpriseOnPrem",
        descriptionKey: "commercial.pricingShowcase.enterpriseOnPremDesc",
      },
      {
        icon: "file-text",
        titleKey: "commercial.pricingShowcase.enterpriseCompliance",
        descriptionKey: "commercial.pricingShowcase.enterpriseComplianceDesc",
      },
    ],
  },

  // White-label
  {
    type: "heading",
    level: 3,
    titleKey: "commercial.pricingShowcase.whiteLabelTitle",
    id: "white-label-plan",
  },
  { type: "paragraph", contentKey: "commercial.pricingShowcase.whiteLabelContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "layout",
        titleKey: "commercial.pricingShowcase.wlBranding",
        descriptionKey: "commercial.pricingShowcase.wlBrandingDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.pricingShowcase.wlDomain",
        descriptionKey: "commercial.pricingShowcase.wlDomainDesc",
      },
      {
        icon: "dollar-sign",
        titleKey: "commercial.pricingShowcase.wlReseller",
        descriptionKey: "commercial.pricingShowcase.wlResellerDesc",
      },
      {
        icon: "tool",
        titleKey: "commercial.pricingShowcase.wlCustomDev",
        descriptionKey: "commercial.pricingShowcase.wlCustomDevDesc",
      },
    ],
  },

  // ═══ Comparison Table ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pricingShowcase.comparisonTitle",
    id: "plan-comparison",
  },
  { type: "paragraph", contentKey: "commercial.pricingShowcase.comparisonIntro" },
  {
    type: "table",
    headers: ["Feature", "Starter", "Growth", "Enterprise", "White-Label"],
    rows: [
      ["Users", "Up to 50", "Up to 200", "Unlimited", "Unlimited"],
      ["Modules", "3 core modules", "10 modules", "All modules", "All modules + custom"],
      ["Custom Branding", "Limited", "Full branding", "Full branding", "Complete white-label"],
      ["Custom Domain", "Not included", "Included", "Included", "Mandatory (own domain)"],
      ["SSO Integration", "Not included", "Optional add-on", "Included", "Included"],
      [
        "Support",
        "Community (email)",
        "Priority (24h SLA)",
        "Dedicated (4h SLA)",
        "White-glove + on-site",
      ],
      ["SLA Guarantee", "None", "99.5% uptime", "99.9% uptime", "99.99% uptime"],
      ["On-premise Option", "No", "No", "Yes", "Yes"],
      [
        "API Access",
        "Standard REST",
        "Full REST + Webhooks",
        "Full + Custom Endpoints",
        "Full + Embedded SDK",
      ],
      ["Audit Trail", "Basic", "Standard", "Advanced (4-source)", "Advanced + Forensic"],
      ["Compliance Reports", "Not included", "Basic", "GDPR, SOX, HIPAA", "Full compliance suite"],
      ["Reseller Rights", "No", "No", "No", "Yes (revenue share)"],
    ],
  },

  // ═══ FAQ ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.pricingShowcase.faqTitle",
    id: "pricing-faq",
  },
  { type: "paragraph", contentKey: "commercial.pricingShowcase.faqIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "commercial.pricingShowcase.faq1Q",
        contentKey: "commercial.pricingShowcase.faq1A",
      },
      {
        titleKey: "commercial.pricingShowcase.faq2Q",
        contentKey: "commercial.pricingShowcase.faq2A",
      },
      {
        titleKey: "commercial.pricingShowcase.faq3Q",
        contentKey: "commercial.pricingShowcase.faq3A",
      },
      {
        titleKey: "commercial.pricingShowcase.faq4Q",
        contentKey: "commercial.pricingShowcase.faq4A",
      },
      {
        titleKey: "commercial.pricingShowcase.faq5Q",
        contentKey: "commercial.pricingShowcase.faq5A",
      },
    ],
  },

  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.pricingShowcase.ctaTip",
  },
];

registerPage({
  slug: "commercial/pricing-showcase",
  titleKey: "commercial.pricingShowcase.title",
  descriptionKey: "commercial.pricingShowcase.description",
  category: "commercial-pricing",
  order: 10,
  sections,
  relatedSlugs: [
    "commercial/licensing-model",
    "commercial/roi-analysis",
    "commercial/support-plans",
  ],
  lastUpdated: "2026-06-28",
});
