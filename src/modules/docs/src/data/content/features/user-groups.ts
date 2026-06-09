import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/user-groups",
  titleKey: "features.userGroups.title",
  category: "features",
  order: 14,
  sections: buildLocalizedDocSections("features.userGroups", "features/user-groups"),
  relatedSlugs: ["features/role-permissions", "features/multi-tenancy", "features/user-management"],
  lastUpdated: "2026-06-09",
});
