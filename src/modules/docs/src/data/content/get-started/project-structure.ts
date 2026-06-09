import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "get-started/project-structure",
  titleKey: "getStarted.projectStructure.title",
  category: "get-started",
  order: 4,
  sections: buildLocalizedDocSections(
    "getStarted.projectStructure",
    "get-started/project-structure"
  ),
  relatedSlugs: ["get-started/overview", "architecture/modules"],
  lastUpdated: "2026-06-09",
});
