import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/system-api",
  titleKey: "apiReference.systemApi.title",
  category: "api-reference",
  order: 8,
  sections: buildLocalizedDocSections("apiReference.systemApi", "api-reference/system-api"),
  relatedSlugs: [
    "api-reference/admin-api",
    "security/audit-compliance",
    "api-reference/webhook-email-api",
  ],
  lastUpdated: "2026-06-09",
});
