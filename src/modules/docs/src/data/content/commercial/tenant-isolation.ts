import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.tenantIsolation.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Data Segregation Strategies",
    id: "segregation",
  },
  {
    type: "paragraph",
    contentKey: "Row-level database filters, hybrid single/multi database models, and end-to-end data segregation protocols ensuring absolute confidentiality.",
  },
];

registerPage({
  slug: "commercial/tenant-isolation",
  titleKey: "commercial.tenantIsolation.title",
  descriptionKey: "commercial.tenantIsolation.description",
  category: "commercial-enterprise",
  order: 13,
  sections,
  relatedSlugs: ["commercial/multi-tenancy", "commercial/sla-guarantees"],
  lastUpdated: "2026-06-28",
});
