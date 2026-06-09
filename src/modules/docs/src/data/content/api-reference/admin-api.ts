import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/admin-api",
  titleKey: "apiReference.adminApi.title",
  category: "api-reference",
  order: 4,
  sections: buildLocalizedDocSections("apiReference.adminApi", "api-reference/admin-api"),
  relatedSlugs: [
    "api-reference/authentication-api",
    "api-reference/role-permission-api",
    "api-reference/tenant-api",
  ],
  lastUpdated: "2026-06-09",
});
