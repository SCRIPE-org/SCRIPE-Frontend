import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/user-groups",
  titleKey: "commercial.userGroups.title",
  category: "commercial-enterprise",
  order: 3,
  sections: buildLocalizedDocSections("commercial.userGroups", "commercial/user-groups"),
  relatedSlugs: ["commercial/roles-permissions", "commercial/multi-tenancy"],
  lastUpdated: "2026-06-09",
});
