import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/real-time-capabilities",
  titleKey: "commercial.realTimeCapabilities.title",
  category: "commercial-enterprise",
  order: 4,
  sections: buildLocalizedDocSections(
    "commercial.realTimeCapabilities",
    "commercial/real-time-capabilities"
  ),
  relatedSlugs: ["commercial/audit-compliance", "commercial/localization-i18n"],
  lastUpdated: "2026-06-09",
});
