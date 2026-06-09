import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/sso-oauth",
  titleKey: "features.ssoOauth.title",
  category: "features",
  order: 14,
  sections: buildLocalizedDocSections("features.ssoOauth", "features/sso-oauth"),
  relatedSlugs: ["security/sso-identity-providers", "features/authentication"],
  lastUpdated: "2026-06-09",
});
