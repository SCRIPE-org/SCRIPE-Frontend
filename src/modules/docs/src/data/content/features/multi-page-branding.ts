import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/multi-page-branding",
  titleKey: "features.multiPageBranding.title",
  category: "features",
  order: 17,
  sections: buildLocalizedDocSections("features.multiPageBranding", "features/multi-page-branding"),
  relatedSlugs: [
    "features/theme-marketplace",
    "features/login-customizer",
    "features/login-page-builder",
  ],
  lastUpdated: "2026-06-09",
});
