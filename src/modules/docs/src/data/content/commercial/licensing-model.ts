import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ───────────────────────────────────────────────────
  { type: "paragraph", contentKey: "commercial.licensingModel.intro" },

  // ─── Subscription Tiers ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.licensingModel.plansTitle",
    id: "subscription-plans",
  },
  {
    type: "table",
    headers: [
      "commercial.licensingModel.tblCompHeader1",
      "commercial.licensingModel.tblCompHeader2",
      "commercial.licensingModel.tblCompHeader3",
      "commercial.licensingModel.tblCompHeader4",
    ],
    rows: [
      [
        "commercial.licensingModel.tblCompR1C1",
        "commercial.licensingModel.tblCompR1C2",
        "commercial.licensingModel.tblCompR1C3",
        "commercial.licensingModel.tblCompR1C4",
      ],
      [
        "commercial.licensingModel.tblCompR2C1",
        "commercial.licensingModel.tblCompR2C2",
        "commercial.licensingModel.tblCompR2C3",
        "commercial.licensingModel.tblCompR2C4",
      ],
      [
        "commercial.licensingModel.tblCompR3C1",
        "commercial.licensingModel.tblCompR3C2",
        "commercial.licensingModel.tblCompR3C3",
        "commercial.licensingModel.tblCompR3C4",
      ],
      [
        "commercial.licensingModel.tblCompR4C1",
        "commercial.licensingModel.tblCompR4C2",
        "commercial.licensingModel.tblCompR4C3",
        "commercial.licensingModel.tblCompR4C4",
      ],
      [
        "commercial.licensingModel.tblCompR5C1",
        "commercial.licensingModel.tblCompR5C2",
        "commercial.licensingModel.tblCompR5C3",
        "commercial.licensingModel.tblCompR5C4",
      ],
      [
        "commercial.licensingModel.tblCompR6C1",
        "commercial.licensingModel.tblCompR6C2",
        "commercial.licensingModel.tblCompR6C3",
        "commercial.licensingModel.tblCompR6C4",
      ],
    ],
  },

  // ─── What's Included in Every Plan ──────────────────────────
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
        icon: "users",
        titleKey: "commercial.licensingModel.featUsers",
        descriptionKey: "commercial.licensingModel.featUsersDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.licensingModel.featSecurity",
        descriptionKey: "commercial.licensingModel.featSecurityDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.licensingModel.featAudit",
        descriptionKey: "commercial.licensingModel.featAuditDesc",
      },
      {
        icon: "layers",
        titleKey: "commercial.licensingModel.featModules",
        descriptionKey: "commercial.licensingModel.featModulesDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.licensingModel.featRealtime",
        descriptionKey: "commercial.licensingModel.featRealtimeDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.licensingModel.featI18n",
        descriptionKey: "commercial.licensingModel.featI18nDesc",
      },
    ],
  },

  // ─── Enterprise Add-ons ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.licensingModel.addonsTitle",
    id: "enterprise-addons",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.licensingModel.lstAddonsI1",
      "commercial.licensingModel.lstAddonsI2",
      "commercial.licensingModel.lstAddonsI3",
      "commercial.licensingModel.lstAddonsI4",
    ],
  },

  // ─── CTA ─────────────────────────────────────────────────────
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
