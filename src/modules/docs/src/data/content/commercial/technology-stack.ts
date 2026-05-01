import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.technologyStack.intro" },

  // ─── Backend Stack ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.technologyStack.backendTitle", id: "backend" },
  {
    type: "table",
    headers: [
      "commercial.technologyStack.tblBackHeader1",
      "commercial.technologyStack.tblBackHeader2",
      "commercial.technologyStack.tblBackHeader3",
      "commercial.technologyStack.tblBackHeader4",
    ],
    rows: [
      [
        "commercial.technologyStack.tblBackR1C1",
        "commercial.technologyStack.tblBackR1C2",
        "commercial.technologyStack.tblBackR1C3",
        "commercial.technologyStack.tblBackR1C4",
      ],
      [
        "commercial.technologyStack.tblBackR2C1",
        "commercial.technologyStack.tblBackR2C2",
        "commercial.technologyStack.tblBackR2C3",
        "commercial.technologyStack.tblBackR2C4",
      ],
      [
        "commercial.technologyStack.tblBackR3C1",
        "commercial.technologyStack.tblBackR3C2",
        "commercial.technologyStack.tblBackR3C3",
        "commercial.technologyStack.tblBackR3C4",
      ],
      [
        "commercial.technologyStack.tblBackR4C1",
        "commercial.technologyStack.tblBackR4C2",
        "commercial.technologyStack.tblBackR4C3",
        "commercial.technologyStack.tblBackR4C4",
      ],
      [
        "commercial.technologyStack.tblBackR5C1",
        "commercial.technologyStack.tblBackR5C2",
        "commercial.technologyStack.tblBackR5C3",
        "commercial.technologyStack.tblBackR5C4",
      ],
      [
        "commercial.technologyStack.tblBackR6C1",
        "commercial.technologyStack.tblBackR6C2",
        "commercial.technologyStack.tblBackR6C3",
        "commercial.technologyStack.tblBackR6C4",
      ],
      [
        "commercial.technologyStack.tblBackR7C1",
        "commercial.technologyStack.tblBackR7C2",
        "commercial.technologyStack.tblBackR7C3",
        "commercial.technologyStack.tblBackR7C4",
      ],
      [
        "commercial.technologyStack.tblBackR8C1",
        "commercial.technologyStack.tblBackR8C2",
        "commercial.technologyStack.tblBackR8C3",
        "commercial.technologyStack.tblBackR8C4",
      ],
      [
        "commercial.technologyStack.tblBackR9C1",
        "commercial.technologyStack.tblBackR9C2",
        "commercial.technologyStack.tblBackR9C3",
        "commercial.technologyStack.tblBackR9C4",
      ],
      [
        "commercial.technologyStack.tblBackR10C1",
        "commercial.technologyStack.tblBackR10C2",
        "commercial.technologyStack.tblBackR10C3",
        "commercial.technologyStack.tblBackR10C4",
      ],
    ],
  },

  // ─── Frontend Stack ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.technologyStack.frontendTitle",
    id: "frontend",
  },
  {
    type: "table",
    headers: [
      "commercial.technologyStack.tblFrontHeader1",
      "commercial.technologyStack.tblFrontHeader2",
      "commercial.technologyStack.tblFrontHeader3",
      "commercial.technologyStack.tblFrontHeader4",
    ],
    rows: [
      [
        "commercial.technologyStack.tblFrontR1C1",
        "commercial.technologyStack.tblFrontR1C2",
        "commercial.technologyStack.tblFrontR1C3",
        "commercial.technologyStack.tblFrontR1C4",
      ],
      [
        "commercial.technologyStack.tblFrontR2C1",
        "commercial.technologyStack.tblFrontR2C2",
        "commercial.technologyStack.tblFrontR2C3",
        "commercial.technologyStack.tblFrontR2C4",
      ],
      [
        "commercial.technologyStack.tblFrontR3C1",
        "commercial.technologyStack.tblFrontR3C2",
        "commercial.technologyStack.tblFrontR3C3",
        "commercial.technologyStack.tblFrontR3C4",
      ],
      [
        "commercial.technologyStack.tblFrontR4C1",
        "commercial.technologyStack.tblFrontR4C2",
        "commercial.technologyStack.tblFrontR4C3",
        "commercial.technologyStack.tblFrontR4C4",
      ],
      [
        "commercial.technologyStack.tblFrontR5C1",
        "commercial.technologyStack.tblFrontR5C2",
        "commercial.technologyStack.tblFrontR5C3",
        "commercial.technologyStack.tblFrontR5C4",
      ],
      [
        "commercial.technologyStack.tblFrontR6C1",
        "commercial.technologyStack.tblFrontR6C2",
        "commercial.technologyStack.tblFrontR6C3",
        "commercial.technologyStack.tblFrontR6C4",
      ],
      [
        "commercial.technologyStack.tblFrontR7C1",
        "commercial.technologyStack.tblFrontR7C2",
        "commercial.technologyStack.tblFrontR7C3",
        "commercial.technologyStack.tblFrontR7C4",
      ],
      [
        "commercial.technologyStack.tblFrontR8C1",
        "commercial.technologyStack.tblFrontR8C2",
        "commercial.technologyStack.tblFrontR8C3",
        "commercial.technologyStack.tblFrontR8C4",
      ],
      [
        "commercial.technologyStack.tblFrontR9C1",
        "commercial.technologyStack.tblFrontR9C2",
        "commercial.technologyStack.tblFrontR9C3",
        "commercial.technologyStack.tblFrontR9C4",
      ],
    ],
  },

  // ─── Infrastructure ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.technologyStack.infraTitle",
    id: "infrastructure",
  },
  {
    type: "table",
    headers: [
      "commercial.technologyStack.tblInfraHeader1",
      "commercial.technologyStack.tblInfraHeader2",
      "commercial.technologyStack.tblInfraHeader3",
    ],
    rows: [
      [
        "commercial.technologyStack.tblInfraR1C1",
        "commercial.technologyStack.tblInfraR1C2",
        "commercial.technologyStack.tblInfraR1C3",
      ],
      [
        "commercial.technologyStack.tblInfraR2C1",
        "commercial.technologyStack.tblInfraR2C2",
        "commercial.technologyStack.tblInfraR2C3",
      ],
      [
        "commercial.technologyStack.tblInfraR3C1",
        "commercial.technologyStack.tblInfraR3C2",
        "commercial.technologyStack.tblInfraR3C3",
      ],
      [
        "commercial.technologyStack.tblInfraR4C1",
        "commercial.technologyStack.tblInfraR4C2",
        "commercial.technologyStack.tblInfraR4C3",
      ],
      [
        "commercial.technologyStack.tblInfraR5C1",
        "commercial.technologyStack.tblInfraR5C2",
        "commercial.technologyStack.tblInfraR5C3",
      ],
      [
        "commercial.technologyStack.tblInfraR6C1",
        "commercial.technologyStack.tblInfraR6C2",
        "commercial.technologyStack.tblInfraR6C3",
      ],
    ],
  },

  // ─── Enterprise Multi-Database Auto-Adaptation ──────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.technologyStack.multiDbTitle",
    id: "multi-database",
  },
  { type: "paragraph", contentKey: "commercial.technologyStack.multiDbContent" },
  {
    type: "table",
    headers: [
      "commercial.technologyStack.tblMultiDbHeader1",
      "commercial.technologyStack.tblMultiDbHeader2",
      "commercial.technologyStack.tblMultiDbHeader3",
    ],
    rows: [
      [
        "commercial.technologyStack.tblMultiDbR1C1",
        "commercial.technologyStack.tblMultiDbR1C2",
        "commercial.technologyStack.tblMultiDbR1C3",
      ],
      [
        "commercial.technologyStack.tblMultiDbR2C1",
        "commercial.technologyStack.tblMultiDbR2C2",
        "commercial.technologyStack.tblMultiDbR2C3",
      ],
      [
        "commercial.technologyStack.tblMultiDbR3C1",
        "commercial.technologyStack.tblMultiDbR3C2",
        "commercial.technologyStack.tblMultiDbR3C3",
      ],
    ],
  },

  // ─── Version Compatibility ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.technologyStack.compatibilityTitle",
    id: "compatibility",
  },
  {
    type: "table",
    headers: [
      "commercial.technologyStack.tblCompHeader1",
      "commercial.technologyStack.tblCompHeader2",
      "commercial.technologyStack.tblCompHeader3",
    ],
    rows: [
      [
        "commercial.technologyStack.tblCompR1C1",
        "commercial.technologyStack.tblCompR1C2",
        "commercial.technologyStack.tblCompR1C3",
      ],
      [
        "commercial.technologyStack.tblCompR2C1",
        "commercial.technologyStack.tblCompR2C2",
        "commercial.technologyStack.tblCompR2C3",
      ],
      [
        "commercial.technologyStack.tblCompR3C1",
        "commercial.technologyStack.tblCompR3C2",
        "commercial.technologyStack.tblCompR3C3",
      ],
      [
        "commercial.technologyStack.tblCompR4C1",
        "commercial.technologyStack.tblCompR4C2",
        "commercial.technologyStack.tblCompR4C3",
      ],
      [
        "commercial.technologyStack.tblCompR5C1",
        "commercial.technologyStack.tblCompR5C2",
        "commercial.technologyStack.tblCompR5C3",
      ],
      [
        "commercial.technologyStack.tblCompR6C1",
        "commercial.technologyStack.tblCompR6C2",
        "commercial.technologyStack.tblCompR6C3",
      ],
      [
        "commercial.technologyStack.tblCompR7C1",
        "commercial.technologyStack.tblCompR7C2",
        "commercial.technologyStack.tblCompR7C3",
      ],
      [
        "commercial.technologyStack.tblCompR8C1",
        "commercial.technologyStack.tblCompR8C2",
        "commercial.technologyStack.tblCompR8C3",
      ],
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.technologyStack.futureTip" },
];

registerPage({
  slug: "commercial/technology-stack",
  titleKey: "commercial.technologyStack.title",
  descriptionKey: "commercial.technologyStack.description",
  category: "commercial-platform",
  order: 3,
  sections,
  relatedSlugs: ["commercial/platform-architecture", "commercial/system-requirements"],
  lastUpdated: "2026-02-20",
});
