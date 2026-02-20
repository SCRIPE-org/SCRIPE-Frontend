import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.intro" },
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.customTitle", id: "custom-modules" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.customContent" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "building", titleKey: "commercial.enterpriseAddons.customDev", descriptionKey: "commercial.enterpriseAddons.customDevDesc" },
                  { icon: "zap", titleKey: "commercial.enterpriseAddons.priorityFeature", descriptionKey: "commercial.enterpriseAddons.priorityFeatureDesc" },
                  { icon: "users", titleKey: "commercial.enterpriseAddons.training", descriptionKey: "commercial.enterpriseAddons.trainingDesc" },
                  { icon: "shield", titleKey: "commercial.enterpriseAddons.securityAudit", descriptionKey: "commercial.enterpriseAddons.securityAuditDesc" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.migrationTitle", id: "migration" },
      {
            type: "table",
            headers: ["Service", "Description", "Deliverable"],
            rows: [
                  ["Legacy migration", "Migrate from existing system to NEXORA", "Data migration scripts, parallel run plan"],
                  ["Architecture review", "Assess current system, design migration", "Architecture document, risk analysis"],
                  ["Performance tuning", "Optimize for your specific workload", "Benchmarks, configuration recommendations"],
                  ["Security hardening", "Additional security measures", "Security report, implementation"],
                  ["Custom integrations", "Connect to your existing systems", "Integration adapters, documentation"],
            ],
      },
];

registerPage({
      slug: "commercial/enterprise-addons",
      titleKey: "commercial.enterpriseAddons.title",
      descriptionKey: "commercial.enterpriseAddons.description",
      category: "commercial-pricing",
      order: 4,
      sections,
      relatedSlugs: ["commercial/support-plans", "commercial/licensing-model"],
      lastUpdated: "2026-02-20",
});
