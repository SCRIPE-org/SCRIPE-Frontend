import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "security/api-security",
  titleKey: "security.apiSecurity.title",
  category: "security",
  order: 4,
  sections: buildLocalizedDocSections("security.apiSecurity", "security/api-security"),
  relatedSlugs: [
    "security/overview",
    "security/authentication-deep",
    "security/middleware-pipeline",
  ],
  lastUpdated: "2026-06-09",
});
