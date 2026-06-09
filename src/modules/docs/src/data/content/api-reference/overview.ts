import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/overview",
  titleKey: "apiReference.overview.title",
  category: "api-reference",
  order: 1,
  sections: buildLocalizedDocSections("apiReference.overview", "api-reference/overview"),
  relatedSlugs: ["features/authentication", "architecture/data-flow"],
  lastUpdated: "2026-06-09",
});
