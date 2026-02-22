import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.intro" },

      // ─── Custom Module Development ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.customTitle", id: "custom-modules" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.customContent" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "building", titleKey: "commercial.enterpriseAddons.customDev", descriptionKey: "commercial.enterpriseAddons.customDevDesc" },
                  { icon: "zap", titleKey: "commercial.enterpriseAddons.priorityFeature", descriptionKey: "commercial.enterpriseAddons.priorityFeatureDesc" },
                  { icon: "users", titleKey: "commercial.enterpriseAddons.training", descriptionKey: "commercial.enterpriseAddons.trainingDesc" },
                  { icon: "shield", titleKey: "commercial.enterpriseAddons.securityAudit", descriptionKey: "commercial.enterpriseAddons.securityAuditDesc" },
            ],
      },

      // ─── Migration Services ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.migrationTitle", id: "migration" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.migrationIntro" },
      {
            type: "table",
            headers: [
                  "commercial.enterpriseAddons.tblMigHeader1",
                  "commercial.enterpriseAddons.tblMigHeader2",
                  "commercial.enterpriseAddons.tblMigHeader3"
            ],
            rows: [
                  ["commercial.enterpriseAddons.tblMigR1C1", "commercial.enterpriseAddons.tblMigR1C2", "commercial.enterpriseAddons.tblMigR1C3"],
                  ["commercial.enterpriseAddons.tblMigR2C1", "commercial.enterpriseAddons.tblMigR2C2", "commercial.enterpriseAddons.tblMigR2C3"],
                  ["commercial.enterpriseAddons.tblMigR3C1", "commercial.enterpriseAddons.tblMigR3C2", "commercial.enterpriseAddons.tblMigR3C3"],
                  ["commercial.enterpriseAddons.tblMigR4C1", "commercial.enterpriseAddons.tblMigR4C2", "commercial.enterpriseAddons.tblMigR4C3"],
                  ["commercial.enterpriseAddons.tblMigR5C1", "commercial.enterpriseAddons.tblMigR5C2", "commercial.enterpriseAddons.tblMigR5C3"],
                  ["commercial.enterpriseAddons.tblMigR6C1", "commercial.enterpriseAddons.tblMigR6C2", "commercial.enterpriseAddons.tblMigR6C3"],
            ],
      },

      // ─── Advanced Integration Services ──────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.integrationTitle", id: "integrations" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.integrationContent" },
      {
            type: "table",
            headers: [
                  "commercial.enterpriseAddons.tblIntHeader1",
                  "commercial.enterpriseAddons.tblIntHeader2",
                  "commercial.enterpriseAddons.tblIntHeader3"
            ],
            rows: [
                  ["commercial.enterpriseAddons.tblIntR1C1", "commercial.enterpriseAddons.tblIntR1C2", "commercial.enterpriseAddons.tblIntR1C3"],
                  ["commercial.enterpriseAddons.tblIntR2C1", "commercial.enterpriseAddons.tblIntR2C2", "commercial.enterpriseAddons.tblIntR2C3"],
                  ["commercial.enterpriseAddons.tblIntR3C1", "commercial.enterpriseAddons.tblIntR3C2", "commercial.enterpriseAddons.tblIntR3C3"],
                  ["commercial.enterpriseAddons.tblIntR4C1", "commercial.enterpriseAddons.tblIntR4C2", "commercial.enterpriseAddons.tblIntR4C3"],
                  ["commercial.enterpriseAddons.tblIntR5C1", "commercial.enterpriseAddons.tblIntR5C2", "commercial.enterpriseAddons.tblIntR5C3"],
                  ["commercial.enterpriseAddons.tblIntR6C1", "commercial.enterpriseAddons.tblIntR6C2", "commercial.enterpriseAddons.tblIntR6C3"],
            ],
      },

      // ─── Engagement Process ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.processTitle", id: "process" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.enterpriseAddons.step1Title", contentKey: "commercial.enterpriseAddons.step1Content" },
                  { titleKey: "commercial.enterpriseAddons.step2Title", contentKey: "commercial.enterpriseAddons.step2Content" },
                  { titleKey: "commercial.enterpriseAddons.step3Title", contentKey: "commercial.enterpriseAddons.step3Content" },
                  { titleKey: "commercial.enterpriseAddons.step4Title", contentKey: "commercial.enterpriseAddons.step4Content" },
                  { titleKey: "commercial.enterpriseAddons.step5Title", contentKey: "commercial.enterpriseAddons.step5Content" },
            ],
      },

      // ─── Pricing Model ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.pricingTitle", id: "pricing" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.pricingContent" },
      {
            type: "table",
            headers: [
                  "commercial.enterpriseAddons.tblPriceHeader1",
                  "commercial.enterpriseAddons.tblPriceHeader2",
                  "commercial.enterpriseAddons.tblPriceHeader3"
            ],
            rows: [
                  ["commercial.enterpriseAddons.tblPriceR1C1", "commercial.enterpriseAddons.tblPriceR1C2", "commercial.enterpriseAddons.tblPriceR1C3"],
                  ["commercial.enterpriseAddons.tblPriceR2C1", "commercial.enterpriseAddons.tblPriceR2C2", "commercial.enterpriseAddons.tblPriceR2C3"],
                  ["commercial.enterpriseAddons.tblPriceR3C1", "commercial.enterpriseAddons.tblPriceR3C2", "commercial.enterpriseAddons.tblPriceR3C3"],
                  ["commercial.enterpriseAddons.tblPriceR4C1", "commercial.enterpriseAddons.tblPriceR4C2", "commercial.enterpriseAddons.tblPriceR4C3"],
                  ["commercial.enterpriseAddons.tblPriceR5C1", "commercial.enterpriseAddons.tblPriceR5C2", "commercial.enterpriseAddons.tblPriceR5C3"],
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.enterpriseAddons.contactNote" },
];

registerPage({
      slug: "commercial/enterprise-addons",
      titleKey: "commercial.enterpriseAddons.title",
      descriptionKey: "commercial.enterpriseAddons.description",
      category: "commercial-pricing",
      order: 4,
      sections,
      relatedSlugs: ["commercial/support-plans", "commercial/licensing-model"],
      lastUpdated: "2026-02-20",
});
