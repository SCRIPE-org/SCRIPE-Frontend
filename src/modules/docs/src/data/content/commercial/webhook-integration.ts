import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/webhook-integration",
  titleKey: "commercial.webhookIntegration.title",
  category: "commercial-integration",
  order: 2,
  sections: buildLocalizedDocSections(
    "commercial.webhookIntegration",
    "commercial/webhook-integration"
  ),
  relatedSlugs: ["commercial/rest-api-overview", "commercial/email-integration"],
  lastUpdated: "2026-06-09",
});
