import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/system-requirements",
  titleKey: "commercial.systemRequirements.title",
  category: "commercial-platform",
  order: 5,
  sections: buildLocalizedDocSections(
    "commercial.systemRequirements",
    "commercial/system-requirements"
  ),
  relatedSlugs: ["commercial/deployment-modes", "commercial/technology-stack"],
  lastUpdated: "2026-06-09",
});
