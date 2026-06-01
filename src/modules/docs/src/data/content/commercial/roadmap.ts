import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.roadmap.intro" },

  // ─── Currently Available ────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roadmap.currentTitle", id: "current" },
  {
    type: "table",
    headers: [
      "commercial.roadmap.tblCurHeader1",
      "commercial.roadmap.tblCurHeader2",
      "commercial.roadmap.tblCurHeader3",
    ],
    rows: [
      [
        "commercial.roadmap.tblCurR1C1",
        "commercial.roadmap.tblCurR1C2",
        "commercial.roadmap.tblCurR1C3",
      ],
      [
        "commercial.roadmap.tblCurR2C1",
        "commercial.roadmap.tblCurR2C2",
        "commercial.roadmap.tblCurR2C3",
      ],
      [
        "commercial.roadmap.tblCurR3C1",
        "commercial.roadmap.tblCurR3C2",
        "commercial.roadmap.tblCurR3C3",
      ],
      [
        "commercial.roadmap.tblCurR4C1",
        "commercial.roadmap.tblCurR4C2",
        "commercial.roadmap.tblCurR4C3",
      ],
      [
        "commercial.roadmap.tblCurR5C1",
        "commercial.roadmap.tblCurR5C2",
        "commercial.roadmap.tblCurR5C3",
      ],
      [
        "commercial.roadmap.tblCurR6C1",
        "commercial.roadmap.tblCurR6C2",
        "commercial.roadmap.tblCurR6C3",
      ],
      [
        "commercial.roadmap.tblCurR7C1",
        "commercial.roadmap.tblCurR7C2",
        "commercial.roadmap.tblCurR7C3",
      ],
      [
        "commercial.roadmap.tblCurR8C1",
        "commercial.roadmap.tblCurR8C2",
        "commercial.roadmap.tblCurR8C3",
      ],
      [
        "commercial.roadmap.tblCurR9C1",
        "commercial.roadmap.tblCurR9C2",
        "commercial.roadmap.tblCurR9C3",
      ],
      [
        "commercial.roadmap.tblCurR10C1",
        "commercial.roadmap.tblCurR10C2",
        "commercial.roadmap.tblCurR10C3",
      ],
    ],
  },

  // ─── In Progress ───────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roadmap.inProgressTitle", id: "in-progress" },
  {
    type: "table",
    headers: [
      "commercial.roadmap.tblProgHeader1",
      "commercial.roadmap.tblProgHeader2",
      "commercial.roadmap.tblProgHeader3",
    ],
    rows: [
      [
        "commercial.roadmap.tblProgR1C1",
        "commercial.roadmap.tblProgR1C2",
        "commercial.roadmap.tblProgR1C3",
      ],
      [
        "commercial.roadmap.tblProgR2C1",
        "commercial.roadmap.tblProgR2C2",
        "commercial.roadmap.tblProgR2C3",
      ],
      [
        "commercial.roadmap.tblProgR3C1",
        "commercial.roadmap.tblProgR3C2",
        "commercial.roadmap.tblProgR3C3",
      ],
    ],
  },

  // ─── Upcoming ──────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roadmap.nextTitle", id: "upcoming" },
  {
    type: "table",
    headers: [
      "commercial.roadmap.tblNextHeader1",
      "commercial.roadmap.tblNextHeader2",
      "commercial.roadmap.tblNextHeader3",
    ],
    rows: [
      [
        "commercial.roadmap.tblNextR1C1",
        "commercial.roadmap.tblNextR1C2",
        "commercial.roadmap.tblNextR1C3",
      ],
      [
        "commercial.roadmap.tblNextR2C1",
        "commercial.roadmap.tblNextR2C2",
        "commercial.roadmap.tblNextR2C3",
      ],
      [
        "commercial.roadmap.tblNextR3C1",
        "commercial.roadmap.tblNextR3C2",
        "commercial.roadmap.tblNextR3C3",
      ],
      [
        "commercial.roadmap.tblNextR4C1",
        "commercial.roadmap.tblNextR4C2",
        "commercial.roadmap.tblNextR4C3",
      ],
      [
        "commercial.roadmap.tblNextR5C1",
        "commercial.roadmap.tblNextR5C2",
        "commercial.roadmap.tblNextR5C3",
      ],
      [
        "commercial.roadmap.tblNextR6C1",
        "commercial.roadmap.tblNextR6C2",
        "commercial.roadmap.tblNextR6C3",
      ],
    ],
  },

  // ─── Release Cadence ────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roadmap.cadenceTitle", id: "cadence" },
  {
    type: "table",
    headers: [
      "commercial.roadmap.tblCadHeader1",
      "commercial.roadmap.tblCadHeader2",
      "commercial.roadmap.tblCadHeader3",
    ],
    rows: [
      [
        "commercial.roadmap.tblCadR1C1",
        "commercial.roadmap.tblCadR1C2",
        "commercial.roadmap.tblCadR1C3",
      ],
      [
        "commercial.roadmap.tblCadR2C1",
        "commercial.roadmap.tblCadR2C2",
        "commercial.roadmap.tblCadR2C3",
      ],
      [
        "commercial.roadmap.tblCadR3C1",
        "commercial.roadmap.tblCadR3C2",
        "commercial.roadmap.tblCadR3C3",
      ],
    ],
  },

  // ─── Long-term Vision ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roadmap.visionTitle", id: "vision" },
  { type: "paragraph", contentKey: "commercial.roadmap.visionContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "zap",
        titleKey: "commercial.roadmap.aiPowered",
        descriptionKey: "commercial.roadmap.aiPoweredDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.roadmap.multiRegion",
        descriptionKey: "commercial.roadmap.multiRegionDesc",
      },
      {
        icon: "layers",
        titleKey: "commercial.roadmap.pluginEco",
        descriptionKey: "commercial.roadmap.pluginEcoDesc",
      },
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.roadmap.feedbackTip" },
];

registerPage({
  slug: "commercial/roadmap",
  titleKey: "commercial.roadmap.title",
  descriptionKey: "commercial.roadmap.description",
  category: "commercial-support",
  order: 4,
  sections,
  relatedSlugs: ["commercial/faq", "commercial/why-scripe-overview"],
  lastUpdated: "2026-02-20",
});
