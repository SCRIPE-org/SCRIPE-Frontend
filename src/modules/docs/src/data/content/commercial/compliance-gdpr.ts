import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/compliance-gdpr",
  titleKey: "commercial.complianceGdpr.title",
  category: "commercial-modules",
  order: 2,
  sections: buildLocalizedDocSections("commercial.complianceGdpr", "commercial/compliance-gdpr"),
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
