import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/observability",
  titleKey: "infrastructure.observability.title",
  category: "infrastructure",
  order: 8,
  sections: buildLocalizedDocSections(
    "infrastructure.observability",
    "infrastructure/observability"
  ),
  relatedSlugs: [
    "infrastructure/health-checks",
    "infrastructure/resilience",
    "infrastructure/audit-trail",
  ],
  lastUpdated: "2026-06-09",
});
