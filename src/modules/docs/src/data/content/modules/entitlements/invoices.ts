import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/invoices",
  titleKey: "modules.invoices.title",
  category: "modules",
  order: 7,
  sections: buildLocalizedDocSections("modules.invoices", "modules/invoices"),
  relatedSlugs: ["modules/billing-engine", "modules/dunning", "modules/subscriptions"],
  lastUpdated: "2026-06-09",
});
