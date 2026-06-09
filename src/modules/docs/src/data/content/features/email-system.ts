import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/email-system",
  titleKey: "features.emailSystem.title",
  category: "features",
  order: 6,
  sections: buildLocalizedDocSections("features.emailSystem", "features/email-system"),
  relatedSlugs: ["features/notification-system", "features/message-templates"],
  lastUpdated: "2026-06-09",
});
