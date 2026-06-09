import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/audit-compliance",
  titleKey: "commercial.auditCompliance.title",
  category: "commercial-enterprise",
  order: 3,
  sections: buildLocalizedDocSections("commercial.auditCompliance", "commercial/audit-compliance"),
  relatedSlugs: ["commercial/security-overview", "commercial/multi-tenancy"],
  lastUpdated: "2026-06-09",
});
