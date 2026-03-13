import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.securityOverview.intro" },

      { type: "heading", level: 2, titleKey: "commercial.securityOverview.modelTitle", id: "security-model" },
      { type: "paragraph", contentKey: "commercial.securityOverview.modelContent" },
      {
            type: "flowchart",
            direction: "vertical",
            title: "9-Layer Security Architecture",
            nodes: [
                  { id: "l1", label: "L1: TLS 1.3 Transport Encryption", type: "default" },
                  { id: "l2", label: "L2: Rate Limiting & IP Filtering (7-tier)", type: "info" },
                  { id: "l3", label: "L3: JWT Authentication + 2FA", type: "primary" },
                  { id: "l4", label: "L4: CSRF Token Validation (timing-safe)", type: "warning" },
                  { id: "l5", label: "L5: Input Sanitization (HTML stripping)", type: "warning" },
                  { id: "l6", label: "L6: RBAC + Field-Level Authorization", type: "primary" },
                  { id: "l7", label: "L7: Anti-Replay (Mandatory Nonce + Timestamp)", type: "warning" },
                  { id: "l8", label: "L8: Response Field Projection", type: "success" },
                  { id: "l9", label: "L9: Comprehensive Audit Trail", type: "danger" },
            ],
            connections: [
                  { from: "l1", to: "l2" }, { from: "l2", to: "l3" },
                  { from: "l3", to: "l4" }, { from: "l4", to: "l5" },
                  { from: "l5", to: "l6" }, { from: "l6", to: "l7" },
                  { from: "l7", to: "l8" }, { from: "l8", to: "l9" },
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.securityOverview.summaryTitle", id: "summary" },
      {
            type: "table",
            headers: ["Layer", "Purpose", "Technology"],
            rows: [
                  ["Transport", "Encrypt all data in transit", "TLS 1.3, HSTS forced in production"],
                  ["Rate Limiting", "Prevent brute force & DDoS", "7-tier ASP.NET Core Rate Limiting"],
                  ["Authentication", "Verify user identity", "JWT + refresh cookies, BCrypt-12, 2FA TOTP"],
                  ["CSRF Protection", "Prevent cross-site request forgery", "Double-submit cookie (timing-safe comparison)"],
                  ["Input Sanitization", "Prevent XSS at backend level", "HTML tag stripping on all JSON inputs"],
                  ["Authorization", "Control resource access", "Policy-based RBAC, field projections"],
                  ["Anti-Replay", "Prevent request replay attacks", "Mandatory nonce + timestamp validation"],
                  ["Field Projection", "Hide sensitive fields per role", "Custom middleware, per-entity config"],
                  ["Audit Trail", "Record all security events", "4-source pipeline, SignalR streaming"],
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.securityOverview.headersTitle", id: "headers" },
      {
            type: "code",
            language: "text",
            filename: "Security Headers Applied to Every Response",
            code: `X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=()`,
      },

      { type: "heading", level: 2, titleKey: "commercial.securityOverview.complianceTitle", id: "compliance" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "shield", titleKey: "commercial.securityOverview.sox", descriptionKey: "commercial.securityOverview.soxDesc" },
                  { icon: "globe", titleKey: "commercial.securityOverview.gdpr", descriptionKey: "commercial.securityOverview.gdprDesc" },
                  { icon: "building", titleKey: "commercial.securityOverview.soc2", descriptionKey: "commercial.securityOverview.soc2Desc" },
            ],
      },
];

registerPage({
      slug: "commercial/security-overview",
      titleKey: "commercial.securityOverview.title",
      descriptionKey: "commercial.securityOverview.description",
      category: "commercial-security",
      order: 1,
      sections,
      relatedSlugs: ["commercial/authentication-security", "commercial/data-protection"],
      lastUpdated: "2026-03-13",
});
