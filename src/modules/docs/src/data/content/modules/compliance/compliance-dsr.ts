import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/compliance-dsr",
  titleKey: "modules.compliance..dsr.title",
  category: "modules",
  order: 2,
  sections: buildLocalizedDocSections("modules.compliance..dsr", "modules/compliance-dsr"),
  relatedSlugs: ["modules/compliance-overview", "infrastructure/background-jobs"],
  lastUpdated: "2026-06-09",
});
