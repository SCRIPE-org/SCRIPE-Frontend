import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "security/overview",
  titleKey: "security.overview.title",
  category: "security",
  order: 1,
  sections: buildLocalizedDocSections("security.overview", "security/overview"),
  relatedSlugs: ["features/authentication", "features/role-permissions"],
  lastUpdated: "2026-06-09",
});
