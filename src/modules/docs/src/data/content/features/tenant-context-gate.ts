import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/tenant-context-gate",
  titleKey: "features.tenantContextGate.title",
  category: "features",
  order: 22,
  sections: buildLocalizedDocSections("features.tenantContextGate", "features/tenant-context-gate"),
  relatedSlugs: ["modules/tenant-plans", "modules/user-subscriptions", "features/menu-system"],
  lastUpdated: "2026-06-09",
});
