import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.webhooks.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Outbound Webhooks Engine",
    id: "engine",
  },
  {
    type: "paragraph",
    contentKey: "SCRIPE's webhook system allows external applications to receive real-time notifications about system events. The engine features automatic retries with exponential backoff, cryptographic signature verification using HMAC-SHA256 headers, and per-tenant endpoint configuration.",
  },
];

registerPage({
  slug: "modules/webhooks",
  titleKey: "modules.webhooks.title",
  descriptionKey: "modules.webhooks.description",
  category: "modules",
  order: 6,
  sections,
  relatedSlugs: ["modules/security-monitoring", "modules/marketplace"],
  lastUpdated: "2026-06-28",
});
