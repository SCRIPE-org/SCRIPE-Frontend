import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.securityMonitoring.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Threat Detection & Rate Limiting",
    id: "monitoring",
  },
  {
    type: "paragraph",
    contentKey: "The Security Monitoring module scans real-time event streams for suspicious access patterns, failed login bursts, and cross-tenant probe attempts. Combined with ASP.NET Core rate limiting middleware, it protects key routes and generates security logs for compliance auditing.",
  },
];

registerPage({
  slug: "modules/security-monitoring",
  titleKey: "modules.securityMonitoring.title",
  descriptionKey: "modules.securityMonitoring.description",
  category: "modules",
  order: 5,
  sections,
  relatedSlugs: ["modules/audit-logs", "modules/webhooks"],
  lastUpdated: "2026-06-28",
});
