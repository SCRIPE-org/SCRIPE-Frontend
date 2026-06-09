import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "security/audit-compliance",
  titleKey: "security.auditCompliance.title",
  category: "security",
  order: 6,
  sections: buildLocalizedDocSections("security.auditCompliance", "security/audit-compliance"),
  relatedSlugs: ["security/overview", "security/middleware-pipeline", "security/data-protection"],
  lastUpdated: "2026-06-09",
});
