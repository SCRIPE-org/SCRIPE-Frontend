import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.supportPlans.intro" },

      // ─── Support Tiers Comparison ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.supportPlans.tiersTitle", id: "tiers" },
      { type: "paragraph", contentKey: "commercial.supportPlans.tiersIntro" },
      {
            type: "table",
            headers: ["Feature", "Community", "Standard", "Premium", "Enterprise"],
            rows: [
                  ["Response time", "Best effort", "24 hours", "4 hours", "1 hour"],
                  ["Channel", "GitHub Issues", "Email", "Slack + Email", "Dedicated channel"],
                  ["Coverage", "Mon-Fri", "Mon-Fri", "Mon-Sat", "24/7"],
                  ["Bug fixes", "Next release", "Hotfix", "Hotfix", "Hotfix + patch"],
                  ["Feature requests", "Backlog", "Prioritized", "Fast-tracked", "Custom development"],
                  ["Training", "Docs only", "2 sessions", "Monthly sessions", "Custom program"],
                  ["Deployment help", "Docs only", "1 session", "Unlimited", "On-site available"],
                  ["Architecture review", "✗", "✗", "Quarterly", "Monthly"],
                  ["Dedicated engineer", "✗", "✗", "✗", "1 FTE assigned"],
                  ["Custom SLA", "✗", "✗", "Available", "Included"],
                  ["Source code access", "Public repo", "Public repo", "Full source", "Full source + priority"],
            ],
      },

      // ─── SLA Details ────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.supportPlans.slaTitle", id: "sla" },
      { type: "paragraph", contentKey: "commercial.supportPlans.slaIntro" },
      {
            type: "table",
            headers: ["Severity", "P1 (Critical)", "P2 (Major)", "P3 (Minor)", "P4 (Low)"],
            rows: [
                  ["Definition", "System down, no workaround", "Core feature broken", "Workaround exists", "Cosmetic / enhancement"],
                  ["Enterprise response", "1 hour", "4 hours", "1 business day", "2 business days"],
                  ["Premium response", "4 hours", "8 hours", "2 business days", "5 business days"],
                  ["Standard response", "24 hours", "48 hours", "5 business days", "Next release"],
                  ["Escalation path", "VP Engineering", "Team Lead", "Support Queue", "Backlog"],
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
