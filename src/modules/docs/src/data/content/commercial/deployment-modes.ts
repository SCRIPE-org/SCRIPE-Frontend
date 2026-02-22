import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.deploymentModes.intro" },

      // ─── Mode Comparison ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.deploymentModes.comparisonTitle", id: "comparison" },
      {
            type: "table",
            headers: [
                  "commercial.deploymentModes.tblCompHeader1",
                  "commercial.deploymentModes.tblCompHeader2",
                  "commercial.deploymentModes.tblCompHeader3",
                  "commercial.deploymentModes.tblCompHeader4"
            ],
            rows: [
                  ["commercial.deploymentModes.tblCompR1C1", "commercial.deploymentModes.tblCompR1C2", "commercial.deploymentModes.tblCompR1C3", "commercial.deploymentModes.tblCompR1C4"],
                  ["commercial.deploymentModes.tblCompR2C1", "commercial.deploymentModes.tblCompR2C2", "commercial.deploymentModes.tblCompR2C3", "commercial.deploymentModes.tblCompR2C4"],
                  ["commercial.deploymentModes.tblCompR3C1", "commercial.deploymentModes.tblCompR3C2", "commercial.deploymentModes.tblCompR3C3", "commercial.deploymentModes.tblCompR3C4"],
                  ["commercial.deploymentModes.tblCompR4C1", "commercial.deploymentModes.tblCompR4C2", "commercial.deploymentModes.tblCompR4C3", "commercial.deploymentModes.tblCompR4C4"],
                  ["commercial.deploymentModes.tblCompR5C1", "commercial.deploymentModes.tblCompR5C2", "commercial.deploymentModes.tblCompR5C3", "commercial.deploymentModes.tblCompR5C4"],
                  ["commercial.deploymentModes.tblCompR6C1", "commercial.deploymentModes.tblCompR6C2", "commercial.deploymentModes.tblCompR6C3", "commercial.deploymentModes.tblCompR6C4"],
                  ["commercial.deploymentModes.tblCompR7C1", "commercial.deploymentModes.tblCompR7C2", "commercial.deploymentModes.tblCompR7C3", "commercial.deploymentModes.tblCompR7C4"],
            ],
      },

      // ─── Monolith Mode ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.deploymentModes.monolithTitle", id: "monolith" },
      { type: "paragraph", contentKey: "commercial.deploymentModes.monolithContent" },
      {
            type: "code",
            language: "text",
            filename: "Monolith Deployment",
            code: `┌──────────────────────────────────────┐
│          Single Process              │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ Identity │  │    HR    │  ...    │
│  └──────────┘  └──────────┘         │
│                                      │
│  ┌──────────────────────────────┐   │
│  │        Shared Core           │   │
│  │  Auth · Cache · Events      │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │    Single Database Server    │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘`,
      },

      // ─── API Gateway Mode ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.deploymentModes.gatewayTitle", id: "gateway" },
      { type: "paragraph", contentKey: "commercial.deploymentModes.gatewayContent" },
      {
            type: "code",
            language: "text",
            filename: "API Gateway Deployment",
            code: `┌──────────────────────────────────────────────┐
│              API Gateway (YARP)               │
│          Route /api/identity → svc1           │
│          Route /api/hr       → svc2           │
└────────┬──────────┬──────────┬───────────────┘
         │          │          │
    ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐
    │Identity │ │   HR   │ │Inventory│
    │ Service │ │Service │ │ Service │
    └────┬────┘ └───┬────┘ └──┬──────┘
         │          │          │
    ┌────▼──────────▼──────────▼──────┐
    │      Shared Database Server     │
    └─────────────────────────────────┘`,
      },

      // ─── Microservices Mode ─────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.deploymentModes.microTitle", id: "microservices" },
      { type: "paragraph", contentKey: "commercial.deploymentModes.microContent" },
      {
            type: "code",
            language: "text",
            filename: "Microservices Deployment",
            code: `┌──────────────────────────────────────────────────────┐
│              Load Balancer / API Gateway              │
└────────┬──────────┬──────────┬──────────┬───────────┘
         │          │          │          │
    ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐ ┌▼────────┐
    │Identity │ │   HR   │ │Inventory│ │ Finance │
    │ Service │ │Service │ │ Service │ │ Service │
    └────┬────┘ └───┬────┘ └──┬──────┘ └┬────────┘
         │          │          │          │
    ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐ ┌▼────────┐
    │  Own DB │ │ Own DB │ │ Own DB  │ │ Own DB  │
    └─────────┘ └────────┘ └─────────┘ └─────────┘`,
      },

      // ─── Migration Path ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.deploymentModes.migrationTitle", id: "migration" },
      { type: "paragraph", contentKey: "commercial.deploymentModes.migrationContent" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.deploymentModes.step1Title", contentKey: "commercial.deploymentModes.step1Content" },
                  { titleKey: "commercial.deploymentModes.step2Title", contentKey: "commercial.deploymentModes.step2Content" },
                  { titleKey: "commercial.deploymentModes.step3Title", contentKey: "commercial.deploymentModes.step3Content" },
                  { titleKey: "commercial.deploymentModes.step4Title", contentKey: "commercial.deploymentModes.step4Content" },
            ],
      },

      { type: "info", variant: "warning", contentKey: "commercial.deploymentModes.keyPoint" },
];

registerPage({
      slug: "commercial/deployment-modes",
      titleKey: "commercial.deploymentModes.title",
      descriptionKey: "commercial.deploymentModes.description",
      category: "commercial-platform",
      order: 4,
      sections,
      relatedSlugs: ["commercial/platform-architecture", "commercial/system-requirements"],
      lastUpdated: "2026-02-20",
});
