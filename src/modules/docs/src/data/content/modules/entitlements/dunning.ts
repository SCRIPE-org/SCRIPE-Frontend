import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.dunning.intro" },

  // ─── 4-Stage Pipeline ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.dunning.stagesTitle",
    id: "dunning-stages",
  },
  { type: "paragraph", contentKey: "modules.dunning.stagesIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Payment fails", type: "danger" },
      { id: "B", label: "Stage 1: PaymentFailed email (Day 0)", type: "warning" },
      { id: "C", label: "Stripe Smart Retry (Days 1-3)", type: "info" },
      { id: "D", label: "Still failing? → Stage 2: GraceWarning email", type: "warning" },
      { id: "E", label: "PastDue status, yellow banner shown", type: "warning" },
      { id: "F", label: "≤2 days left → Stage 3: GraceFinalWarning email", type: "danger" },
      { id: "G", label: "Grace expires → Stage 4: Suspend subscription", type: "danger" },
      { id: "H", label: "All tenant admins deactivated", type: "danger" },
      { id: "I", label: "Extended grace expires → Cancel + Fallback edition", type: "danger" },
      { id: "J", label: "Payment recovered? → Reactivate", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
      { from: "G", to: "H" },
      { from: "H", to: "I" },
      { from: "G", to: "J", label: "if payment recovered", style: "dashed" },
    ],
  },

  // Stage 1
  { type: "heading", level: 3, titleKey: "modules.dunning.stage1Title", id: "stage-1" },
  { type: "paragraph", contentKey: "modules.dunning.stage1Intro" },

  // Stage 2
  { type: "heading", level: 3, titleKey: "modules.dunning.stage2Title", id: "stage-2" },
  { type: "paragraph", contentKey: "modules.dunning.stage2Intro" },

  // Stage 3
  { type: "heading", level: 3, titleKey: "modules.dunning.stage3Title", id: "stage-3" },
  { type: "paragraph", contentKey: "modules.dunning.stage3Intro" },

  // Stage 4
  { type: "heading", level: 3, titleKey: "modules.dunning.stage4Title", id: "stage-4" },
  { type: "paragraph", contentKey: "modules.dunning.stage4Intro" },

  // ─── Background Jobs ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.dunning.jobsTitle",
    id: "background-jobs",
  },
  { type: "paragraph", contentKey: "modules.dunning.jobsIntro" },
  {
    type: "table",
    headers: ["Job", "Schedule", "Responsibility"],
    rows: [
      [
        "SubscriptionReconciliationJob",
        "Daily 3:00 AM UTC",
        "Expiry detection, suspension, fallback edition assignment",
      ],
      [
        "DunningNotificationJob",
        "Daily 4:00 AM UTC",
        "Grace warning and final warning emails for PastDue subscriptions",
      ],
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json",
    code: `{
  "BackgroundJobs": {
    "Jobs": {
      "entitlements-subscription-reconciliation": {
        "Enabled": true,
        "CronExpression": "0 3 * * *"
      },
      "entitlements-dunning-notification": {
        "Enabled": true,
        "CronExpression": "0 4 * * *"
      }
    }
  }
}`,
  },

  // ─── Email Deduplication ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.dunning.deduplicationTitle",
    id: "email-deduplication",
  },
  { type: "paragraph", contentKey: "modules.dunning.deduplicationIntro" },

  // ─── Cross-Module Integration ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.dunning.crossModuleTitle",
    id: "cross-module-integration",
  },
  { type: "paragraph", contentKey: "modules.dunning.crossModuleIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.dunning.crossModuleIntro",
    titleKey: "modules.dunning.crossModuleTitle",
  },

  // ─── Auto-Fallback Edition ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.dunning.fallbackTitle",
    id: "fallback-edition",
  },
  { type: "paragraph", contentKey: "modules.dunning.fallbackIntro" },

  // ─── Promo Codes & Proration ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.dunning.promotionsTitle",
    id: "promo-proration",
  },
  { type: "paragraph", contentKey: "modules.dunning.promotionsIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "modules.dunning.promoExpiryTitle",
    id: "promo-expiry",
  },
  { type: "paragraph", contentKey: "modules.dunning.promoExpiryIntro" },

  // ─── Email Templates ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.dunning.emailsTitle",
    id: "email-templates",
  },
  { type: "paragraph", contentKey: "modules.dunning.emailsIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "modules.dunning.email1",
      "modules.dunning.email2",
      "modules.dunning.email3",
      "modules.dunning.email4",
    ],
  },
];

registerPage({
  slug: "modules/dunning",
  titleKey: "modules.dunning.title",
  descriptionKey: "modules.dunning.description",
  category: "modules",
  order: 8,
  sections,
  relatedSlugs: [
    "modules/billing-engine",
    "modules/invoices",
    "modules/subscriptions",
    "features/notification-system",
  ],
  lastUpdated: "2026-04-18",
});
