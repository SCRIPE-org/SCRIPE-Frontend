import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/recycle-bin",
  titleKey: "features.recycleBin.title",
  category: "features",
  order: 9,
  sections: buildLocalizedDocSections("features.recycleBin", "features/recycle-bin"),
  relatedSlugs: ["features/user-management"],
  lastUpdated: "2026-06-09",
});
