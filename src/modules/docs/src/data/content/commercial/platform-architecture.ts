import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/platform-architecture",
  titleKey: "commercial.platformArchitecture.title",
  category: "commercial-platform",
  order: 1,
  sections: buildLocalizedDocSections(
    "commercial.platformArchitecture",
    "commercial/platform-architecture"
  ),
  relatedSlugs: ["commercial/technology-stack", "commercial/deployment-modes"],
  lastUpdated: "2026-06-09",
});
