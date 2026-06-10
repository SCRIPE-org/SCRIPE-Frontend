import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.complianceReadiness.intro" },

  // ─── Compliance Frameworks ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceReadiness.frameworkTitle",
    id: "frameworks",
  },
  { type: "paragraph", contentKey: "commercial.complianceReadiness.frameworkIntro" },
  {
    type: "table",
    headers: ["Framework", "Focus Area", "SCRIPE Coverage", "Ready"],
    rows: [
      [
        "SOX",
        "Financial controls & audit trail",
        "Full audit pipeline, entity change tracking",
        "✓",
      ],
      [
        "GDPR",
        "Data privacy & right to be forgotten",
        "Soft delete, data export, consent tracking",
        "✓",
      ],
      [
        "SOC 2 Type II",
        "Security, availability, integrity",
        "8-layer security, health checks, audit",
        "✓",
      ],
      [
        "ISO 27001",
        "Information security management",
        "Access control, encryption, monitoring",
        "✓",
      ],
      [
        "HIPAA",
        "Protected health information",
        "Field-level security, audit trail, encryption",
        "✓",
      ],
      [
        "PCI-DSS",
        "Payment card data security",
        "Encryption, access control, anti-replay",
        "Partial",
      ],
      ["CCPA", "California consumer privacy", "Data export, deletion, consent management", "✓"],
    ],
  },

  // ─── Audit-Ready Features ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceReadiness.auditReadyTitle",
    id: "audit-ready",
  },
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

  // ─── Security Controls ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceReadiness.securityControlsTitle",
    id: "controls",
  },
  {
    type: "table",
    headers: ["Control Category", "Controls Implemented", "Evidence Available"],
    rows: [
      [
        "Access Control",
        "RBAC, field-level restrictions, MFA",
        "User access logs, permission audit",
      ],
      [
        "Data Protection",
        "Encryption (transit + rest), field masking",
        "Configuration, audit trail",
      ],
      ["Incident Response", "Security event streaming, alerting", "Real-time dashboard, export"],
      ["Change Management", "Entity versioning, soft delete", "Before/after tracking, timestamps"],
      ["Network Security", "TLS, CORS, CSP, rate limiting", "Security headers, config"],
      ["Availability", "Health checks, circuit breakers", "Uptime logs, health endpoints"],
    ],
  },

  // ─── Data Privacy (GDPR) ────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.complianceReadiness.gdprTitle", id: "gdpr" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "shield",
        titleKey: "commercial.complianceReadiness.rightToErasure",
        descriptionKey: "commercial.complianceReadiness.rightToErasureDesc",
      },
      {
        icon: "database",
        titleKey: "commercial.complianceReadiness.dataPortability",
        descriptionKey: "commercial.complianceReadiness.dataPortabilityDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.complianceReadiness.consentMgmt",
        descriptionKey: "commercial.complianceReadiness.consentMgmtDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.complianceReadiness.dataMinimization",
        descriptionKey: "commercial.complianceReadiness.dataMinimizationDesc",
      },
    ],
  },

  // ─── Compliance Checklist ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.complianceReadiness.checklistTitle",
    id: "checklist",
  },
  {
    type: "table",
    headers: ["Requirement", "SCRIPE Feature", "Status"],
    rows: [
      ["Encryption at rest", "AES-256 database encryption", "✓ Built-in"],
      ["Encryption in transit", "TLS 1.3 enforced", "✓ Built-in"],
      ["Access logging", "4-source audit pipeline", "✓ Built-in"],
      ["Password policy", "Configurable complexity, history, expiry", "✓ Built-in"],
      ["Session management", "JWT + refresh tokens, revocation", "✓ Built-in"],
      ["Data backup", "Automated backup configuration", "✓ Configurable"],
      ["Incident alerting", "SignalR real-time + webhook", "✓ Built-in"],
    ],
  },

  { type: "info", variant: "warning", contentKey: "commercial.complianceReadiness.disclaimer" },
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
