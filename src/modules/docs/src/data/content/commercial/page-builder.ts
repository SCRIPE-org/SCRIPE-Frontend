import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/page-builder",
  titleKey: "commercial.pageBuilder.title",
  category: "commercial-enterprise",
  order: 9,
  sections: buildLocalizedDocSections("commercial.pageBuilder", "commercial/page-builder"),
  relatedSlugs: ["commercial/login-customizer", "commercial/theme-marketplace"],
  lastUpdated: "2026-06-09",
});
