import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/audit-system",
  titleKey: "features.auditSystem.title",
  category: "features",
  order: 5,
  sections: buildLocalizedDocSections("features.auditSystem", "features/audit-system"),
  relatedSlugs: ["features/authentication", "features/role-permissions"],
  lastUpdated: "2026-06-09",
});
