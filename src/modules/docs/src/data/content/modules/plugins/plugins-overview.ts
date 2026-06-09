import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/plugins-overview",
  titleKey: "modules.plugins..overview.title",
  category: "modules",
  order: 1,
  sections: buildLocalizedDocSections("modules.plugins..overview", "modules/plugins-overview"),
  relatedSlugs: ["modules/plugins-sdk", "infrastructure/background-jobs", "architecture/cqrs"],
  lastUpdated: "2026-06-09",
});
