import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.roiAnalysis.intro" },
      { type: "heading", level: 2, titleKey: "commercial.roiAnalysis.costTitle", id: "cost-comparison" },
      {
            type: "table",
            headers: ["Component", "Build from Scratch", "With NEXORA", "Savings"],
            rows: [
                  ["Authentication + RBAC", "$50,000 - $80,000", "$0 (included)", "$50-80K"],
                  ["Multi-tenancy", "$60,000 - $120,000", "$0 (included)", "$60-120K"],
                  ["Audit system", "$30,000 - $50,000", "$0 (included)", "$30-50K"],
                  ["Email infrastructure", "$15,000 - $25,000", "$0 (included)", "$15-25K"],
                  ["Real-time (WebSockets)", "$20,000 - $40,000", "$0 (included)", "$20-40K"],
                  ["File management", "$15,000 - $20,000", "$0 (included)", "$15-20K"],
                  ["i18n + RTL", "$25,000 - $40,000", "$0 (included)", "$25-40K"],
                  ["CI/CD + DevOps setup", "$10,000 - $20,000", "$0 (included)", "$10-20K"],
                  ["**Total Infrastructure**", "**$225K - $395K**", "**License cost**", "**$200K+**"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.roiAnalysis.timeTitle", id: "time-savings" },
      {
            type: "table",
            headers: ["Phase", "Without NEXORA", "With NEXORA"],
            rows: [
                  ["Infrastructure (auth, multi-tenant, audit)", "3-6 months", "0 (Day 1)"],
                  ["First business module", "1-2 months", "1-2 weeks"],
                  ["MVP launch", "6-12 months", "1-3 months"],
                  ["Production readiness", "12-18 months", "3-6 months"],
                  ["**Total to Production**", "**12-18 months**", "**3-6 months**"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.roiAnalysis.teamTitle", id: "team" },
      { type: "paragraph", contentKey: "commercial.roiAnalysis.teamContent" },
      {
            type: "table",
            headers: ["Role", "Without NEXORA", "With NEXORA"],
            rows: [
                  ["Senior Backend Developer", "3-4", "1-2"],
                  ["Senior Frontend Developer", "2-3", "1-2"],
                  ["DevOps Engineer", "1-2", "0-1"],
                  ["Security Specialist", "1", "0"],
                  ["Infrastructure Architect", "1", "0"],
                  ["**Total Team Size**", "**8-11**", "**2-5**"],
            ],
      },
];

registerPage({
      slug: "commercial/roi-analysis",
      titleKey: "commercial.roiAnalysis.title",
      descriptionKey: "commercial.roiAnalysis.description",
      category: "commercial-pricing",
      order: 2,
      sections,
      relatedSlugs: ["commercial/licensing-model", "commercial/success-metrics"],
      lastUpdated: "2026-02-20",
});
