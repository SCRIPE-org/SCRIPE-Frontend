import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.complianceReadiness.intro" },

      { type: "heading", level: 2, titleKey: "commercial.complianceReadiness.frameworkTitle", id: "frameworks" },
      {
            type: "table",
            headers: ["Framework", "Focus Area", "NEXORA Coverage", "Ready"],
            rows: [
                  ["SOX", "Financial controls & audit trail", "Full audit pipeline, entity change tracking", "✓"],
                  ["GDPR", "Data privacy & right to be forgotten", "Soft delete, data export, consent tracking", "✓"],
                  ["SOC 2 Type II", "Security, availability, integrity", "8-layer security, health checks, audit", "✓"],
                  ["ISO 27001", "Information security management", "Access control, encryption, monitoring", "✓"],
                  ["HIPAA", "Protected health information", "Field-level security, audit trail, encryption", "✓"],
                  ["PCI-DSS", "Payment card data security", "Encryption, access control, anti-replay", "Partial"],
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.complianceReadiness.auditReadyTitle", id: "audit-ready" },
      { type: "paragraph", contentKey: "commercial.complianceReadiness.auditReadyContent" },
      {
            type: "list",
            variant: "ordered",
            items: [
                  "Every API request logged with user context, IP, timestamp, and response code",
                  "Every entity change tracked with before/after values and the user who made the change",
                  "Every security event (login, logout, failed auth, permission changes) recorded",
                  "Every business operation tagged with custom audit entries",
                  "All audit data tenant-scoped — no cross-tenant data leakage in audit trails",
                  "Real-time audit streaming via SignalR for immediate visibility",
                  "Configurable retention policies per tenant",
                  "Full audit export in PDF, CSV, and Excel formats",
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.complianceReadiness.securityControlsTitle", id: "controls" },
      {
            type: "table",
            headers: ["Control Category", "Controls Implemented", "Evidence Available"],
            rows: [
                  ["Access Control", "RBAC, field-level restrictions, MFA", "User access logs, permission audit"],
                  ["Data Protection", "Encryption (transit + rest), field masking", "Configuration, audit trail"],
                  ["Incident Response", "Security event streaming, alerting", "Real-time dashboard, export"],
                  ["Change Management", "Entity versioning, soft delete", "Before/after tracking, timestamps"],
                  ["Network Security", "TLS, CORS, CSP, rate limiting", "Security headers, config"],
                  ["Availability", "Health checks, circuit breakers", "Uptime logs, health endpoints"],
            ],
      },

      { type: "info", variant: "important", contentKey: "commercial.complianceReadiness.disclaimer" },
];

registerPage({
      slug: "commercial/compliance-readiness",
      titleKey: "commercial.complianceReadiness.title",
      descriptionKey: "commercial.complianceReadiness.description",
      category: "commercial-security",
      order: 5,
      sections,
      relatedSlugs: ["commercial/security-overview", "commercial/audit-compliance"],
      lastUpdated: "2026-02-20",
});
