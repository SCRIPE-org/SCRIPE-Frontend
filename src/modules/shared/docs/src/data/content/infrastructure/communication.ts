import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.communication.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.communication.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "infrastructure.communication.architectureIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.communication.templatesTitle",
    id: "templates",
  },
  { type: "paragraph", contentKey: "infrastructure.communication.templatesIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.communication.jobsTitle",
    id: "jobs",
  },
  { type: "paragraph", contentKey: "infrastructure.communication.jobsIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.communication.permissionsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "infrastructure.communication.permissionsContent" },
];

registerPage({
  slug: "infrastructure/communication",
  category: "infrastructure",
  order: 12,
  titleKey: "infrastructure.communication.title",
  descriptionKey: "infrastructure.communication.description",
  sections,
  relatedSlugs: [
    "infrastructure/background-jobs",
    "infrastructure/outbox-pattern",
    "modules/identity",
  ],
  lastUpdated: "2026-07-08",
});
