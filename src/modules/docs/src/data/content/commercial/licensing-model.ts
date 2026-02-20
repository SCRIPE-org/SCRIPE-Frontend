import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.licensingModel.intro" },
      { type: "heading", level: 2, titleKey: "commercial.licensingModel.typesTitle", id: "license-types" },
      {
            type: "table",
            headers: ["License", "Description", "Includes"],
            rows: [
                  ["Developer", "Single developer, unlimited projects", "Source code, updates for 1 year, community support"],
                  ["Team", "Up to 10 developers, single organization", "Everything in Developer + priority support"],
                  ["Enterprise", "Unlimited developers, unlimited organizations", "Everything in Team + custom SLA, on-site training"],
                  ["OEM", "Redistribute as part of your product", "Everything in Enterprise + white-label rights"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.licensingModel.comparisonTitle", id: "comparison" },
      {
            type: "table",
            headers: ["Feature", "Developer", "Team", "Enterprise", "OEM"],
            rows: [
                  ["Source code access", "✓", "✓", "✓", "✓"],
                  ["Commercial use", "✓", "✓", "✓", "✓"],
                  ["Updates & patches", "1 year", "1 year", "Perpetual", "Perpetual"],
                  ["Support channels", "Community", "Email (24h)", "Dedicated (4h)", "Custom SLA"],
                  ["Custom development", "✗", "✗", "Available", "Included"],
                  ["White-label rights", "✗", "✗", "✗", "✓"],
                  ["Deployment assistance", "Docs only", "1 session", "Unlimited", "Unlimited"],
                  ["Training", "Docs only", "2 sessions", "On-site", "Custom program"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.licensingModel.sourcCodeTitle", id: "source-code" },
      { type: "paragraph", contentKey: "commercial.licensingModel.sourceCodeContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Full source code for backend (.NET 10) and frontend (Next.js 16)",
                  "No obfuscation, no compiled-only libraries",
                  "Full Git history for understanding design decisions",
                  "Freedom to modify, extend, and customize everything",
                  "No runtime license checks or phone-home mechanisms",
                  "Deploy anywhere without license server dependency",
            ],
      },
      { type: "info", variant: "tip", contentKey: "commercial.licensingModel.trialTip" },
];

registerPage({
      slug: "commercial/licensing-model",
      titleKey: "commercial.licensingModel.title",
      descriptionKey: "commercial.licensingModel.description",
      category: "commercial-pricing",
      order: 1,
      sections,
      relatedSlugs: ["commercial/roi-analysis", "commercial/support-plans"],
      lastUpdated: "2026-02-20",
});
