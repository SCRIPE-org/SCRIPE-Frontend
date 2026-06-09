import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/api-design",
  titleKey: "commercial.apiDesign.title",
  category: "commercial-developer",
  order: 3,
  sections: buildLocalizedDocSections("commercial.apiDesign", "commercial/api-design"),
  relatedSlugs: ["commercial/clean-architecture", "commercial/rest-api-overview"],
  lastUpdated: "2026-06-09",
});
