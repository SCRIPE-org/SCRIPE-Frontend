import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/compliance-reports",
  titleKey: "modules.compliance..reports.title",
  category: "modules",
  order: 6,
  sections: buildLocalizedDocSections("modules.compliance..reports", "modules/compliance-reports"),
  relatedSlugs: ["modules/compliance-overview"],
  lastUpdated: "2026-06-09",
});
