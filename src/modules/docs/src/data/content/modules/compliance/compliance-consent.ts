import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/compliance-consent",
  titleKey: "modules.compliance..consent.title",
  category: "modules",
  order: 3,
  sections: buildLocalizedDocSections("modules.compliance..consent", "modules/compliance-consent"),
  relatedSlugs: ["modules/compliance-overview", "infrastructure/background-jobs"],
  lastUpdated: "2026-06-09",
});
