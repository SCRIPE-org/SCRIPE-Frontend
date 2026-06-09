import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/multi-tenancy",
  titleKey: "commercial.multiTenancy.title",
  category: "commercial-enterprise",
  order: 1,
  sections: buildLocalizedDocSections("commercial.multiTenancy", "commercial/multi-tenancy"),
  relatedSlugs: ["commercial/roles-permissions", "commercial/audit-compliance"],
  lastUpdated: "2026-06-09",
});
