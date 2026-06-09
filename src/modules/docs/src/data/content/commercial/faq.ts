import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/faq",
  titleKey: "commercial.faq.title",
  category: "commercial-support",
  order: 3,
  sections: buildLocalizedDocSections("commercial.faq", "commercial/faq"),
  relatedSlugs: ["commercial/getting-started-guide", "commercial/roadmap"],
  lastUpdated: "2026-06-09",
});
