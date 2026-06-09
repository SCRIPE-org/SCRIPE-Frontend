import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "get-started/prerequisites",
  titleKey: "getStarted.prerequisites.title",
  category: "get-started",
  order: 2,
  sections: buildLocalizedDocSections("getStarted.prerequisites", "get-started/prerequisites"),
  relatedSlugs: ["get-started/overview", "get-started/quick-start"],
  lastUpdated: "2026-06-09",
});
