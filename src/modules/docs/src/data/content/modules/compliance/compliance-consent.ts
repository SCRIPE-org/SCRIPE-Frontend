import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.consent.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.consent.infoTitle",
    contentKey: "modules.compliance.consent.infoContent",
  },

  // ─── Consent Flow ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.flowTitle",
    id: "consent-flow",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.flowIntro" },
  {
    type: "flowchart",
    titleKey: "modules.compliance.consent.flowTitle",
    direction: "vertical",
    nodes: [
      {
        id: "purpose",
        labelKey: "modules.compliance.consent.nodePurpose",
        type: "primary",
        descriptionKey: "modules.compliance.consent.descPurpose",
      },
      {
        id: "record",
        labelKey: "modules.compliance.consent.nodeRecord",
        type: "info",
        descriptionKey: "modules.compliance.consent.descRecord",
      },
      {
        id: "snapshot",
        labelKey: "modules.compliance.consent.nodeSnapshot",
        type: "warning",
        descriptionKey: "modules.compliance.consent.descSnapshot",
      },
      {
        id: "job",
        labelKey: "modules.compliance.consent.nodeJob",
        type: "default",
        descriptionKey: "modules.compliance.consent.descJob",
      },
    ],
    connections: [
      { from: "purpose", to: "record", labelKey: "modules.compliance.consent.conn1" },
      { from: "record", to: "snapshot", labelKey: "modules.compliance.consent.conn2" },
      { from: "job", to: "record", labelKey: "modules.compliance.consent.conn3" },
    ],
  },

  // ─── Consent Purposes ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.purposesTitle",
    id: "consent-purposes",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.purposesIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.consent.purposesCode",
      "modules.compliance.consent.purposesDesc",
      "modules.compliance.consent.purposesBasis",
    ],
    rows: [
      [
        "Marketing",
        "modules.compliance.consent.purposesMarketingDesc",
        "modules.compliance.consent.basisConsent",
      ],
      [
        "Analytics",
        "modules.compliance.consent.purposesAnalyticsDesc",
        "modules.compliance.consent.basisConsent",
      ],
      [
        "ThirdParty",
        "modules.compliance.consent.purposesThirdPartyDesc",
        "modules.compliance.consent.basisConsent",
      ],
      [
        "Essential",
        "modules.compliance.consent.purposesEssentialDesc",
        "modules.compliance.consent.basisLegitimate",
      ],
    ],
  },

  // ─── Snapshot Immutability ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.immutabilityTitle",
    id: "immutability",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.immutabilityIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ConsentSnapshot.cs",
    code: `public class ConsentSnapshot : BaseEntity<Guid>
{
    public Guid ConsentRecordId { get; set; }
    public ConsentState State { get; set; } // Granted/Revoked
    public DateTime Timestamp { get; set; }
    
    // Hash of (RecordId + State + Timestamp + PreviousHash) for tampering detection
    [MaxLength(256)]
    public string IntegrityHash { get; set; } = null!;
}`,
  },

  // ─── Entity Reference ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.entitiesTitle",
    id: "entities",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.entitiesIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.consent.field",
      "modules.compliance.consent.type",
      "modules.compliance.consent.description",
    ],
    rows: [
      ["Id", "Guid", "modules.compliance.consent.fId"],
      ["TenantId", "Guid", "modules.compliance.consent.fTenantId"],
      ["SubjectId", "String", "modules.compliance.consent.fSubjectId"],
      ["PurposeCode", "String", "modules.compliance.consent.fPurposeCode"],
      ["State", "Enum", "modules.compliance.consent.fState"],
      ["IpAddress", "String", "modules.compliance.consent.fIpAddress"],
      ["UserAgent", "String", "modules.compliance.consent.fUserAgent"],
      ["PolicyVersion", "String", "modules.compliance.consent.fPolicyVersion"],
    ],
  },

  // ─── Best Practices ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.bestPracticesTitle",
    id: "best-practices",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "modules.compliance.consent.doTitle",
        variant: "positive",
        items: [
          "modules.compliance.consent.do1",
          "modules.compliance.consent.do2",
          "modules.compliance.consent.do3",
        ],
      },
      {
        titleKey: "modules.compliance.consent.dontTitle",
        variant: "negative",
        items: [
          "modules.compliance.consent.dont1",
          "modules.compliance.consent.dont2",
          "modules.compliance.consent.dont3",
        ],
      },
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/compliance/consent",
        descriptionKey: "modules.compliance.consent.epRecord",
        auth: "AdminOnly",
        permission: "compliance_consent.manage",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/consent",
        descriptionKey: "modules.compliance.consent.epList",
        auth: "AdminOnly",
        permission: "compliance_consent.view",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/consent/analytics",
        descriptionKey: "modules.compliance.consent.epAnalytics",
        auth: "AdminOnly",
        permission: "compliance_consent.view_analytics",
      },
    ],
  },
];

registerPage({
  slug: "modules/compliance-consent",
  titleKey: "modules.compliance.consent.title",
  descriptionKey: "modules.compliance.consent.description",
  category: "modules",
  order: 3,
  sections,
  relatedSlugs: ["modules/compliance-overview", "infrastructure/background-jobs"],
  lastUpdated: "2026-05-03",
});
