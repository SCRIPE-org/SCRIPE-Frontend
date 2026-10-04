import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.ujComplianceGovernance.intro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "tutorials.ujComplianceGovernance.infoTitle",
    contentKey: "tutorials.ujComplianceGovernance.infoContent",
  },

  // ─── Step 1: Real-Time Security Incident Monitoring ───────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujComplianceGovernance.step1Title",
    id: "step-1-security-monitoring",
  },
  { type: "paragraph", contentKey: "tutorials.ujComplianceGovernance.step1Desc" },

  // ─── Step 2: System Audit Log Forensics ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujComplianceGovernance.step2Title",
    id: "step-2-audit-logs",
  },
  { type: "paragraph", contentKey: "tutorials.ujComplianceGovernance.step2Desc" },

  // ─── Step 3: GDPR Data Subject Rights (DSR) Erasure Request ───────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujComplianceGovernance.step3Title",
    id: "step-3-dsr-erasure",
  },
  { type: "paragraph", contentKey: "tutorials.ujComplianceGovernance.step3Desc" },
  {
    type: "code",
    language: "bash",
    filename: "Submit DSR Erasure Request (POST /api/v1/compliance/dsr)",
    code: `curl -X POST http://localhost:5000/api/v1/compliance/dsr \\
  -H "Authorization: Bearer \$TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subjectEmail": "user@example.com",
    "requestType": "RightToErasure",
    "verificationMethod": "MagicLinkConfirmed",
    "cascadePurge": true
  }'`,
  },

  // ─── Step 4: Executive BI Dashboards & Event Streaming ────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujComplianceGovernance.step4Title",
    id: "step-4-bi-analytics",
  },
  { type: "paragraph", contentKey: "tutorials.ujComplianceGovernance.step4Desc" },
];

registerPage({
  slug: "tutorials/user-journey-compliance-governance",
  titleKey: "tutorials.ujComplianceGovernance.title",
  descriptionKey: "tutorials.ujComplianceGovernance.description",
  category: "tutorials",
  order: 6,
  sections,
  relatedSlugs: [
    "modules/compliance/compliance-overview",
    "modules/analytics/analytics-overview",
    "security/overview",
  ],
  lastUpdated: "2026-10-03",
});
