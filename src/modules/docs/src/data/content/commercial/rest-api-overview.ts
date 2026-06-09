import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/rest-api-overview",
  titleKey: "commercial.restApiOverview.title",
  category: "commercial-integration",
  order: 1,
  sections: buildLocalizedDocSections("commercial.restApiOverview", "commercial/rest-api-overview"),
  relatedSlugs: ["commercial/webhook-integration", "commercial/api-design"],
  lastUpdated: "2026-06-09",
});
