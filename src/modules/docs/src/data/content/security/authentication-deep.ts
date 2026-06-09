import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "security/authentication-deep",
  titleKey: "security.authDeep.title",
  category: "security",
  order: 2,
  sections: buildLocalizedDocSections("security.authDeep", "security/authentication-deep"),
  relatedSlugs: [
    "security/overview",
    "security/data-protection",
    "security/api-security",
    "features/authentication",
  ],
  lastUpdated: "2026-06-09",
});
