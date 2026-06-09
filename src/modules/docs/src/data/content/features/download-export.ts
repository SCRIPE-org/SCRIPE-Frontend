import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/download-export",
  titleKey: "features.downloadExport.title",
  category: "features",
  order: 12,
  sections: buildLocalizedDocSections("features.downloadExport", "features/download-export"),
  relatedSlugs: ["features/file-upload"],
  lastUpdated: "2026-06-09",
});
