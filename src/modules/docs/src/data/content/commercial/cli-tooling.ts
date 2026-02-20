import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.cliTooling.intro" },
      { type: "heading", level: 2, titleKey: "commercial.cliTooling.commandsTitle", id: "commands" },
      {
            type: "table",
            headers: ["Command", "Description", "Example"],
            rows: [
                  ["nexora new-module", "Scaffold full-stack module", "nexora new-module --name HR"],
                  ["nexora new-entity", "Create domain entity + config", "nexora new-entity --module HR --name Employee"],
                  ["nexora new-command", "Generate CQRS command + handler", "nexora new-command --module HR --name CreateEmployee"],
                  ["nexora new-query", "Generate CQRS query + handler", "nexora new-query --module HR --name GetEmployees"],
                  ["nexora remove-module", "Clean removal of entire module", "nexora remove-module --name HR"],
                  ["nexora dev", "Run both backend + frontend", "nexora dev"],
                  ["nexora build", "Build both projects", "nexora build"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.cliTooling.scaffoldTitle", id: "scaffolding" },
      { type: "paragraph", contentKey: "commercial.cliTooling.scaffoldContent" },
      {
            type: "code",
            language: "bash",
            filename: "Full Module Scaffold Output",
            code: `$ nexora new-module --name "ProjectManagement"

✓ Created Backend Domain layer
  → Entities/Project.cs
  → Interfaces/IProjectRepository.cs
  
✓ Created Backend Application layer  
  → Commands/CreateProject/CreateProjectCommand.cs
  → Commands/CreateProject/CreateProjectHandler.cs
  → Queries/GetProjects/GetProjectsQuery.cs
  → Validators/CreateProjectValidator.cs
  
✓ Created Backend Infrastructure layer
  → Repositories/ProjectRepository.cs
  → EntityConfigurations/ProjectConfiguration.cs
  → DependencyInjection.cs
  → Seeder/ProjectPermissionSeeder.cs

✓ Created Frontend module
  → domain/entities/Project.ts
  → data/repositories/ProjectRepository.ts
  → presentation/views/ProjectListView.tsx
  → presentation/viewmodels/useProjectViewModel.ts
  → di.ts
  
✓ Registered in module system
✓ Added permissions to seeder
✓ Ready to use — run 'nexora dev' to start`,
      },
      { type: "heading", level: 2, titleKey: "commercial.cliTooling.customizeTitle", id: "customize" },
      { type: "paragraph", contentKey: "commercial.cliTooling.customizeContent" },
];

registerPage({
      slug: "commercial/cli-tooling",
      titleKey: "commercial.cliTooling.title",
      descriptionKey: "commercial.cliTooling.description",
      category: "commercial-developer",
      order: 1,
      sections,
      relatedSlugs: ["commercial/clean-architecture", "commercial/api-design"],
      lastUpdated: "2026-02-20",
});
