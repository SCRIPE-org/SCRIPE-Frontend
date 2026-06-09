import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/authentication-api",
  titleKey: "apiReference.authApi.title",
  category: "api-reference",
  order: 2,
  sections: buildLocalizedDocSections("apiReference.authApi", "api-reference/authentication-api"),
  relatedSlugs: [
    "api-reference/user-auth-api",
    "security/authentication-deep",
    "api-reference/admin-api",
  ],
  lastUpdated: "2026-06-09",
});
