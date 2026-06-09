import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/role-permission-api",
  titleKey: "apiReference.rolePermissionApi.title",
  category: "api-reference",
  order: 6,
  sections: buildLocalizedDocSections(
    "apiReference.rolePermissionApi",
    "api-reference/role-permission-api"
  ),
  relatedSlugs: ["api-reference/admin-api", "api-reference/tenant-api", "security/data-protection"],
  lastUpdated: "2026-06-09",
});
