import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────────
  { type: "paragraph", contentKey: "commercial.tenantIsolation.intro" },

  // ─── What Isolation Means ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.tenantIsolation.whatItMeansTitle",
    id: "what-isolation-means",
  },
  { type: "paragraph", contentKey: "commercial.tenantIsolation.whatItMeansContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "users",
        titleKey: "commercial.tenantIsolation.isolUserData",
        descriptionKey: "commercial.tenantIsolation.isolUserDataDesc",
      },
      {
        icon: "folder",
        titleKey: "commercial.tenantIsolation.isolFiles",
        descriptionKey: "commercial.tenantIsolation.isolFilesDesc",
      },
      {
        icon: "settings",
        titleKey: "commercial.tenantIsolation.isolSettings",
        descriptionKey: "commercial.tenantIsolation.isolSettingsDesc",
      },
      {
        icon: "bell",
        titleKey: "commercial.tenantIsolation.isolNotifications",
        descriptionKey: "commercial.tenantIsolation.isolNotificationsDesc",
      },
      {
        icon: "clipboard-list",
        titleKey: "commercial.tenantIsolation.isolAuditLogs",
        descriptionKey: "commercial.tenantIsolation.isolAuditLogsDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.tenantIsolation.isolPermissions",
        descriptionKey: "commercial.tenantIsolation.isolPermissionsDesc",
      },
    ],
  },

  // ─── Visual Separation Diagram ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.tenantIsolation.diagramTitle",
    id: "isolation-diagram",
  },
  { type: "paragraph", contentKey: "commercial.tenantIsolation.diagramContent" },
  {
    type: "code",
    language: "text",
    code: `┌──────────────────────────────────────────────────────────────────┐
│                        SCRIPE Platform                           │
│                                                                  │
│  ┌───────────────────────────┐   ┌───────────────────────────┐  │
│  │      Company A Workspace  │   │      Company B Workspace  │  │
│  │  ─────────────────────── │   │  ─────────────────────── │  │
│  │  👥  Team: 42 members     │   │  👥  Team: 18 members     │  │
│  │  📁  Files: 1,200 items   │   │  📁  Files: 340 items     │  │
│  │  ⚙️   Settings: Custom    │   │  ⚙️   Settings: Custom    │  │
│  │  📋  Audit Logs: Private  │   │  📋  Audit Logs: Private  │  │
│  │  🔔  Notifications: Own   │   │  🔔  Notifications: Own   │  │
│  │                           │   │                           │  │
│  │  ❌ Cannot see Company B  │   │  ❌ Cannot see Company A  │  │
│  └───────────────────────────┘   └───────────────────────────┘  │
│                                                                  │
│              🔒 Zero Cross-Workspace Data Access 🔒              │
└──────────────────────────────────────────────────────────────────┘`,
  },

  // ─── Zero-Trust by Design ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.tenantIsolation.zeroTrustTitle",
    id: "zero-trust",
  },
  { type: "paragraph", contentKey: "commercial.tenantIsolation.zeroTrustContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.tenantIsolation.zeroTrustItem1",
      "commercial.tenantIsolation.zeroTrustItem2",
      "commercial.tenantIsolation.zeroTrustItem3",
      "commercial.tenantIsolation.zeroTrustItem4",
      "commercial.tenantIsolation.zeroTrustItem5",
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.tenantIsolation.zeroTrustTip",
  },

  // ─── Compliance & Audit ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.tenantIsolation.complianceTitle",
    id: "compliance-audit",
  },
  { type: "paragraph", contentKey: "commercial.tenantIsolation.complianceContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "file-check",
        titleKey: "commercial.tenantIsolation.complianceGdpr",
        descriptionKey: "commercial.tenantIsolation.complianceGdprDesc",
      },
      {
        icon: "activity",
        titleKey: "commercial.tenantIsolation.complianceAuditTrail",
        descriptionKey: "commercial.tenantIsolation.complianceAuditTrailDesc",
      },
      {
        icon: "lock",
        titleKey: "commercial.tenantIsolation.complianceEncryption",
        descriptionKey: "commercial.tenantIsolation.complianceEncryptionDesc",
      },
      {
        icon: "map-pin",
        titleKey: "commercial.tenantIsolation.complianceDataResidency",
        descriptionKey: "commercial.tenantIsolation.complianceDataResidencyDesc",
      },
    ],
  },
  {
    type: "table",
    headers: [
      "commercial.tenantIsolation.tblCompH1",
      "commercial.tenantIsolation.tblCompH2",
      "commercial.tenantIsolation.tblCompH3",
    ],
    rows: [
      [
        "commercial.tenantIsolation.tblCompR1C1",
        "commercial.tenantIsolation.tblCompR1C2",
        "commercial.tenantIsolation.tblCompR1C3",
      ],
      [
        "commercial.tenantIsolation.tblCompR2C1",
        "commercial.tenantIsolation.tblCompR2C2",
        "commercial.tenantIsolation.tblCompR2C3",
      ],
      [
        "commercial.tenantIsolation.tblCompR3C1",
        "commercial.tenantIsolation.tblCompR3C2",
        "commercial.tenantIsolation.tblCompR3C3",
      ],
      [
        "commercial.tenantIsolation.tblCompR4C1",
        "commercial.tenantIsolation.tblCompR4C2",
        "commercial.tenantIsolation.tblCompR4C3",
      ],
    ],
  },

  // ─── FAQ ──────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.tenantIsolation.faqTitle",
    id: "faq",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.tenantIsolation.faqItem1",
      "commercial.tenantIsolation.faqItem2",
      "commercial.tenantIsolation.faqItem3",
      "commercial.tenantIsolation.faqItem4",
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "commercial.tenantIsolation.assuranceNote",
  },
];

registerPage({
  slug: "commercial/tenant-isolation",
  titleKey: "commercial.tenantIsolation.title",
  descriptionKey: "commercial.tenantIsolation.description",
  category: "commercial-enterprise",
  order: 13,
  sections,
  relatedSlugs: ["commercial/multi-tenancy", "commercial/sla-guarantees", "commercial/data-protection"],
  lastUpdated: "2026-06-28",
});
