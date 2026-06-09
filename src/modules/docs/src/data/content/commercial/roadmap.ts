import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/roadmap",
  titleKey: "commercial.roadmap.title",
  category: "commercial-support",
  order: 4,
  sections: buildLocalizedDocSections("commercial.roadmap", "commercial/roadmap"),
  relatedSlugs: ["commercial/faq", "commercial/why-scripe-overview"],
  lastUpdated: "2026-06-09",
});
