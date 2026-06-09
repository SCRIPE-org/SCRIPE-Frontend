import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/compliance-overview",
  titleKey: "commercial.complianceOverview.title",
  category: "commercial-modules",
  order: 1,
  sections: buildLocalizedDocSections(
    "commercial.complianceOverview",
    "commercial/compliance-overview"
  ),
  relatedSlugs: [],
  lastUpdated: "2026-06-09",
});
