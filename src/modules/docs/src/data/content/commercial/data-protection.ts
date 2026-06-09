import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/data-protection",
  titleKey: "commercial.dataProtection.title",
  category: "commercial-security",
  order: 3,
  sections: buildLocalizedDocSections("commercial.dataProtection", "commercial/data-protection"),
  relatedSlugs: ["commercial/security-overview", "commercial/infrastructure-security"],
  lastUpdated: "2026-06-09",
});
