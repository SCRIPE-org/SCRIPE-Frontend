import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/scripe-studio",
  titleKey: "infrastructure.scripeStudio.title",
  category: "infrastructure",
  order: 11,
  sections: buildLocalizedDocSections(
    "infrastructure.scripeStudio",
    "infrastructure/scripe-studio"
  ),
  relatedSlugs: ["infrastructure/scripe-cli", "get-started/overview"],
  lastUpdated: "2026-06-09",
});
