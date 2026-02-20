import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.securityOverview.intro" },
      { type: "heading", level: 2, titleKey: "commercial.securityOverview.pipelineTitle", id: "security-pipeline" },
      {
            type: "table",
            headers: ["Layer", "Mechanism", "What It Prevents"],
            rows: [
                  ["1", "HTTPS + HSTS (max-age=31536000)", "Man-in-the-middle, SSL stripping"],
                  ["2", "Rate Limiting (100 req/min per IP)", "DDoS, brute force"],
                  ["3", "Security Headers (CSP, X-Frame, Referrer)", "XSS, clickjacking, info leakage"],
                  ["4", "Authentication (JWT + OTP)", "Unauthorized access"],
                  ["5", "Authorization (RBAC, ~40 permissions)", "Privilege escalation"],
                  ["6", "CSRF Protection (double-submit cookie)", "Cross-site request forgery"],
                  ["7", "Replay Protection (nonce + timestamp)", "Request replay attacks"],
                  ["8", "Field Projection (per-role filtering)", "Data leakage"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.securityOverview.transportTitle", id: "transport-security" },
      {
            type: "table",
            headers: ["Mechanism", "Configuration"],
            rows: [
                  ["HTTPS enforced", "HTTP requests redirect to HTTPS"],
                  ["HSTS", "max-age=31536000; includeSubDomains (1 year)"],
                  ["TLS 1.2+", "Older protocols disabled"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.securityOverview.rateLimitTitle", id: "rate-limiting" },
      {
            type: "table",
            headers: ["Rule", "Limit", "Window"],
            rows: [
                  ["Global per-IP", "100 requests", "1 minute"],
                  ["Auth endpoints", "10 requests", "1 minute"],
                  ["Custom (configurable)", "Variable", "Variable"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.securityOverview.headersTitle", id: "security-headers" },
      {
            type: "table",
            headers: ["Header", "Value", "Prevents"],
            rows: [
                  ["X-Content-Type-Options", "nosniff", "MIME type sniffing"],
                  ["X-Frame-Options", "DENY", "Clickjacking"],
                  ["Content-Security-Policy", "default-src 'self'", "XSS injection"],
                  ["Referrer-Policy", "strict-origin-when-cross-origin", "Information leakage"],
                  ["Permissions-Policy", "camera=(), microphone=()", "Feature abuse"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.securityOverview.auditTitle", id: "audit-trail" },
      { type: "paragraph", contentKey: "commercial.securityOverview.auditIntro" },
      {
            type: "table",
            headers: ["Field", "Example"],
            rows: [
                  ["Admin ID", "550e8400-e29b-41d4-..."],
                  ["Action", "POST /api/admins"],
                  ["IP Address", "192.168.1.100"],
                  ["Timestamp", "2024-01-15T10:30:00Z"],
                  ["Before/After", "Entity snapshot diff"],
                  ["Status Code", "201 Created"],
                  ["Duration", "45ms"],
                  ["User Agent", "Mozilla/5.0..."],
            ],
      },
      { type: "info", variant: "warning", contentKey: "commercial.securityOverview.auditImmutable" },
];

registerPage({
      slug: "commercial/security-overview",
      titleKey: "commercial.securityOverview.title",
      descriptionKey: "commercial.securityOverview.description",
      category: "commercial-security",
      order: 1,
      sections,
      relatedSlugs: ["commercial/auth-security", "commercial/data-protection"],
      lastUpdated: "2026-02-19",
});
