import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/multi-tenancy",
  titleKey: "features.multiTenancy.title",
  category: "features",
  order: 2,
  sections: buildLocalizedDocSections("features.multiTenancy", "features/multi-tenancy"),
  relatedSlugs: ["features/authentication", "features/role-permissions"],
  lastUpdated: "2026-06-09",
});
