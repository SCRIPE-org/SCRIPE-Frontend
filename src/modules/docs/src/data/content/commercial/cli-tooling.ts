import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/cli-tooling",
  titleKey: "commercial.cliTooling.title",
  category: "commercial-developer",
  order: 1,
  sections: buildLocalizedDocSections("commercial.cliTooling", "commercial/cli-tooling"),
  relatedSlugs: ["commercial/clean-architecture", "commercial/api-design"],
  lastUpdated: "2026-06-09",
});
