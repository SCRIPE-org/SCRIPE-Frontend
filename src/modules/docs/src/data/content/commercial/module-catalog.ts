import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/module-catalog",
  titleKey: "commercial.moduleCatalog.title",
  category: "commercial-platform",
  order: 2,
  sections: buildLocalizedDocSections("commercial.moduleCatalog", "commercial/module-catalog"),
  relatedSlugs: ["commercial/platform-architecture", "commercial/technology-stack"],
  lastUpdated: "2026-06-09",
});
