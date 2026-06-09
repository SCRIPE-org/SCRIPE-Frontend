import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/enterprise-addons",
  titleKey: "commercial.enterpriseAddons.title",
  category: "commercial-pricing",
  order: 4,
  sections: buildLocalizedDocSections(
    "commercial.enterpriseAddons",
    "commercial/enterprise-addons"
  ),
  relatedSlugs: ["commercial/support-plans", "commercial/licensing-model"],
  lastUpdated: "2026-06-09",
});
