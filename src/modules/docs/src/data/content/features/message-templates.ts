import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/message-templates",
  titleKey: "features.messageTemplates.title",
  category: "features",
  order: 13,
  sections: buildLocalizedDocSections("features.messageTemplates", "features/message-templates"),
  relatedSlugs: ["features/email-system", "features/notification-system"],
  lastUpdated: "2026-06-09",
});
