import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/testing-strategy",
  titleKey: "commercial.testingStrategy.title",
  category: "commercial-developer",
  order: 4,
  sections: buildLocalizedDocSections("commercial.testingStrategy", "commercial/testing-strategy"),
  relatedSlugs: ["commercial/clean-architecture", "commercial/ci-cd-pipeline"],
  lastUpdated: "2026-06-09",
});
