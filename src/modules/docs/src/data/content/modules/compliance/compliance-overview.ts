import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/compliance-overview",
  titleKey: "modules.compliance..overview.title",
  category: "modules",
  order: 1,
  sections: buildLocalizedDocSections(
    "modules.compliance..overview",
    "modules/compliance-overview"
  ),
  relatedSlugs: [
    "modules/compliance-dsr",
    "modules/compliance-consent",
    "modules/compliance-retention",
    "infrastructure/background-jobs",
  ],
  lastUpdated: "2026-06-09",
});
