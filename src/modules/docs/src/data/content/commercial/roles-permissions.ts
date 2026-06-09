import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/roles-permissions",
  titleKey: "commercial.rolesPermissions.title",
  category: "commercial-enterprise",
  order: 2,
  sections: buildLocalizedDocSections(
    "commercial.rolesPermissions",
    "commercial/roles-permissions"
  ),
  relatedSlugs: ["commercial/multi-tenancy", "commercial/authentication-security"],
  lastUpdated: "2026-06-09",
});
