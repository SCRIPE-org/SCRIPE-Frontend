import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/user-groups-api",
  titleKey: "apiReference.userGroupsApi.title",
  category: "api-reference",
  order: 7,
  sections: buildLocalizedDocSections(
    "apiReference.userGroupsApi",
    "api-reference/user-groups-api"
  ),
  relatedSlugs: ["api-reference/role-permission-api", "api-reference/admin-api"],
  lastUpdated: "2026-06-09",
});
