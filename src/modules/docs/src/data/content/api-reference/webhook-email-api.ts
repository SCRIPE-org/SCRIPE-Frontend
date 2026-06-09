import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "api-reference/webhook-email-api",
  titleKey: "apiReference.webhookEmailApi.title",
  category: "api-reference",
  order: 7,
  sections: buildLocalizedDocSections(
    "apiReference.webhookEmailApi",
    "api-reference/webhook-email-api"
  ),
  relatedSlugs: [
    "api-reference/system-api",
    "security/audit-compliance",
    "api-reference/admin-api",
  ],
  lastUpdated: "2026-06-09",
});
