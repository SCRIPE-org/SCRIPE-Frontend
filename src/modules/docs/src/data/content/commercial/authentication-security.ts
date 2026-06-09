import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/authentication-security",
  titleKey: "commercial.authSecurity.title",
  category: "commercial-security",
  order: 2,
  sections: buildLocalizedDocSections(
    "commercial.authSecurity",
    "commercial/authentication-security"
  ),
  relatedSlugs: ["commercial/security-overview", "commercial/data-protection"],
  lastUpdated: "2026-06-09",
});
