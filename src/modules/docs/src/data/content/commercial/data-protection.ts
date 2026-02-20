import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.dataProtection.intro" },
      { type: "heading", level: 2, titleKey: "commercial.dataProtection.atRestTitle", id: "data-at-rest" },
      {
            type: "table",
            headers: ["Mechanism", "Implementation"],
            rows: [
                  ["Database encryption", "SQL Server TDE, Oracle TDE, PostgreSQL pgcrypto — no application changes needed"],
                  ["Blob storage encryption", "Azure SSE, S3 SSE-S3, MinIO encryption-at-rest"],
                  ["ID encryption", "AES-256-CBC for external-facing entity IDs (prevents enumeration)"],
                  ["Password hashing", "BCrypt with configurable work factor"],
                  ["Token storage", "Refresh tokens hashed before database storage"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.dataProtection.inTransitTitle", id: "data-in-transit" },
      {
            type: "table",
            headers: ["Mechanism", "Configuration"],
            rows: [
                  ["HTTPS", "Enforced — all HTTP requests redirect to HTTPS"],
                  ["HSTS", "max-age=31536000; includeSubDomains — browsers remember HTTPS for 1 year"],
                  ["TLS version", "1.2 minimum, 1.3 preferred"],
                  ["WebSocket", "WSS (encrypted) for SignalR hubs"],
                  ["Certificate pinning", "Supported via client configuration"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.dataProtection.inProcessTitle", id: "data-in-processing" },
      {
            type: "table",
            headers: ["Mechanism", "What It Protects"],
            rows: [
                  ["Field projection", "Hides restricted fields (salary, ssn) based on admin's role"],
                  ["Log redaction", "Strips password, token, secret, authorization from structured logs"],
                  ["ID encryption", "Prevents entity enumeration in public-facing URLs"],
                  ["Parameterized queries", "EF Core prevents SQL injection by default"],
                  ["Input sanitization", "HTML sanitizer strips <script>, javascript:, event handlers from email bodies"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.dataProtection.complianceTitle", id: "compliance-alignment" },
      {
            type: "table",
            headers: ["Standard", "NEXORA Capabilities"],
            rows: [
                  ["SOC 2 Type II", "Immutable audit trails, access controls, encryption at rest/transit, change management"],
                  ["GDPR", "Data isolation (multi-tenancy), right to deletion (recycle bin → purge), consent tracking, data export"],
                  ["ISO 27001", "Information security management via RBAC, audit logging, incident response (webhook events)"],
                  ["PCI DSS", "Network segmentation (tenant isolation), encryption, access logging, secure coding practices"],
                  ["HIPAA", "Access controls, audit trails, data encryption, minimum necessary (field projection)"],
            ],
      },
      { type: "info", variant: "note", contentKey: "commercial.dataProtection.complianceNote" },
      { type: "heading", level: 2, titleKey: "commercial.dataProtection.retentionTitle", id: "data-retention" },
      {
            type: "table",
            headers: ["Data Type", "Default Retention", "Configurable"],
            rows: [
                  ["Audit logs", "90 days", "Yes — per tenant"],
                  ["Soft-deleted entities", "30 days before auto-purge", "Yes — per tenant"],
                  ["Sent email logs", "365 days", "Yes"],
                  ["Download sessions", "1 hour", "Yes"],
                  ["Replay nonces", "10 minutes", "Fixed (security)"],
                  ["Refresh tokens", "7 days", "Yes"],
            ],
      },
];

registerPage({
      slug: "commercial/data-protection",
      titleKey: "commercial.dataProtection.title",
      descriptionKey: "commercial.dataProtection.description",
      category: "commercial-security",
      order: 3,
      sections,
      relatedSlugs: ["commercial/security-overview", "commercial/auth-security", "commercial/audit-compliance"],
      lastUpdated: "2026-02-19",
});
