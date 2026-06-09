import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "security/data-protection",
  titleKey: "security.dataProtection.title",
  category: "security",
  order: 3,
  sections: buildLocalizedDocSections("security.dataProtection", "security/data-protection"),
  relatedSlugs: ["security/overview", "security/authentication-deep", "security/audit-compliance"],
  lastUpdated: "2026-06-09",
});
