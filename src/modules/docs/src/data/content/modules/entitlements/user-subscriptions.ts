import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/user-subscriptions",
  titleKey: "modules.userSubscriptions.title",
  category: "modules",
  order: 10,
  sections: buildLocalizedDocSections("modules.userSubscriptions", "modules/user-subscriptions"),
  relatedSlugs: ["modules/tenant-plans", "modules/subscriptions", "features/tenant-context-gate"],
  lastUpdated: "2026-06-09",
});
