import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ──────────────────────────────────────────────────
  { type: "paragraph", contentKey: "commercial.partnerJourney.intro" },

  // ─── Partner Program Overview ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.partnerJourney.overviewTitle",
    id: "partner-program-overview",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "repeat",
        titleKey: "commercial.partnerJourney.typeResellerTitle",
        descriptionKey: "commercial.partnerJourney.typeResellerDesc",
      },
      {
        icon: "cpu",
        titleKey: "commercial.partnerJourney.typeTechTitle",
        descriptionKey: "commercial.partnerJourney.typeTechDesc",
      },
      {
        icon: "layout",
        titleKey: "commercial.partnerJourney.typeWhiteLabelTitle",
        descriptionKey: "commercial.partnerJourney.typeWhiteLabelDesc",
      },
    ],
  },

  // ─── Reseller Partners ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.partnerJourney.resellerTitle",
    id: "reseller-partners",
  },
  { type: "paragraph", contentKey: "commercial.partnerJourney.resellerContent" },

  // ─── Technology Partners ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.partnerJourney.techTitle",
    id: "technology-partners",
  },
  { type: "paragraph", contentKey: "commercial.partnerJourney.techContent" },

  // ─── White-Label Partners ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.partnerJourney.whiteLabelTitle",
    id: "white-label-partners",
  },
  { type: "paragraph", contentKey: "commercial.partnerJourney.whiteLabelContent" },

  // ─── Partner Benefits ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.partnerJourney.benefitsTitle",
    id: "partner-benefits",
  },
  {
    type: "table",
    headers: [
      "commercial.partnerJourney.tblBenefitH1",
      "commercial.partnerJourney.tblBenefitH2",
      "commercial.partnerJourney.tblBenefitH3",
      "commercial.partnerJourney.tblBenefitH4",
    ],
    rows: [
      [
        "commercial.partnerJourney.tblBenefitR1C1",
        "commercial.partnerJourney.tblBenefitR1C2",
        "commercial.partnerJourney.tblBenefitR1C3",
        "commercial.partnerJourney.tblBenefitR1C4",
      ],
      [
        "commercial.partnerJourney.tblBenefitR2C1",
        "commercial.partnerJourney.tblBenefitR2C2",
        "commercial.partnerJourney.tblBenefitR2C3",
        "commercial.partnerJourney.tblBenefitR2C4",
      ],
      [
        "commercial.partnerJourney.tblBenefitR3C1",
        "commercial.partnerJourney.tblBenefitR3C2",
        "commercial.partnerJourney.tblBenefitR3C3",
        "commercial.partnerJourney.tblBenefitR3C4",
      ],
      [
        "commercial.partnerJourney.tblBenefitR4C1",
        "commercial.partnerJourney.tblBenefitR4C2",
        "commercial.partnerJourney.tblBenefitR4C3",
        "commercial.partnerJourney.tblBenefitR4C4",
      ],
      [
        "commercial.partnerJourney.tblBenefitR5C1",
        "commercial.partnerJourney.tblBenefitR5C2",
        "commercial.partnerJourney.tblBenefitR5C3",
        "commercial.partnerJourney.tblBenefitR5C4",
      ],
      [
        "commercial.partnerJourney.tblBenefitR6C1",
        "commercial.partnerJourney.tblBenefitR6C2",
        "commercial.partnerJourney.tblBenefitR6C3",
        "commercial.partnerJourney.tblBenefitR6C4",
      ],
    ],
  },

  // ─── How to Become a Partner ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.partnerJourney.howToTitle",
    id: "how-to-become-a-partner",
  },
  {
    type: "flowchart",
    title: "Partner Onboarding Journey",
    direction: "horizontal",
    nodes: [
      { id: "apply", label: "Apply", type: "default" },
      { id: "screening", label: "Screening Call", type: "info" },
      { id: "agreement", label: "Partnership Agreement", type: "primary" },
      { id: "onboarding", label: "Onboarding", type: "info" },
      { id: "golive", label: "Go Live", type: "success" },
    ],
    connections: [
      { from: "apply", to: "screening" },
      { from: "screening", to: "agreement" },
      { from: "agreement", to: "onboarding" },
      { from: "onboarding", to: "golive" },
    ],
  },

  // ─── CTA ─────────────────────────────────────────────────────
  { type: "info", variant: "tip", contentKey: "commercial.partnerJourney.applyTip" },
];

registerPage({
  slug: "commercial/partner-journey",
  titleKey: "commercial.partnerJourney.title",
  descriptionKey: "commercial.partnerJourney.description",
  category: "commercial-pricing",
  order: 13,
  sections,
  relatedSlugs: ["commercial/investor-overview", "commercial/co-founder-journey"],
  lastUpdated: "2026-06-28",
});
