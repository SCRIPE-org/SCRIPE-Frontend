import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/user-auth-api",
  titleKey: "apiReference.userAuthApi.title",
  category: "api-reference",
  order: 3,
  sections: buildLocalizedDocSections("apiReference.userAuthApi", "api-reference/user-auth-api"),
  relatedSlugs: [
    "api-reference/authentication-api",
    "security/authentication-deep",
    "api-reference/admin-api",
  ],
  lastUpdated: "2026-06-09",
});
