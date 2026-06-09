import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/compliance-readiness",
  titleKey: "commercial.complianceReadiness.title",
  category: "commercial-security",
  order: 5,
  sections: buildLocalizedDocSections(
    "commercial.complianceReadiness",
    "commercial/compliance-readiness"
  ),
  relatedSlugs: ["commercial/security-overview", "commercial/audit-compliance"],
  lastUpdated: "2026-06-09",
});
