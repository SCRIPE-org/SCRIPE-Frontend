import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.whyUISOverview.intro" },

  // ─── Vision ─────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.whyUISOverview.visionTitle", id: "vision" },
  { type: "paragraph", contentKey: "commercial.whyUISOverview.visionContent" },

  // ─── The Problem ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyUISOverview.problemTitle",
    id: "the-problem",
  },
  { type: "paragraph", contentKey: "commercial.whyUISOverview.problemContent" },
  {
    type: "table",
    headers: [
      "commercial.whyUISOverview.tblCostHeader1",
      "commercial.whyUISOverview.tblCostHeader2",
      "commercial.whyUISOverview.tblCostHeader3",
    ],
    rows: [
      [
        "commercial.whyUISOverview.tblCostR1C1",
        "commercial.whyUISOverview.tblCostR1C2",
        "commercial.whyUISOverview.tblCostR1C3",
      ],
      [
        "commercial.whyUISOverview.tblCostR2C1",
        "commercial.whyUISOverview.tblCostR2C2",
        "commercial.whyUISOverview.tblCostR2C3",
      ],
      [
        "commercial.whyUISOverview.tblCostR3C1",
        "commercial.whyUISOverview.tblCostR3C2",
        "commercial.whyUISOverview.tblCostR3C3",
      ],
      [
        "commercial.whyUISOverview.tblCostR4C1",
        "commercial.whyUISOverview.tblCostR4C2",
        "commercial.whyUISOverview.tblCostR4C3",
      ],
      [
        "commercial.whyUISOverview.tblCostR5C1",
        "commercial.whyUISOverview.tblCostR5C2",
        "commercial.whyUISOverview.tblCostR5C3",
      ],
      [
        "commercial.whyUISOverview.tblCostR6C1",
        "commercial.whyUISOverview.tblCostR6C2",
        "commercial.whyUISOverview.tblCostR6C3",
      ],
    ],
  },

  // ─── The SCRIPE Solution ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyUISOverview.solutionTitle",
    id: "solution",
  },
  { type: "paragraph", contentKey: "commercial.whyUISOverview.solutionContent" },
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
    titleKey: "commercial.whyUISOverview.glanceTitle",
    id: "at-a-glance",
  },
  {
    type: "table",
    headers: [
      "commercial.whyUISOverview.tblMetricsHeader1",
      "commercial.whyUISOverview.tblMetricsHeader2",
    ],
    rows: [
      ["commercial.whyUISOverview.tblMetricsR1C1", "commercial.whyUISOverview.tblMetricsR1C2"],
      ["commercial.whyUISOverview.tblMetricsR2C1", "commercial.whyUISOverview.tblMetricsR2C2"],
      ["commercial.whyUISOverview.tblMetricsR3C1", "commercial.whyUISOverview.tblMetricsR3C2"],
      ["commercial.whyUISOverview.tblMetricsR4C1", "commercial.whyUISOverview.tblMetricsR4C2"],
      ["commercial.whyUISOverview.tblMetricsR5C1", "commercial.whyUISOverview.tblMetricsR5C2"],
      ["commercial.whyUISOverview.tblMetricsR6C1", "commercial.whyUISOverview.tblMetricsR6C2"],
      ["commercial.whyUISOverview.tblMetricsR7C1", "commercial.whyUISOverview.tblMetricsR7C2"],
      ["commercial.whyUISOverview.tblMetricsR8C1", "commercial.whyUISOverview.tblMetricsR8C2"],
      ["commercial.whyUISOverview.tblMetricsR9C1", "commercial.whyUISOverview.tblMetricsR9C2"],
      ["commercial.whyUISOverview.tblMetricsR10C1", "commercial.whyUISOverview.tblMetricsR10C2"],
      ["commercial.whyUISOverview.tblMetricsR11C1", "commercial.whyUISOverview.tblMetricsR11C2"],
    ],
  },

  // ─── Who Is SCRIPE For? ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyUISOverview.idealForTitle",
    id: "ideal-for",
  },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "building",
        titleKey: "commercial.whyUISOverview.idealEnterprise",
        descriptionKey: "commercial.whyUISOverview.idealEnterpriseDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.whyUISOverview.idealGov",
        descriptionKey: "commercial.whyUISOverview.idealGovDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.whyUISOverview.idealSaaS",
        descriptionKey: "commercial.whyUISOverview.idealSaaSDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.whyUISOverview.idealStartup",
        descriptionKey: "commercial.whyUISOverview.idealStartupDesc",
      },
    ],
  },

  // ─── How SCRIPE Saves You ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whyUISOverview.savingsTitle",
    id: "savings",
  },
  {
    type: "table",
    headers: [
      "commercial.whyUISOverview.tblSavingsHeader1",
      "commercial.whyUISOverview.tblSavingsHeader2",
      "commercial.whyUISOverview.tblSavingsHeader3",
    ],
    rows: [
      [
        "commercial.whyUISOverview.tblSavingsR1C1",
        "commercial.whyUISOverview.tblSavingsR1C2",
        "commercial.whyUISOverview.tblSavingsR1C3",
      ],
      [
        "commercial.whyUISOverview.tblSavingsR2C1",
        "commercial.whyUISOverview.tblSavingsR2C2",
        "commercial.whyUISOverview.tblSavingsR2C3",
      ],
      [
        "commercial.whyUISOverview.tblSavingsR3C1",
        "commercial.whyUISOverview.tblSavingsR3C2",
        "commercial.whyUISOverview.tblSavingsR3C3",
      ],
      [
        "commercial.whyUISOverview.tblSavingsR4C1",
        "commercial.whyUISOverview.tblSavingsR4C2",
        "commercial.whyUISOverview.tblSavingsR4C3",
      ],
      [
        "commercial.whyUISOverview.tblSavingsR5C1",
        "commercial.whyUISOverview.tblSavingsR5C2",
        "commercial.whyUISOverview.tblSavingsR5C3",
      ],
      [
        "commercial.whyUISOverview.tblSavingsR6C1",
        "commercial.whyUISOverview.tblSavingsR6C2",
        "commercial.whyUISOverview.tblSavingsR6C3",
      ],
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.whyUISOverview.startTip" },
];

registerPage({
  slug: "commercial/why-scripe-overview",
  titleKey: "commercial.whyUISOverview.title",
  descriptionKey: "commercial.whyUISOverview.description",
  category: "commercial-why-scripe",
  order: 1,
  sections,
  relatedSlugs: ["commercial/competitive-advantages", "commercial/success-metrics"],
  lastUpdated: "2026-02-20",
});
