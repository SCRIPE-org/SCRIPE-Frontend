import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.infraSecurity.intro" },

      // ─── CORS Configuration ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.infraSecurity.corsTitle", id: "cors" },
      { type: "paragraph", contentKey: "commercial.infraSecurity.corsContent" },
      {
            type: "table",
            headers: ["Setting", "Configuration"],
            rows: [
                  ["Allowed Origins", "Configurable per environment (no wildcards in production)"],
                  ["Allowed Methods", "GET, POST, PUT, DELETE, PATCH (configurable)"],
                  ["Allowed Headers", "Authorization, Content-Type, X-CSRF-Token, X-Request-Id"],
                  ["Credentials", "Enabled (for cookie-based authentication)"],
                  ["Max Age", "86400 seconds (24 hours preflight cache)"],
            ],
      },

      // ─── Rate Limiting ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.infraSecurity.rateLimitTitle", id: "rate-limiting" },
      { type: "paragraph", contentKey: "commercial.infraSecurity.rateLimitContent" },
      {
            type: "table",
            headers: ["Endpoint Category", "Limit", "Window", "Strategy"],
            rows: [
                  ["Authentication", "5 requests", "Per minute", "Sliding window per IP"],
                  ["Password Reset", "3 requests", "Per hour", "Sliding window per email"],
                  ["General API", "100 requests", "Per minute", "Sliding window per user"],
                  ["File Upload", "10 requests", "Per minute", "Fixed window per user"],
                  ["Export/Download", "5 requests", "Per minute", "Token bucket per user"],
                  ["Webhook outbound", "50 requests", "Per minute", "Per destination URL"],
            ],
      },

      // ─── Content Security Policy ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.infraSecurity.cspTitle", id: "csp" },
      { type: "paragraph", contentKey: "commercial.infraSecurity.cspContent" },
      {
            type: "table",
            headers: ["Header", "Value", "Purpose"],
            rows: [
                  ["Content-Security-Policy", "default-src 'self'; script-src 'self'", "Prevent XSS and code injection"],
                  ["X-Content-Type-Options", "nosniff", "Prevent MIME type sniffing"],
                  ["X-Frame-Options", "DENY", "Prevent clickjacking"],
                  ["Strict-Transport-Security", "max-age=31536000; includeSubDomains", "Enforce HTTPS"],
                  ["Referrer-Policy", "strict-origin-when-cross-origin", "Control referrer information"],
                  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()", "Restrict browser features"],
            ],
      },

      // ─── Network Security ───────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.infraSecurity.networkTitle", id: "network" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "shield", titleKey: "commercial.infraSecurity.tlsInspection", descriptionKey: "commercial.infraSecurity.tlsInspectionDesc" },
                  { icon: "server", titleKey: "commercial.infraSecurity.reverseProxy", descriptionKey: "commercial.infraSecurity.reverseProxyDesc" },
                  { icon: "zap", titleKey: "commercial.infraSecurity.ipFiltering", descriptionKey: "commercial.infraSecurity.ipFilteringDesc" },
                  { icon: "building", titleKey: "commercial.infraSecurity.networkSegment", descriptionKey: "commercial.infraSecurity.networkSegmentDesc" },
            ],
      },

      // ─── Secrets Management ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.infraSecurity.secretsTitle", id: "secrets" },
      { type: "paragraph", contentKey: "commercial.infraSecurity.secretsContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Azure Key Vault integration for production secrets",
                  "Environment variable injection via Docker/Kubernetes",
                  "User Secrets for local development (dotnet user-secrets)",
                  "Automatic secret rotation with zero-downtime key rollover",
                  "No secrets in source code — all externalized configuration",
            ],
      },

      { type: "info", variant: "warning", contentKey: "commercial.infraSecurity.warningNote" },
];

registerPage({
      slug: "commercial/infrastructure-security",
      titleKey: "commercial.infraSecurity.title",
      descriptionKey: "commercial.infraSecurity.description",
      category: "commercial-security",
      order: 4,
      sections,
      relatedSlugs: ["commercial/data-protection", "commercial/compliance-readiness"],
      lastUpdated: "2026-02-20",
});
