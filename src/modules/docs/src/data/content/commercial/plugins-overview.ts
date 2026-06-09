import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/plugins-overview",
  titleKey: "commercial.pluginsOverview.title",
  category: "commercial-modules",
  order: 3,
  sections: buildLocalizedDocSections("commercial.pluginsOverview", "commercial/plugins-overview"),
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
