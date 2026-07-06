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
    titleKey: "Soft Delete & Restore Engine",
    id: "soft-delete",
  },
  {
    type: "paragraph",
    contentKey:
      "The Ecosystem Recycle Bin manages soft-deleted entities across all active modules. By leveraging the AuditableEntity base class's IsDeleted and DeletedAt attributes, it enforces global query filters and schedules permanent cleanup jobs after 30 days.",
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
