import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/clean-architecture",
  titleKey: "commercial.cleanArchitecture.title",
  category: "commercial-developer",
  order: 2,
  sections: buildLocalizedDocSections(
    "commercial.cleanArchitecture",
    "commercial/clean-architecture"
  ),
  relatedSlugs: ["commercial/cli-tooling", "commercial/api-design"],
  lastUpdated: "2026-06-09",
});
