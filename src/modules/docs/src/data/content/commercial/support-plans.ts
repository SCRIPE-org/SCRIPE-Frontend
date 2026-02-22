import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.supportPlans.intro" },

      // ─── Support Tiers Comparison ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.supportPlans.tiersTitle", id: "tiers" },
      { type: "paragraph", contentKey: "commercial.supportPlans.tiersIntro" },
      {
            type: "table",
            headers: [
                  "commercial.supportPlans.tblTiersHeader1",
                  "commercial.supportPlans.tblTiersHeader2",
                  "commercial.supportPlans.tblTiersHeader3",
                  "commercial.supportPlans.tblTiersHeader4",
                  "commercial.supportPlans.tblTiersHeader5"
            ],
            rows: [
                  ["commercial.supportPlans.tblTiersR1C1", "commercial.supportPlans.tblTiersR1C2", "commercial.supportPlans.tblTiersR1C3", "commercial.supportPlans.tblTiersR1C4", "commercial.supportPlans.tblTiersR1C5"],
                  ["commercial.supportPlans.tblTiersR2C1", "commercial.supportPlans.tblTiersR2C2", "commercial.supportPlans.tblTiersR2C3", "commercial.supportPlans.tblTiersR2C4", "commercial.supportPlans.tblTiersR2C5"],
                  ["commercial.supportPlans.tblTiersR3C1", "commercial.supportPlans.tblTiersR3C2", "commercial.supportPlans.tblTiersR3C3", "commercial.supportPlans.tblTiersR3C4", "commercial.supportPlans.tblTiersR3C5"],
                  ["commercial.supportPlans.tblTiersR4C1", "commercial.supportPlans.tblTiersR4C2", "commercial.supportPlans.tblTiersR4C3", "commercial.supportPlans.tblTiersR4C4", "commercial.supportPlans.tblTiersR4C5"],
                  ["commercial.supportPlans.tblTiersR5C1", "commercial.supportPlans.tblTiersR5C2", "commercial.supportPlans.tblTiersR5C3", "commercial.supportPlans.tblTiersR5C4", "commercial.supportPlans.tblTiersR5C5"],
                  ["commercial.supportPlans.tblTiersR6C1", "commercial.supportPlans.tblTiersR6C2", "commercial.supportPlans.tblTiersR6C3", "commercial.supportPlans.tblTiersR6C4", "commercial.supportPlans.tblTiersR6C5"],
                  ["commercial.supportPlans.tblTiersR7C1", "commercial.supportPlans.tblTiersR7C2", "commercial.supportPlans.tblTiersR7C3", "commercial.supportPlans.tblTiersR7C4", "commercial.supportPlans.tblTiersR7C5"],
                  ["commercial.supportPlans.tblTiersR8C1", "commercial.supportPlans.tblTiersR8C2", "commercial.supportPlans.tblTiersR8C3", "commercial.supportPlans.tblTiersR8C4", "commercial.supportPlans.tblTiersR8C5"],
                  ["commercial.supportPlans.tblTiersR9C1", "commercial.supportPlans.tblTiersR9C2", "commercial.supportPlans.tblTiersR9C3", "commercial.supportPlans.tblTiersR9C4", "commercial.supportPlans.tblTiersR9C5"],
                  ["commercial.supportPlans.tblTiersR10C1", "commercial.supportPlans.tblTiersR10C2", "commercial.supportPlans.tblTiersR10C3", "commercial.supportPlans.tblTiersR10C4", "commercial.supportPlans.tblTiersR10C5"],
                  ["commercial.supportPlans.tblTiersR11C1", "commercial.supportPlans.tblTiersR11C2", "commercial.supportPlans.tblTiersR11C3", "commercial.supportPlans.tblTiersR11C4", "commercial.supportPlans.tblTiersR11C5"],
            ],
      },

      // ─── SLA Details ────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.supportPlans.slaTitle", id: "sla" },
      { type: "paragraph", contentKey: "commercial.supportPlans.slaIntro" },
      {
            type: "table",
            headers: [
                  "commercial.supportPlans.tblSlaHeader1",
                  "commercial.supportPlans.tblSlaHeader2",
                  "commercial.supportPlans.tblSlaHeader3",
                  "commercial.supportPlans.tblSlaHeader4",
                  "commercial.supportPlans.tblSlaHeader5"
            ],
            rows: [
                  ["commercial.supportPlans.tblSlaR1C1", "commercial.supportPlans.tblSlaR1C2", "commercial.supportPlans.tblSlaR1C3", "commercial.supportPlans.tblSlaR1C4", "commercial.supportPlans.tblSlaR1C5"],
                  ["commercial.supportPlans.tblSlaR2C1", "commercial.supportPlans.tblSlaR2C2", "commercial.supportPlans.tblSlaR2C3", "commercial.supportPlans.tblSlaR2C4", "commercial.supportPlans.tblSlaR2C5"],
                  ["commercial.supportPlans.tblSlaR3C1", "commercial.supportPlans.tblSlaR3C2", "commercial.supportPlans.tblSlaR3C3", "commercial.supportPlans.tblSlaR3C4", "commercial.supportPlans.tblSlaR3C5"],
                  ["commercial.supportPlans.tblSlaR4C1", "commercial.supportPlans.tblSlaR4C2", "commercial.supportPlans.tblSlaR4C3", "commercial.supportPlans.tblSlaR4C4", "commercial.supportPlans.tblSlaR4C5"],
                  ["commercial.supportPlans.tblSlaR5C1", "commercial.supportPlans.tblSlaR5C2", "commercial.supportPlans.tblSlaR5C3", "commercial.supportPlans.tblSlaR5C4", "commercial.supportPlans.tblSlaR5C5"],
            ],
      },

      // ─── What's Included ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.supportPlans.includedTitle", id: "included" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "zap", titleKey: "commercial.supportPlans.hotfixes", descriptionKey: "commercial.supportPlans.hotfixesDesc" },
                  { icon: "terminal", titleKey: "commercial.supportPlans.remoteDebug", descriptionKey: "commercial.supportPlans.remoteDebugDesc" },
                  { icon: "book", titleKey: "commercial.supportPlans.knowledgeBase", descriptionKey: "commercial.supportPlans.knowledgeBaseDesc" },
                  { icon: "users", titleKey: "commercial.supportPlans.communityAccess", descriptionKey: "commercial.supportPlans.communityAccessDesc" },
            ],
      },

      // ─── Onboarding Process ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.supportPlans.onboardingTitle", id: "onboarding" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.supportPlans.step1Title", contentKey: "commercial.supportPlans.step1Content" },
                  { titleKey: "commercial.supportPlans.step2Title", contentKey: "commercial.supportPlans.step2Content" },
                  { titleKey: "commercial.supportPlans.step3Title", contentKey: "commercial.supportPlans.step3Content" },
                  { titleKey: "commercial.supportPlans.step4Title", contentKey: "commercial.supportPlans.step4Content" },
            ],
      },

      // ─── Upgrade Path ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.supportPlans.upgradeTitle", id: "upgrade" },
      { type: "paragraph", contentKey: "commercial.supportPlans.upgradeContent" },
      { type: "info", variant: "tip", contentKey: "commercial.supportPlans.upgradeTip" },
];

registerPage({
      slug: "commercial/support-plans",
      titleKey: "commercial.supportPlans.title",
      descriptionKey: "commercial.supportPlans.description",
      category: "commercial-pricing",
      order: 3,
      sections,
      relatedSlugs: ["commercial/licensing-model", "commercial/documentation-training"],
      lastUpdated: "2026-02-20",
});
