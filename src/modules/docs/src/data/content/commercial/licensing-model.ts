import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.licensingModel.intro" },

  // ─── Subscription Plans ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.licensingModel.plansTitle",
    id: "subscription-plans",
  },
  { type: "paragraph", contentKey: "commercial.licensingModel.plansIntro" },
  {
    type: "table",
    headers: [
      "commercial.licensingModel.tblPlansHeader1",
      "commercial.licensingModel.tblPlansHeader2",
      "commercial.licensingModel.tblPlansHeader3",
      "commercial.licensingModel.tblPlansHeader4",
      "commercial.licensingModel.tblPlansHeader5",
    ],
    rows: [
      [
        "commercial.licensingModel.tblPlansR1C1",
        "commercial.licensingModel.tblPlansR1C2",
        "commercial.licensingModel.tblPlansR1C3",
        "commercial.licensingModel.tblPlansR1C4",
        "commercial.licensingModel.tblPlansR1C5",
      ],
      [
        "commercial.licensingModel.tblPlansR2C1",
        "commercial.licensingModel.tblPlansR2C2",
        "commercial.licensingModel.tblPlansR2C3",
        "commercial.licensingModel.tblPlansR2C4",
        "commercial.licensingModel.tblPlansR2C5",
      ],
      [
        "commercial.licensingModel.tblPlansR3C1",
        "commercial.licensingModel.tblPlansR3C2",
        "commercial.licensingModel.tblPlansR3C3",
        "commercial.licensingModel.tblPlansR3C4",
        "commercial.licensingModel.tblPlansR3C5",
      ],
      [
        "commercial.licensingModel.tblPlansR4C1",
        "commercial.licensingModel.tblPlansR4C2",
        "commercial.licensingModel.tblPlansR4C3",
        "commercial.licensingModel.tblPlansR4C4",
        "commercial.licensingModel.tblPlansR4C5",
      ],
    ],
  },

  // ─── What's Included in Every Plan ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.licensingModel.includedTitle",
    id: "whats-included",
  },
  { type: "paragraph", contentKey: "commercial.licensingModel.includedContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "shield",
        titleKey: "commercial.licensingModel.featSecurity",
        descriptionKey: "commercial.licensingModel.featSecurityDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.licensingModel.featUsers",
        descriptionKey: "commercial.licensingModel.featUsersDesc",
      },
      {
        icon: "layers",
        titleKey: "commercial.licensingModel.featModules",
        descriptionKey: "commercial.licensingModel.featModulesDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.licensingModel.featI18n",
        descriptionKey: "commercial.licensingModel.featI18nDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.licensingModel.featRealtime",
        descriptionKey: "commercial.licensingModel.featRealtimeDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.licensingModel.featAudit",
        descriptionKey: "commercial.licensingModel.featAuditDesc",
      },
    ],
  },

  // ─── Plan Comparison ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.licensingModel.comparisonTitle",
    id: "comparison",
  },
  {
    type: "table",
    headers: [
      "commercial.licensingModel.tblCompHeader1",
      "commercial.licensingModel.tblCompHeader2",
      "commercial.licensingModel.tblCompHeader3",
      "commercial.licensingModel.tblCompHeader4",
      "commercial.licensingModel.tblCompHeader5",
    ],
    rows: [
      [
        "commercial.licensingModel.tblCompR1C1",
        "commercial.licensingModel.tblCompR1C2",
        "commercial.licensingModel.tblCompR1C3",
        "commercial.licensingModel.tblCompR1C4",
        "commercial.licensingModel.tblCompR1C5",
      ],
      [
        "commercial.licensingModel.tblCompR2C1",
        "commercial.licensingModel.tblCompR2C2",
        "commercial.licensingModel.tblCompR2C3",
        "commercial.licensingModel.tblCompR2C4",
        "commercial.licensingModel.tblCompR2C5",
      ],
      [
        "commercial.licensingModel.tblCompR3C1",
        "commercial.licensingModel.tblCompR3C2",
        "commercial.licensingModel.tblCompR3C3",
        "commercial.licensingModel.tblCompR3C4",
        "commercial.licensingModel.tblCompR3C5",
      ],
      [
        "commercial.licensingModel.tblCompR4C1",
        "commercial.licensingModel.tblCompR4C2",
        "commercial.licensingModel.tblCompR4C3",
        "commercial.licensingModel.tblCompR4C4",
        "commercial.licensingModel.tblCompR4C5",
      ],
      [
        "commercial.licensingModel.tblCompR5C1",
        "commercial.licensingModel.tblCompR5C2",
        "commercial.licensingModel.tblCompR5C3",
        "commercial.licensingModel.tblCompR5C4",
        "commercial.licensingModel.tblCompR5C5",
      ],
      [
        "commercial.licensingModel.tblCompR6C1",
        "commercial.licensingModel.tblCompR6C2",
        "commercial.licensingModel.tblCompR6C3",
        "commercial.licensingModel.tblCompR6C4",
        "commercial.licensingModel.tblCompR6C5",
      ],
      [
        "commercial.licensingModel.tblCompR7C1",
        "commercial.licensingModel.tblCompR7C2",
        "commercial.licensingModel.tblCompR7C3",
        "commercial.licensingModel.tblCompR7C4",
        "commercial.licensingModel.tblCompR7C5",
      ],
      [
        "commercial.licensingModel.tblCompR8C1",
        "commercial.licensingModel.tblCompR8C2",
        "commercial.licensingModel.tblCompR8C3",
        "commercial.licensingModel.tblCompR8C4",
        "commercial.licensingModel.tblCompR8C5",
      ],
      [
        "commercial.licensingModel.tblCompR9C1",
        "commercial.licensingModel.tblCompR9C2",
        "commercial.licensingModel.tblCompR9C3",
        "commercial.licensingModel.tblCompR9C4",
        "commercial.licensingModel.tblCompR9C5",
      ],
      [
        "commercial.licensingModel.tblCompR10C1",
        "commercial.licensingModel.tblCompR10C2",
        "commercial.licensingModel.tblCompR10C3",
        "commercial.licensingModel.tblCompR10C4",
        "commercial.licensingModel.tblCompR10C5",
      ],
    ],
  },

  // ─── Subscription Lifecycle ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.licensingModel.renewalTitle",
    id: "subscription-lifecycle",
  },
  { type: "paragraph", contentKey: "commercial.licensingModel.renewalContent" },
  {
    type: "flowchart",
    title: "Subscription Lifecycle",
    direction: "horizontal",
    nodes: [
      { id: "trial", label: "30-Day Free Trial", type: "default" },
      { id: "subscribe", label: "Choose Your Plan", type: "primary" },
      { id: "onboard", label: "Onboarding & Setup", type: "info" },
      { id: "grow", label: "Scale & Expand", type: "success" },
      { id: "upgrade", label: "Upgrade Anytime", type: "primary" },
    ],
    connections: [
      { from: "trial", to: "subscribe" },
      { from: "subscribe", to: "onboard" },
      { from: "onboard", to: "grow" },
      { from: "grow", to: "upgrade" },
    ],
  },

  // ─── Entitlements-Powered Plan Differentiation ──────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.licensingModel.entitlementsTitle",
    id: "how-plans-work",
  },
  { type: "paragraph", contentKey: "commercial.licensingModel.entitlementsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "layers",
        titleKey: "commercial.licensingModel.entEditions",
        descriptionKey: "commercial.licensingModel.entEditionsDesc",
      },
      {
        icon: "refresh-cw",
        titleKey: "commercial.licensingModel.entSubscriptions",
        descriptionKey: "commercial.licensingModel.entSubscriptionsDesc",
      },
      {
        icon: "sliders",
        titleKey: "commercial.licensingModel.entOverrides",
        descriptionKey: "commercial.licensingModel.entOverridesDesc",
      },
      {
        icon: "git-branch",
        titleKey: "commercial.licensingModel.entVersioning",
        descriptionKey: "commercial.licensingModel.entVersioningDesc",
      },
    ],
  },

  // ─── Terms ──────────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.licensingModel.termsTitle", id: "terms" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.licensingModel.lstTermsI1",
      "commercial.licensingModel.lstTermsI2",
      "commercial.licensingModel.lstTermsI3",
      "commercial.licensingModel.lstTermsI4",
      "commercial.licensingModel.lstTermsI5",
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.licensingModel.entitlementsTip" },
  { type: "info", variant: "tip", contentKey: "commercial.licensingModel.trialTip" },
];

registerPage({
  slug: "commercial/licensing-model",
  titleKey: "commercial.licensingModel.title",
  descriptionKey: "commercial.licensingModel.description",
  category: "commercial-pricing",
  order: 1,
  sections,
  relatedSlugs: ["commercial/roi-analysis", "commercial/support-plans"],
  lastUpdated: "2026-06-28",
});
