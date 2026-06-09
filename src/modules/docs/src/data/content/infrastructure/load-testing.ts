import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/load-testing",
  titleKey: "infrastructure.loadTesting.title",
  category: "infrastructure",
  order: 10,
  sections: buildLocalizedDocSections("infrastructure.loadTesting", "infrastructure/load-testing"),
  relatedSlugs: [
    "infrastructure/observability",
    "infrastructure/resilience",
    "infrastructure/health-checks",
  ],
  lastUpdated: "2026-06-09",
});
