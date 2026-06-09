import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/support-plans",
  titleKey: "commercial.supportPlans.title",
  category: "commercial-pricing",
  order: 3,
  sections: buildLocalizedDocSections("commercial.supportPlans", "commercial/support-plans"),
  relatedSlugs: ["commercial/licensing-model", "commercial/documentation-training"],
  lastUpdated: "2026-06-09",
});
