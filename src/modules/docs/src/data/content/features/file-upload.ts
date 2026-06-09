import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/file-upload",
  titleKey: "features.fileUpload.title",
  category: "features",
  order: 11,
  sections: buildLocalizedDocSections("features.fileUpload", "features/file-upload"),
  relatedSlugs: ["features/download-export"],
  lastUpdated: "2026-06-09",
});
