import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/infrastructure-security",
  titleKey: "commercial.infraSecurity.title",
  category: "commercial-security",
  order: 4,
  sections: buildLocalizedDocSections(
    "commercial.infraSecurity",
    "commercial/infrastructure-security"
  ),
  relatedSlugs: ["commercial/data-protection", "commercial/compliance-readiness"],
  lastUpdated: "2026-06-09",
});
