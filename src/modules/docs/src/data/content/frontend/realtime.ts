import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "frontend/realtime",
  titleKey: "frontend.realtime.title",
  category: "frontend",
  order: 7,
  sections: buildLocalizedDocSections("frontend.realtime", "frontend/realtime"),
  relatedSlugs: [
    "security/audit-compliance",
    "frontend/state-management",
    "api-reference/webhook-email-api",
  ],
  lastUpdated: "2026-06-09",
});
