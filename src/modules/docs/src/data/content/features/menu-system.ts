import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/menu-system",
  titleKey: "features.menuSystem.title",
  category: "features",
  order: 8,
  sections: buildLocalizedDocSections("features.menuSystem", "features/menu-system"),
  relatedSlugs: ["features/role-permissions", "features/user-management"],
  lastUpdated: "2026-06-09",
});
