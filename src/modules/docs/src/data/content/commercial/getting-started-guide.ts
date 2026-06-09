import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/getting-started-guide",
  titleKey: "commercial.gettingStartedGuide.title",
  category: "commercial-support",
  order: 2,
  sections: buildLocalizedDocSections(
    "commercial.gettingStartedGuide",
    "commercial/getting-started-guide"
  ),
  relatedSlugs: ["commercial/documentation-training", "commercial/faq"],
  lastUpdated: "2026-06-09",
});
