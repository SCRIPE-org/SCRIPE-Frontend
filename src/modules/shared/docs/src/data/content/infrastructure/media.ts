import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.media.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.media.chunkedUploadTitle",
    id: "chunked-upload",
  },
  { type: "paragraph", contentKey: "infrastructure.media.chunkedUploadIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.media.accessGrantsTitle",
    id: "access-grants",
  },
  { type: "paragraph", contentKey: "infrastructure.media.accessGrantsIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.media.quotasTitle",
    id: "quotas",
  },
  { type: "paragraph", contentKey: "infrastructure.media.quotasContent" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.media.permissionsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "infrastructure.media.permissionsContent" },
];

registerPage({
  slug: "infrastructure/media",
  category: "infrastructure",
  order: 14,
  titleKey: "infrastructure.media.title",
  descriptionKey: "infrastructure.media.description",
  sections,
  relatedSlugs: [
    "infrastructure/file-storage",
    "infrastructure/integrations",
    "modules/media",
  ],
  lastUpdated: "2026-07-08",
});
