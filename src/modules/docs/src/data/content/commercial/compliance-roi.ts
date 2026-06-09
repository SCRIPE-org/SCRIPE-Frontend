import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/compliance-roi",
  titleKey: "commercial.complianceRoi.title",
  category: "commercial-modules",
  order: 4,
  sections: buildLocalizedDocSections("commercial.complianceRoi", "commercial/compliance-roi"),
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
