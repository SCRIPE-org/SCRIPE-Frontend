import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.whyScripeOverview.intro" },

  // ─── Vision ─────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.whyScripeOverview.visionTitle", id: "vision" },
  { type: "paragraph", contentKey: "commercial.whyScripeOverview.visionContent" },

  // ─── The Problem ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyScripeOverview.problemTitle",
    id: "the-problem",
  },
  { type: "paragraph", contentKey: "commercial.whyScripeOverview.problemContent" },
  {
    type: "table",
    headers: [
      "commercial.whyScripeOverview.tblCostHeader1",
      "commercial.whyScripeOverview.tblCostHeader2",
      "commercial.whyScripeOverview.tblCostHeader3",
    ],
    rows: [
      [
        "commercial.whyScripeOverview.tblCostR1C1",
        "commercial.whyScripeOverview.tblCostR1C2",
        "commercial.whyScripeOverview.tblCostR1C3",
      ],
      [
        "commercial.whyScripeOverview.tblCostR2C1",
        "commercial.whyScripeOverview.tblCostR2C2",
        "commercial.whyScripeOverview.tblCostR2C3",
      ],
      [
        "commercial.whyScripeOverview.tblCostR3C1",
        "commercial.whyScripeOverview.tblCostR3C2",
        "commercial.whyScripeOverview.tblCostR3C3",
      ],
      [
        "commercial.whyScripeOverview.tblCostR4C1",
        "commercial.whyScripeOverview.tblCostR4C2",
        "commercial.whyScripeOverview.tblCostR4C3",
      ],
      [
        "commercial.whyScripeOverview.tblCostR5C1",
        "commercial.whyScripeOverview.tblCostR5C2",
        "commercial.whyScripeOverview.tblCostR5C3",
      ],
      [
        "commercial.whyScripeOverview.tblCostR6C1",
        "commercial.whyScripeOverview.tblCostR6C2",
        "commercial.whyScripeOverview.tblCostR6C3",
      ],
    ],
  },

  // ─── The SCRIPE Solution ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyScripeOverview.solutionTitle",
    id: "solution",
  },
  { type: "paragraph", contentKey: "commercial.whyScripeOverview.solutionContent" },
  {
    type: "code",
    language: "text",
    filename: "SCRIPE — One Codebase, Three Deployment Modes",
    code: `┌──────────────────────────────────────────────────────────────┐
│                    SCRIPE Platform                            │
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
    titleKey: "commercial.whyScripeOverview.glanceTitle",
    id: "at-a-glance",
  },
  {
    type: "table",
    headers: [
      "commercial.whyScripeOverview.tblMetricsHeader1",
      "commercial.whyScripeOverview.tblMetricsHeader2",
    ],
    rows: [
      ["commercial.whyScripeOverview.tblMetricsR1C1", "commercial.whyScripeOverview.tblMetricsR1C2"],
      ["commercial.whyScripeOverview.tblMetricsR2C1", "commercial.whyScripeOverview.tblMetricsR2C2"],
      ["commercial.whyScripeOverview.tblMetricsR3C1", "commercial.whyScripeOverview.tblMetricsR3C2"],
      ["commercial.whyScripeOverview.tblMetricsR4C1", "commercial.whyScripeOverview.tblMetricsR4C2"],
      ["commercial.whyScripeOverview.tblMetricsR5C1", "commercial.whyScripeOverview.tblMetricsR5C2"],
      ["commercial.whyScripeOverview.tblMetricsR6C1", "commercial.whyScripeOverview.tblMetricsR6C2"],
      ["commercial.whyScripeOverview.tblMetricsR7C1", "commercial.whyScripeOverview.tblMetricsR7C2"],
      ["commercial.whyScripeOverview.tblMetricsR8C1", "commercial.whyScripeOverview.tblMetricsR8C2"],
      ["commercial.whyScripeOverview.tblMetricsR9C1", "commercial.whyScripeOverview.tblMetricsR9C2"],
      ["commercial.whyScripeOverview.tblMetricsR10C1", "commercial.whyScripeOverview.tblMetricsR10C2"],
      ["commercial.whyScripeOverview.tblMetricsR11C1", "commercial.whyScripeOverview.tblMetricsR11C2"],
    ],
  },

  // ─── Who Is SCRIPE For? ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyScripeOverview.idealForTitle",
    id: "ideal-for",
  },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "building",
        titleKey: "commercial.whyScripeOverview.idealEnterprise",
        descriptionKey: "commercial.whyScripeOverview.idealEnterpriseDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.whyScripeOverview.idealGov",
        descriptionKey: "commercial.whyScripeOverview.idealGovDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.whyScripeOverview.idealSaaS",
        descriptionKey: "commercial.whyScripeOverview.idealSaaSDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.whyScripeOverview.idealStartup",
        descriptionKey: "commercial.whyScripeOverview.idealStartupDesc",
      },
    ],
  },

  // ─── How SCRIPE Saves You ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyScripeOverview.savingsTitle",
    id: "savings",
  },
  {
    type: "table",
    headers: [
      "commercial.whyScripeOverview.tblSavingsHeader1",
      "commercial.whyScripeOverview.tblSavingsHeader2",
      "commercial.whyScripeOverview.tblSavingsHeader3",
    ],
    rows: [
      [
        "commercial.whyScripeOverview.tblSavingsR1C1",
        "commercial.whyScripeOverview.tblSavingsR1C2",
        "commercial.whyScripeOverview.tblSavingsR1C3",
      ],
      [
        "commercial.whyScripeOverview.tblSavingsR2C1",
        "commercial.whyScripeOverview.tblSavingsR2C2",
        "commercial.whyScripeOverview.tblSavingsR2C3",
      ],
      [
        "commercial.whyScripeOverview.tblSavingsR3C1",
        "commercial.whyScripeOverview.tblSavingsR3C2",
        "commercial.whyScripeOverview.tblSavingsR3C3",
      ],
      [
        "commercial.whyScripeOverview.tblSavingsR4C1",
        "commercial.whyScripeOverview.tblSavingsR4C2",
        "commercial.whyScripeOverview.tblSavingsR4C3",
      ],
      [
        "commercial.whyScripeOverview.tblSavingsR5C1",
        "commercial.whyScripeOverview.tblSavingsR5C2",
        "commercial.whyScripeOverview.tblSavingsR5C3",
      ],
      [
        "commercial.whyScripeOverview.tblSavingsR6C1",
        "commercial.whyScripeOverview.tblSavingsR6C2",
        "commercial.whyScripeOverview.tblSavingsR6C3",
      ],
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.whyScripeOverview.startTip" },
];

registerPage({
  slug: "commercial/why-scripe-overview",
  titleKey: "commercial.whyScripeOverview.title",
  descriptionKey: "commercial.whyScripeOverview.description",
  category: "commercial-why-scripe",
  order: 1,
  sections,
  relatedSlugs: ["commercial/competitive-advantages", "commercial/success-metrics"],
  lastUpdated: "2026-02-20",
});
