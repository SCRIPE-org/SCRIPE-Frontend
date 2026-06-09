import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/theme-marketplace",
  titleKey: "features.themeMarketplace.title",
  category: "features",
  order: 16,
  sections: buildLocalizedDocSections("features.themeMarketplace", "features/theme-marketplace"),
  relatedSlugs: [
    "features/login-customizer",
    "features/multi-page-branding",
    "features/login-page-builder",
  ],
  lastUpdated: "2026-06-09",
});
