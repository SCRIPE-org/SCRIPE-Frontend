import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/email-integration",
  titleKey: "commercial.emailIntegration.title",
  category: "commercial-integration",
  order: 3,
  sections: buildLocalizedDocSections(
    "commercial.emailIntegration",
    "commercial/email-integration"
  ),
  relatedSlugs: ["commercial/webhook-integration", "commercial/message-templates"],
  lastUpdated: "2026-06-09",
});
