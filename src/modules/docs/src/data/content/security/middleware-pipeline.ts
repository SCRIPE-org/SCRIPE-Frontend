import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "security/middleware-pipeline",
  titleKey: "security.middlewarePipeline.title",
  category: "security",
  order: 5,
  sections: buildLocalizedDocSections(
    "security.middlewarePipeline",
    "security/middleware-pipeline"
  ),
  relatedSlugs: ["security/api-security", "architecture/backend", "security/authentication-deep"],
  lastUpdated: "2026-06-09",
});
