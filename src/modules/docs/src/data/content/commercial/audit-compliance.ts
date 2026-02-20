import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.auditCompliance.intro" },
      { type: "heading", level: 2, titleKey: "commercial.auditCompliance.whatTitle", id: "what-gets-audited" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "activity", titleKey: "commercial.auditCompliance.auditRequests", descriptionKey: "commercial.auditCompliance.auditRequestsDesc" },
                  { icon: "git-commit", titleKey: "commercial.auditCompliance.auditEntities", descriptionKey: "commercial.auditCompliance.auditEntitiesDesc" },
                  { icon: "lock", titleKey: "commercial.auditCompliance.auditAuth", descriptionKey: "commercial.auditCompliance.auditAuthDesc" },
                  { icon: "alert-triangle", titleKey: "commercial.auditCompliance.auditSecurity", descriptionKey: "commercial.auditCompliance.auditSecurityDesc" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.auditCompliance.fieldsTitle", id: "audit-log-fields" },
      {
            type: "table",
            headers: ["Field", "Type", "Example"],
            rows: [
                  ["Id", "GUID", "550e8400-..."],
                  ["AdminId", "GUID", "Who performed the action"],
                  ["AdminName", "String", "Human-readable name"],
                  ["Action", "String", "POST /api/admins"],
                  ["EntityType", "String", "Admin, Role, Tenant"],
                  ["EntityId", "String", "Affected entity ID"],
                  ["OldValues", "JSON", "Entity state before change"],
                  ["NewValues", "JSON", "Entity state after change"],
                  ["IPAddress", "String", "192.168.1.100"],
                  ["UserAgent", "String", "Mozilla/5.0..."],
                  ["Timestamp", "DateTime", "2024-01-15T10:30:00Z"],
                  ["StatusCode", "Int", "201 (Created)"],
                  ["Duration", "Int", "45 (milliseconds)"],
                  ["TenantId", "GUID", "Tenant context"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.auditCompliance.realtimeTitle", id: "real-time-streaming" },
      { type: "paragraph", contentKey: "commercial.auditCompliance.realtimeIntro" },
      { type: "heading", level: 2, titleKey: "commercial.auditCompliance.queryTitle", id: "query-export" },
      {
            type: "table",
            headers: ["Feature", "Endpoint", "Description"],
            rows: [
                  ["List logs", "GET /api/audit", "Paginated, filterable by date, admin, action, entity"],
                  ["Detail", "GET /api/audit/{id}", "Full audit entry with before/after snapshots"],
                  ["Statistics", "GET /api/audit/statistics", "Counts by action type, time period, admin"],
                  ["Export", "GET /api/audit/export", "CSV/Excel download for compliance reporting"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.auditCompliance.recycleBinTitle", id: "recycle-bin" },
      {
            type: "table",
            headers: ["Action", "Result", "Reversible?"],
            rows: [
                  ["Delete", "IsDeleted = true", "✅ Yes — restore via Recycle Bin"],
                  ["Restore", "IsDeleted = false", "✅ Yes — delete again"],
                  ["Purge", "Hard DELETE FROM", "❌ No — permanently removed"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.auditCompliance.complianceTitle", id: "compliance-alignment" },
      {
            type: "table",
            headers: ["Standard", "Audit Capability"],
            rows: [
                  ["SOC 2", "Complete activity logging, access controls, change tracking"],
                  ["GDPR", "Data access logs, deletion records, consent tracking"],
                  ["ISO 27001", "Information security event logging, incident detection"],
                  ["PCI DSS", "Cardholder data access logging, network monitoring"],
                  ["HIPAA", "PHI access audit trail, minimum necessary verification"],
            ],
      },
];

registerPage({
      slug: "commercial/audit-compliance",
      titleKey: "commercial.auditCompliance.title",
      descriptionKey: "commercial.auditCompliance.description",
      category: "commercial-enterprise",
      order: 2,
      sections,
      relatedSlugs: ["commercial/enterprise-multi-tenancy", "commercial/data-protection", "commercial/real-time"],
      lastUpdated: "2026-02-19",
});
