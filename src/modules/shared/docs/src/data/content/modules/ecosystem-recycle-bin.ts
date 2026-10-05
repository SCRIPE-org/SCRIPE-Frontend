import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.ecosystemRecycleBin.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.ecosystemRecycleBin.softDeleteTitle",
    id: "soft-delete",
  },
  {
    type: "paragraph",
    contentKey: "modules.ecosystemRecycleBin.softDeleteContent",
  },
];

registerPage({
  slug: "modules/ecosystem-recycle-bin",
  titleKey: "modules.ecosystemRecycleBin.title",
  descriptionKey: "modules.ecosystemRecycleBin.description",
  category: "modules",
  order: 8,
  sections,
  relatedSlugs: ["modules/audit-logs", "modules/entitlements-overview"],
  lastUpdated: "2026-06-28",
});
