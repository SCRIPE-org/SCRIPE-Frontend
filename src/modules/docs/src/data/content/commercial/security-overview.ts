import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/security-overview",
  titleKey: "commercial.securityOverview.title",
  category: "commercial-security",
  order: 1,
  sections: buildLocalizedDocSections(
    "commercial.securityOverview",
    "commercial/security-overview"
  ),
  relatedSlugs: ["commercial/authentication-security", "commercial/data-protection"],
  lastUpdated: "2026-06-09",
});
