import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/authentication",
  titleKey: "features.authentication.title",
  category: "features",
  order: 1,
  sections: buildLocalizedDocSections("features.authentication", "features/authentication"),
  relatedSlugs: [
    "features/role-permissions",
    "features/audit-system",
    "security/authentication-deep",
  ],
  lastUpdated: "2026-06-09",
});
