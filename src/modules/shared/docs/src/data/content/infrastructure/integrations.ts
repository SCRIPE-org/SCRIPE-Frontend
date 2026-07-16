import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.integrations.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.integrations.webhooksTitle",
    id: "webhooks",
  },
  { type: "paragraph", contentKey: "infrastructure.integrations.webhooksIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.integrations.apiKeysTitle",
    id: "api-keys",
  },
  { type: "paragraph", contentKey: "infrastructure.integrations.apiKeysIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.integrations.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "infrastructure.integrations.securityContent" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.integrations.permissionsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "infrastructure.integrations.permissionsContent" },
];

registerPage({
  slug: "infrastructure/integrations",
  category: "infrastructure",
  order: 13,
  titleKey: "infrastructure.integrations.title",
  descriptionKey: "infrastructure.integrations.description",
  sections,
  relatedSlugs: [
    "infrastructure/outbox-pattern",
    "modules/webhooks",
    "infrastructure/communication",
  ],
  lastUpdated: "2026-07-08",
});
