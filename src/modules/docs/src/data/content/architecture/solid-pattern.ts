import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/solid-pattern",
  titleKey: "architecture.solidPattern.title",
  category: "architecture",
  order: 6,
  sections: buildLocalizedDocSections("architecture.solidPattern", "architecture/solid-pattern"),
  relatedSlugs: ["architecture/frontend", "architecture/state-management"],
  lastUpdated: "2026-06-09",
});
