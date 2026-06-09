import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/documentation-training",
  titleKey: "commercial.documentationTraining.title",
  category: "commercial-support",
  order: 1,
  sections: buildLocalizedDocSections(
    "commercial.documentationTraining",
    "commercial/documentation-training"
  ),
  relatedSlugs: ["commercial/getting-started-guide", "commercial/support-plans"],
  lastUpdated: "2026-06-09",
});
