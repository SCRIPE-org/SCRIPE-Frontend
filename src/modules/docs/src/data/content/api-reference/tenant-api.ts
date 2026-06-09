import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/tenant-api",
  titleKey: "apiReference.tenantApi.title",
  category: "api-reference",
  order: 5,
  sections: buildLocalizedDocSections("apiReference.tenantApi", "api-reference/tenant-api"),
  relatedSlugs: [
    "api-reference/admin-api",
    "api-reference/role-permission-api",
    "security/data-protection",
  ],
  lastUpdated: "2026-06-09",
});
