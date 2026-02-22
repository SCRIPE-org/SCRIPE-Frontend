import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.faq.intro" },

      // ─── General Questions ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.faq.generalTitle", id: "general" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q1", id: "q1" },
      { type: "paragraph", contentKey: "commercial.faq.a1" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q2", id: "q2" },
      { type: "paragraph", contentKey: "commercial.faq.a2" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q3", id: "q3" },
      { type: "paragraph", contentKey: "commercial.faq.a3" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qWhatIndustries", id: "q-industries" },
      { type: "paragraph", contentKey: "commercial.faq.aWhatIndustries" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qHowLongSetup", id: "q-setup-time" },
      { type: "paragraph", contentKey: "commercial.faq.aHowLongSetup" },

      // ─── Technical Questions ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.faq.technicalTitle", id: "technical" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q4", id: "q4" },
      { type: "paragraph", contentKey: "commercial.faq.a4" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q5", id: "q5" },
      { type: "paragraph", contentKey: "commercial.faq.a5" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q6", id: "q6" },
      { type: "paragraph", contentKey: "commercial.faq.a6" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qCanWeCustomize", id: "q-customize" },
      { type: "paragraph", contentKey: "commercial.faq.aCanWeCustomize" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qDatabaseSupport", id: "q-db" },
      { type: "paragraph", contentKey: "commercial.faq.aDatabaseSupport" },
      {
            type: "table",
            headers: [
                  "commercial.faq.tblDbHeader1",
                  "commercial.faq.tblDbHeader2",
                  "commercial.faq.tblDbHeader3"
            ],
            rows: [
                  ["commercial.faq.tblDbR1C1", "commercial.faq.tblDbR1C2", "commercial.faq.tblDbR1C3"],
                  ["commercial.faq.tblDbR2C1", "commercial.faq.tblDbR2C2", "commercial.faq.tblDbR2C3"],
                  ["commercial.faq.tblDbR3C1", "commercial.faq.tblDbR3C2", "commercial.faq.tblDbR3C3"],
                  ["commercial.faq.tblDbR4C1", "commercial.faq.tblDbR4C2", "commercial.faq.tblDbR4C3"],
                  ["commercial.faq.tblDbR5C1", "commercial.faq.tblDbR5C2", "commercial.faq.tblDbR5C3"],
            ],
      },

      // ─── Licensing & Pricing ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.faq.licensingTitle", id: "licensing" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q7", id: "q7" },
      { type: "paragraph", contentKey: "commercial.faq.a7" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q8", id: "q8" },
      { type: "paragraph", contentKey: "commercial.faq.a8" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q9", id: "q9" },
      { type: "paragraph", contentKey: "commercial.faq.a9" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qTrialPeriod", id: "q-trial" },
      { type: "paragraph", contentKey: "commercial.faq.aTrialPeriod" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qUpgradePath", id: "q-upgrade" },
      { type: "paragraph", contentKey: "commercial.faq.aUpgradePath" },

      // ─── Security & Compliance ──────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.faq.securityTitle", id: "security" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qDataResidency", id: "q-data-residency" },
      { type: "paragraph", contentKey: "commercial.faq.aDataResidency" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qAuditLogs", id: "q-audit" },
      { type: "paragraph", contentKey: "commercial.faq.aAuditLogs" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qSSOIntegration", id: "q-sso" },
      { type: "paragraph", contentKey: "commercial.faq.aSSOIntegration" },

      // ─── Support & Updates ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.faq.supportTitle", id: "support" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qUpdateFrequency", id: "q-updates" },
      { type: "paragraph", contentKey: "commercial.faq.aUpdateFrequency" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qBreakingChanges", id: "q-breaking" },
      { type: "paragraph", contentKey: "commercial.faq.aBreakingChanges" },
      { type: "heading", level: 3, titleKey: "commercial.faq.qMigrationHelp", id: "q-migration" },
      { type: "paragraph", contentKey: "commercial.faq.aMigrationHelp" },

      { type: "info", variant: "tip", contentKey: "commercial.faq.contactNote" },
];

registerPage({
      slug: "commercial/faq",
      titleKey: "commercial.faq.title",
      descriptionKey: "commercial.faq.description",
      category: "commercial-support",
      order: 3,
      sections,
      relatedSlugs: ["commercial/getting-started-guide", "commercial/roadmap"],
      lastUpdated: "2026-02-20",
});
