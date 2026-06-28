import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.auditLogs.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Audit Logging Architecture",
    id: "architecture",
  },
  {
    type: "paragraph",
    contentKey: "SCRIPE includes a comprehensive audit logging system utilizing AstraFlow pipeline behaviors. The AuditBehavior automatically captures all query/command metadata, client IP addresses, user identifiers, and mutation payloads, persisting them to an isolated, tamper-proof audit trail table.",
  },
];

registerPage({
  slug: "modules/audit-logs",
  titleKey: "modules.auditLogs.title",
  descriptionKey: "modules.auditLogs.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: ["modules/security-monitoring", "modules/ecosystem-recycle-bin"],
  lastUpdated: "2026-06-28",
});
