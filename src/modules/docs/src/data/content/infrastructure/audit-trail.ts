import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/audit-trail",
  titleKey: "infrastructure.auditTrail.title",
  category: "infrastructure",
  order: 9,
  sections: buildLocalizedDocSections("infrastructure.auditTrail", "infrastructure/audit-trail"),
  relatedSlugs: [
    "features/audit-system",
    "security/audit-compliance",
    "infrastructure/observability",
  ],
  lastUpdated: "2026-06-09",
});
