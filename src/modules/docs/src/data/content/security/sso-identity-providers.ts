import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "security/sso-identity-providers",
  titleKey: "security.sso.title",
  category: "security",
  order: 7,
  sections: buildLocalizedDocSections("security.sso", "security/sso-identity-providers"),
  relatedSlugs: ["security/authentication-deep", "security/api-security", "features/sso-oauth"],
  lastUpdated: "2026-06-09",
});
