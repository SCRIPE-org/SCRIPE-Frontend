import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/dunning",
  titleKey: "modules.dunning.title",
  category: "modules",
  order: 8,
  sections: buildLocalizedDocSections("modules.dunning", "modules/dunning"),
  relatedSlugs: [
    "modules/billing-engine",
    "modules/invoices",
    "modules/subscriptions",
    "features/notification-system",
  ],
  lastUpdated: "2026-06-09",
});
