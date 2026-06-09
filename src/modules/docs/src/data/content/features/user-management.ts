import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/user-management",
  titleKey: "features.userManagement.title",
  category: "features",
  order: 10,
  sections: buildLocalizedDocSections("features.userManagement", "features/user-management"),
  relatedSlugs: ["features/role-permissions", "features/recycle-bin"],
  lastUpdated: "2026-06-09",
});
