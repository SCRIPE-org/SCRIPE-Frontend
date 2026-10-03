import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.securityMonitoring.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.securityMonitoring.threatDetectionTitle",
    id: "monitoring",
  },
  {
    type: "paragraph",
    contentKey: "modules.securityMonitoring.threatDetectionContent",
  },
];

registerPage({
  slug: "modules/security-monitoring",
  titleKey: "modules.securityMonitoring.title",
  descriptionKey: "modules.securityMonitoring.description",
  category: "modules",
  order: 5,
  sections,
  relatedSlugs: ["modules/audit-logs", "modules/webhooks"],
  lastUpdated: "2026-06-28",
});
