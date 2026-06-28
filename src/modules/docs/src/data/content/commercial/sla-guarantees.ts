import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.slaGuarantees.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Support SLA Tiers",
    id: "sla-tiers",
  },
  {
    type: "paragraph",
    contentKey: "Guaranteed uptime, incident response priorities, and 24/7 technical support options contractually backed by our enterprise teams.",
  },
];

registerPage({
  slug: "commercial/sla-guarantees",
  titleKey: "commercial.slaGuarantees.title",
  descriptionKey: "commercial.slaGuarantees.description",
  category: "commercial-enterprise",
  order: 12,
  sections,
  relatedSlugs: ["commercial/enterprise-addons", "commercial/tenant-isolation"],
  lastUpdated: "2026-06-28",
});
