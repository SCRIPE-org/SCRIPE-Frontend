import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/compliance-retention",
  titleKey: "modules.compliance..retention.title",
  category: "modules",
  order: 4,
  sections: buildLocalizedDocSections(
    "modules.compliance..retention",
    "modules/compliance-retention"
  ),
  relatedSlugs: ["modules/compliance-overview", "infrastructure/background-jobs"],
  lastUpdated: "2026-06-09",
});
