import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/message-templates",
  titleKey: "commercial.messageTemplates.title",
  category: "commercial-enterprise",
  order: 6,
  sections: buildLocalizedDocSections(
    "commercial.messageTemplates",
    "commercial/message-templates"
  ),
  relatedSlugs: ["commercial/localization-i18n", "commercial/email-integration"],
  lastUpdated: "2026-06-09",
});
