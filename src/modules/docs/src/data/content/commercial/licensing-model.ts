import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.licensingModel.intro" },

      // ─── License Types ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.licensingModel.typesTitle", id: "license-types" },
      { type: "paragraph", contentKey: "commercial.licensingModel.typesIntro" },
      {
            type: "table",
            headers: [
                  "commercial.licensingModel.tblTypesHeader1",
                  "commercial.licensingModel.tblTypesHeader2",
                  "commercial.licensingModel.tblTypesHeader3"
            ],
            rows: [
                  ["commercial.licensingModel.tblTypesR1C1", "commercial.licensingModel.tblTypesR1C2", "commercial.licensingModel.tblTypesR1C3"],
                  ["commercial.licensingModel.tblTypesR2C1", "commercial.licensingModel.tblTypesR2C2", "commercial.licensingModel.tblTypesR2C3"],
                  ["commercial.licensingModel.tblTypesR3C1", "commercial.licensingModel.tblTypesR3C2", "commercial.licensingModel.tblTypesR3C3"],
                  ["commercial.licensingModel.tblTypesR4C1", "commercial.licensingModel.tblTypesR4C2", "commercial.licensingModel.tblTypesR4C3"],
            ],
      },

      // ─── Feature Comparison ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.licensingModel.comparisonTitle", id: "comparison" },
      {
            type: "table",
            headers: [
                  "commercial.licensingModel.tblCompHeader1",
                  "commercial.licensingModel.tblCompHeader2",
                  "commercial.licensingModel.tblCompHeader3",
                  "commercial.licensingModel.tblCompHeader4",
                  "commercial.licensingModel.tblCompHeader5"
            ],
            rows: [
                  ["commercial.licensingModel.tblCompR1C1", "commercial.licensingModel.tblCompR1C2", "commercial.licensingModel.tblCompR1C3", "commercial.licensingModel.tblCompR1C4", "commercial.licensingModel.tblCompR1C5"],
                  ["commercial.licensingModel.tblCompR2C1", "commercial.licensingModel.tblCompR2C2", "commercial.licensingModel.tblCompR2C3", "commercial.licensingModel.tblCompR2C4", "commercial.licensingModel.tblCompR2C5"],
                  ["commercial.licensingModel.tblCompR3C1", "commercial.licensingModel.tblCompR3C2", "commercial.licensingModel.tblCompR3C3", "commercial.licensingModel.tblCompR3C4", "commercial.licensingModel.tblCompR3C5"],
                  ["commercial.licensingModel.tblCompR4C1", "commercial.licensingModel.tblCompR4C2", "commercial.licensingModel.tblCompR4C3", "commercial.licensingModel.tblCompR4C4", "commercial.licensingModel.tblCompR4C5"],
                  ["commercial.licensingModel.tblCompR5C1", "commercial.licensingModel.tblCompR5C2", "commercial.licensingModel.tblCompR5C3", "commercial.licensingModel.tblCompR5C4", "commercial.licensingModel.tblCompR5C5"],
                  ["commercial.licensingModel.tblCompR6C1", "commercial.licensingModel.tblCompR6C2", "commercial.licensingModel.tblCompR6C3", "commercial.licensingModel.tblCompR6C4", "commercial.licensingModel.tblCompR6C5"],
                  ["commercial.licensingModel.tblCompR7C1", "commercial.licensingModel.tblCompR7C2", "commercial.licensingModel.tblCompR7C3", "commercial.licensingModel.tblCompR7C4", "commercial.licensingModel.tblCompR7C5"],
                  ["commercial.licensingModel.tblCompR8C1", "commercial.licensingModel.tblCompR8C2", "commercial.licensingModel.tblCompR8C3", "commercial.licensingModel.tblCompR8C4", "commercial.licensingModel.tblCompR8C5"],
                  ["commercial.licensingModel.tblCompR9C1", "commercial.licensingModel.tblCompR9C2", "commercial.licensingModel.tblCompR9C3", "commercial.licensingModel.tblCompR9C4", "commercial.licensingModel.tblCompR9C5"],
                  ["commercial.licensingModel.tblCompR10C1", "commercial.licensingModel.tblCompR10C2", "commercial.licensingModel.tblCompR10C3", "commercial.licensingModel.tblCompR10C4", "commercial.licensingModel.tblCompR10C5"],
            ],
      },

      // ─── Source Code Access ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.licensingModel.sourcCodeTitle", id: "source-code" },
      { type: "paragraph", contentKey: "commercial.licensingModel.sourceCodeContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "commercial.licensingModel.lstSourceI1",
                  "commercial.licensingModel.lstSourceI2",
                  "commercial.licensingModel.lstSourceI3",
                  "commercial.licensingModel.lstSourceI4",
                  "commercial.licensingModel.lstSourceI5",
                  "commercial.licensingModel.lstSourceI6",
            ],
      },

      // ─── Renewal & Upgrades ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.licensingModel.renewalTitle", id: "renewal" },
      { type: "paragraph", contentKey: "commercial.licensingModel.renewalContent" },
      {
            type: "table",
            headers: [
                  "commercial.licensingModel.tblRenewHeader1",
                  "commercial.licensingModel.tblRenewHeader2",
                  "commercial.licensingModel.tblRenewHeader3"
            ],
            rows: [
                  ["commercial.licensingModel.tblRenewR1C1", "commercial.licensingModel.tblRenewR1C2", "commercial.licensingModel.tblRenewR1C3"],
                  ["commercial.licensingModel.tblRenewR2C1", "commercial.licensingModel.tblRenewR2C2", "commercial.licensingModel.tblRenewR2C3"],
                  ["commercial.licensingModel.tblRenewR3C1", "commercial.licensingModel.tblRenewR3C2", "commercial.licensingModel.tblRenewR3C3"],
                  ["commercial.licensingModel.tblRenewR4C1", "commercial.licensingModel.tblRenewR4C2", "commercial.licensingModel.tblRenewR4C3"],
            ],
      },

      // ─── Commercial Terms ───────────────────────────────────────
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
      lastUpdated: "2026-02-20",
});
