import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/sso-enterprise",
  titleKey: "commercial.ssoEnterprise.title",
  category: "commercial-security",
  order: 6,
  sections: buildLocalizedDocSections("commercial.ssoEnterprise", "commercial/sso-enterprise"),
  relatedSlugs: ["commercial/authentication-security", "commercial/security-overview"],
  lastUpdated: "2026-06-09",
});
