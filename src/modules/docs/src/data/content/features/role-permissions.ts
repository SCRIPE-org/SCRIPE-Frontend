import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/role-permissions",
  titleKey: "features.rolePermissions.title",
  category: "features",
  order: 3,
  sections: buildLocalizedDocSections("features.rolePermissions", "features/role-permissions"),
  relatedSlugs: ["features/authentication", "features/multi-tenancy"],
  lastUpdated: "2026-06-09",
});
