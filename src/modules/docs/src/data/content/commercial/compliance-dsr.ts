import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/compliance-dsr",
  titleKey: "commercial.complianceDsr.title",
  category: "commercial-modules",
  order: 3,
  sections: buildLocalizedDocSections("commercial.complianceDsr", "commercial/compliance-dsr"),
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
