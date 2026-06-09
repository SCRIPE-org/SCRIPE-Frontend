import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/health-checks",
  titleKey: "infrastructure.healthChecks.title",
  category: "infrastructure",
  order: 7,
  sections: buildLocalizedDocSections(
    "infrastructure.healthChecks",
    "infrastructure/health-checks"
  ),
  relatedSlugs: [
    "infrastructure/resilience",
    "infrastructure/gateway-deployment",
    "infrastructure/observability",
  ],
  lastUpdated: "2026-06-09",
});
