import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/localization-i18n",
  titleKey: "commercial.localizationI18n.title",
  category: "commercial-enterprise",
  order: 5,
  sections: buildLocalizedDocSections(
    "commercial.localizationI18n",
    "commercial/localization-i18n"
  ),
  relatedSlugs: ["commercial/real-time-capabilities", "commercial/message-templates"],
  lastUpdated: "2026-06-09",
});
