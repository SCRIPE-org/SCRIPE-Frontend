import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.infraSecurity.intro" },

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
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.infraSecurity.cspTitle", id: "csp" },
      { type: "paragraph", contentKey: "commercial.infraSecurity.cspContent" },

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
