import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/notification-system",
  titleKey: "features.notificationSystem.title",
  category: "features",
  order: 5,
  sections: buildLocalizedDocSections(
    "features.notificationSystem",
    "features/notification-system"
  ),
  relatedSlugs: ["features/email-system", "features/webhook-system"],
  lastUpdated: "2026-06-09",
});
