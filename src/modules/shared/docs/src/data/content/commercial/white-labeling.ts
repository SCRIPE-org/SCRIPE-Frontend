import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────────
  { type: "paragraph", contentKey: "commercial.whiteLabeling.intro" },

  // ─── What White-Labeling Gives You ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whiteLabeling.capabilitiesTitle",
    id: "capabilities",
  },
  { type: "paragraph", contentKey: "commercial.whiteLabeling.capabilitiesContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "globe",
        titleKey: "commercial.whiteLabeling.featDomain",
        descriptionKey: "commercial.whiteLabeling.featDomainDesc",
      },
      {
        icon: "image",
        titleKey: "commercial.whiteLabeling.featLogo",
        descriptionKey: "commercial.whiteLabeling.featLogoDesc",
      },
      {
        icon: "palette",
        titleKey: "commercial.whiteLabeling.featColors",
        descriptionKey: "commercial.whiteLabeling.featColorsDesc",
      },
      {
        icon: "mail",
        titleKey: "commercial.whiteLabeling.featEmail",
        descriptionKey: "commercial.whiteLabeling.featEmailDesc",
      },
      {
        icon: "layout",
        titleKey: "commercial.whiteLabeling.featLogin",
        descriptionKey: "commercial.whiteLabeling.featLoginDesc",
      },
      {
        icon: "smartphone",
        titleKey: "commercial.whiteLabeling.featMobile",
        descriptionKey: "commercial.whiteLabeling.featMobileDesc",
      },
      {
        icon: "languages",
        titleKey: "commercial.whiteLabeling.featMultiLang",
        descriptionKey: "commercial.whiteLabeling.featMultiLangDesc",
      },
      {
        icon: "bell",
        titleKey: "commercial.whiteLabeling.featNotifications",
        descriptionKey: "commercial.whiteLabeling.featNotificationsDesc",
      },
      {
        icon: "file-text",
        titleKey: "commercial.whiteLabeling.featDocs",
        descriptionKey: "commercial.whiteLabeling.featDocsDesc",
      },
    ],
  },

  // ─── Customer Journey ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whiteLabeling.journeyTitle",
    id: "customer-journey",
  },
  { type: "paragraph", contentKey: "commercial.whiteLabeling.journeyContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "commercial.whiteLabeling.journeyItem1",
      "commercial.whiteLabeling.journeyItem2",
      "commercial.whiteLabeling.journeyItem3",
      "commercial.whiteLabeling.journeyItem4",
      "commercial.whiteLabeling.journeyItem5",
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.whiteLabeling.journeyTip",
  },

  // ─── Real-World Use Cases ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whiteLabeling.useCasesTitle",
    id: "use-cases",
  },
  { type: "paragraph", contentKey: "commercial.whiteLabeling.useCasesContent" },
  {
    type: "table",
    headers: [
      "commercial.whiteLabeling.tblCaseH1",
      "commercial.whiteLabeling.tblCaseH2",
      "commercial.whiteLabeling.tblCaseH3",
    ],
    rows: [
      [
        "commercial.whiteLabeling.tblCaseR1C1",
        "commercial.whiteLabeling.tblCaseR1C2",
        "commercial.whiteLabeling.tblCaseR1C3",
      ],
      [
        "commercial.whiteLabeling.tblCaseR2C1",
        "commercial.whiteLabeling.tblCaseR2C2",
        "commercial.whiteLabeling.tblCaseR2C3",
      ],
      [
        "commercial.whiteLabeling.tblCaseR3C1",
        "commercial.whiteLabeling.tblCaseR3C2",
        "commercial.whiteLabeling.tblCaseR3C3",
      ],
      [
        "commercial.whiteLabeling.tblCaseR4C1",
        "commercial.whiteLabeling.tblCaseR4C2",
        "commercial.whiteLabeling.tblCaseR4C3",
      ],
    ],
  },

  // ─── Getting Started Flowchart ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whiteLabeling.gettingStartedTitle",
    id: "getting-started",
  },
  { type: "paragraph", contentKey: "commercial.whiteLabeling.gettingStartedContent" },
  {
    type: "flowchart",
    title: "White-Label Activation Journey",
    direction: "vertical",
    nodes: [
      { id: "n1", label: "Subscribe to Enterprise or Growth Plan", type: "default" },
      { id: "n2", label: "Access Brand Settings in your workspace", type: "default" },
      { id: "n3", label: "Upload your logo and set your brand colors", type: "default" },
      { id: "n4", label: "Add your custom domain and verify DNS", type: "default" },
      { id: "n5", label: "Configure your branded email domain", type: "default" },
      { id: "n6", label: "Customize your login page and welcome messages", type: "default" },
      { id: "n7", label: "Your customers see only your brand — never SCRIPE", type: "success" },
    ],
    connections: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n4" },
      { from: "n4", to: "n5" },
      { from: "n5", to: "n6" },
      { from: "n6", to: "n7" },
    ],
  },

  // ─── White-Label vs Standard Comparison ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.whiteLabeling.comparisonTitle",
    id: "comparison",
  },
  { type: "paragraph", contentKey: "commercial.whiteLabeling.comparisonContent" },
  {
    type: "table",
    headers: [
      "commercial.whiteLabeling.tblCompH1",
      "commercial.whiteLabeling.tblCompH2",
      "commercial.whiteLabeling.tblCompH3",
    ],
    rows: [
      [
        "commercial.whiteLabeling.tblCompR1C1",
        "commercial.whiteLabeling.tblCompR1C2",
        "commercial.whiteLabeling.tblCompR1C3",
      ],
      [
        "commercial.whiteLabeling.tblCompR2C1",
        "commercial.whiteLabeling.tblCompR2C2",
        "commercial.whiteLabeling.tblCompR2C3",
      ],
      [
        "commercial.whiteLabeling.tblCompR3C1",
        "commercial.whiteLabeling.tblCompR3C2",
        "commercial.whiteLabeling.tblCompR3C3",
      ],
      [
        "commercial.whiteLabeling.tblCompR4C1",
        "commercial.whiteLabeling.tblCompR4C2",
        "commercial.whiteLabeling.tblCompR4C3",
      ],
      [
        "commercial.whiteLabeling.tblCompR5C1",
        "commercial.whiteLabeling.tblCompR5C2",
        "commercial.whiteLabeling.tblCompR5C3",
      ],
      [
        "commercial.whiteLabeling.tblCompR6C1",
        "commercial.whiteLabeling.tblCompR6C2",
        "commercial.whiteLabeling.tblCompR6C3",
      ],
    ],
  },

  // ─── CTA ───────────────────────────────────────────────────────
  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.whiteLabeling.ctaTip",
  },
];

registerPage({
  slug: "commercial/white-labeling",
  titleKey: "commercial.whiteLabeling.title",
  descriptionKey: "commercial.whiteLabeling.description",
  category: "commercial-enterprise",
  order: 11,
  sections,
  relatedSlugs: [
    "commercial/login-customizer",
    "commercial/message-templates",
    "commercial/multi-tenancy",
  ],
  lastUpdated: "2026-06-28",
});
