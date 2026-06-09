import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/ci-cd-pipeline",
  titleKey: "commercial.ciCdPipeline.title",
  category: "commercial-integration",
  order: 4,
  sections: buildLocalizedDocSections("commercial.ciCdPipeline", "commercial/ci-cd-pipeline"),
  relatedSlugs: ["commercial/deployment-modes", "commercial/testing-strategy"],
  lastUpdated: "2026-06-09",
});
