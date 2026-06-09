import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "get-started/overview",
  titleKey: "getStarted.overview.title",
  category: "get-started",
  order: 1,
  sections: buildLocalizedDocSections("getStarted.overview", "get-started/overview"),
  relatedSlugs: ["get-started/prerequisites", "get-started/quick-start", "architecture/overview"],
  lastUpdated: "2026-06-09",
});
