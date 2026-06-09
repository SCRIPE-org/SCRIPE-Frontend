import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/billing-engine",
  titleKey: "modules.billingEngine.title",
  category: "modules",
  order: 6,
  sections: buildLocalizedDocSections("modules.billingEngine", "modules/billing-engine"),
  relatedSlugs: [
    "modules/invoices",
    "modules/dunning",
    "modules/subscriptions",
    "features/webhook-system",
  ],
  lastUpdated: "2026-06-09",
});
