import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.gettingStartedGuide.intro" },

  // ─── Prerequisites ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.gettingStartedGuide.prereqTitle",
    id: "prerequisites",
  },
  {
    type: "table",
    headers: [
      "commercial.gettingStartedGuide.tblPrereqHeader1",
      "commercial.gettingStartedGuide.tblPrereqHeader2",
      "commercial.gettingStartedGuide.tblPrereqHeader3",
    ],
    rows: [
      [
        "commercial.gettingStartedGuide.tblPrereqR1C1",
        "commercial.gettingStartedGuide.tblPrereqR1C2",
        "commercial.gettingStartedGuide.tblPrereqR1C3",
      ],
      [
        "commercial.gettingStartedGuide.tblPrereqR2C1",
        "commercial.gettingStartedGuide.tblPrereqR2C2",
        "commercial.gettingStartedGuide.tblPrereqR2C3",
      ],
      [
        "commercial.gettingStartedGuide.tblPrereqR3C1",
        "commercial.gettingStartedGuide.tblPrereqR3C2",
        "commercial.gettingStartedGuide.tblPrereqR3C3",
      ],
      [
        "commercial.gettingStartedGuide.tblPrereqR4C1",
        "commercial.gettingStartedGuide.tblPrereqR4C2",
        "commercial.gettingStartedGuide.tblPrereqR4C3",
      ],
      [
        "commercial.gettingStartedGuide.tblPrereqR5C1",
        "commercial.gettingStartedGuide.tblPrereqR5C2",
        "commercial.gettingStartedGuide.tblPrereqR5C3",
      ],
      [
        "commercial.gettingStartedGuide.tblPrereqR6C1",
        "commercial.gettingStartedGuide.tblPrereqR6C2",
        "commercial.gettingStartedGuide.tblPrereqR6C3",
      ],
    ],
  },

  // ─── Quick Start ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.gettingStartedGuide.quickStartTitle",
    id: "quick-start",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "commercial.gettingStartedGuide.step1Title",
        contentKey: "commercial.gettingStartedGuide.step1Content",
      },
      {
        titleKey: "commercial.gettingStartedGuide.step2Title",
        contentKey: "commercial.gettingStartedGuide.step2Content",
      },
      {
        titleKey: "commercial.gettingStartedGuide.step3Title",
        contentKey: "commercial.gettingStartedGuide.step3Content",
      },
      {
        titleKey: "commercial.gettingStartedGuide.step4Title",
        contentKey: "commercial.gettingStartedGuide.step4Content",
      },
      {
        titleKey: "commercial.gettingStartedGuide.step5Title",
        contentKey: "commercial.gettingStartedGuide.step5Content",
      },
    ],
  },

  // ─── First Module ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.gettingStartedGuide.firstModuleTitle",
    id: "first-module",
  },
  {
    type: "code",
    language: "bash",
    filename: "Create Your First Module",
    code: `# 1. Use NEXORA CLI to scaffold
nexora new-module --name "MyFirstModule"

# 2. Run both backend and frontend
nexora dev

# 3. Navigate to http://localhost:3000/my-first-module
# Your new module is ready with full CRUD!`,
  },

  // ─── Project Structure ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.gettingStartedGuide.structureTitle",
    id: "project-structure",
  },
  {
    type: "code",
    language: "text",
    filename: "Repository Structure",
    code: `NEXORA/
├── NEXORA-Backend/          # .NET 10 backend
│   ├── src/
│   │   ├── Core/            # Domain + Application layers
│   │   ├── Infrastructure/  # EF Core, external services
│   │   └── Presentation/    # Controllers, middleware
│   └── appsettings.json     # Configuration
│
├── NEXORA-Frontend/         # Next.js 16 frontend
│   ├── src/
│   │   ├── core/            # Shared UI, providers, stores
│   │   ├── modules/         # Feature modules
│   │   └── app/             # Next.js routing
│   └── package.json
│
└── tools/nexora-cli/        # CLI scaffolding tool`,
  },

  // ─── Default Credentials ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.gettingStartedGuide.credentialsTitle",
    id: "credentials",
  },
  {
    type: "table",
    headers: [
      "commercial.gettingStartedGuide.tblCredHeader1",
      "commercial.gettingStartedGuide.tblCredHeader2",
    ],
    rows: [
      ["commercial.gettingStartedGuide.tblCredR1C1", "commercial.gettingStartedGuide.tblCredR1C2"],
      ["commercial.gettingStartedGuide.tblCredR2C1", "commercial.gettingStartedGuide.tblCredR2C2"],
      ["commercial.gettingStartedGuide.tblCredR3C1", "commercial.gettingStartedGuide.tblCredR3C2"],
      ["commercial.gettingStartedGuide.tblCredR4C1", "commercial.gettingStartedGuide.tblCredR4C2"],
      ["commercial.gettingStartedGuide.tblCredR5C1", "commercial.gettingStartedGuide.tblCredR5C2"],
      ["commercial.gettingStartedGuide.tblCredR6C1", "commercial.gettingStartedGuide.tblCredR6C2"],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "commercial.gettingStartedGuide.credentialsWarning",
  },

  // ─── Next Steps ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.gettingStartedGuide.nextStepsTitle",
    id: "next-steps",
  },
  {
    type: "list",
    variant: "ordered",
    items: [
      "commercial.gettingStartedGuide.lstNextI1",
      "commercial.gettingStartedGuide.lstNextI2",
      "commercial.gettingStartedGuide.lstNextI3",
      "commercial.gettingStartedGuide.lstNextI4",
      "commercial.gettingStartedGuide.lstNextI5",
      "commercial.gettingStartedGuide.lstNextI6",
    ],
  },
];

registerPage({
  slug: "commercial/getting-started-guide",
  titleKey: "commercial.gettingStartedGuide.title",
  descriptionKey: "commercial.gettingStartedGuide.description",
  category: "commercial-support",
  order: 2,
  sections,
  relatedSlugs: ["commercial/documentation-training", "commercial/faq"],
  lastUpdated: "2026-02-20",
});
