import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/licensing-model",
  titleKey: "commercial.licensingModel.title",
  category: "commercial-pricing",
  order: 1,
  sections: buildLocalizedDocSections("commercial.licensingModel", "commercial/licensing-model"),
  relatedSlugs: ["commercial/roi-analysis", "commercial/support-plans"],
  lastUpdated: "2026-06-09",
});
