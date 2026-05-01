import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.whyNexoraOverview.intro" },

  // ─── Vision ─────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.whyNexoraOverview.visionTitle", id: "vision" },
  { type: "paragraph", contentKey: "commercial.whyNexoraOverview.visionContent" },

  // ─── The Problem ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyNexoraOverview.problemTitle",
    id: "the-problem",
  },
  { type: "paragraph", contentKey: "commercial.whyNexoraOverview.problemContent" },
  {
    type: "table",
    headers: [
      "commercial.whyNexoraOverview.tblCostHeader1",
      "commercial.whyNexoraOverview.tblCostHeader2",
      "commercial.whyNexoraOverview.tblCostHeader3",
    ],
    rows: [
      [
        "commercial.whyNexoraOverview.tblCostR1C1",
        "commercial.whyNexoraOverview.tblCostR1C2",
        "commercial.whyNexoraOverview.tblCostR1C3",
      ],
      [
        "commercial.whyNexoraOverview.tblCostR2C1",
        "commercial.whyNexoraOverview.tblCostR2C2",
        "commercial.whyNexoraOverview.tblCostR2C3",
      ],
      [
        "commercial.whyNexoraOverview.tblCostR3C1",
        "commercial.whyNexoraOverview.tblCostR3C2",
        "commercial.whyNexoraOverview.tblCostR3C3",
      ],
      [
        "commercial.whyNexoraOverview.tblCostR4C1",
        "commercial.whyNexoraOverview.tblCostR4C2",
        "commercial.whyNexoraOverview.tblCostR4C3",
      ],
      [
        "commercial.whyNexoraOverview.tblCostR5C1",
        "commercial.whyNexoraOverview.tblCostR5C2",
        "commercial.whyNexoraOverview.tblCostR5C3",
      ],
      [
        "commercial.whyNexoraOverview.tblCostR6C1",
        "commercial.whyNexoraOverview.tblCostR6C2",
        "commercial.whyNexoraOverview.tblCostR6C3",
      ],
    ],
  },

  // ─── The NEXORA Solution ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyNexoraOverview.solutionTitle",
    id: "solution",
  },
  { type: "paragraph", contentKey: "commercial.whyNexoraOverview.solutionContent" },
  {
    type: "code",
    language: "text",
    filename: "NEXORA — One Codebase, Three Deployment Modes",
    code: `┌──────────────────────────────────────────────────────────────┐
│                    NEXORA Platform                            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Identity │  │    HR    │  │ Inventory│  │  Finance │    │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └──────────────┴──────────────┴──────────────┘         │
│                           │                                   │
│            ┌──────────────┴──────────────┐                   │
│            │      Shared Core Layer      │                   │
│            │  Security · Audit · Events  │                   │
│            │  Caching · Saga · Storage   │                   │
│            └──────────────┬──────────────┘                   │
│                           │                                   │
│        ┌──────────────────┼──────────────────┐               │
│        ▼                  ▼                  ▼               │
│    Monolith           Gateway          Microservice          │
│   (mvp/startup)    (growing team)    (enterprise scale)      │
└──────────────────────────────────────────────────────────────┘`,
  },

  // ─── Platform at a Glance ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyNexoraOverview.glanceTitle",
    id: "at-a-glance",
  },
  {
    type: "table",
    headers: [
      "commercial.whyNexoraOverview.tblMetricsHeader1",
      "commercial.whyNexoraOverview.tblMetricsHeader2",
    ],
    rows: [
      [
        "commercial.whyNexoraOverview.tblMetricsR1C1",
        "commercial.whyNexoraOverview.tblMetricsR1C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR2C1",
        "commercial.whyNexoraOverview.tblMetricsR2C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR3C1",
        "commercial.whyNexoraOverview.tblMetricsR3C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR4C1",
        "commercial.whyNexoraOverview.tblMetricsR4C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR5C1",
        "commercial.whyNexoraOverview.tblMetricsR5C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR6C1",
        "commercial.whyNexoraOverview.tblMetricsR6C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR7C1",
        "commercial.whyNexoraOverview.tblMetricsR7C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR8C1",
        "commercial.whyNexoraOverview.tblMetricsR8C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR9C1",
        "commercial.whyNexoraOverview.tblMetricsR9C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR10C1",
        "commercial.whyNexoraOverview.tblMetricsR10C2",
      ],
      [
        "commercial.whyNexoraOverview.tblMetricsR11C1",
        "commercial.whyNexoraOverview.tblMetricsR11C2",
      ],
    ],
  },

  // ─── Who Is NEXORA For? ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyNexoraOverview.idealForTitle",
    id: "ideal-for",
  },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "building",
        titleKey: "commercial.whyNexoraOverview.idealEnterprise",
        descriptionKey: "commercial.whyNexoraOverview.idealEnterpriseDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.whyNexoraOverview.idealGov",
        descriptionKey: "commercial.whyNexoraOverview.idealGovDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.whyNexoraOverview.idealSaaS",
        descriptionKey: "commercial.whyNexoraOverview.idealSaaSDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.whyNexoraOverview.idealStartup",
        descriptionKey: "commercial.whyNexoraOverview.idealStartupDesc",
      },
    ],
  },

  // ─── How NEXORA Saves You ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyNexoraOverview.savingsTitle",
    id: "savings",
  },
  {
    type: "table",
    headers: [
      "commercial.whyNexoraOverview.tblSavingsHeader1",
      "commercial.whyNexoraOverview.tblSavingsHeader2",
      "commercial.whyNexoraOverview.tblSavingsHeader3",
    ],
    rows: [
      [
        "commercial.whyNexoraOverview.tblSavingsR1C1",
        "commercial.whyNexoraOverview.tblSavingsR1C2",
        "commercial.whyNexoraOverview.tblSavingsR1C3",
      ],
      [
        "commercial.whyNexoraOverview.tblSavingsR2C1",
        "commercial.whyNexoraOverview.tblSavingsR2C2",
        "commercial.whyNexoraOverview.tblSavingsR2C3",
      ],
      [
        "commercial.whyNexoraOverview.tblSavingsR3C1",
        "commercial.whyNexoraOverview.tblSavingsR3C2",
        "commercial.whyNexoraOverview.tblSavingsR3C3",
      ],
      [
        "commercial.whyNexoraOverview.tblSavingsR4C1",
        "commercial.whyNexoraOverview.tblSavingsR4C2",
        "commercial.whyNexoraOverview.tblSavingsR4C3",
      ],
      [
        "commercial.whyNexoraOverview.tblSavingsR5C1",
        "commercial.whyNexoraOverview.tblSavingsR5C2",
        "commercial.whyNexoraOverview.tblSavingsR5C3",
      ],
      [
        "commercial.whyNexoraOverview.tblSavingsR6C1",
        "commercial.whyNexoraOverview.tblSavingsR6C2",
        "commercial.whyNexoraOverview.tblSavingsR6C3",
      ],
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.whyNexoraOverview.startTip" },
];

registerPage({
  slug: "commercial/why-nexora-overview",
  titleKey: "commercial.whyNexoraOverview.title",
  descriptionKey: "commercial.whyNexoraOverview.description",
  category: "commercial-why-nexora",
  order: 1,
  sections,
  relatedSlugs: ["commercial/competitive-advantages", "commercial/success-metrics"],
  lastUpdated: "2026-02-20",
});
