import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.gettingStartedGuide.intro" },

      // ─── Prerequisites ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.gettingStartedGuide.prereqTitle", id: "prerequisites" },
      {
            type: "table",
            headers: ["Tool", "Version", "Purpose"],
            rows: [
                  [".NET SDK", "10.0+", "Backend development"],
                  ["Node.js", "20 LTS+", "Frontend development"],
                  ["Git", "2.40+", "Version control + submodules"],
                  ["IDE", "VS Code / Rider / VS 2022", "Code editing & debugging"],
                  ["Docker (optional)", "24+", "Containerized development & deployment"],
                  ["Database", "SQL Server / PostgreSQL / Oracle", "Data persistence (SQLite for dev)"],
            ],
      },

      // ─── Quick Start ────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.gettingStartedGuide.quickStartTitle", id: "quick-start" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.gettingStartedGuide.step1Title", contentKey: "commercial.gettingStartedGuide.step1Content" },
                  { titleKey: "commercial.gettingStartedGuide.step2Title", contentKey: "commercial.gettingStartedGuide.step2Content" },
                  { titleKey: "commercial.gettingStartedGuide.step3Title", contentKey: "commercial.gettingStartedGuide.step3Content" },
                  { titleKey: "commercial.gettingStartedGuide.step4Title", contentKey: "commercial.gettingStartedGuide.step4Content" },
                  { titleKey: "commercial.gettingStartedGuide.step5Title", contentKey: "commercial.gettingStartedGuide.step5Content" },
            ],
      },

      // ─── First Module ───────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.gettingStartedGuide.firstModuleTitle", id: "first-module" },
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
      { type: "heading", level: 2, titleKey: "commercial.gettingStartedGuide.structureTitle", id: "project-structure" },
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
      { type: "heading", level: 2, titleKey: "commercial.gettingStartedGuide.credentialsTitle", id: "credentials" },
      {
            type: "table",
            headers: ["Field", "Value"],
            rows: [
                  ["Admin Email", "admin@nexora.io"],
                  ["Password", "Admin@123"],
                  ["Default Tenant", "Root Tenant"],
                  ["API URL", "http://localhost:5000"],
                  ["Frontend URL", "http://localhost:3000"],
                  ["Swagger", "http://localhost:5000/swagger"],
            ],
      },
      { type: "info", variant: "warning", contentKey: "commercial.gettingStartedGuide.credentialsWarning" },

      // ─── Next Steps ─────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.gettingStartedGuide.nextStepsTitle", id: "next-steps" },
      {
            type: "list",
            variant: "ordered",
            items: [
                  "Configure your database provider in appsettings.json",
                  "Set up email settings for notification delivery",
                  "Create your first tenant via the admin panel",
                  "Add custom roles and permissions",
                  "Build your first business module with the CLI",
                  "Explore the full technical documentation for deep dives",
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
