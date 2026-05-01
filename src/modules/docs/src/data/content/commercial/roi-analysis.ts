import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.roiAnalysis.intro" },

  // ─── Cost Comparison ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.roiAnalysis.costTitle",
    id: "cost-comparison",
  },
  { type: "paragraph", contentKey: "commercial.roiAnalysis.costIntro" },
  {
    type: "table",
    headers: [
      "commercial.roiAnalysis.tblCostHeader1",
      "commercial.roiAnalysis.tblCostHeader2",
      "commercial.roiAnalysis.tblCostHeader3",
      "commercial.roiAnalysis.tblCostHeader4",
    ],
    rows: [
      [
        "commercial.roiAnalysis.tblCostR1C1",
        "commercial.roiAnalysis.tblCostR1C2",
        "commercial.roiAnalysis.tblCostR1C3",
        "commercial.roiAnalysis.tblCostR1C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR2C1",
        "commercial.roiAnalysis.tblCostR2C2",
        "commercial.roiAnalysis.tblCostR2C3",
        "commercial.roiAnalysis.tblCostR2C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR3C1",
        "commercial.roiAnalysis.tblCostR3C2",
        "commercial.roiAnalysis.tblCostR3C3",
        "commercial.roiAnalysis.tblCostR3C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR4C1",
        "commercial.roiAnalysis.tblCostR4C2",
        "commercial.roiAnalysis.tblCostR4C3",
        "commercial.roiAnalysis.tblCostR4C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR5C1",
        "commercial.roiAnalysis.tblCostR5C2",
        "commercial.roiAnalysis.tblCostR5C3",
        "commercial.roiAnalysis.tblCostR5C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR6C1",
        "commercial.roiAnalysis.tblCostR6C2",
        "commercial.roiAnalysis.tblCostR6C3",
        "commercial.roiAnalysis.tblCostR6C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR7C1",
        "commercial.roiAnalysis.tblCostR7C2",
        "commercial.roiAnalysis.tblCostR7C3",
        "commercial.roiAnalysis.tblCostR7C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR8C1",
        "commercial.roiAnalysis.tblCostR8C2",
        "commercial.roiAnalysis.tblCostR8C3",
        "commercial.roiAnalysis.tblCostR8C4",
      ],
      [
        "commercial.roiAnalysis.tblCostR9C1",
        "commercial.roiAnalysis.tblCostR9C2",
        "commercial.roiAnalysis.tblCostR9C3",
        "commercial.roiAnalysis.tblCostR9C4",
      ],
    ],
  },

  // ─── Time to Market ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roiAnalysis.timeTitle", id: "time-savings" },
  {
    type: "table",
    headers: [
      "commercial.roiAnalysis.tblTimeHeader1",
      "commercial.roiAnalysis.tblTimeHeader2",
      "commercial.roiAnalysis.tblTimeHeader3",
    ],
    rows: [
      [
        "commercial.roiAnalysis.tblTimeR1C1",
        "commercial.roiAnalysis.tblTimeR1C2",
        "commercial.roiAnalysis.tblTimeR1C3",
      ],
      [
        "commercial.roiAnalysis.tblTimeR2C1",
        "commercial.roiAnalysis.tblTimeR2C2",
        "commercial.roiAnalysis.tblTimeR2C3",
      ],
      [
        "commercial.roiAnalysis.tblTimeR3C1",
        "commercial.roiAnalysis.tblTimeR3C2",
        "commercial.roiAnalysis.tblTimeR3C3",
      ],
      [
        "commercial.roiAnalysis.tblTimeR4C1",
        "commercial.roiAnalysis.tblTimeR4C2",
        "commercial.roiAnalysis.tblTimeR4C3",
      ],
      [
        "commercial.roiAnalysis.tblTimeR5C1",
        "commercial.roiAnalysis.tblTimeR5C2",
        "commercial.roiAnalysis.tblTimeR5C3",
      ],
    ],
  },

  // ─── Team Size ──────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roiAnalysis.teamTitle", id: "team" },
  { type: "paragraph", contentKey: "commercial.roiAnalysis.teamContent" },
  {
    type: "table",
    headers: [
      "commercial.roiAnalysis.tblTeamHeader1",
      "commercial.roiAnalysis.tblTeamHeader2",
      "commercial.roiAnalysis.tblTeamHeader3",
    ],
    rows: [
      [
        "commercial.roiAnalysis.tblTeamR1C1",
        "commercial.roiAnalysis.tblTeamR1C2",
        "commercial.roiAnalysis.tblTeamR1C3",
      ],
      [
        "commercial.roiAnalysis.tblTeamR2C1",
        "commercial.roiAnalysis.tblTeamR2C2",
        "commercial.roiAnalysis.tblTeamR2C3",
      ],
      [
        "commercial.roiAnalysis.tblTeamR3C1",
        "commercial.roiAnalysis.tblTeamR3C2",
        "commercial.roiAnalysis.tblTeamR3C3",
      ],
      [
        "commercial.roiAnalysis.tblTeamR4C1",
        "commercial.roiAnalysis.tblTeamR4C2",
        "commercial.roiAnalysis.tblTeamR4C3",
      ],
      [
        "commercial.roiAnalysis.tblTeamR5C1",
        "commercial.roiAnalysis.tblTeamR5C2",
        "commercial.roiAnalysis.tblTeamR5C3",
      ],
      [
        "commercial.roiAnalysis.tblTeamR6C1",
        "commercial.roiAnalysis.tblTeamR6C2",
        "commercial.roiAnalysis.tblTeamR6C3",
      ],
    ],
  },

  // ─── Ongoing Savings ────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.roiAnalysis.ongoingTitle", id: "ongoing" },
  {
    type: "table",
    headers: [
      "commercial.roiAnalysis.tblOngoingHeader1",
      "commercial.roiAnalysis.tblOngoingHeader2",
      "commercial.roiAnalysis.tblOngoingHeader3",
      "commercial.roiAnalysis.tblOngoingHeader4",
    ],
    rows: [
      [
        "commercial.roiAnalysis.tblOngoingR1C1",
        "commercial.roiAnalysis.tblOngoingR1C2",
        "commercial.roiAnalysis.tblOngoingR1C3",
        "commercial.roiAnalysis.tblOngoingR1C4",
      ],
      [
        "commercial.roiAnalysis.tblOngoingR2C1",
        "commercial.roiAnalysis.tblOngoingR2C2",
        "commercial.roiAnalysis.tblOngoingR2C3",
        "commercial.roiAnalysis.tblOngoingR2C4",
      ],
      [
        "commercial.roiAnalysis.tblOngoingR3C1",
        "commercial.roiAnalysis.tblOngoingR3C2",
        "commercial.roiAnalysis.tblOngoingR3C3",
        "commercial.roiAnalysis.tblOngoingR3C4",
      ],
      [
        "commercial.roiAnalysis.tblOngoingR4C1",
        "commercial.roiAnalysis.tblOngoingR4C2",
        "commercial.roiAnalysis.tblOngoingR4C3",
        "commercial.roiAnalysis.tblOngoingR4C4",
      ],
      [
        "commercial.roiAnalysis.tblOngoingR5C1",
        "commercial.roiAnalysis.tblOngoingR5C2",
        "commercial.roiAnalysis.tblOngoingR5C3",
        "commercial.roiAnalysis.tblOngoingR5C4",
      ],
    ],
  },

  // ─── Case Study ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.roiAnalysis.caseStudyTitle",
    id: "case-study",
  },
  { type: "paragraph", contentKey: "commercial.roiAnalysis.caseStudyContent" },

  { type: "info", variant: "tip", contentKey: "commercial.roiAnalysis.tip" },
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
