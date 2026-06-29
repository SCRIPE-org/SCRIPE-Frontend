import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ─────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.intro" },

  // ─── What Is a Regulation Profile ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.regulationProfiles.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.whatIsIntro" },

  // ─── Entity Reference ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.regulationProfiles.entityTitle",
    id: "entity-reference",
  },
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.entityIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Code", "string (max 20)", "Short code identifier, e.g. \"GDPR\", \"CCPA\", \"LGPD\", \"PDPA\"."],
      ["Name", "string (max 200)", "Full regulation name, e.g. \"General Data Protection Regulation\"."],
      ["Jurisdiction", "string? (max 50)", "Region/country code, e.g. \"EU\", \"US-CA\", \"BR\", \"TH\". Null if global."],
      ["DsrDeadlineDays", "int", "Legal deadline for DSR response in days. Default 30 (GDPR). CCPA = 45."],
      ["DefaultRetentionJson", "string?", "JSON map of default retention periods per category (days). -1 = indefinite. e.g. {\"UserProfile\": 1095}."],
      ["ReferenceUrl", "string? (max 500)", "URL to the official regulation text or summary page shown in the compliance dashboard."],
      ["CurrentConsentVersion", "string? (max 50)", "Semantic version of the active consent text (e.g. \"1.0\", \"2.1\"). Changing this triggers re-consent for all active consents (GDPR Art. 7)."],
      ["IsActive", "bool", "Whether this profile is available for tenants to select. Inactive profiles are hidden from the compliance UI."],
    ],
  },

  // ─── Seeded Regulations ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.regulationProfiles.seededTitle",
    id: "seeded-regulations",
  },
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.seededIntro" },
  {
    type: "table",
    headers: ["Code", "Name", "Jurisdiction", "DSR SLA"],
    rows: [
      ["GDPR", "General Data Protection Regulation", "EU/EEA", "30 days"],
      ["CCPA", "California Consumer Privacy Act", "US-CA", "45 days"],
      ["LGPD", "Lei Geral de Proteção de Dados", "BR", "15 days"],
      ["POPIA", "Protection of Personal Information Act", "ZA", "30 days"],
      ["PDPA", "Personal Data Protection Act", "SG/TH", "30 days"],
    ],
  },

  // ─── Consent Version & Re-Consent ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.regulationProfiles.consentVersionTitle",
    id: "consent-version",
  },
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.consentVersionIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.compliance.regulationProfiles.consentVersionWarning",
  },

  // ─── Default Retention JSON ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.regulationProfiles.retentionJsonTitle",
    id: "default-retention-json",
  },
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.retentionJsonIntro" },
  {
    type: "code",
    language: "json",
    filename: "DefaultRetentionJson example",
    code: `{
  "UserProfile": 1095,
  "AuditLogs": 1825,
  "LoginHistory": 365,
  "ConsentRecords": 2190,
  "DsrRequests": 2190,
  "TransactionLogs": 2555
}`,
  },
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.retentionJsonNote" },

  // ─── API Endpoints ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.regulationProfiles.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.compliance.regulationProfiles.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/compliances/regulations",
        descriptionKey: "modules.compliance.regulationProfiles.ep.list",
        auth: "JWT",
        permission: "compliance.view",
      },
      {
        method: "GET",
        path: "/api/v1/compliances/regulations/{id}",
        descriptionKey: "modules.compliance.regulationProfiles.ep.get",
        auth: "JWT",
        permission: "compliance.view",
      },
      {
        method: "POST",
        path: "/api/v1/compliances/regulations",
        descriptionKey: "modules.compliance.regulationProfiles.ep.create",
        auth: "JWT",
        permission: "compliance.manage",
      },
      {
        method: "PUT",
        path: "/api/v1/compliances/regulations/{id}",
        descriptionKey: "modules.compliance.regulationProfiles.ep.update",
        auth: "JWT",
        permission: "compliance.manage",
      },
      {
        method: "DELETE",
        path: "/api/v1/compliances/regulations/{id}",
        descriptionKey: "modules.compliance.regulationProfiles.ep.delete",
        auth: "JWT",
        permission: "compliance.manage",
      },
    ],
  },

  // ─── Best Practices ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.regulationProfiles.bestPracticesTitle",
    id: "best-practices",
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.compliance.regulationProfiles.bestPracticesTip",
  },
];

registerPage({
  slug: "modules/compliance-regulation-profiles",
  titleKey: "modules.compliance.regulationProfiles.title",
  descriptionKey: "modules.compliance.regulationProfiles.description",
  category: "modules",
  order: 13,
  sections,
  relatedSlugs: [
    "modules/compliance-overview",
    "modules/compliance-dsr",
    "modules/compliance-consent",
    "modules/compliance-retention",
  ],
  lastUpdated: "2026-06-29",
});
