import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/state-management",
  titleKey: "architecture.stateManagement.title",
  category: "architecture",
  order: 7,
  sections: buildLocalizedDocSections(
    "architecture.stateManagement",
    "architecture/state-management"
  ),
  relatedSlugs: ["architecture/frontend", "architecture/solid-pattern"],
  lastUpdated: "2026-06-09",
});
