import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.sharedFoundations.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.sharedFoundations.ownershipTitle",
    id: "module-ownership",
  },
  { type: "paragraph", contentKey: "infrastructure.sharedFoundations.ownershipContent" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.sharedFoundations.idempotencyTitle",
    id: "idempotency",
  },
  { type: "paragraph", contentKey: "infrastructure.sharedFoundations.idempotencyContent" },
  {
    type: "code",
    language: "text",
    code: "Intent key K1 + payload A → first request\nRetry K1 + payload A → same-intent replay candidate\nRetry K1 + payload B → conflict candidate\nNew business intent → new key K2",
  },
  { type: "info", variant: "tip", contentKey: "infrastructure.sharedFoundations.idempotencyTip" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.sharedFoundations.frontendIntentTitle",
    id: "frontend-intent",
  },
  { type: "paragraph", contentKey: "infrastructure.sharedFoundations.frontendIntentContent" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.sharedFoundations.searchTitle",
    id: "search",
  },
  { type: "paragraph", contentKey: "infrastructure.sharedFoundations.searchContent" },
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.sharedFoundations.adoptionTitle",
    id: "adoption-and-evidence",
  },
  { type: "paragraph", contentKey: "infrastructure.sharedFoundations.adoptionContent" },
];

registerPage({
  slug: "infrastructure/shared-foundations",
  titleKey: "infrastructure.sharedFoundations.title",
  descriptionKey: "infrastructure.sharedFoundations.description",
  category: "infrastructure",
  order: 13,
  sections,
  relatedSlugs: ["infrastructure/outbox-pattern", "modules/hrms/staff-directory"],
  lastUpdated: "2026-10-17",
});

