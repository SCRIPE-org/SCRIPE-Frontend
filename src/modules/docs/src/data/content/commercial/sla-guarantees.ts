import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────────
  { type: "paragraph", contentKey: "commercial.slaGuarantees.intro" },

  // ─── Uptime SLAs ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.slaGuarantees.uptimeTitle",
    id: "uptime-sla",
  },
  { type: "paragraph", contentKey: "commercial.slaGuarantees.uptimeContent" },
  {
    type: "table",
    headers: [
      "commercial.slaGuarantees.tblUptimeH1",
      "commercial.slaGuarantees.tblUptimeH2",
      "commercial.slaGuarantees.tblUptimeH3",
      "commercial.slaGuarantees.tblUptimeH4",
    ],
    rows: [
      [
        "commercial.slaGuarantees.tblUptimeR1C1",
        "commercial.slaGuarantees.tblUptimeR1C2",
        "commercial.slaGuarantees.tblUptimeR1C3",
        "commercial.slaGuarantees.tblUptimeR1C4",
      ],
      [
        "commercial.slaGuarantees.tblUptimeR2C1",
        "commercial.slaGuarantees.tblUptimeR2C2",
        "commercial.slaGuarantees.tblUptimeR2C3",
        "commercial.slaGuarantees.tblUptimeR2C4",
      ],
      [
        "commercial.slaGuarantees.tblUptimeR3C1",
        "commercial.slaGuarantees.tblUptimeR3C2",
        "commercial.slaGuarantees.tblUptimeR3C3",
        "commercial.slaGuarantees.tblUptimeR3C4",
      ],
    ],
  },

  // ─── Support Response Times ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.slaGuarantees.supportTitle",
    id: "support-response",
  },
  { type: "paragraph", contentKey: "commercial.slaGuarantees.supportContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "mail",
        titleKey: "commercial.slaGuarantees.supportEmail",
        descriptionKey: "commercial.slaGuarantees.supportEmailDesc",
      },
      {
        icon: "message-circle",
        titleKey: "commercial.slaGuarantees.supportChat",
        descriptionKey: "commercial.slaGuarantees.supportChatDesc",
      },
      {
        icon: "phone",
        titleKey: "commercial.slaGuarantees.supportPhone",
        descriptionKey: "commercial.slaGuarantees.supportPhoneDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.slaGuarantees.supportDedicatedCsm",
        descriptionKey: "commercial.slaGuarantees.supportDedicatedCsmDesc",
      },
      {
        icon: "clock",
        titleKey: "commercial.slaGuarantees.support247",
        descriptionKey: "commercial.slaGuarantees.support247Desc",
      },
      {
        icon: "zap",
        titleKey: "commercial.slaGuarantees.supportEscalation",
        descriptionKey: "commercial.slaGuarantees.supportEscalationDesc",
      },
    ],
  },

  // ─── Incident Classification ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.slaGuarantees.incidentTitle",
    id: "incident-classification",
  },
  { type: "paragraph", contentKey: "commercial.slaGuarantees.incidentContent" },
  {
    type: "table",
    headers: [
      "commercial.slaGuarantees.tblIncH1",
      "commercial.slaGuarantees.tblIncH2",
      "commercial.slaGuarantees.tblIncH3",
      "commercial.slaGuarantees.tblIncH4",
      "commercial.slaGuarantees.tblIncH5",
    ],
    rows: [
      [
        "commercial.slaGuarantees.tblIncR1C1",
        "commercial.slaGuarantees.tblIncR1C2",
        "commercial.slaGuarantees.tblIncR1C3",
        "commercial.slaGuarantees.tblIncR1C4",
        "commercial.slaGuarantees.tblIncR1C5",
      ],
      [
        "commercial.slaGuarantees.tblIncR2C1",
        "commercial.slaGuarantees.tblIncR2C2",
        "commercial.slaGuarantees.tblIncR2C3",
        "commercial.slaGuarantees.tblIncR2C4",
        "commercial.slaGuarantees.tblIncR2C5",
      ],
      [
        "commercial.slaGuarantees.tblIncR3C1",
        "commercial.slaGuarantees.tblIncR3C2",
        "commercial.slaGuarantees.tblIncR3C3",
        "commercial.slaGuarantees.tblIncR3C4",
        "commercial.slaGuarantees.tblIncR3C5",
      ],
      [
        "commercial.slaGuarantees.tblIncR4C1",
        "commercial.slaGuarantees.tblIncR4C2",
        "commercial.slaGuarantees.tblIncR4C3",
        "commercial.slaGuarantees.tblIncR4C4",
        "commercial.slaGuarantees.tblIncR4C5",
      ],
    ],
  },

  // ─── Maintenance Windows ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.slaGuarantees.maintenanceTitle",
    id: "maintenance-windows",
  },
  { type: "paragraph", contentKey: "commercial.slaGuarantees.maintenanceContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.slaGuarantees.maintItem1",
      "commercial.slaGuarantees.maintItem2",
      "commercial.slaGuarantees.maintItem3",
      "commercial.slaGuarantees.maintItem4",
    ],
  },

  // ─── SLA Credits & Remedies ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.slaGuarantees.creditsTitle",
    id: "sla-credits",
  },
  { type: "paragraph", contentKey: "commercial.slaGuarantees.creditsContent" },
  {
    type: "table",
    headers: [
      "commercial.slaGuarantees.tblCreditH1",
      "commercial.slaGuarantees.tblCreditH2",
      "commercial.slaGuarantees.tblCreditH3",
    ],
    rows: [
      [
        "commercial.slaGuarantees.tblCreditR1C1",
        "commercial.slaGuarantees.tblCreditR1C2",
        "commercial.slaGuarantees.tblCreditR1C3",
      ],
      [
        "commercial.slaGuarantees.tblCreditR2C1",
        "commercial.slaGuarantees.tblCreditR2C2",
        "commercial.slaGuarantees.tblCreditR2C3",
      ],
      [
        "commercial.slaGuarantees.tblCreditR3C1",
        "commercial.slaGuarantees.tblCreditR3C2",
        "commercial.slaGuarantees.tblCreditR3C3",
      ],
    ],
  },

  // ─── Our Commitment ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.slaGuarantees.commitmentTitle",
    id: "our-commitment",
  },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "shield-check",
        titleKey: "commercial.slaGuarantees.commitTransparency",
        descriptionKey: "commercial.slaGuarantees.commitTransparencyDesc",
      },
      {
        icon: "bar-chart-2",
        titleKey: "commercial.slaGuarantees.commitStatusPage",
        descriptionKey: "commercial.slaGuarantees.commitStatusPageDesc",
      },
      {
        icon: "bell",
        titleKey: "commercial.slaGuarantees.commitNotifications",
        descriptionKey: "commercial.slaGuarantees.commitNotificationsDesc",
      },
      {
        icon: "trending-up",
        titleKey: "commercial.slaGuarantees.commitReview",
        descriptionKey: "commercial.slaGuarantees.commitReviewDesc",
      },
    ],
  },

  // ─── Tips ──────────────────────────────────────────────────────
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.slaGuarantees.upgradeTip",
  },
  {
    type: "info",
    variant: "note",
    contentKey: "commercial.slaGuarantees.contactNote",
  },
];

registerPage({
  slug: "commercial/sla-guarantees",
  titleKey: "commercial.slaGuarantees.title",
  descriptionKey: "commercial.slaGuarantees.description",
  category: "commercial-enterprise",
  order: 12,
  sections,
  relatedSlugs: ["commercial/enterprise-addons", "commercial/tenant-isolation", "commercial/support-plans"],
  lastUpdated: "2026-06-28",
});
