import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/theme-marketplace",
  titleKey: "commercial.themeMarketplace.title",
  category: "commercial-enterprise",
  order: 8,
  sections: buildLocalizedDocSections(
    "commercial.themeMarketplace",
    "commercial/theme-marketplace"
  ),
  relatedSlugs: ["commercial/login-customizer", "commercial/page-builder"],
  lastUpdated: "2026-06-09",
});
