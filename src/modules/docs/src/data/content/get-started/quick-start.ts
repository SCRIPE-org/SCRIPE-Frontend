import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "get-started/quick-start",
  titleKey: "getStarted.quickStart.title",
  category: "get-started",
  order: 3,
  sections: buildLocalizedDocSections("getStarted.quickStart", "get-started/quick-start"),
  relatedSlugs: ["get-started/prerequisites", "get-started/project-structure"],
  lastUpdated: "2026-06-09",
});
