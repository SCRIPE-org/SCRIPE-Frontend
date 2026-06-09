import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/webhook-system",
  titleKey: "features.webhookSystem.title",
  category: "features",
  order: 6,
  sections: buildLocalizedDocSections("features.webhookSystem", "features/webhook-system"),
  relatedSlugs: ["features/audit-system", "features/multi-tenancy"],
  lastUpdated: "2026-06-09",
});
