/**
 * Docs page locale — EN
 */
export const en = {
  tutorials: {
    addBackendModule: {
      commandTitle: "Commands & Handlers",
      controllerTitle: "API Controller",
      description:
        "Step-by-step guide to creating a new backend module with Clean Architecture and CQRS.",
      diTitle: "Dependency Injection",
      entityTitle: "Domain Entity",
      intro:
        "This tutorial covers creating a complete backend module using Clean Architecture with CQRS. You'll define the entity, create commands and queries, implement the repository, register with DI, add the controller, and configure module registration.",
      migrationNote:
        "After creating your entity configuration, run 'dotnet ef migrations add AddYourEntity' to generate the database migration. Test with 'dotnet ef database update' before committing.",
      prerequisitesTitle: "Prerequisites",
      registerTitle: "Module Registration",
      step1Desc:
        "Set up the module's class library projects following Clean Architecture layers (Domain, Application, Infrastructure, API).",
      step1Title: "1. Create Project Structure",
      step2Desc: "Create the entity class inheriting from AuditableEntity with proper validation.",
      step2Title: "2. Define Domain Entity",
      step3Desc:
        "Implement Create, Update, and Delete commands with FluentValidation and handlers.",
      step3Title: "3. Create Commands",
      step4Desc: "Implement GetById and GetPaged queries with response DTOs.",
      step4Title: "4. Create Queries",
      step5Desc: "Create the EF Core repository with the generic repository base class.",
      step5Title: "5. Implement Repository",
      step6Desc:
        "Configure dependency injection for the module's services, repositories, and SCRIPE request handlers.",
      step6Title: "6. Register with DI",
      step7Desc:
        "Create the API controller with RESTful endpoints, Swagger docs, and authorization attributes.",
      step7Title: "7. Add Controller",
      step8Desc:
        "Register the module in the gateway and add database migration for the new entity.",
      step8Title: "8. Module Registration",
      stepsTitle: "Step-by-Step Guide",
      structureTitle: "Project Structure",
      title: "Add a Backend Module",
    },
    addModule: {
      checklist:
        "Before submitting, verify:  Module follows SOLID pattern,  View is under 60 lines,  No cross-module imports,  Translations added to dictionaries,  Navigation entry added.",
      description:
        "Step-by-step guide to creating a new frontend module following SOLID View/ViewModel pattern.",
      diTitle: "DI Container",
      entityTitle: "Domain Entity",
      intro:
        "This tutorial walks you through creating a complete frontend module from scratch, following the SOLID View/ViewModel pattern. You'll set up the module structure, create domain entities, build the data layer, implement ViewModels, and wire everything together.",
      prerequisitesTitle: "Prerequisites",
      repoTitle: "Repository",
      routeTitle: "Route & Navigation",
      step1Desc:
        "Set up the standard module directory structure with domain, data, and presentation layers.",
      step1Title: "1. Create Module Structure",
      step2Desc: "Create a Zod schema for your entity with validation rules.",
      step2Title: "2. Define Domain Entity",
      step3Desc: "Implement the data layer with API calls and response mapping.",
      step3Title: "3. Create Repository",
      step4Desc: "Register your repository in the module's dependency injection container.",
      step4Title: "4. Set Up DI Container",
      step5Desc:
        "Create the main ViewModel that orchestrates CRUD operations using useCrudViewModel.",
      step5Title: "5. Build ViewModel",
      step6Desc: "Build the pure UI View component that consumes the ViewModel (max ~60 lines).",
      step6Title: "6. Create View",
      step7Desc: "Create the Next.js page connector and add navigation entries.",
      step7Title: "7. Add Route & Navigation",
      stepsTitle: "Step-by-Step Guide",
      structureTitle: "Module Structure",
      title: "Add a Frontend Module",
      viewModelTitle: "ViewModel",
      viewTitle: "View Component",
    },
  },
};
